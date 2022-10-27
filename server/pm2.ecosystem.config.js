module.exports = {
  apps: [{
    name: "seismo-app",
    script: "./server.js",
    max_memory_restart: '1G',
    env: {
      NODE_ENV: "production"
    }
  }]
}