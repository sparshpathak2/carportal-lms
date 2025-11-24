module.exports = {
  apps: [
    {
      name: "frontend",
      script: "node_modules/next/dist/bin/next",
      args: "start -p 3000",
      cwd: "/home/ubuntu/carportal-lms/frontend",
      env: {
        NODE_ENV: "production",
     }
    }
  ]
};





