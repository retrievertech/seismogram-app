module.exports = {
  apps: [{
    name: "seismo-app",
    script: "./server.js",
    env: {
      NODE_ENV: "production"
    }
  }]
}
