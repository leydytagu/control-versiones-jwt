# Control de versiones y autenticación con JWT

Aplicación web desarrollada con Node.js, Express y MySQL que permite registrar usuarios, iniciar sesión y acceder a recursos protegidos mediante JSON Web Tokens (JWT).

Este proyecto se desarrolla como parte de la actividad académica sobre **control de versiones y despliegue continuo**, aplicando buenas prácticas de organización del código, configuración mediante variables de entorno y control de acceso.

## Tecnologías utilizadas

- **Node.js:** entorno de ejecución de JavaScript.
- **Express:** framework para construir el servidor y las API REST.
- **MySQL:** sistema de gestión de bases de datos.
- **mysql2:** conexión e interacción con MySQL.
- **bcrypt:** cifrado seguro de contraseñas mediante hash.
- **jsonwebtoken:** generación y validación de tokens JWT.
- **dotenv:** gestión de variables de entorno.
- **HTML, CSS y JavaScript:** interfaz web de la aplicación.
- **Git y GitHub:** control de versiones y alojamiento del repositorio.

## Funcionalidades

- Registro de usuarios.
- Validación de datos durante el registro.
- Almacenamiento de contraseñas mediante hash.
- Inicio de sesión con correo electrónico y contraseña.
- Generación de tokens JWT con tiempo de expiración.
- Consulta del perfil mediante autenticación.
- Control de acceso a recursos exclusivos para administradores.
- Verificación del estado del servidor y de la conexión con MySQL.

## Requisitos previos

Antes de ejecutar el proyecto, asegúrate de tener instalados:

- Node.js y npm.
- MySQL Server.
- Git.
- Visual Studio Code, u otro editor de código.

## Instalación y configuración

### 1. Clonar el repositorio

```bash
git clone https://github.com/leydytagu/control-versiones-jwt.git
cd control-versiones-jwt
```

### 2. Instalar las dependencias

```bash
npm install
```

### 3. Crear la base de datos

Abre MySQL y ejecuta:

```sql
CREATE DATABASE control_versiones_jwt;
```

Después, ejecuta las instrucciones del archivo `database.sql` para crear la tabla de usuarios.

### 4. Configurar las variables de entorno

Crea un archivo `.env` en la raíz del proyecto con la siguiente estructura:

```env
PORT=3001
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=TU_CLAVE_MYSQL
DB_NAME=control_versiones_jwt
JWT_SECRET=TU_SECRETO_JWT
JWT_EXPIRES_IN=1h
```

Reemplaza los valores de ejemplo por tus propias credenciales. El secreto JWT debe ser aleatorio y tener al menos 32 caracteres.

**Importante:** no publiques el archivo `.env` ni compartas tus credenciales. Este archivo debe permanecer excluido del repositorio mediante `.gitignore`.

### 5. Ejecutar la aplicación

Para iniciar el servidor en modo desarrollo:

```bash
npm run dev
```

También puedes iniciarlo con:

```bash
npm start
```

Abre en el navegador:

http://localhost:3001

## Endpoints de la API

| Método | Endpoint         | Descripción                                        |
| ------ | ---------------- | -------------------------------------------------- |
| GET    | `/api/health`    | Verifica el estado del servidor.                   |
| GET    | `/api/db-health` | Verifica la conexión con MySQL.                    |
| POST   | `/api/register`  | Registra un usuario.                               |
| POST   | `/api/login`     | Inicia sesión y genera un JWT.                     |
| GET    | `/api/profile`   | Consulta el perfil con un token válido.            |
| GET    | `/api/admin`     | Accede a un recurso restringido a administradores. |

### Flujo de autenticación

1. El usuario completa el formulario de registro.
2. La aplicación valida los datos y almacena el hash de la contraseña.
3. El usuario inicia sesión con sus credenciales.
4. El servidor verifica la contraseña y genera un token JWT.
5. El cliente utiliza el token para solicitar recursos protegidos.
6. El servidor valida el token antes de autorizar el acceso.

## Control de versiones

El proyecto utiliza Git para registrar los cambios del código fuente y GitHub como repositorio remoto. Se excluyen archivos sensibles y dependencias instaladas mediante `.gitignore`.

## Autor

Proyecto académico desarrollado para la actividad **Control de versiones y despliegue continuo**.
