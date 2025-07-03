const path = require('path')

module.exports = {
  target: 'electron-preload',
  entry: './src/preload.js',
  output: {
    path: path.resolve(__dirname, 'src', 'dist'),
    filename: 'preload.bundle.js'
  },
  externals: {
    electron: 'commonjs2 electron',
    fs: 'commonjs2 fs',
    path: 'commonjs2 path'
  },
  node: {
    __dirname: false,
    __filename: false
  },
  resolve: {
    extensions: ['.js']
  }
}
