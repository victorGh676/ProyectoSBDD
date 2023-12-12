class DatosCadena {
    constructor(ip, puerto, usuario, contraseña) {
        this.ip = ip
        this.puerto = puerto
        this.usuario = usuario
        this.contraseña = contraseña
    }
}
class Query {
    constructor(gestor, base, nombre, ba, num) {
        this.gestor = gestor
        this.base = base
        this.nombre = nombre
        this.listaBases=ba
        this.numero=num
    }
}
//Estado de los gestores, si despliega para hacer la cadena de conexión
var estado = [false, false, false]
var estadoQuerys=[false, false, false, false, false]
let datosGestores = [0, 1, 2]
let listaQuerys = []
let selector = "";
import * as pg from './PostgreSQL/app.js';
import * as mg from './mongo_v2/mongo.js';

let host = '';
let port = '';
let user = '';
let password = '';
let numeroQuery = 0;
let select;
let listaBases=[];

function empezar() {
    var abrir = document.getElementsByClassName('elige')
    var cerrar = document.getElementById('cancelar')
    var modal = document.getElementById('modal')
    var consulta = document.getElementById('query');
    select = document.getElementById("basesSelect");
    cargarFormulario(abrir, cerrar, modal)
    consulta.addEventListener('click', () => crearQuery());
}

function crearQuery() {
    var selectDiv = document.getElementById('selectDiv');
    var ejecutar = document.getElementById("ejecutar")
    var cuadro = document.getElementById("consulta")
    var menuQuerys = document.getElementById("Opciones")    
    ejecutar.style.display = 'block';
    cuadro.style.display = 'block';
    selectDiv.style.display = 'block';
    
    let nuevoQuery = new Query();
    //Pendiendte hasta tener la base y gestor
    nuevoQuery.nombre = 'Query ' + numeroQuery;
    nuevoQuery.gestor=selector
    nuevoQuery.bases= select.value
    nuevoQuery.listaBases= listaBases
    nuevoQuery.numero=numeroQuery
    listaQuerys.push(nuevoQuery)
    let seccion = document.createElement("div")
    seccion.innerHTML=`<h3>${nuevoQuery.nombre}</h3>`
    seccion.classList.add("cuadroQuery");
    seccion.id=nuevoQuery.nombre;
    seccion.style.backgroundColor="rgb(183, 143, 11)"
    seccion.style.color="#fff"
    menuQuerys.appendChild(seccion)
    for (let i = 0; i < listaQuerys.length-1; i++) {
        var sec2= document.getElementById(listaQuerys[i].nombre)
        sec2.style.backgroundColor="rgba(168, 135, 37, 0.247)"
    }
    seccion.addEventListener("click", () => {        
        listaQuerys.forEach(query => {
            var sec = document.getElementById(query.nombre);
            sec.style.backgroundColor = "rgba(168, 135, 37, 0.247)";
            sec.style.color = "#fff"; 
        });
        
        seccion.style.backgroundColor = "rgb(183, 143, 11)";
        seccion.style.color = "#fff";
    });
        ejecutar.addEventListener("click",()=>{            
            var con = cuadro.innerHTML;
            var espera = document.getElementById("resultado")
            pg.ejecutarConsulta(select.value, datosGestores[1].ip, "5432","postgres",datosGestores[1].contraseña,con,espera);
        
    })

    numeroQuery++;
}

function cargarFormulario(abrir, cerrar, modal) {
    var crear = document.getElementById('crear')
    for (let i = 0; i < abrir.length; i++) {
        abrir[i].addEventListener("click", (e) => {
            if (!estado[i]) {
                e.preventDefault();
                modal.showModal();
                crear.addEventListener('click', obtenerDatosConexión.bind(null, i, e))
            }else{
                e.preventDefault();
                abrir[i].addEventListener('click',()=> obtenerBase(i))
            }
        })
    }
    cerrar.addEventListener("click", (e) => {
        e.preventDefault();
        modal.close()
    })
}

function obtenerBase(i){    
    if (i == 0) {
        selector="sqlServer"
    } else if (i == 1) {
        selector="postgress"
        let basesClase = document.getElementsByClassName("basesPg");
        for (let i = 0; i < basesClase.length; i++) {
            listaBases.push[basesClase[i].innerHTML];
        }
        select.innerHTML=CrearOptions(basesClase)
    } else if (i == 2) {
        selector="mongo"
        let basesClase = document.getElementsByClassName("basesMongo");
        for (let i = 0; i < basesClase.length; i++) {
            listaBases.push[basesClase[i].innerHTML];                        
        }
        select.innerHTML=CrearOptions(basesClase)
    }
    
}

function obtenerDatosConexión(i, e) {
    host = document.getElementById("ip").value
    port = document.getElementById("puerto").value
    user = document.getElementById("usuario").value
    password = document.getElementById("contraseña").value
    let cadena = new DatosCadena()
    cadena.ip = host
    cadena.contraseña = password
    cadena.puerto = port
    cadena.usuario = user
    datosGestores[i] = cadena
    crearConexión(i)
    e.preventDefault();
}
//cambiarNombres Funcion conexion
function crearConexión(i) {
    var conexion
    var gestor = ""
    let mostrar;
    if (i == 0) {
        gestor = "sqlServer"
        mostrar = document.getElementsByClassName("ocultaSs")        
    } else if (i == 1) {
        gestor = "postgress"
        let basesPostg = document.getElementById(gestor)
        conexion = pg.CrearConexionPg(datosGestores[1].ip, datosGestores[1].puerto, datosGestores[1].usuario, datosGestores[1].contraseña,basesPostg, estado)
        mostrar = document.getElementsByClassName("ocultaPg")    
    } else if (i == 2) {
        gestor = "mongo"
        let basesMongo = document.getElementById(gestor)
        conexion = mg.IniciarMongo(datosGestores[2].ip, datosGestores[2].puerto, datosGestores[2].usuario, basesMongo, estado)
        mostrar = document.getElementsByClassName("ocultaMn")
    }
    selector=gestor
    for (let i = 0; i < mostrar.length; i++) {
        mostrar[i].style.display = "block"
    }
}

var CrearOptions = function (lista) {
    var stringTabla=""
    for (let i = 0; i < lista.length; i++) {
    stringTabla += `<option value="${lista[i].innerHTML}">${lista[i].innerHTML}</option>`
    }
    return stringTabla
}

document.addEventListener('DOMContentLoaded', empezar)