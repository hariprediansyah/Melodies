using Microsoft.Data.Sqlite;
using System.Net.Http;
using System.Text.Json;

namespace ServiceSync
{


    public class SyncService
    {
        private readonly string _basePath;
        private readonly string _dbPath;
        private readonly string _logPath;
        private SqliteConnection _conn;
        private Timer? _timer;
        private readonly HttpClient _http;

        public SyncService()
        {
            _basePath = AppContext.BaseDirectory;
            _dbPath = Path.Combine(_basePath, "Storage", "database.sqlite");
            _logPath = Path.Combine(_basePath, "Logs", "sync.log");
            _http = new HttpClient();
            SetupFolders();
            SetupDatabase();
        }

        public void Start()
        {
            _timer = new Timer(async _ => await Sync(), null, TimeSpan.Zero, TimeSpan.FromMinutes(1));
            Log("Client update server listening on port 5771");
        }

        private void SetupFolders()
        {
            Directory.CreateDirectory(Path.Combine(_basePath, "Storage"));
            Directory.CreateDirectory(Path.Combine(_basePath, "Logs"));
            Directory.CreateDirectory(Path.Combine(_basePath, "Storage", "songs"));
            Directory.CreateDirectory(Path.Combine(_basePath, "Storage", "banners"));
            Directory.CreateDirectory(Path.Combine(_basePath, "Storage", "carousels"));
        }

        private void SetupDatabase()
        {
            _conn = new SqliteConnection($"Data Source={_dbPath}");
            _conn.Open();

            var commands = new[]
            {
            "CREATE TABLE IF NOT EXISTS songs (id INTEGER PRIMARY KEY, title TEXT, artist TEXT, genre TEXT, album TEXT, release_date TEXT, duration TEXT, play_count INTEGER, created_at TEXT, updated_at TEXT, cover_updated_at TEXT, song_updated_at TEXT, vocal TEXT)",
            "CREATE TABLE IF NOT EXISTS playlist (id INTEGER PRIMARY KEY AUTOINCREMENT, song_id INTEGER)",
            "CREATE TABLE IF NOT EXISTS banners (id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT, description TEXT, created_at TEXT, updated_at TEXT, banner_updated_at TEXT)",
            "CREATE TABLE IF NOT EXISTS carousels (id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT, description TEXT)",
            "CREATE TABLE IF NOT EXISTS sys_params (key TEXT PRIMARY KEY, value TEXT)"
        };

            foreach (var cmdText in commands)
            {
                var cmd = _conn.CreateCommand();
                cmd.CommandText = cmdText;
                cmd.ExecuteNonQuery();
            }
        }

        public void UpdateSysParam(string key, string value)
        {
            var cmd = _conn.CreateCommand();
            cmd.CommandText = @"
            INSERT INTO sys_params (key, value)
            VALUES ($key, $value)
            ON CONFLICT(key) DO UPDATE SET value = $value";
            cmd.Parameters.AddWithValue("$key", key);
            cmd.Parameters.AddWithValue("$value", value);
            cmd.ExecuteNonQuery();
        }

        public void Log(string message)
        {
            var line = $"[{DateTime.Now:yyyy-MM-dd HH:mm:ss}] {message}\n";
            try
            {
                using var fs = new FileStream(_logPath, FileMode.Append, FileAccess.Write, FileShare.ReadWrite);
                using var sw = new StreamWriter(fs);
                sw.Write(line);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[LOGGING ERROR] {ex.Message}");
            }
        }


        private string? GetServerUrl()
        {
            try
            {
                var cmd = _conn.CreateCommand();
                cmd.CommandText = "SELECT value FROM sys_params WHERE key = 'server_ip'";
                var result = cmd.ExecuteScalar()?.ToString();
                if (!string.IsNullOrWhiteSpace(result))
                {
                    return result.StartsWith("http") ? result : $"http://{result}";
                }
            }
            catch (Exception ex)
            {
                Log("ERROR getServerUrl: " + ex.Message);
            }
            return null;
        }

        private string? GetSysParam(string key)
        {
            try
            {
                var cmd = _conn.CreateCommand();
                cmd.CommandText = "SELECT value FROM sys_params WHERE key = $key";
                cmd.Parameters.AddWithValue("$key", key);
                return cmd.ExecuteScalar()?.ToString();
            }
            catch (Exception ex)
            {
                Log("ERROR getSysParam: " + ex.Message);
                return null;
            }
        }

        private async Task<bool> CheckForceShutdown(string serverUrl, string roomId)
        {
            try
            {
                var url = $"{serverUrl}/rooms/force-shutdown/{roomId}";
                Log($"Cek force shutdown di {url}");
                var response = await _http.GetAsync(url);
                response.EnsureSuccessStatusCode();
                var json = await response.Content.ReadAsStringAsync();
                return json.Contains("true");
            }
            catch (Exception ex)
            {
                Log($"Gagal cek force shutdown: {ex.Message}");
                return false;
            }
        }

        private void ForceShutdown()
        {
            try
            {
                Log("Melakukan shutdown paksa...");
                var psi = new System.Diagnostics.ProcessStartInfo("shutdown", "/s /t 0")
                {
                    CreateNoWindow = true,
                    UseShellExecute = false
                };
                System.Diagnostics.Process.Start(psi);
            }
            catch (Exception ex)
            {
                Log("Gagal shutdown: " + ex.Message);
            }
        }

        private async Task Sync()
        {
            var serverUrl = GetServerUrl();
            if (serverUrl == null)
            {
                Log("SERVER_URL belum di-set di sys_params. Sinkronisasi dilewati.");
                return;
            }

            var roomId = GetSysParam("client_room_id");
            if (string.IsNullOrEmpty(roomId))
            {
                Log("client_room_id belum di-set di sys_params. Sinkronisasi dilewati.");
                return;
            }

            Log($"Sebelum shutdown");

            var shouldShutdown = await CheckForceShutdown(serverUrl, roomId);
            if (shouldShutdown)
            {
                Log($"Flag force_shutdown aktif untuk room {roomId}. Shutdown akan dilakukan.");
                ForceShutdown();
                return;
            }

            Log("Mulai sinkronisasi...");
            Console.WriteLine("[SYNC] Mulai sinkronisasi...");

            try
            {
                var songs = await GetJsonAsync<List<Dictionary<string, object>>>($"{serverUrl}/songs");
                var banners = await GetJsonAsync<List<Dictionary<string, object>>>($"{serverUrl}/banners");
                var carousels = await GetJsonAsync<List<Dictionary<string, object>>>($"{serverUrl}/carousels/files");

                SyncTable("songs", songs, new[] { "id", "title", "artist", "genre", "album", "release_date", "duration", "play_count", "created_at", "updated_at", "cover_updated_at", "song_updated_at", "vocal" });
                SyncTable("banners", banners, new[] { "id", "title", "description", "created_at", "updated_at", "banner_updated_at" });
                SyncCarousels(carousels, serverUrl);
                //SyncSongsFiles(songs, serverUrl);
                SyncBannersFiles(banners, serverUrl);

                Log("Sinkronisasi selesai.");
                Console.WriteLine("[SYNC] Sinkronisasi selesai.");
            }
            catch (Exception ex)
            {
                Log("ERROR: " + ex.Message);
                Console.WriteLine("[SYNC] Error: " + ex);
            }
        }


        private void SyncTable(string table, List<Dictionary<string, object>> rows, string[] columns)
        {
            foreach (var row in rows)
            {
                var keys = string.Join(", ", columns);
                var values = string.Join(", ", columns.Select(c => "@" + c));
                var update = string.Join(", ", columns.Select(c => $"{c} = @{c}"));

                var cmd = _conn.CreateCommand();
                cmd.CommandText = $"INSERT INTO {table} ({keys}) VALUES ({values}) ON CONFLICT(id) DO UPDATE SET {update}";
                foreach (var col in columns)
                {
                    object value = "";

                    if (row.TryGetValue(col, out var rawValue) && rawValue is JsonElement element)
                    {
                        value = element.ValueKind switch
                        {
                            JsonValueKind.String => element.GetString(),
                            JsonValueKind.Number => element.TryGetInt64(out var l) ? l : (element.TryGetDouble(out var d) ? d : 0),
                            JsonValueKind.True => true,
                            JsonValueKind.False => false,
                            JsonValueKind.Null => "",
                            _ => element.ToString()
                        };
                    }

                    cmd.Parameters.AddWithValue("@" + col, value ?? "");
                }

                cmd.ExecuteNonQuery();
            }
        }

        private void SyncCarousels(List<Dictionary<string, object>> serverFiles, string serverUrl)
        {
            var carouselsPath = Path.Combine(_basePath, "Storage", "carousels");
            var localFiles = Directory.GetFiles(carouselsPath).Select(f => Path.GetFileName(f)).ToHashSet();
            var serverFileNames = serverFiles.Select(f => f["filename"].ToString()).ToHashSet();

            foreach (var f in serverFiles)
            {
                var filename = f["filename"].ToString();
                var url = $"{serverUrl}/carousels/{filename}";
                var dest = Path.Combine(carouselsPath, filename);
                DownloadFile(url, dest);
                Log($"Download/update carousel {filename}");
            }

            foreach (var local in localFiles)
            {
                if (!serverFileNames.Contains(local))
                {
                    var path = Path.Combine(carouselsPath, local);
                    File.Delete(path);
                    Log($"Hapus file carousel {local}");
                }
            }
        }

        // private void SyncSongsFiles(List<Dictionary<string, object>> songs, string serverUrl)
        // {
        //     var songsBasePath = Path.Combine(_basePath, "Storage", "songs");

        //     var localSongs = new HashSet<string>(
        //         Directory.GetDirectories(songsBasePath).Select(d => Path.GetFileName(d)));

        //     foreach (var song in songs)
        //     {
        //         var id = song["id"].ToString();
        //         var folder = Path.Combine(songsBasePath, id);
        //         Directory.CreateDirectory(folder);

        //         localSongs.Remove(id); // akan dihapus nanti jika tidak ada di server

        //         // Cover
        //         var localCover = Path.Combine(folder, "cover.jpg");
        //         if (NeedsDownload(song, "cover_updated_at", localCover))
        //         {
        //             var url = $"{serverUrl}/files/song/{id}/cover.jpg";
        //             DownloadFile(url, localCover);
        //             Log($"Download cover song {id}");
        //         }

        //         // Song file
        //         var localMp4 = Path.Combine(folder, "song.mp4");
        //         if (NeedsDownload(song, "song_updated_at", localMp4))
        //         {
        //             var url = $"{serverUrl}/files/song/{id}/song.mp4";
        //             DownloadFile(url, localMp4);
        //             Log($"Download song file {id}");
        //         }
        //     }

        //     // Hapus folder yang tidak ada di server
        //     foreach (var id in localSongs)
        //     {
        //         var path = Path.Combine(songsBasePath, id);
        //         Directory.Delete(path, true);
        //         Log($"Hapus folder song {id}");
        //     }
        // }

        private void SyncBannersFiles(List<Dictionary<string, object>> banners, string serverUrl)
        {
            var bannerPath = Path.Combine(_basePath, "Storage", "banners");
            var localFiles = Directory.GetFiles(bannerPath)
                .Where(f => f.EndsWith(".jpg"))
                .Select(f => Path.GetFileName(f))
                .ToHashSet();

            var serverIds = banners.Select(b => b["id"].ToString()).ToHashSet();

            foreach (var banner in banners)
            {
                var id = banner["id"].ToString();
                var file = $"{id}.jpg";
                var local = Path.Combine(bannerPath, file);

                localFiles.Remove(file);

                if (NeedsDownload(banner, "banner_updated_at", local))
                {
                    var url = $"{serverUrl}/files/banner/{file}";
                    DownloadFile(url, local);
                    Log($"Download banner {id}");
                }
            }

            // Hapus file yang tidak ada di server
            foreach (var file in localFiles)
            {
                File.Delete(Path.Combine(bannerPath, file));
                Log($"Hapus file banner {file}");
            }
        }

        private bool NeedsDownload(Dictionary<string, object> item, string updatedKey, string localPath)
        {
            if (!File.Exists(localPath)) return true;
            if (!item.ContainsKey(updatedKey)) return false;

            var serverTime = DateTime.TryParse(item[updatedKey]?.ToString(), out var sTime) ? sTime : DateTime.MinValue;
            var localTime = File.GetLastWriteTimeUtc(localPath);
            return serverTime > localTime;
        }


        private void DownloadFile(string url, string destination)
        {
            try
            {
                var bytes = _http.GetByteArrayAsync(url).Result;
                File.WriteAllBytes(destination, bytes);
            }
            catch (Exception ex)
            {
                Log($"Gagal download {url}: {ex.Message}");
            }
        }

        private async Task<T?> GetJsonAsync<T>(string url)
        {
            var response = await _http.GetAsync(url);
            response.EnsureSuccessStatusCode();
            var stream = await response.Content.ReadAsStreamAsync();
            return await JsonSerializer.DeserializeAsync<T>(stream);
        }
    }

}
