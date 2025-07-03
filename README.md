# Melodies - Karaoke Management System

Sistem manajemen karaoke lengkap dengan aplikasi client untuk room karaoke dan admin panel untuk pengelolaan.

## 🏗️ Struktur Project

```
Melodies/
├── client/                 # Aplikasi karaoke (Electron)
│   ├── src/
│   │   ├── components/     # Komponen UI
│   │   ├── page/          # Halaman aplikasi
│   │   └── App.jsx        # Entry point
│   └── package.json
├── server/                 # Backend & Admin Panel
│   ├── backend/           # Express.js API
│   │   ├── index.js       # Server utama
│   │   ├── db.js          # Konfigurasi database
│   │   ├── package.json   # Dependencies backend
│   │   └── setup_database.sql # Script setup database
│   ├── frontend/          # React Admin Panel (Electron)
│   ├── uploads/           # File upload banner
│   └── README.md          # Dokumentasi server
└── README.md
```

## 🚀 Quick Start

### 1. Setup Database

1. Install MySQL dan buat database `melodies`
2. Jalankan script setup:

```bash
cd server/backend
mysql -u root -p < setup_database.sql
```

### 2. Setup Backend

```bash
cd server/backend
npm install
npm start
```

Backend akan berjalan di `http://localhost:4000`

### 3. Setup Admin Panel

```bash
cd server/frontend
npm install
npm start          # Development mode
npm run electron   # Desktop app
```

### 4. Setup Client App

```bash
cd client
npm install
npm start          # Development mode
npm run electron   # Desktop app
```

## 📋 Fitur

### Admin Panel

- **Dashboard**: Statistik dan overview sistem
- **Room Management**: Kelola room karaoke
- **Library Songs**: Kelola library lagu
- **Content Banner**: Kelola banner promosi dengan upload image
- **Settings**: Konfigurasi aplikasi
- **User**: Manajemen profil user

### Client App

- **Karaoke Player**: Pemutar lagu dengan YouTube integration
- **Volume Control**: Master, music, dan mic volume
- **Playlist Management**: Kelola playlist lagu
- **Mic Monitoring**: Suara mic diputar ke speaker

## 🔧 API Endpoints

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

## 🛠️ Tech Stack

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

### Client App

- **React** - UI framework
- **Electron** - Desktop app
- **YouTube API** - Video integration
- **Web Audio API** - Audio processing

## 📁 Database Schema

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

## 🔐 Environment Variables

Buat file `.env` di folder `server/backend/`:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=melodies
PORT=4000
```

## 📝 Development

### Menjalankan dalam Development Mode

1. **Backend**:

```bash
cd server/backend
npm run dev  # dengan nodemon untuk auto-reload
```

2. **Admin Panel**:

```bash
cd server/frontend
npm start
```

3. **Client App**:

```bash
cd client
npm start
```

### Build untuk Production

1. **Admin Panel**:

```bash
cd server/frontend
npm run build
npm run electron
```

2. **Client App**:

```bash
cd client
npm run build
npm run electron
```

## 🤝 Contributing

1. Fork repository
2. Buat feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push ke branch (`git push origin feature/AmazingFeature`)
5. Buat Pull Request

## 📄 License

Distributed under the ISC License. See `LICENSE` for more information.

## 📞 Support

Untuk bantuan dan pertanyaan, silakan buat issue di repository ini.
