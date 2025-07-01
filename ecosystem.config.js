module.exports = {
  apps: [{
    name: 'Codeplanner_Frontend',
    script: 'npm',
    args: 'start',
    cwd: '/home/ubuntu/codeplanner/Codeplanner_Frontend',
    env: {
      NODE_ENV: 'development',
      PORT: 3000,
      NEXT_PUBLIC_API_URL: 'http://localhost:5000',
      NEXT_PUBLIC_ENV: 'development'
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 3000,
      NEXT_PUBLIC_API_URL: 'http://3.38.25.129:5000',
      NEXT_PUBLIC_ENV: 'production'
    },
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true
  }]
} 