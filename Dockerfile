FROM nginx:1-alpine

# Copy nginx configuration file
COPY ./nginx.conf /etc/nginx
# Copy static assets to serve
COPY assets /www/data/
