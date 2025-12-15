// module.exports = {
//   apps: [
//     {
//       name: "frontend",
//       script: "node_modules/next/dist/bin/next",
//       args: "start -p 3000",
//       cwd: "/home/ubuntu/carportal-lms/frontend",
//       env: {
//         NODE_ENV: "production",
//      }
//     }
//   ]
// };

module.exports = {
  apps: [
    {
      name: "frontend",

      script: "node_modules/next/dist/bin/next",
      args: "start -p 3000 -H 127.0.0.1",
      cwd: "/home/ubuntu/carportal-lms/frontend",

      watch: false,
      autorestart: true,
      max_memory_restart: "400M",

      env: {
        NODE_ENV: "production",
        PORT: 3000,
        HOST: "127.0.0.1"
      },

      exec_mode: "fork",
      instances: 1,
      kill_timeout: 5000,
      time: true
    }
  ]
};



