;(() => {
  var e = {
      21: (e) => {
        'use strict'
        e.exports = require('fs')
      },
      288: (e) => {
        'use strict'
        e.exports = require('electron')
      },
      873: (e) => {
        'use strict'
        e.exports = require('path')
      }
    },
    r = {}
  function t(o) {
    var s = r[o]
    if (void 0 !== s) return s.exports
    var a = (r[o] = { exports: {} })
    return e[o](a, a.exports, t), a.exports
  }
  try {
    const { contextBridge: e, ipcRenderer: r } = t(288),
      o = t(21),
      s = t(873)
    e.exposeInMainWorld('electronAPI', {
      getDbData: () => r.invoke('get-db-data'),
      saveDb: (e) => r.invoke('save-db', e),
      getCoverImagePath: (e) => {
        const r = app.isPackaged ? s.dirname(process.execPath) : s.resolve(__dirname, '..'),
          t = s.join(r, 'storage', e.toString(), 'cover.jpg')
        return o.existsSync(t)
          ? `file://${t.replace(/\\/g, '/')}`
          : `file://${s.join(r, 'storage', 'default_cover.jpg').replace(/\\/g, '/')}`
      }
    })
  } catch (e) {
    console.error('Preload error:', e)
  }
})()
