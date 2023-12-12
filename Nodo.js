export class Nodo {
    constructor(nombre, listaNodos=[]) {
        this.nombre = nombre;
        this.hijos = listaNodos;
    }
    
}
export function listaStringAListaNodos(listaS){
    let nodos=new Array();
    listaS.forEach(ele => {
        var nodo = new Nodo();
        nodo.nombre=ele
        nodos.push(nodo)
    });
    return nodos
}

  export function mostrarNodos2(nodo, parentElement) {
    const dataList = document.createElement('ul');

    function crearLista(nodo, parentElement) {
        nodo.hijos.forEach(hijo => {
            const listItem = document.createElement('li');
            const itemName = document.createElement('span');
            itemName.textContent = hijo.nombre;

            if (hijo.hijos && hijo.hijos.length > 0) {
                const toggleIcon = document.createElement('span');
                toggleIcon.textContent = ' (+)';

                itemName.addEventListener('click', () => {
                    const childrenList = listItem.querySelector('ul');
                    if (childrenList) {
                        childrenList.classList.toggle('hidden');
                        toggleIcon.textContent = childrenList.classList.contains('hidden') ? ' (+)' : ' (-)';
                    }
                });

                listItem.appendChild(itemName);
                listItem.appendChild(toggleIcon);

                const childrenList = document.createElement('ul');
                childrenList.classList.add('hidden');
                listItem.appendChild(childrenList);

                crearLista(hijo, childrenList);
            } else {
                listItem.appendChild(itemName);
            }

            parentElement.appendChild(listItem);
        });
    }

    crearLista(nodo, dataList);
    parentElement.appendChild(dataList);
}
export function mostrarNodos3(nodo, parentElement, className) {
    const dataList = document.createElement('ul');
    let numeraClase=0
    function crearLista(nodo, parentElement) {
      nodo.hijos.forEach(hijo => {
        const listItem = document.createElement('li');
        const itemName = document.createElement('span');
        itemName.textContent = hijo.nombre;
  
        // Agregar la clase recibida por parámetro
        if (numeraClase==0) {
            itemName.classList.add(className);
        }
        numeraClase++;
  
        if (hijo.hijos && hijo.hijos.length > 0) {
          const toggleIcon = document.createElement('span');
          toggleIcon.textContent = '+ ';
  
          itemName.addEventListener('click', () => {
            const childrenList = listItem.querySelector('ul');
            if (childrenList) {
              childrenList.classList.toggle('hidden');
              toggleIcon.textContent = childrenList.classList.contains('hidden') ? '+ ' : '- ';
            }
          });
  
          listItem.appendChild(toggleIcon);
          listItem.appendChild(itemName);
  
          const childrenList = document.createElement('ul');
          childrenList.classList.add('hidden');
          listItem.appendChild(childrenList);
  
          crearLista(hijo, childrenList);
        } else {
          listItem.appendChild(itemName);
          numeraClase=0;
        }
  
        parentElement.appendChild(listItem);
      });
    }
  
    crearLista(nodo, dataList);
    parentElement.appendChild(dataList);
  }