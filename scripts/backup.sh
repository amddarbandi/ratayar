#!/bin/bash

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/var/www/zarvan/backups"
mkdir -p $BACKUP_DIR

# 1. دیتابیس
docker exec zarvan-postgres pg_dump -U zarvan zarvan_db | gzip > $BACKUP_DIR/db_$DATE.sql.gz

# 2. .env
cp /var/www/zarvan/.env $BACKUP_DIR/env_$DATE.bak

# 3. پاک کردن بکاپ‌های قدیمی (بیش از ۳۰ روز)
find $BACKUP_DIR -name "*.gz" -mtime +30 -delete
find $BACKUP_DIR -name "*.bak" -mtime +30 -delete

echo "[$(date)] ✅ Backup: db_$DATE.sql.gz"
