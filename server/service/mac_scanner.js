const mysql = require('mysql2/promise')
const { exec } = require('child_process')
const util = require('util')
const execAsync = util.promisify(exec)

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

async function main() {
  console.log('Starting MAC address scan service...')

  setInterval(async () => {
    try {
      const subnet = '192.168.1' // Ganti dengan subnet kamu
      console.log('Pinging subnet...')
      await pingSubnet(subnet)

      const rooms = await getRooms()
      for (const room of rooms) {
        const ip = await getIPFromMAC(room.mac_address)
        if (ip) {
          await updateRoomIP(room.id, ip)
        } else {
          console.log(`IP for MAC ${room.mac_address} not found`)
        }
      }
    } catch (error) {
      console.error('An error occurred during the scan:', error)
    }
  }, 10000) // Scan setiap 60 detik
}

main()
