const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { MongoClient } = require('mongodb');

const app = express();
const port = 5000;

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*'); // Permitir todas las solicitudes
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});

// Ruta para establecer la conexión
app.post('/connect', (req, res) => {
  const { host, port} = req.body;

  const connectionString = `mongodb://${host}:${port}/`;
  const client = new MongoClient(connectionString);

  client.connect()
    .then(() => {
      console.log('Conexión exitosa');
      res.status(200).send('Conexión exitosa');
    })
    .catch(err => {
      console.error('Error al conectar a la base de datos:', err.message);
      res.status(500).send('Error al conectar a la base de datos');
    })
    .finally(() => {
      client.close();
    });
});

// Ruta para obtener los nombres de las bases de datos
app.get('/databases', (req, res) => {
    const { host, port} = req.query;

    const client = new MongoClient(`mongodb://${host}:${port}/`);
  
    client.connect()
  .then(() => {
    const adminDb = client.db('admin');
    return adminDb.admin().listDatabases();
  })
  .then(result => {
    const databaseNames = result.databases.map(db => db.name);
    res.status(200).json(databaseNames);
  })
  .catch(err => {
    console.error('Error al obtener nombres de bases de datos:', err.message);
    res.status(500).send('Error al obtener nombres de bases de datos');
  })
  .finally(() => {
    client.close(); // Cerrar la conexión al finalizar
  });
});

 // Ruta para obtener las tablas de una base de datos específica
app.get('/tables/:databaseName', (req, res) => {
  const { host, port } = req.query;
  const { databaseName } = req.params;

  const client = new MongoClient(`mongodb://${host}:${port}/`);

  client.connect()
      .then(() => {
          // Obtener la base de datos proporcionada
          const db = client.db(databaseName);

          // Obtener las colecciones de la base de datos proporcionada
          return db.listCollections().toArray();
      })
      .then(colecciones => {
          const nombresColecciones = colecciones.map(obj => obj.name);
          console.log(`Colecciones en la base de datos ${databaseName}:`, nombresColecciones);
          res.status(200).json(nombresColecciones);
      })
      .catch(err => {
          console.error('Error al obtener nombres de tablas:', err.message);
          res.status(500).send('Error al obtener nombres de tablas');
      })
      .finally(() => {
          client.close();
      });
});
app.get('/query', (req, res) => {
  const { host, port } = req.query;
  const { databaseName, query } = req.params;

  const client = new MongoClient(`mongodb://${host}:${port}/`);

  client.connect()
      .then(() => {
          // Obtener la base de datos proporcionada
          const db = client.db(databaseName);

          // Obtener las colecciones de la base de datos proporcionada
          const result = db.eval(query);
          return result
      })
      .then(colecciones => {
          const nombresColecciones = colecciones.map(obj => obj.name);
          console.log(`Colecciones en la base de datos ${databaseName}:`, nombresColecciones);
          res.status(200).json(nombresColecciones);
      })
      .catch(err => {
          console.error('Error al obtener nombres de tablas:', err.message);
          res.status(500).send('Error al obtener nombres de tablas');
      })
      .finally(() => {
          client.close();
      });
});


app.listen(port, () => {
  console.log(`Servidor escuchando en el puerto ${port}`);
});
