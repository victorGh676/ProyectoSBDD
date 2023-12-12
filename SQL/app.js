// app.js

function connectToInstance() {
  const host = document.getElementById('host').value;
  const port = document.getElementById('port').value;
  const user = document.getElementById('user').value;
  const password = document.getElementById('password').value;

  if (!host || !port || !user || !password) {
    console.error('Por favor, completa todos los campos');
    alert('Por favor, completa todos los campos');
    return;
  }

  const data = { host, port, user, password };

  fetch('http://localhost:3000/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  })
    .then(response => response.text())
    .then(data => {
      console.log(data);
      if (data === 'Conexión exitosa') {
        alert("Conexión exitosa");
        getAllDatabases(host, port, user, password);
      } else {
        console.error('La conexión no fue exitosa');
        alert("Error de conexión");
      }
    })
    .catch(error => {
      console.error('Error de conexión', error);
      alert(`Error de conexión: ${error.message}`);
    });
}

function getAllDatabases(host, port, user, password) {
  const data = { host, port, user, password };

  fetch('http://localhost:3000/databases', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  })
    .then(response => response.json())
    .then(databases => {
      console.log('Bases de Datos:', databases);

      const databaseList = document.getElementById('databaseList');
      databaseList.innerHTML = '';

      databases.forEach(db => {
        const listItem = document.createElement('li');
        listItem.textContent = db;
        listItem.setAttribute('ondblclick', 'showTables()');
        databaseList.appendChild(listItem);
      });
    })
    .catch(error => {
      console.error('Error al obtener bases de datos', error);
      alert('Error al obtener bases de datos. Consulta la consola para más detalles.');
    });
}

function showTables() {
  const host = document.getElementById('host').value;
  const port = document.getElementById('port').value;
  const user = document.getElementById('user').value;
  const password = document.getElementById('password').value;
  const selectedDatabase = event.target.textContent;

  const data = { host, port, user, password, selectedDatabase };

  fetch('http://localhost:3000/tablesInDatabase', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  })
    .then(response => response.json())
    .then(tableInfo => {
      console.log(`Información de Tablas en ${selectedDatabase}:`, tableInfo);

      const databaseTableList = document.getElementById('databaseTableList');
      databaseTableList.innerHTML = '';

      tableInfo.forEach(table => {
        const listItem = document.createElement('li');
        listItem.textContent = table;
        databaseTableList.appendChild(listItem);
      });
    })
    .catch(error => {
      console.error(`Error al obtener información de tablas en ${selectedDatabase}:`, error);
      alert(`Error al obtener información de tablas en ${selectedDatabase}. Consulta la consola para más detalles.`);
    });
}

function closeInstance() {
  const data = {};  // No necesitas enviar datos para cerrar la conexión

  fetch('http://localhost:3000/closeConnection', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  })
    .then(response => response.text())
    .then(data => {
      console.log(data);
      if (data === 'Conexión cerrada exitosamente') {
        alert("Conexión cerrada exitosamente");
      } else {
        console.error('Error al cerrar la conexión');
        alert("Error al cerrar la conexión");
      }
    })
    .catch(error => {
      console.error('Error de conexión', error);
      alert(`Error de conexión: ${error.message}`);
    });
}
