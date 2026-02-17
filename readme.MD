# 📦 Sistema de Gestión de Inventario y POS (Point of Sale)

Un sistema integral "Full-Stack" para la gestión de inventario y punto de venta. Diseñado con una arquitectura moderna orientada a microservicios mediante Docker, asegurando alta disponibilidad, precisión financiera y una excelente experiencia de usuario.

## ✨ Características Principales

### 📊 Dashboard Analítico (Business Intelligence)
* **Métricas en tiempo real:** Visualización instantánea de Ventas Totales, Ganancia Neta y volumen de transacciones del día.
* **Gráficos interactivos:** Comparativa de Ingresos vs. Ganancias (últimos 7 días) y distribución de métodos de pago mediante gráficos construidos con `Recharts`.
* **Alertas automatizadas:** Identificación automática de productos con stock bajo y ranking de los más vendidos.

### 🛒 Punto de Venta (POS) Inteligente
* **Carrito dinámico:** Búsqueda rápida por nombre o código de barras (SKU).
* **Validación estricta de stock:** Prevención de ventas sin inventario físico con notificaciones instantáneas.
* **Múltiples métodos de pago:** Soporte para Efectivo, Tarjeta y Transferencia.

### 📦 Gestión de Inventario Avanzada
* **Inteligencia comercial:** Cálculo de margen de ganancia en tiempo real. Sugerencia automática de precios de venta (markup del 100%) al ingresar el costo.
* **Auditoría completa:** Sistema de logs (historial) por producto que registra quién, cuándo y qué acción se realizó (Creación, Edición, Venta, Eliminación).
* **Manejo de casos límite:** Soporte nativo para productos sin SKU (previniendo conflictos de claves únicas en base de datos).

### 🔔 UI/UX Premium
* Interfaz fluida e intuitiva con notificaciones modernas animadas impulsadas por `Sileo`.
* Formateo estricto de moneda local (`es-CL`) en toda la aplicación.

---

## 🛠️ Tecnologías Utilizadas

El proyecto está dividido en una arquitectura de tres capas, orquestadas completamente por **Docker Compose**:

**Frontend:**
* [React 18](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
* [Vite](https://vitejs.dev/) (Bundler ultrarrápido)
* [Recharts](https://recharts.org/) (Visualización de datos)
* [Lucide React](https://lucide.dev/) (Iconografía)
* [Sileo](https://sileo.aaryan.design/) (Sistema de notificaciones Toast)

**Backend API:**
* [Python 3.9](https://www.python.org/)
* [Flask](https://flask.palletsprojects.com/) (Framework web)
* [Flask-SQLAlchemy](https://flask-sqlalchemy.palletsprojects.com/) (ORM para la base de datos)
* Manejo estricto de variables de entorno (Fail-fast architecture)

**Base de Datos:**
* [PostgreSQL 15](https://www.postgresql.org/)
* Precisión financiera estricta utilizando tipos de datos `NUMERIC(10, 2)`.

---

## 🚀 Requisitos Previos

Para ejecutar este proyecto en tu máquina local, necesitas tener instalado:
1. **Docker Desktop:** Asegúrate de que tu PC tenga la **Virtualización por hardware (VT-x / AMD-V)** activada en la BIOS y WSL2 habilitado (en Windows).
2. **Git** (Opcional, para clonar el repositorio).

---

## ⚙️ Instalación y Uso (Quick Start)

### Paso 1: Clonar el proyecto y configurar credenciales
Descarga el código fuente y crea tu archivo de configuración de base de datos.

```bash
git clone [https://github.com/tu-usuario/tu-repositorio.git](https://github.com/tu-usuario/tu-repositorio.git)
cd tu-repositorio

Crea un archivo llamado .env en la raíz del proyecto (junto a docker-compose.yml) con el siguiente contenido:

# .env
DB_USER=
DB_PASSWORD=
DB_NAME=

### Paso 2: Ejecutar la aplicación

El proyecto incluye scripts automatizados para levantar todo el entorno con un solo clic.

Para usuarios de Windows:

Haz doble clic en el archivo iniciar_app.bat.

El script verificará que Docker esté encendido, construirá las imágenes e iniciará los contenedores en segundo plano.

Al terminar, para detener el sistema, ejecuta detener_app.bat.

Para usuarios de Mac/Linux (Terminal):

# Iniciar servicios
docker-compose up --build -d

# Detener servicios
docker-compose down

Paso 3: Acceder al sistema
Una vez que la consola indique que los servicios están activos, abre tu navegador web e ingresa a:
👉 http://localhost:3000 (O el puerto configurado en Vite)

La API del backend estará corriendo silenciosamente en http://localhost:5000.

### 📂 Estructura del Proyecto

📦 GESTION DE INVENTARIO
 ┣ 📂 backend                 # Lógica de servidor en Flask (Python)
 ┃ ┣ 📜 app.py                # Punto de entrada de la API
 ┃ ┣ 📜 models.py             # Esquemas de la BDD (SQLAlchemy)
 ┃ ┣ 📜 routes.py             # Controladores (Endponits REST)
 ┃ ┣ 📜 utils.py              # Funciones auxiliares (Logs/Auditoría)
 ┃ ┣ 📜 requirements.txt      # Dependencias de Python
 ┃ ┗ 🐳 Dockerfile            # Construcción de la imagen backend
 ┣ 📂 db                      # Scripts de inicialización de la Base de Datos
 ┃ ┗ 📜 init.sql              # Creación de tablas (products, sales, sale_items...)
 ┣ 📂 frontend                # Interfaz de usuario en React/TypeScript
 ┃ ┣ 📂 src
 ┃ ┃ ┣ 📂 components          # Componentes reutilizables (Modales, Nav, etc.)
 ┃ ┃ ┣ 📂 pages               # Vistas (Dashboard, POS, Inventario, Historial)
 ┃ ┃ ┣ 📜 api.ts              # Configuración de Axios para llamadas al backend
 ┃ ┃ ┣ 📜 App.tsx             # Enrutador principal y Sidebar
 ┃ ┃ ┣ 📜 index.css           # Estilos personalizados (BEM) y UI Tokens
 ┃ ┃ ┗ 📜 types.ts            # Interfaces TypeScript globales
 ┃ ┣ 📜 package.json          # Dependencias de Node.js
 ┃ ┗ 🐳 Dockerfile            # Construcción de la imagen frontend
 ┣ 🐳 docker-compose.yml      # Orquestador de contenedores (App, API, DB)
 ┣ 📜 iniciar_app.bat         # Script rápido de inicio (Windows)

### 🔗 Principales Endpoints de la API

Método,Endpoint,Descripción
GET,/api/dashboard,"Retorna KPIs principales, alertas de stock y métricas."
GET,/api/sales/trends,Obtiene el historial de ingresos vs ganancias de los últimos 7 días.
GET,/api/products,Lista todos los productos activos en el inventario.
POST,/api/products,Crea un nuevo producto.
PUT,/api/products/<id>,Actualiza la información de un producto específico.
DELETE,/api/products/<id>,Soft-delete (Desactiva) un producto.
POST,/api/sales,Procesa una nueva venta y descuenta el stock (ACID transaction).
GET,/api/sales,Retorna el historial de ventas paginable.

