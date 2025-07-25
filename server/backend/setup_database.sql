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
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  force_shutdown VARCHAR(1)
);

-- Tabel songs
CREATE TABLE IF NOT EXISTS songs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  artist VARCHAR(255),
  genre VARCHAR(255),
  album VARCHAR(255),
  release_date DATE,
  duration VARCHAR(10),
  format VARCHAR(10),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  play_count INT DEFAULT 0,
  cover_updated_at TIMESTAMP NULL DEFAULT NULL,
  song_updated_at TIMESTAMP NULL DEFAULT NULL
);

-- Tabel banners
CREATE TABLE IF NOT EXISTS banners (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  banner_updated_at TIMESTAMP NULL DEFAULT NULL
);

-- Tabel room_sessions
CREATE TABLE IF NOT EXISTS room_sessions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  room_id INT NOT NULL,
  start_time DATETIME NOT NULL,
  end_time DATETIME DEFAULT NULL,
  status ENUM('Active', 'Ended') DEFAULT 'Active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS song_playlist (
  room_id INT,
  id VARCHAR(255) PRIMARY KEY,
  title VARCHAR(255),
  artist VARCHAR(100),
  video_url VARCHAR(255),
  is_youtube BOOLEAN DEFAULT 0
)

CREATE TABLE IF NOT EXISTS call_log (
  id INT AUTO_INCREMENT PRIMARY KEY,
  room_id INT NOT NULL,
  status ENUM('Calling', 'Accepted', 'Rejected') DEFAULT 'Calling',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)

CREATE TABLE IF NOT EXISTS master_mac (
  mac_address VARCHAR(100) PRIMARY KEY
)

CREATE TABLE IF NOT EXISTS sys_params (
  key VARCHAR(100) PRIMARY KEY,
  value TEXT
)

INSERT INTO sys_params (key, value) VALUES ('login_userid', 'admin');
INSERT INTO sys_params (key, value) VALUES ('login_password', 'greenhouse1198');