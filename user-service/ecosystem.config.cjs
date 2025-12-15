// module.exports = {
//   apps: [
//     {
//       name: "user-service",
//       script: "src/index.js",
//       watch: false,
//       env: {
//         PORT: 3002
//       }
//     }
//   ]
// }


module.exports = {
  apps: [
    {
      name: "user-service",

      script: "src/index.js",
      cwd: "/home/ubuntu/carportal-lms/user-service",

      // ---- Security ----
      watch: false,
      autorestart: true,
      max_memory_restart: "300M",

      // ---- Environment ----
      env: {
        NODE_ENV: "production",
        PORT: 3002,
        HOST: "127.0.0.1"
      },

      // ---- Hardening ----
      exec_mode: "fork",
      instances: 1,
      kill_timeout: 5000,
      listen_timeout: 5000,
      time: true
    }
  ]
};

