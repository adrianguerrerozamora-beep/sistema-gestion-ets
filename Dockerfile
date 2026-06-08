FROM php:8.2-apache

# Instalar extensiones de PDO para MySQL necesarias para el proyecto
RUN docker-php-ext-install pdo pdo_mysql

# Habilitar mod_rewrite por si necesitamos URLs amigables en el Backend
RUN a2enmod rewrite

# Ajustar los permisos del directorio de trabajo
RUN chown -R www-data:www-data /var/www/html