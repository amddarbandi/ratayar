#!/bin/bash

WEB_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000)
API_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:4000/api/health)

if [ "$WEB_STATUS" != "200" ]; then
  echo "[$(date)] ⚠️ WEB down (status: $WEB_STATUS). Restarting..."
  pm2 restart zarvan-web
fi

if [ "$API_STATUS" != "200" ]; then
  echo "[$(date)] ⚠️ API down (status: $API_STATUS). Restarting..."
  pm2 restart zarvan-api
fi
