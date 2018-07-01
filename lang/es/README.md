# Kubox

Es una pequeña herramienta creada para controlar el estado dentro de aplicaciones, sin aumentar la complejidad ofreciendo una cobertura tanto síncrona como asíncrona en tan solo **540 bytes gzip**

## Introducción

### ¿Que es el estado?

El estado es un objeto, este posee la situación actual de lo que se desea observar, por ejemplo las interacciones de una aplicación.

### ¿Que es el store?

El store es la instancia de **kubox** esta enlaza el estado con los suscriptores y acciones.


### ¿Que es una acción?

Para comenzar a trabajar con kubox, debe comprender bien el concepto de **action**.

Una acción es una función que permite cambiar u obtener el estado del store, esta interacción puede ser sincrona o asincrona.

Toda acción recibe como mínimo un argumento, el **primer parámetro lo define el store**, y le entrega a la acción en un objeto la capacidad ya comentada de modificar u obtener el estado mediante 2 funciones:

* **set** : modifica el estado.
* **get** : obtiene el estado.

```javascript
function action({set,get}){
   set({state:"sync change"});

   setTimeout(()=>{
       set({state:"async change"})
   })
}
```

### ¿Que es el middleware?

El middleware es solo una función que permite interceder los cambios enviados por las acciones.




## Métodos y propiedades

### Store([object state, object actions, function middleware])

La instancia del **Store**, puede recibir hasta 3 argumentos

1. **state** : *{object}*, estado inicial para el store.
2. **actions** : *{object}*, acciones modificadoras del estado.
2. **middleware** : *{function}*, controla los cambios provocados por las acciones


``` javascript
import Store from "kubox";

let state = {
   task : []
}

let actions = {
   task : {
       create({set,get},value){
           set(
               get().concat(value)
           );
       },
       remove({set,get},index){
           set(
               get().filter((value,indexSearch)=>indexSearch !== index)
           );
       }
   }
}

let store = new Store(state,actions);

store.actions.createTask("hello!");

store.state.task // ["hello!"];

```
> Favor note que las acciones se encuentran anidadas en una propiedad esta propiedad **task** esta será el **space**, esto quiere decir que las acciones solo verán y modifican el estado desde la propiedad space.

> El store de forma arbitraria define los nombres de las acciones a registrar usando el patrón **camel case**, anteponiendo el nombre de la función al origen de la propiedad.

La instancia del **Store** retorna las siguientes propiedades

* **state** : {object}, estado del store.
* **actions** : {object}, acciones registradas en el store.
* **handlers** : {object}, agrupación de suscriptores.
* **setActions** : {function}, crea o modifica acciones al store.
* **subscribe** : {function}, añade un suscriptor al store

### setActions( object actions [, function middleware, string space])

Esta función crear o modificar acciones en el store, recibe 3 argumentos :

* **actions** : {object}, grupo de funciones a definir como acciones dentro del store
* **middleware** : [function], función a interceder los cambios generados por las acciones
* **space** : [string], nombre de espacio para las acciones.

### subscribe( function handler[, string  space]) : function unsubscribe

Esta función añade suscriptores al store, recibe 2 argumentos:

* **handler** : {function}, función que se le notificarán los cambios
* **space** : [string], string que permite suscribirse solo a los cambios generados por acciones vinculadas al **space**

## Ejemplos
