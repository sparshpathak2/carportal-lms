module.exports = {
  apps: [
    {
      name: "notification-service",
      script: "src/index.js",
      watch: false,
      env: {
        PORT: 3004
      }
    }
  ]
};


