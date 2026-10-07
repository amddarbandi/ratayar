module.exports = {
  apps: [
    {
      name: 'zarvan-api',
      script: './dist/main.js',
      cwd: '/var/www/zarvan/apps/api',
      instances: 1,
      exec_mode: 'fork',
      watch: false,
      max_memory_restart: '1G',
      autorestart: true,
      max_restarts: 10,
      min_uptime: '10s',
      restart_delay: 3000,
      kill_timeout: 5000,
      env: {
        NODE_ENV: 'production',
        API_PORT: 4000,
      },
      error_file: '/var/www/zarvan/logs/api-error.log',
      out_file: '/var/www/zarvan/logs/api-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
    },
  ],
};
