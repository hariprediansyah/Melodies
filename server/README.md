# Melodies Server

Server untuk sistem manajemen karaoke Melodies yang terdiri dari backend API dan admin panel frontend.

## Struktur Folder

```
server/
├── backend/          # Express.js API
│   ├── index.js      # Server utama
│   ├── db.js         # Konfigurasi database
│   ├── package.json  # Dependencies backend
│   └── setup_database.sql # Script setup database
├── frontend/         # React Admin Panel (Electron)
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   └── App.jsx
│   └── package.json
├── uploads/          # Folder untuk file upload banner
└── README.md         # Dokumentasi ini
```

## Setup

### 1. Setup Backend

```bash
cd backend
npm install
npm start
```

Backend akan berjalan di `http://localhost:4000`

### 2. Setup Database

1. Install MySQL dan buat database `melodies`
2. Jalankan script setup:

```bash
cd backend
mysql -u root -p < setup_database.sql
```

### 3. Setup Frontend (Admin Panel)

```bash
cd frontend
npm install
npm start          # Development mode
npm run electron   # Desktop app
```

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

## Fitur Admin Panel

- **Dashboard**: Statistik dan overview sistem
- **Room Management**: Kelola room karaoke
- **Library Songs**: Kelola library lagu
- **Content Banner**: Kelola banner promosi dengan upload image
- **Settings**: Konfigurasi aplikasi
- **User**: Manajemen profil user

## Development

### Menjalankan Backend dalam Development Mode

```bash
cd backend
npm run dev  # dengan nodemon untuk auto-reload
```

### Menjalankan Frontend dalam Development Mode

```bash
cd frontend
npm start
```

### Build untuk Production

1. **Admin Panel**:

```bash
cd frontend
npm run build
npm run electron
```

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

## Tech Stack

### Backend

- **Express.js** - Web framework
- **MySQL** - Database
- **Multer** - File upload handling
- **CORS** - Cross-origin resource sharing

### Frontend (Admin Panel)

- **React** - UI framework
- **Tailwind CSS** - Styling
- **React Router** - Navigation
- **Electron** - Desktop app wrapper
