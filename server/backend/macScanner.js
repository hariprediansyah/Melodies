const pool = require('./db')
const { exec } = require('child_process')
const os = require('os')
const util = require('util')
const execAsync = util.promisify(exec)
const axios = require('axios')

// Ambil daftar room yang punya mac_address
async function getRooms() {
  const [rows] = await pool.query('SELECT id, mac_address FROM rooms WHERE mac_address IS NOT NULL')
  return rows
}

// Update IP room dan kirim update ke client
async function updateRoomIP(id, ip, mac) {
  await pool.query('UPDATE rooms SET ip_address = ? WHERE id = ?', [ip, id])
  console.log(`Updated room ${id} with IP ${ip}`)
  // Kirim update ke client
  const serverIp = getServerIp()
  try {
    await axios.post(`http://${ip}:5771/updateserver`, { server_ip: serverIp, client_mac: mac }, { timeout: 2000 })
    console.log(`Berhasil update server_ip ke client ${ip}`)
  } catch (err) {
    console.log(`Gagal update server_ip ke client ${ip}: ${err.message}`)
  }
}

// Cari IP dari MAC address di ARP table
async function getIPFromMAC(targetMAC) {
  try {
    const { stdout } = await execAsync('arp -a')
    const lines = stdout.split('\n')
    for (const line of lines) {
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

// Dapatkan subnet lokal
function getLocalSubnet() {
  const interfaces = os.networkInterfaces()
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        const parts = iface.address.split('.')
        if (parts.length === 4) {
          return `${parts[0]}.${parts[1]}.${parts[2]}`
        }
      }
    }
  }
  return '192.168.1'
}

// Ping seluruh IP di subnet
async function pingSubnet(subnet) {
  const pingPromises = []
  for (let i = 1; i <= 254; i++) {
    const ip = `${subnet}.${i}`
    pingPromises.push(execAsync(`ping -n 1 -w 500 ${ip}`).catch(() => {}))
  }
  await Promise.all(pingPromises)
}

// Dapatkan IP server sendiri
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

// Fungsi utama: scan dan update semua room
async function scanAndUpdateRooms() {
  const log = []
  try {
    const subnet = getLocalSubnet()
    log.push(`Pinging subnet: ${subnet}`)
    await pingSubnet(subnet)
    const rooms = await getRooms()
    for (const room of rooms) {
      const ip = await getIPFromMAC(room.mac_address)
      if (ip) {
        await updateRoomIP(room.id, ip, room.mac_address)
        log.push(`Room ${room.id} (${room.mac_address}) -> IP ${ip}`)
      } else {
        log.push(`IP untuk MAC ${room.mac_address} tidak ditemukan`)
      }
    }
  } catch (error) {
    log.push('Terjadi error saat scan: ' + error)
  }
  return log
}

module.exports = {
  scanAndUpdateRooms
}
