# Melodies Backend API

Backend API untuk sistem manajemen karaoke Melodies dengan Express.js dan MySQL.

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Setup Database

1. Install MySQL dan buat database `melodies`
2. Jalankan script setup:

```bash
mysql -u root -p < setup_database.sql
```

### 3. Konfigurasi Database

Edit file `db.js` sesuai dengan konfigurasi MySQL Anda:

```javascript
const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '', // sesuaikan dengan password MySQL
  database: 'melodies',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
})
```

### 4. Jalankan Server

```bash
# Production
npm start

# Development (dengan auto-reload)
npm run dev
```

Server akan berjalan di `http://localhost:4000`

## API Endpoints

### Rooms

- `GET /rooms` - Ambil semua data room
- `POST /rooms` - Tambah room baru
- `PUT /rooms/:id` - Update room
- `DELETE /rooms/:id` - Hapus room

### Songs

- `GET /songs` - Ambil semua data song
- `POST /songs` - Tambah song baru
- `PUT /songs/:id` - Update song
- `DELETE /songs/:id` - Hapus song

### Banners

- `GET /banners` - Ambil semua data banner
- `POST /banners` - Tambah banner baru (dengan upload image)
- `PUT /banners/:id` - Update banner (dengan upload image)
- `DELETE /banners/:id` - Hapus banner

## File Upload

File upload untuk banner disimpan di folder `../uploads/` dan dapat diakses melalui endpoint `/uploads/filename`.

## Database Schema

### Rooms

```sql
CREATE TABLE rooms (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  status ENUM('Active', 'Standby', 'Inactive') DEFAULT 'Active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### Songs

```sql
CREATE TABLE songs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  singer VARCHAR(255),
  folder VARCHAR(255),
  album VARCHAR(255),
  release_date DATE,
  duration VARCHAR(10),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### Banners

```sql
CREATE TABLE banners (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  image VARCHAR(500),
  status ENUM('Active', 'Inactive') DEFAULT 'Active',
  url VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

## Environment Variables

Buat file `.env` untuk konfigurasi:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=melodies
PORT=4000
```

## Dependencies

- **express**: Web framework
- **mysql2**: MySQL client
- **multer**: File upload handling
- **cors**: Cross-origin resource sharing
- **nodemon**: Development auto-reload (dev dependency)
