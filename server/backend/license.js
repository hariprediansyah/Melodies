const fs = require('fs')
const path = require('path')
const { machineIdSync } = require('node-machine-id')
const axios = require('axios')

const LICENSE_FILE = path.join(__dirname, 'licensed.json')

function getHardwareId() {
  return machineIdSync()
}

function isLicensed() {
  if (!fs.existsSync(LICENSE_FILE)) return false
  try {
    const data = JSON.parse(fs.readFileSync(LICENSE_FILE, 'utf-8'))
    const currentId = getHardwareId()

    return data.status === 'licensed' && data.hardwareId === currentId
  } catch {
    return false
  }
}

async function activateLicense(licenseKey) {
  const hardwareId = getHardwareId()
  // Ganti URL di bawah dengan API kamu
  const apiUrl = 'https://master.skylerasolutions.com/activate-license'
  try {
    const body = { licenseKey, hardwareId }
    console.log('Activating license with body:', body)
    const res = await axios.post(apiUrl, body)
    console.log('License activation response:', res.data)
    if (res.data && res.data.success) {
      fs.writeFileSync(
        LICENSE_FILE,
        JSON.stringify(
          {
            status: 'licensed',
            hardwareId,
            activatedAt: new Date().toISOString(),
            licenseKey
          },
          null,
          2
        )
      )
      return { success: true }
    }
    console.error('License activation failed:', res.data)
    return { success: false, message: res.data && res.data.message }
  } catch (err) {
    console.error('License activation error:', err.message)
    return { success: false, message: err.message }
  }
}

module.exports = {
  isLicensed,
  activateLicense,
  getHardwareId
}
