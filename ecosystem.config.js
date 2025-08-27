module.exports = {
  apps: [
    {
      name: "bugscreator-wishes",
      script: "node_modules/next/dist/bin/next",
      args: "start",
      instances: "max", // Or a number of instances
      autorestart: true,
      watch: true,
      max_memory_restart: "1G",
      env: {
        NODE_ENV: "production",
        PORT: 2905
      },
      env_production: {
        NODE_ENV: "production",
        PORT: 2905
      }
    }
  ]
};
