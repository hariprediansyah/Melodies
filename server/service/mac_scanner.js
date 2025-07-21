const mysql = require('mysql2/promise')
const { exec } = require('child_process')
const os = require('os')
const util = require('util')
const execAsync = util.promisify(exec)
const axios = require('axios')

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'melodies',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
})

async function getRooms() {
  const [rows] = await pool.query('SELECT id, mac_address FROM rooms WHERE mac_address IS NOT NULL')
  return rows
}

async function updateRoomIP(id, ip) {
  await pool.query('UPDATE rooms SET ip_address = ? WHERE id = ?', [ip, id])
  console.log(`Updated room ${id} with IP ${ip}`)
  // Kirim update ke client
  const serverIp = getServerIp()
  try {
    await axios.post(`http://${ip}:5771/updateserver`, { server_ip: serverIp }, { timeout: 2000 })
    console.log(`Berhasil update server_ip ke client ${ip}`)
  } catch (err) {
    console.log(`Gagal update server_ip ke client ${ip}: ${err.message}`)
  }
}

async function getIPFromMAC(targetMAC) {
  try {
    const { stdout } = await execAsync('arp -a')
    const lines = stdout.split('\n')

    for (const line of lines) {
      console.log(line)

      if (line.toLowerCase().includes(targetMAC.toLowerCase())) {
        const parts = line.split(' ').filter((p) => p.trim() !== '')
        const ip = parts[0].replace('(', '').replace(')', '')
        return ip
      }
    }
    return null
  } catch (error) {
    console.error('Failed to read ARP table:', error)
    return null
  }
}

// Fungsi untuk mendapatkan subnet dari IP lokal
function getLocalSubnet() {
  const interfaces = os.networkInterfaces()
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      // Hanya IPv4 dan bukan internal (bukan 127.0.0.1)
      if (iface.family === 'IPv4' && !iface.internal) {
        // Contoh: 192.168.1.23 -> 192.168.1
        const parts = iface.address.split('.')
        if (parts.length === 4) {
          return `${parts[0]}.${parts[1]}.${parts[2]}`
        }
      }
    }
  }
  // Default fallback
  return '192.168.1'
}

async function pingSubnet(subnet) {
  const pingPromises = []
  for (let i = 1; i <= 254; i++) {
    const ip = `${subnet}.${i}`
    pingPromises.push(
      execAsync(`ping -n 1 -w 500 ${ip}`).catch(() => {}) // Windows
      // execAsync(`ping -c 1 -W 1 ${ip}`).catch(() => {}) // Linux/Mac
    )
  }
  await Promise.all(pingPromises)
}

// Fungsi untuk mendapatkan IP address server sendiri
function getServerIp() {
  const interfaces = os.networkInterfaces()
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address
      }
    }
  }
  return '127.0.0.1'
}

async function main() {
  console.log('Starting MAC address scan service...')

  setInterval(async () => {
    try {
      const subnet = getLocalSubnet()
      console.log('Pinging subnet:', subnet)
      await pingSubnet(subnet)

      const rooms = await getRooms()
      for (const room of rooms) {
        const ip = await getIPFromMAC(room.mac_address)
        if (ip) {
          await updateRoomIP(room.id, ip)
        } else {
          console.log(`IP untuk MAC ${room.mac_address} tidak ditemukan`)
        }
      }
    } catch (error) {
      console.error('Terjadi error saat scan:', error)
    }
  }, 10000) // Scan setiap 10 detik
}

main()
