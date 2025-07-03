# Melodies Admin Panel

Aplikasi Electron untuk admin panel Melodies Karaoke yang menggunakan API dari backend server.

## Struktur Proyek

```
server/frontend/
├── src/
│   ├── main.js              # Electron main process
│   ├── preload.js           # Electron preload script (expose API config)
│   ├── renderer.js          # React entry point
│   ├── index.html           # HTML template
│   ├── App.jsx              # React App component (dengan state management)
│   ├── components/          # React components
│   ├── pages/               # React pages
│   ├── services/            # API services
│   │   └── api.js           # API calls ke backend
│   └── dist/                # Preload bundle output
├── public/                  # Build output
├── webpack.config.js        # Webpack config untuk React
├── webpack.preload.config.js # Webpack config untuk preload
├── tailwind.config.js       # Tailwind CSS config
├── postcss.config.js        # PostCSS config
└── style.css               # Tailwind CSS input
```

## Cara Menjalankan

### Prerequisites

Pastikan backend server sudah berjalan di `http://localhost:4000`

```bash
# Jalankan backend server terlebih dahulu
cd ../backend
npm install
npm start
```

### Development Mode

```bash
# Install dependencies
npm install

# Jalankan dalam mode development
npm run dev

# Atau jalankan Electron langsung
npm start
```

### Build untuk Production

```bash
# Build aplikasi
npm run build
```

## Scripts yang Tersedia

- `npm start` - Build preload dan jalankan Electron
- `npm run dev` - Jalankan CSS dan React build dalam watch mode
- `npm run build:css` - Build Tailwind CSS dengan watch mode
- `npm run build:react` - Build React dengan watch mode
- `npm run build:react-prod` - Build React untuk production
- `npm run build:preload` - Build preload script
- `npm run build` - Build lengkap untuk production

## Struktur Electron

Aplikasi ini menggunakan struktur Electron yang sama dengan client:

1. **Main Process** (`src/main.js`) - Mengatur window Electron
2. **Preload Script** (`src/preload.js`) - Expose API config ke renderer
3. **Renderer Process** (`src/renderer.js`) - React application

## Navigation System

Aplikasi menggunakan **state management** untuk navigasi antar halaman, bukan React Router:

- **State Management**: Menggunakan `useState` untuk mengatur halaman aktif
- **Sidebar Navigation**: Komponen Sidebar menerima `activeMenu` dan `onMenuChange` props
- **Content Rendering**: Fungsi `renderContent()` menampilkan komponen berdasarkan `activeMenu`

```javascript
const [activeMenu, setActiveMenu] = useState('dashboard')

const renderContent = () => {
  switch (activeMenu) {
    case 'dashboard':
      return <Dashboard />
    case 'room':
      return <RoomManagement />
    // ... lainnya
  }
}
```

## API Integration

Admin panel menggunakan API dari backend server (`http://localhost:4000`):

### Room Management

- `GET /rooms` - Ambil semua room
- `POST /rooms` - Buat room baru
- `PUT /rooms/:id` - Update room
- `DELETE /rooms/:id` - Hapus room

### Songs Management

- `GET /songs` - Ambil semua lagu
- `POST /songs` - Tambah lagu baru
- `PUT /songs/:id` - Update lagu
- `DELETE /songs/:id` - Hapus lagu

### Banner Management

- `GET /banners` - Ambil semua banner
- `POST /banners` - Upload banner baru
- `PUT /banners/:id` - Update banner
- `DELETE /banners/:id` - Hapus banner

## API Services

File `src/services/api.js` berisi semua fungsi untuk berkomunikasi dengan backend:

```javascript
import { roomAPI, songsAPI, bannerAPI } from './services/api'

// Contoh penggunaan
const rooms = await roomAPI.getAll()
const newRoom = await roomAPI.create({ name: 'Room 1', description: 'Test room' })
```

## Perbedaan dengan Client

- **Tidak menggunakan React Router** - Admin panel menggunakan state management untuk navigasi
- **Tidak menggunakan IPC handlers** - Admin panel menggunakan HTTP API
- **Backend integration** - Terhubung langsung dengan backend server
- **File upload support** - Mendukung upload file untuk banner
- **Database management** - CRUD operations untuk rooms, songs, banners
