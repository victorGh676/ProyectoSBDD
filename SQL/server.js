// server.js

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const sql = require('mssql');

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

const app = express();
const port = 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.post('/login', async (req, res) => {
  try {
    console.log('Datos recibidos:', req.body);
    const { host, port, user, password } = req.body;

    if (!host || !port || !user || !password) {
      console.error('Por favor, completa todos los campos');
      res.status(400).send('Por favor, completa todos los campos');
      return;
    }

    const config = {
      server: host,
      port: parseInt(port),
      user: user,
      password: password,
      database: 'master',
      options: {
        encrypt: true,
        trustServerCertificate: true,
      },
    };

    await sql.connect(config);
    console.log('Conexión exitosa');
    res.status(200).send('Conexión exitosa');
  } catch (err) {
    console.error('Error al conectar a la base de datos:', err.message);
    res.status(500).send('Error al conectar a la base de datos');
  }
});

app.post('/databases', async (req, res) => {
  const { host, port, user, password } = req.body;

  const config = {
    server: host,
    port: parseInt(port),
    user: user,
    password: password,
    database: 'master',
    options: {
      encrypt: true,
      trustServerCertificate: true,
    },
  };

  try {
    await sql.connect(config);

    const databasesResult = await sql.query`SELECT name FROM master.sys.databases WHERE database_id > 4`;
    const databases = databasesResult.recordset.map(record => record.name);

    res.status(200).json(databases);
  } catch (err) {
    console.error('Error al obtener bases de datos:', err.message);
    res.status(500).send('Error al obtener bases de datos');
  }
});

app.post('/tablesInDatabase', async (req, res) => {
  const { host, port, user, password, selectedDatabase } = req.body;

  const config = {
    server: host,
    port: parseInt(port),
    user: user,
    password: password,
    database: selectedDatabase,
    options: {
      encrypt: true,
      trustServerCertificate: true,
    },
  };

  try {
    const pool = new sql.ConnectionPool(config);
    await pool.connect();

    const tablesResult = await pool.query`SELECT table_name FROM information_schema.tables WHERE table_type = 'BASE TABLE'`;
    const tables = tablesResult.recordset.map(record => record.table_name);

    pool.close();

    res.status(200).json(tables);
  } catch (err) {
    console.error(`Error al obtener información de tablas en ${selectedDatabase}:`, err.message);
    res.status(500).send(`Error al obtener información de tablas en ${selectedDatabase}`);
  }
});

app.post('/closeConnection', async (req, res) => {
  try {
    await sql.close();

    console.log('Conexión cerrada exitosamente');
    res.status(200).send('Conexión cerrada exitosamente');
  } catch (err) {
    console.error('Error al cerrar la conexión:', err.message);
    res.status(500).send('Error al cerrar la conexión');
  }
});

app.listen(port, () => {
  console.log(`Servidor iniciado en http://localhost:${port}`);
});

