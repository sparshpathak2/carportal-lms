module.exports = {
  apps: [
    {
      name: "api-gateway",
      script: "src/index.js",
      watch: false,
      env: {
        PORT: 3001
      }
    }
  ]
}


