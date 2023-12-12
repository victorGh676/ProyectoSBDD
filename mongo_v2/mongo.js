import * as ndo from './../Nodo.js';

export function IniciarMongo(host,port,user, ul, estado){
  CrearConexionMn(host,port,user, ul).then((h) => {
    console.log(h);
    if (h==false) {
      estado[2]=false
    }else{
      estado[2]=true
    }
   });
}

//Verifica que las credenciales esten de manera correcta
export async function CrearConexionMn(host,port, user, padre) {      
  
  const data = { host, port};
  
  try {
    const response = await fetch('http://localhost:5000/connect', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    const responseData = await response.text();

    console.log(responseData);
    if (responseData === 'Conexión exitosa') {
      var NodoPrin= await mostrarBasesMn(host, port)   
      ndo.mostrarNodos3(NodoPrin, padre, "basesMongo")
      return true;
    } else {
      alert("Información Invalida en los Registros")                 
    }
  } catch (error) {
    console.error('Error de conexión', error.message);
    alert("Error de conexión catch", error);
    return false;
  }
}

//Ya verificado si funciona, se debe mostrar las bases de la instancia
export async function mostrarBasesMn(ip, puerto) {
  try {
    const response = await fetch(`http://localhost:5000/databases?host=${ip}&port=${puerto}`);
    if (!response.ok) {
      throw new Error('La solicitud no fue exitosa');
    }
    
    const databaseNames = await response.json();
    console.log('Nombres de bases de datos:', databaseNames);    
    var hijosPrincipal=ndo.listaStringAListaNodos(databaseNames)
    let NodoPrincipal=new ndo.Nodo("MongoBD",hijosPrincipal);
    for (let i = 0; i < databaseNames.length; i++) {
      var hijosBases= await mostrarColeccionesMn(databaseNames[i],ip,puerto)
       NodoPrincipal.hijos[i].hijos=hijosBases;
    }
    return NodoPrincipal;    
  } catch (error) {
    console.error('Error al obtener nombres de bases de datos', error.message);
    alert('Error al obtener nombres de bases de datos. Consulta la consola para más detalles.');
    throw error;
  }
}

//Muestra colecciones de las bases
 export async function mostrarColeccionesMn(baseDatos, ip, puerto) {
  try {
    const response = await fetch(`http://localhost:5000/tables/${baseDatos}?host=${ip}&port=${puerto}`);
    if (!response.ok) {
      throw new Error('La solicitud no fue exitosa');
    }
    
    const tableNames = await response.json();
    console.log('Nombres de tablas:', tableNames);

    var lista = ndo.listaStringAListaNodos(tableNames);
    return lista;
  } catch (error) {
    console.error('Error al obtener nombres de tablas', error);
    alert('Error al obtener nombres de tablas. Consulta la consola para más detalles.');
    throw error;
  }
}

export async function ejecutarConsulta(baseDatos, ip, puerto, consulta) {
  try {
    const response = await fetch(`http://localhost:5000/query?host=${ip}&port=${puerto}&databaseName=${baseDatos}&query=${consulta}`);
    if (!response.ok) {
      throw new Error('La solicitud no fue exitosa');
    }
    
    const resultadoConsulta = await response.json();
    console.log('Resultado de la consulta:', resultadoConsulta);

    // Manejo del resultado según tu lógica
    // ...

    return resultadoConsulta;
  } catch (error) {
    console.error('Error al ejecutar la consulta', error);
    alert('Error al ejecutar la consulta. Consulta la consola para más detalles.');
    throw error;
  }
}