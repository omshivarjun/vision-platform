#!/bin/bash

# Vision Platform Demo Data Seeder
set -e

# Configuration
API_URL="${API_URL:-http://localhost:3001}"
ADMIN_EMAIL="${ADMIN_EMAIL:-admin@vision-platform.com}"
ADMIN_PASSWORD="${ADMIN_PASSWORD:-admin123}"
DEMO_USER_EMAIL="${DEMO_USER_EMAIL:-demo@vision-platform.com}"
DEMO_USER_PASSWORD="${DEMO_USER_PASSWORD:-demo123}"

echo "🚀 Vision Platform Demo Data Seeder"
echo "=================================="

# Wait for API service
echo "⏳ Waiting for API service..."
until curl -s -f "$API_URL/health" > /dev/null; do
    sleep 2
done
echo "✅ API service ready"

# Create admin user
echo "👤 Creating admin user..."
curl -s -X POST "$API_URL/api/auth/register" \
    -H "Content-Type: application/json" \
    -d "{\"email\":\"$ADMIN_EMAIL\",\"password\":\"$ADMIN_PASSWORD\",\"firstName\":\"Admin\",\"lastName\":\"User\",\"role\":\"admin\"}" > /dev/null

# Create demo user
echo "👤 Creating demo user..."
curl -s -X POST "$API_URL/api/auth/register" \
    -H "Content-Type: application/json" \
    -d "{\"email\":\"$DEMO_USER_EMAIL\",\"password\":\"$DEMO_USER_PASSWORD\",\"firstName\":\"Demo\",\"lastName\":\"User\",\"role\":\"user\"}" > /dev/null

# Login as admin
echo "🔑 Logging in as admin..."
admin_response=$(curl -s -X POST "$API_URL/api/auth/login" \
    -H "Content-Type: application/json" \
    -d "{\"email\":\"$ADMIN_EMAIL\",\"password\":\"$ADMIN_PASSWORD\"}")
admin_token=$(echo "$admin_response" | grep -o '"accessToken":"[^"]*"' | cut -d'"' -f4)

# Add languages
echo "🌍 Adding supported languages..."
languages=("en:English:English:ltr" "es:Spanish:Español:ltr" "fr:French:Français:ltr" "de:German:Deutsch:ltr" "it:Italian:Italiano:ltr")
for lang in "${languages[@]}"; do
    IFS=':' read -r code name native direction <<< "$lang"
    curl -s -X POST "$API_URL/api/languages" \
        -H "Content-Type: application/json" \
        -H "Authorization: Bearer $admin_token" \
        -d "{\"code\":\"$code\",\"name\":\"$name\",\"nativeName\":\"$native\",\"direction\":\"$direction\",\"isActive\":true}" > /dev/null
done

echo "✅ Demo data seeding completed!"
echo "🔑 Login: $DEMO_USER_EMAIL / $DEMO_USER_PASSWORD"
echo "🌐 Web App: http://localhost:3000"
