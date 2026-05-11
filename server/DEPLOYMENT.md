# Deployment Guide — Investors World Realty

## VPS Setup (Hostinger KVM 4: 4 vCPU, 8GB RAM, 200GB SSD)

### 1. Install Dependencies
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Node.js 20 LTS
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# PostgreSQL
sudo apt install -y postgresql postgresql-contrib
sudo systemctl enable postgresql

# Redis
sudo apt install -y redis-server
sudo systemctl enable redis-server

# Nginx
sudo apt install -y nginx
sudo systemctl enable nginx

# PM2
sudo npm install -g pm2
```

### 2. PostgreSQL Setup
```bash
sudo -u postgres psql
CREATE USER iwrealty WITH PASSWORD 'your_secure_password';
CREATE DATABASE investors_world_realty OWNER iwrealty;
\q
```

### 3. Upload Directory Structure
```bash
sudo mkdir -p /var/www/investors-world-realty/uploads/{profiles,kyc,properties/images,properties/videos}
sudo chown -R www-data:www-data /var/www/investors-world-realty/uploads
```

### 4. Nginx Configuration
```nginx
# /etc/nginx/sites-available/investors-world-realty
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

    # API Server
    location /api/ {
        proxy_pass http://127.0.0.1:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_cache_bypass $http_upgrade;
    }

    # Uploaded files
    location /uploads/ {
        alias /var/www/investors-world-realty/uploads/;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }

    # Admin Panel (built static files)
    location /admin/ {
        alias /var/www/investors-world-realty/admin/dist/;
        try_files $uri $uri/ /admin/index.html;
    }

    # Landing Site (Next.js)
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 5. SSL (Let's Encrypt)
```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

### 6. PM2 Deployment
```bash
cd /var/www/investors-world-realty/server
npm install --production
npx prisma generate
npx prisma migrate deploy
npm run db:seed

# Start with PM2
pm2 start ecosystem.config.js --env production
pm2 save
pm2 startup
```

### 7. Log Rotation
```bash
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 30
pm2 set pm2-logrotate:compress true
```

### 8. Database Backup
```bash
# Add to crontab: daily backup at 2 AM
0 2 * * * pg_dump -U iwrealty investors_world_realty | gzip > /var/backups/db/iwrealty_$(date +\%Y\%m\%d).sql.gz
# Keep 30 days
0 3 * * * find /var/backups/db -mtime +30 -delete
```

### 9. Environment Variables (Production .env)
```env
PORT=5000
NODE_ENV=production
DATABASE_URL=postgresql://iwrealty:your_secure_password@localhost:5432/investors_world_realty
REDIS_URL=redis://localhost:6379
JWT_SECRET=generate-a-64-char-random-string
JWT_REFRESH_SECRET=generate-another-64-char-random-string
APP_BASE_URL=https://yourdomain.com
ADMIN_BASE_URL=https://yourdomain.com/admin
```

### 10. Health Check Verification
```bash
curl https://yourdomain.com/api/v1/public/health
# Expected: { "status": "success", "data": { "server": "ok", "database": "ok", "redis": "ok" } }
```
