module.exports = {
  apps: [
    {
      name: "athlete-tracker-backend",
      script: "app.js", // ili "index.js", zavisi od tvog entry pointa
      instances: 1,
      autorestart: true,
      watch: false,
      env: {
        NODE_ENV: "production",
        PORT: 5000
      }
    }
  ]
};