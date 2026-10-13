
import express from 'express';
import dotenv from 'dotenv';
import mysql from 'mysql2/promise';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET || JWT_SECRET.length < 32) {
  throw new Error('JWT_SECRET debe tener al menos 32 caracteres.');
}

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Conexión con MySQL
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || 'control_versiones_jwt',
  waitForConnections: true,
  connectionLimit: 10,
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Servidor funcionando correctamente',
  });
});

app.get('/api/db-health', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT 1 AS resultado');

    res.json({
      status: 'ok',
      message: 'Conexión con MySQL exitosa',
      database: rows[0].resultado === 1,
    });
  } catch (error) {
    console.error('Error de MySQL:', error.message);

    res.status(500).json({
      message: 'No fue posible conectar con la base de datos.',
    });
  }
});

app.post('/api/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (
      typeof name !== 'string' ||
      typeof email !== 'string' ||
      typeof password !== 'string' ||
      !name.trim() ||
      !email.trim() ||
      password.length < 8 ||
      password.length > 72
    ) {
      return res.status(400).json({
        message: 'Ingresa nombre, correo y contraseña de 8 a 72 caracteres.',
      });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const passwordHash = await bcrypt.hash(password, 12);

    await pool.execute(
      `INSERT INTO users (name, email, password_hash)
       VALUES (?, ?, ?)`,
      [name.trim(), normalizedEmail, passwordHash]
    );

    return res.status(201).json({
      message: 'Usuario registrado correctamente.',
    });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({
        message: 'Ese correo electrónico ya está registrado.',
      });
    }

    console.error('Error de registro:', error.message);

    return res.status(500).json({
      message: 'No fue posible registrar el usuario.',
    });
  }
});

app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (
      typeof email !== 'string' ||
      typeof password !== 'string'
    ) {
      return res.status(400).json({
        message: 'Debes ingresar correo y contraseña.',
      });
    }

    const [users] = await pool.execute(
      `SELECT id, name, email, password_hash, role
       FROM users
       WHERE email = ?`,
      [email.trim().toLowerCase()]
    );

    if (
      users.length === 0 ||
      !(await bcrypt.compare(password, users[0].password_hash))
    ) {
      return res.status(401).json({
        message: 'Correo o contraseña incorrectos.',
      });
    }

    const user = users[0];

    const token = jwt.sign(
      { role: user.role },
      JWT_SECRET,
      {
        subject: String(user.id),
        expiresIn: process.env.JWT_EXPIRES_IN || '1h',
        issuer: 'control-versiones-jwt',
        audience: 'control-versiones-jwt-client',
      }
    );

    return res.json({
      message: 'Inicio de sesión exitoso.',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Error de inicio de sesión:', error.message);

    return res.status(500).json({
      message: 'No fue posible iniciar sesión.',
    });
  }
});

function authenticateToken(req, res, next) {
  const authorization = req.headers.authorization;
  const [scheme, token] = authorization?.split(' ') || [];

  if (scheme !== 'Bearer' || !token) {
    return res.status(401).json({
      message: 'Debes iniciar sesión para acceder.',
    });
  }

  jwt.verify(
    token,
    JWT_SECRET,
    {
      issuer: 'control-versiones-jwt',
      audience: 'control-versiones-jwt-client',
    },
    (error, payload) => {
      if (error) {
        return res.status(401).json({
          message: 'Token inválido o expirado.',
        });
      }

      req.auth = payload;
      next();
    }
  );
}

app.get('/api/profile', authenticateToken, async (req, res) => {
  try {
    const [users] = await pool.execute(
      'SELECT id, name, email, role, created_at FROM users WHERE id = ?',
      [req.auth.sub]
    );

    if (users.length === 0) {
      return res.status(404).json({
        message: 'Usuario no encontrado.',
      });
    }

    return res.json({ user: users[0] });
  } catch (error) {
    console.error('Error al consultar perfil:', error.message);

    return res.status(500).json({
      message: 'No fue posible consultar el perfil.',
    });
  }
});

app.get('/api/admin', authenticateToken, (req, res) => {
  if (req.auth.role !== 'admin') {
    return res.status(403).json({
      message: 'No tienes permisos de administrador.',
    });
  }

  return res.json({
    message: 'Acceso de administrador autorizado.',
  });
});

app.listen(PORT, () => {
  console.log(`Servidor ejecutándose en http://localhost:${PORT}`);
});
