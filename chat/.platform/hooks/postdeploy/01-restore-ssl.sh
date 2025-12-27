#!/bin/bash

# Restore SSL configuration if certificates exist but nginx config doesn't have SSL
# This script runs after each deployment to ensure SSL configuration is preserved

if [ -f /etc/letsencrypt/live/chat.migudev.com/fullchain.pem ]; then
    echo "SSL certificates found, checking nginx configuration..."
    
    # Check if nginx config already has SSL configuration
    if grep -q "ssl_certificate" /etc/nginx/conf.d/https.conf 2>/dev/null; then
        echo "Nginx config already has SSL configuration, no action needed"
    else
        echo "SSL certificates exist but nginx config missing SSL, restoring..."
        
        # Use certbot to restore SSL configuration
        # --non-interactive flag prevents prompts
        # --nginx flag tells certbot to configure nginx
        # --cert-name specifies which certificate to use
        # --redirect configures HTTP to HTTPS redirect
        certbot install --cert-name chat.migudev.com --nginx --redirect --quiet --non-interactive 2>&1 || {
            echo "Certbot install failed, nginx config may need manual SSL setup"
            echo "Run: sudo certbot --nginx -d chat.migudev.com"
        }
        
        # Reload nginx to apply changes
        systemctl reload nginx || systemctl restart nginx
    fi
else
    echo "No SSL certificates found, using base HTTP configuration"
fi

