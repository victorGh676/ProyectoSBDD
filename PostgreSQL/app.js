import * as ndo from './../Nodo.js';

export function IniciarPg(host, port, user, password, ul, estado) {
  CrearConexionPg(host, port, user, password, ul, estado).then((h) => {
    console.log(h);
    if (h == false) {
      estado[1] = false
    } else {
      estado[1] = true
    }
  });
}

export async function CrearConexionPg(host, port, user, password, padre, estado) {

  const data = { host, port, user, password };
  try{

   const response = await fetch('http://localhost:3000/connect', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  const responseData = await response.text();
    
      if (responseData === 'Conexión exitosa') {
        var NodoPrin = await mostrarBasesPg(host, port, user, password)
        ndo.mostrarNodos3(NodoPrin, padre, "basesPg")
        estado[1]=true
        return true;
      } else {
        // Mostrar un mensaje o realizar acciones adicionales en caso de conexión no exitosa
        console.error('La conexión no fue exitosa');
        alert("Error de conexión");        
        return false
      }
      
    }catch(error) {
      console.error('Error de conexión', error);
      alert("Error de conexión");      
      return false
    };
}

export async function mostrarBasesPg(host, port, user, password) {
  try {
    const response = await fetch(`http://localhost:3000/databases?host=${host}&port=${port}&user=${user}&password=${password}`);
    const databaseNames = await response.json();

    console.log('Nombres de bases de datos :', databaseNames);
      var hijosPrincipal = ndo.listaStringAListaNodos(databaseNames)
      let NodoPrincipal = new ndo.Nodo("MongoBD", hijosPrincipal);
      for (let i = 0; i < databaseNames.length; i++) {        
        var hijosBases = await mostrarTablasPg(databaseNames[i], host, port, user, password)
        NodoPrincipal.hijos[i].hijos = hijosBases;
      }
      return NodoPrincipal      
  } catch (error) {
    console.error('Error al obtener nombres de bases de datos', error);
    alert('Error al obtener nombres de bases de datos. Consulta la consola para más detalles.');
    throw error; // También podrías manejar el error y lanzarlo nuevamente
  }
}

export async function mostrarTablasPg(databaseName, host, port, user, password) {
  try {
    const response = await fetch(`http://localhost:3000/tables/${databaseName}?host=${host}&port=${port}&user=${user}&password=${password}`);
    const tableNames = await response.json();

    console.log('Nombres de tablas:', tableNames);
      var lista = ndo.listaStringAListaNodos(tableNames);
    
    return lista; // Asegúrate de devolver el resultado
  } catch (error) {
    console.error('Error al obtener nombres de tablas', error);
    alert('Error al obtener nombres de tablas. Consulta la consola para más detalles.');
    throw error; // También podrías manejar el error y lanzarlo nuevamente
  }
}
export async function ejecutarConsulta(database, host, port, user, password, query, resu) {
  try {
    const requestOptions = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ host, port, user, password, database, query }),
    };

    const response = await fetch('http://localhost:3000/query', requestOptions);
    const result = await response.json();

    console.log('Resultado de la consulta:', result);
    resu.innerHTML=result
    // Aquí puedes procesar o manipular el resultado según sea necesario
    
    return result; // Asegúrate de devolver el resultado
  } catch (error) {
    console.error('Error al ejecutar la consulta:', error);
    resu.innerHTML=error.message
    alert('Error al ejecutar la consulta. Consulta la consola para más detalles.');
    throw error; // También podrías manejar el error y lanzarlo nuevamente
  }
}
