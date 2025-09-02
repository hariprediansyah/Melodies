using Microsoft.Data.Sqlite;
using System.Net.Http;
using System.Text.Json;
using System.Threading;

namespace ServiceSync
{
    public class SyncService : IAsyncDisposable
    {
        private readonly string _basePath;
        private readonly string _dbPath;
        private readonly string _logPath;
        private SqliteConnection _conn;
        private readonly HttpClient _http;
        private CancellationTokenSource? _cts;
        private Task? _runnerTask;

        // atur interval di sini
        private static readonly TimeSpan SyncInterval = TimeSpan.FromMinutes(1);

        // konstanta untuk cleanup
        private const long MaxLogSizeBytes = 100L * 1024 * 1024; // 300 MB
        private static readonly TimeSpan MaxSongAge = TimeSpan.FromDays(7); // 7 hari

        public SyncService()
        {
            _basePath = AppContext.BaseDirectory;
            _dbPath = Path.Combine(_basePath, "Storage", "database.sqlite");
            _logPath = Path.Combine(_basePath, "Logs", "sync.log");
            _http = new HttpClient();
            SetupFolders();
            SetupDatabase();
        }

        public Task StartAsync(CancellationToken externalToken = default)
        {
            // buat CTS gabungan supaya bisa di-cancel dari luar maupun internal
            _cts = CancellationTokenSource.CreateLinkedTokenSource(externalToken);
            var token = _cts.Token;

            _runnerTask = Task.Run(async () =>
            {
                // jalankan sekali saat start
                await SafeSync(token);

                // lalu periodic
                using var timer = new PeriodicTimer(SyncInterval);
                try
                {
                    while (await timer.WaitForNextTickAsync(token))
                    {
                        await SafeSync(token);
                    }
                }
                catch (OperationCanceledException) { /* normal on stop */ }
            }, token);

            Log("Client update server listening on port 5771 (PeriodicTimer mode)");
            return Task.CompletedTask;
        }

        public async Task StopAsync()
        {
            if (_cts != null)
            {
                try { _cts.Cancel(); } catch { }
            }
            if (_runnerTask != null)
            {
                try { await _runnerTask; } catch (OperationCanceledException) { }
            }
        }

        public async ValueTask DisposeAsync()
        {
            await StopAsync();
            _conn?.Dispose();
            _http?.Dispose();
            _cts?.Dispose();
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
                using var cmd = _conn.CreateCommand();
                cmd.CommandText = cmdText;
                cmd.ExecuteNonQuery();
            }
        }

        public void UpdateSysParam(string key, string value)
        {
            using var cmd = _conn.CreateCommand();
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
                // Cek ukuran log sebelum menulis
                CheckAndCleanupLog();

                using var fs = new FileStream(_logPath, FileMode.Append, FileAccess.Write, FileShare.ReadWrite);
                using var sw = new StreamWriter(fs);
                sw.Write(line);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[LOGGING ERROR] {ex.Message}");
            }
        }

        private void CheckAndCleanupLog()
        {
            try
            {
                if (File.Exists(_logPath))
                {
                    var fileInfo = new FileInfo(_logPath);
                    if (fileInfo.Length > MaxLogSizeBytes)
                    {
                        try
                        {
                            // Hapus file log yang terlalu besar
                            File.Delete(_logPath);
                            Console.WriteLine($"[LOG CLEANUP] Log file deleted (size: {fileInfo.Length / (1024 * 1024)} MB)");
                        }
                        catch (Exception ex)
                        {
                            Console.WriteLine($"[LOG CLEANUP ERROR] {ex.Message}");
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[LOG CHECK ERROR] {ex.Message}");
            }
        }

        private void CleanupOldSongs()
        {
            try
            {
                var songsPath = Path.Combine(_basePath, "Storage", "songs");
                if (!Directory.Exists(songsPath)) return;

                var cutoffDate = DateTime.Now.Subtract(MaxSongAge);
                var deletedCount = 0;

                foreach (var songDir in Directory.GetDirectories(songsPath))
                {
                    var songFile = Path.Combine(songDir, "song.mp4");
                    if (File.Exists(songFile))
                    {
                        var creationTime = File.GetCreationTime(songFile);
                        if (creationTime < cutoffDate)
                        {
                            try
                            {
                                File.Delete(songFile);
                                deletedCount++;

                                var songId = Path.GetFileName(songDir);
                                Log($"Hapus song.mp4 lama untuk ID {songId} (created: {creationTime:yyyy-MM-dd})");

                                // Hapus folder jika kosong
                                if (Directory.GetFiles(songDir).Length == 0)
                                {
                                    Directory.Delete(songDir);
                                    Log($"Hapus folder kosong {songId}");
                                }
                            }
                            catch (Exception ex)
                            {
                                Log($"Gagal hapus song.mp4 di {songFile}: {ex.Message}");
                            }
                        }
                    }
                }

                if (deletedCount > 0)
                {
                    Log($"Cleanup selesai: {deletedCount} file song.mp4 lama dihapus");
                }
            }
            catch (Exception ex)
            {
                Log($"ERROR cleanup songs: {ex.Message}");
            }
        }

        private string? GetServerUrl()
        {
            try
            {
                using var cmd = _conn.CreateCommand();
                cmd.CommandText = "SELECT value FROM sys_params WHERE key = 'server_ip'";
                var result = cmd.ExecuteScalar()?.ToString();
                if (!string.IsNullOrWhiteSpace(result))
                {
                    return result.StartsWith("http", StringComparison.OrdinalIgnoreCase) ? result : $"http://{result}";
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
                using var cmd = _conn.CreateCommand();
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

        private async Task<bool> CheckForceShutdown(string serverUrl, string roomId, CancellationToken ct)
        {
            try
            {
                var url = $"{serverUrl}/rooms/force-shutdown/{roomId}";
                Log($"Cek force shutdown di {url}");
                using var response = await _http.GetAsync(url, ct);
                response.EnsureSuccessStatusCode();
                var json = await response.Content.ReadAsStringAsync(ct);
                return json.Contains("true", StringComparison.OrdinalIgnoreCase);
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

        // Pembungkus Sync dengan try/catch supaya loop timer aman
        private async Task SafeSync(CancellationToken ct)
        {
            try { await Sync(ct); }
            catch (OperationCanceledException) { /* normal on cancel */ }
            catch (Exception ex)
            {
                Log("UNHANDLED ERROR in Sync: " + ex);
                Console.WriteLine("[SYNC] Unhandled: " + ex);
            }
        }

        private async Task Sync(CancellationToken ct)
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

            Log("Sebelum shutdown");
            if (await CheckForceShutdown(serverUrl, roomId, ct))
            {
                Log($"Flag force_shutdown aktif untuk room {roomId}. Shutdown akan dilakukan.");
                ForceShutdown();
                return;
            }

            // Lakukan cleanup file lama sebelum sync
            CleanupOldSongs();

            Log("Mulai sinkronisasi...");
            Console.WriteLine("[SYNC] Mulai sinkronisasi...");

            var songs = await GetJsonAsync<List<Dictionary<string, object>>>($"{serverUrl}/songs", ct) ?? new();
            var banners = await GetJsonAsync<List<Dictionary<string, object>>>($"{serverUrl}/banners", ct) ?? new();
            var carousels = await GetJsonAsync<List<Dictionary<string, object>>>($"{serverUrl}/carousels/files", ct) ?? new();

            SyncTable("songs", songs, new[] { "id", "title", "artist", "genre", "album", "release_date", "duration", "play_count", "created_at", "updated_at", "cover_updated_at", "song_updated_at", "vocal" });
            SyncTable("banners", banners, new[] { "id", "title", "description", "created_at", "updated_at", "banner_updated_at" });

            SyncCarousels(carousels, serverUrl, ct);
            SyncBannersFiles(banners, serverUrl, ct);

            Log("Sinkronisasi selesai.");
            Console.WriteLine("[SYNC] Sinkronisasi selesai.");
        }

        private void SyncTable(string table, List<Dictionary<string, object>> rows, string[] columns)
        {
            foreach (var row in rows)
            {
                var keys = string.Join(", ", columns);
                var values = string.Join(", ", columns.Select(c => "@" + c));
                var update = string.Join(", ", columns.Select(c => $"{c} = @{c}"));

                using var cmd = _conn.CreateCommand();
                cmd.CommandText = $"INSERT INTO {table} ({keys}) VALUES ({values}) ON CONFLICT(id) DO UPDATE SET {update}";

                foreach (var col in columns)
                {
                    object? value = "";
                    if (row.TryGetValue(col, out var rawValue))
                    {
                        if (rawValue is JsonElement element)
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
                        else
                        {
                            value = rawValue;
                        }
                    }
                    cmd.Parameters.AddWithValue("@" + col, value ?? "");
                }

                cmd.ExecuteNonQuery();
            }
        }

        private void SyncCarousels(List<Dictionary<string, object>> serverFiles, string serverUrl, CancellationToken ct)
        {
            var carouselsPath = Path.Combine(_basePath, "Storage", "carousels");
            Directory.CreateDirectory(carouselsPath);

            var localFiles = Directory.GetFiles(carouselsPath).Select(Path.GetFileName).ToHashSet(StringComparer.OrdinalIgnoreCase);
            var serverFileNames = serverFiles.Select(f => f["filename"]?.ToString() ?? "").ToHashSet(StringComparer.OrdinalIgnoreCase);

            foreach (var f in serverFiles)
            {
                var filename = f["filename"]?.ToString();
                if (string.IsNullOrWhiteSpace(filename)) continue;

                var url = $"{serverUrl}/carousels/{filename}";
                var dest = Path.Combine(carouselsPath, filename);
                DownloadFileAsync(url, dest, ct).GetAwaiter().GetResult(); // sinkron supaya urutan log rapi
                Log($"Download/update carousel {filename}");
            }

            foreach (var local in localFiles)
            {
                if (!serverFileNames.Contains(local))
                {
                    var path = Path.Combine(carouselsPath, local);
                    try
                    {
                        File.Delete(path);
                        Log($"Hapus file carousel {local}");
                    }
                    catch (Exception ex)
                    {
                        Log($"Gagal hapus carousel {local}: {ex.Message}");
                    }
                }
            }
        }

        private void SyncBannersFiles(List<Dictionary<string, object>> banners, string serverUrl, CancellationToken ct)
        {
            var bannerPath = Path.Combine(_basePath, "Storage", "banners");
            Directory.CreateDirectory(bannerPath);

            var localFiles = Directory.GetFiles(bannerPath)
                .Where(f => f.EndsWith(".jpg", StringComparison.OrdinalIgnoreCase) || f.EndsWith(".mp4", StringComparison.OrdinalIgnoreCase))
                .Select(Path.GetFileName)
                .ToHashSet(StringComparer.OrdinalIgnoreCase);

            var serverIds = banners.Select(b => b["id"]?.ToString() ?? "").ToHashSet(StringComparer.OrdinalIgnoreCase);

            foreach (var banner in banners)
            {
                var id = banner["id"]?.ToString();
                if (string.IsNullOrWhiteSpace(id)) continue;

                var file = $"{id}{(banner["extension"]?.ToString() == "mp4" ? ".mp4" : ".jpg")}";
                var local = Path.Combine(bannerPath, file);

                localFiles.Remove(file);

                if (NeedsDownload(banner, "banner_updated_at", local))
                {
                    var url = $"{serverUrl}/files/banner/{file}";
                    DownloadFileAsync(url, local, ct).GetAwaiter().GetResult();
                    Log($"Download banner {id}");
                }
            }

            foreach (var file in localFiles)
            {
                try
                {
                    File.Delete(Path.Combine(bannerPath, file));
                    Log($"Hapus file banner {file}");
                }
                catch (Exception ex)
                {
                    Log($"Gagal hapus banner {file}: {ex.Message}");
                }
            }
        }

        private bool NeedsDownload(Dictionary<string, object> item, string updatedKey, string localPath)
        {
            if (!File.Exists(localPath)) return true;
            if (!item.ContainsKey(updatedKey)) return false;

            var serverTime = DateTime.TryParse(item[updatedKey]?.ToString(), out var sTime) ? sTime.ToUniversalTime() : DateTime.MinValue;
            var localTime = File.GetLastWriteTimeUtc(localPath);
            return serverTime > localTime;
        }

        private async Task DownloadFileAsync(string url, string destination, CancellationToken ct)
        {
            try
            {
                var bytes = await _http.GetByteArrayAsync(url, ct);
                Directory.CreateDirectory(Path.GetDirectoryName(destination)!);
                await File.WriteAllBytesAsync(destination, bytes, ct);
            }
            catch (Exception ex)
            {
                Log($"Gagal download {url}: {ex.Message}");
            }
        }

        private async Task<T?> GetJsonAsync<T>(string url, CancellationToken ct)
        {
            using var response = await _http.GetAsync(url, ct);
            response.EnsureSuccessStatusCode();
            await using var stream = await response.Content.ReadAsStreamAsync(ct);
            return await JsonSerializer.DeserializeAsync<T>(stream, cancellationToken: ct);
        }
    }
}