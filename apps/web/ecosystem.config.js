module.exports = {
  apps: [
    {
      name: 'zarvan-web',
      script: '/var/www/zarvan/node_modules/.bin/next',
      args: 'start -p 3000',
      cwd: '/var/www/zarvan/apps/web',
      instances: 1,
      exec_mode: 'fork',
      watch: false,
      max_memory_restart: '512M',
      // 🔥 رفع ۵۰۲: اگر کرش کرد، دوباره تلاش کن
      autorestart: true,
      max_restarts: 10,
      min_uptime: '10s',
      restart_delay: 3000,
      kill_timeout: 5000,
      // 🔥 منتظر build باش
      wait_ready: false,
      listen_timeout: 10000,
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
        API_URL: 'http://localhost:4000',
      },
      error_file: '/var/www/zarvan/logs/web-error.log',
      out_file: '/var/www/zarvan/logs/web-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
    },
  ],
};
