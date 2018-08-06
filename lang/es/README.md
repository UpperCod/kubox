# Kubox

Kubox es una alternativa a la forma de gestionar el estado a librerias como Redux, Mobx u otra. 

Como alternativa a redux ud no necesitara usar actionsTypes o reducers, ya que Kubox se centra solo en el uso de acciones, para la gestion del estado.

Ahora repasaremos algunos conceptos que se comparten en la mayoria de las librerias destinadas a la gestion del estado.

### El Estado

El estado para Kubox es un objeto y este esta destinado a almacenar informacion a compartir mediante el uso **Store**.

### El Store

El Store permite gestionar el estado y dar acceso a el, ud puede aceder al estado mediante la propiedad **state** de la instancia del Store, si ud busca suscribirce a los cambios simplemente use el metodo **subscribe** de la instancia, este lo alertara de todos los cambios que proboquen las **acciones**


### Accion

La accion es simplemente una funcion capas de comunicarce con el Store, la accion puede notificar cambios a los suscriptores. El estado dentro de Kubox, es inmutable, por lo que cada cambio genera un nuevo estado que remplaza el anterior.


## El Space

Este ultimo punto es propio de Kubox y es lo que lo define como diferente, Kubox controla los contextos dados para cada accion. esto lo hace mediante el uso de indices de espacio, este solo afecta a las acciones, no al estado en si.

### Ejemplo 

Si poseyeramos el siguiente arbol de acciones.

```js
export default {
    count : {
        add({set,get}){
            set(get()+1)
        },
        sub({set,get}){
            set(get()-1)
        }
    }   
}
```

Kubox limitaria el contexto de cada accion solo a acceder a la propiedad count. la ventaja de esto es que tus acciones son componenitables.


```js

function add({set,get}){
    set(get()+1)
}

function sub({set,get}){
    set(get()-1)
}

export default {
    count1 : {add,res},   
    count2 : {add,res},   
    count3 : {add,res},   
}

```

> Kubox asigna el indice al que pertenece la accion como un contexto, esto dentro de kubox se llama **space**

> otro punto importante de esto es que las acciones por mas anidadas que sean poseeran un espacio de un solo indice.


```js

function add({set,get}){
    set(get()+1)
}

function sub({set,get}){
    set(get()-1)
}

export default {
    count : {
        add,sub,
        child : {add,sub}
    }
}
```

> por ejemplo para acceder a al accion **count.child.add** ud debera usar el metodo dentro de accions **actions.countChildAdd**, de igual forma si ud quiere conocer el  estado controlado por esa accion debera acceder a la propiedad **state.countChild**, esto no afecta al valor asignado al space, por lo que us valor puede ser un objeto con mayor profundidad.

## Instancia

La funcion **Store**, resive los 3 parametros ya explicados:

1. EL estado : {object}, este es el estado inicial de Store.
2. Las acciones : {object}, estas son las acciones del Store.
3. El middleware : {function}, este permite observar los cambios que probocas las acciones.

```js
import Store from "kubox";

function add({set,get}){
    set(get()+1)
}

function sub({set,get}){
    set(get()-1)
}

let actions = {
    count : {add,sub}
}

let state = {count : 0}

let store = new Store(state,actions);

store.actions.countAdd(); 
console.log(store.state.count); // 1;
store.actions.countSub(); 
console.log(store.state.count); // 0;
```





