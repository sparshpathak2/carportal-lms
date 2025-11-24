module.exports = {
  apps: [
    {
      name: "leads-management-service",
      script: "src/index.js",
      watch: false,
      env: {
        PORT: 3003
      }
    }
  ]
}


