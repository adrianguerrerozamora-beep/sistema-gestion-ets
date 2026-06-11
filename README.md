# Sistema de Gestión de Exámenes a Título de Suficiencia (ETS)

Este proyecto es una aplicación web Full-Stack diseñada bajo el patrón de arquitectura **MVC (Modelo-Vista-Controlador)** para la consulta y administración de horarios de exámenes ETS. El sistema cuenta con un buscador inteligente en tiempo real para los alumnos, exportación de horarios a PDF e iCalendar (.ics), y un panel privado (Dashboard) con estadísticas dinámicas y gestión CRUD completa para el administrador.

## 🛠️ Tecnologías Utilizadas

* **Backend:** PHP (Pure) con PDO para la conexión segura a la base de datos (sentencias preparadas contra SQL Injection).
* **Frontend:** HTML5, CSS3, JavaScript Asíncrono (Fetch API) y Bootstrap 5 para el diseño responsivo.
* **Librerías:** `html2pdf.js` para la generación de reportes en el cliente.
* **Base de Datos:** MySQL / PostgreSQL con restricciones de integridad referencial.
* **Entorno:** Docker y Docker Compose para la contenerización y fácil despliegue.

## 🚀 Requisitos Previos

Asegúrate de tener instalado en tu equipo:
* [Docker Desktop](https://www.docker.com/products/docker-desktop/)
* Docker Compose

## 📦 Instalación y Despliegue

Sigue estos pasos para desplegar el proyecto localmente en cuestión de segundos:

1. **Clonar el repositorio:**
   ```bash
   git clone <URL_DE_TU_REPOSITORIO>
   cd <NOMBRE_DE_LA_CARPETA>
   ```

2. **Encender los contenedores de Docker:**
   Ejecuta el siguiente comando en la raíz del proyecto para descargar las imágenes e iniciar los servicios en segundo plano:
   ```bash
   docker-compose up -d
   ```

3. **Acceso a la aplicación:**
   Una vez que los contenedores estén corriendo, abre tu navegador web e ingresa a las siguientes direcciones:
   * **Módulo de Alumnos (Consulta pública):** [http://localhost:8081/frontend/index.html](http://localhost:8081/frontend/index.html)
   * **Módulo de Administración (Dashboard):** [http://localhost:8081/frontend/dashboard.html](http://localhost:8081/frontend/dashboard.html)

## 🔑 Credenciales de Prueba (Para Evaluación)

Para ingresar al panel de administración y evaluar las funciones CRUD y estadísticas, utilice los siguientes datos de acceso:
* **Usuario / Email:** `admin@escom.ipn.mx`
* **Contraseña:** `admin123`

*(Nota: Si necesita regenerar el administrador, puede visitar el script de instalación en `http://localhost:8081/backend/src/Auth/crear_admin.php`)*

## 📂 Estructura del Proyecto

* `/backend` - Modelos, Controladores y endpoints de la API (Auth, CRUD, Public).
* `/frontend` - Vistas HTML, CSS y lógica en JavaScript (`main.js` y `dashboard.js`).
* `docker-compose.yml` - Configuración de los contenedores del entorno.
* `database.sql` - Script de inicialización de la base de datos.