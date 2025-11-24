module.exports = {
  apps: [
    {
      name: "user-service",
      script: "src/index.js",
      watch: false,
      env: {
        PORT: 3002
      }
    }
  ]
}


