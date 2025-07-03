-- Setup Database Melodies
-- Jalankan script ini di MySQL untuk membuat database dan tabel

-- Buat database jika belum ada
CREATE DATABASE IF NOT EXISTS melodies;
USE melodies;

-- Tabel rooms
CREATE TABLE IF NOT EXISTS rooms (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  status ENUM('Active', 'Standby', 'Inactive') DEFAULT 'Active',
  mac_address VARCHAR(100),
  ip_address VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tabel songs
CREATE TABLE IF NOT EXISTS songs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  artist VARCHAR(255),
  folder VARCHAR(255),
  album VARCHAR(255),
  release_date DATE,
  duration VARCHAR(10),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tabel banners
CREATE TABLE IF NOT EXISTS banners (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  image VARCHAR(500),
  status ENUM('Active', 'Inactive') DEFAULT 'Active',
  url VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  banner_updated_at TIMESTAMP NULL DEFAULT NULL
);

-- Insert sample data untuk rooms
INSERT INTO rooms (name, description, status) VALUES
('Melody Haven', 'Melody Haven is a serene retreat designed for relaxation and creativity. With soft hues...', 'Active'),
('Rhythm Room', 'Rhythm Room is a dynamic space that encourages movement and expression. Decke...', 'Active'),
('Inspiration Loft', 'Inspiration Loft is a high-ceilinged space filled with natural light, designed to spark cr...', 'Active'),
('Harmony Hub', 'Melody Haven is a serene retreat designed for relaxation and creativity. With soft hue...', 'Standby'),
('Chorus Chamber', 'Chorus Chamber is an interactive environment designed for collaboration and teamw...', 'Standby'),
('Visionary Vault', 'Visionary Vault is a futuristic room that merges technology with artistry. Equipped wit...', 'Standby'),
('Serenity Studio', 'Serenity Studio provides an intimate setting for personal projects and reflection. Ador...', 'Inactive'),
('Tune Oasis', 'Melody Haven is a serene retreat designed for relaxation and creativity. With soft hue...', 'Inactive'),
('Echo Enclave', 'Echo Enclave offers a unique acoustic experience ideal for sound exploration and mu...', 'Inactive'),
('Creativity Cove', 'Creativity Cove is a vibrant and inspiring space designed to ignite your imagination. B...', 'Active');

-- Insert sample data untuk songs
INSERT INTO songs (title, singer, folder, album, release_date, duration) VALUES
('Bohemian Rhapsody', 'Queen', 'queen_folder', 'A Night at the Opera', '1975-11-21', '5:55'),
('Hotel California', 'Eagles', 'eagles_folder', 'Hotel California', '1976-12-08', '6:30'),
('Imagine', 'John Lennon', 'lennon_folder', 'Imagine', '1971-09-09', '3:03'),
('Stairway to Heaven', 'Led Zeppelin', 'zeppelin_folder', 'Led Zeppelin IV', '1971-11-08', '8:02'),
('Yesterday', 'The Beatles', 'beatles_folder', 'Help!', '1965-08-06', '2:05'),
('Wonderwall', 'Oasis', 'oasis_folder', '(What''s the Story) Morning Glory?', '1995-10-30', '4:18'),
('Creep', 'Radiohead', 'radiohead_folder', 'Pablo Honey', '1992-09-21', '3:58'),
('Smells Like Teen Spirit', 'Nirvana', 'nirvana_folder', 'Nevermind', '1991-09-10', '5:01'),
('Sweet Child O'' Mine', 'Guns N'' Roses', 'gnr_folder', 'Appetite for Destruction', '1987-07-21', '5:56'),
('Nothing Else Matters', 'Metallica', 'metallica_folder', 'Metallica', '1991-08-12', '6:28');

-- Insert sample data untuk banners
INSERT INTO banners (title, image, status, url) VALUES
('Promo Spesial Lebaran', '/uploads/banner1.jpg', 'Active', 'https://promo-lebaran.com'),
('Diskon Akhir Tahun', '/uploads/banner2.jpg', 'Inactive', 'https://diskon-tahun.com');

-- Tampilkan data yang sudah diinsert
SELECT 'Rooms:' as table_name, COUNT(*) as count FROM rooms
UNION ALL
SELECT 'Songs:' as table_name, COUNT(*) as count FROM songs
UNION ALL
SELECT 'Banners:' as table_name, COUNT(*) as count FROM banners; 