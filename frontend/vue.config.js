const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  transpileDependencies: true,
  devServer: {
    proxy: {
      '/socket': {
        target: 'http://backend:3000',
        ws: true,
        changeOrigin: true,
        pathRewrite: {'^/socket' : ''}
      }
    }
  }
})
