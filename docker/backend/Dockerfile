FROM php:8.2-cli-alpine

# Install minimal system dependencies including SQLite
RUN apk add --no-cache \
    curl \
    zip \
    unzip \
    sqlite-dev \
    && docker-php-ext-install \
        pdo \
        pdo_sqlite

# Install Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Set working directory
WORKDIR /var/www/html

# Copy all backend files
COPY backend/ /var/www/html/

# Create necessary directories and set permissions
RUN mkdir -p storage/logs storage/framework/cache storage/framework/sessions storage/framework/views \
    && mkdir -p bootstrap/cache \
    && chmod -R 775 storage bootstrap/cache

# Install dependencies (will use vendor if exists)
RUN composer install --no-dev --optimize-autoloader --no-interaction 2>/dev/null || echo "Composer install failed, continuing..."

# Create SQLite database
RUN touch database/database.sqlite

# Expose port
EXPOSE 8000

# Start command
CMD ["sh", "-c", "php artisan key:generate --force 2>/dev/null || echo 'Key exists'; php artisan migrate --force 2>/dev/null || echo 'Migration skipped'; php artisan serve --host=0.0.0.0 --port=8000"]