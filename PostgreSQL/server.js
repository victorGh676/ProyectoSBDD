const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { Client } = require('pg');

const app = express();
const port = 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


// Ruta para establecer la conexión
app.post('/connect', (req, res) => {
  const { host, port, user, password } = req.body;

  const connectionString = `postgres://${user}:${password}@${host}:${port}`;
  const client = new Client({ connectionString });

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
      client.end();
    });
});

// Ruta para obtener los nombres de las bases de datos
app.get('/databases', (req, res) => {
    const { host, port, user, password } = req.query;

    const client = new Client({
      connectionString: `postgres://${user}:${password}@${host}:${port}`,
    });
  
    client.connect()
      .then(() => {
        // Consulta para obtener los nombres de las bases de datos
        return client.query("SELECT datname FROM pg_database WHERE datistemplate = false;")
      })
      .then(result => {
        const databaseNames = result.rows.map(row => row.datname);
        res.status(200).json(databaseNames);
      })
      .catch(err => {
        console.error('Error al obtener nombres de bases de datos:', err.message);
        res.status(500).send('Error al obtener nombres de bases de datos');
      })
      .finally(() => {
        client.end();
      });
});

 // Ruta para obtener las tablas de una base de datos específica
app.get('/tables/:databaseName', (req, res) => {
    const { host, port, user, password } = req.query;
    const { databaseName } = req.params;

    const client = new Client({
        connectionString: `postgres://${user}:${password}@${host}:${port}/${databaseName}`, // Incluye el nombre de la base de datos en la cadena de conexión
    });

    client.connect()
        .then(() => {
            // Consulta para obtener los nombres de las tablas en la base de datos especificada
            return client.query("SELECT table_name FROM information_schema.tables WHERE table_schema='public' AND table_type='BASE TABLE';");
        })
        .then(result => {
            const tableNames = result.rows.map(row => row.table_name);
            res.status(200).json(tableNames);
        })
        .catch(err => {
            console.error('Error al obtener nombres de tablas:', err.message);
            res.status(500).send('Error al obtener nombres de tablas');
        })
        .finally(() => {
            client.end();
        });
});

// Ruta para ejecutar consultas SQL arbitrarias
app.post('/query', (req, res) => {
  const { host, port, user, password, database, query } = req.body;

  const client = new Client({
      connectionString: `postgres://${user}:${password}@${host}:${port}/${database}`,
  });

  client.connect()
      .then(() => {
          return client.query(query); 
      })
      .then(result => {
          res.status(200).json(result.rows); // Devuelve los resultados de la consulta
      })
      .catch(err => {
          console.error('Error al ejecutar la consulta:', err.message);
          res.status(500).send('Error al ejecutar la consulta');
      })
      .finally(() => {
          client.end();
      });
});


app.listen(port, () => {
  console.log(`Servidor escuchando en el puerto ${port}`);
});
