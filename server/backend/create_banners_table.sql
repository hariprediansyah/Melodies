-- Create banners table
CREATE TABLE IF NOT EXISTS banners (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description VARCHAR(255) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Insert sample data
INSERT INTO banners (title, description) VALUES
('Sing Your Heart Out.\nThe Ultimate Karaoke Collection!', 'Discover our karaoke app, where you can dive into a fantastic library of both classic hits and the latest chart-toppers. Sing along to your favorite songs in stunning quality, all while enjoying a seamless experience. No matter your musical preference, we have the perfect tracks to get you singing!'),
('Koleksi Lagu Terbaru', 'Nikmati update lagu-lagu terbaru setiap minggu, langsung dari chart dunia!'),
('Karaoke Kualitas Tinggi', 'Audio jernih dan lirik realtime, pengalaman karaoke terbaik untuk semua usia.'),
('Buat Playlist Favoritmu', 'Susun dan simpan lagu favoritmu, siap dinyanyikan kapan saja!'); 