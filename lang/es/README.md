# Kubox

Kubox, es un pequeño(<600bytes gzip) administrador de estados, como lo es Redux, Mobx u otra librería.

Lo que lo hace particular es la forma en la que gestiona el estado a base de **nombre de espacio**, estos se crean a partir de un objeto de acciones, Kubox mapea este objeto y obtiene los  **nombre de espacio** a base de las propiedades que este objeto posea, el objetivo de estos **nombre de espacio** es limitar el alcance a conocer por las acciones sólo al **nombre de espacio**.



```js
import Store from "kubox";
// El estado de raíz siempre debe ser un objeto.
let state = {countOne : 0, countTwo:0};
// Esta función sólo conocerá como alcance de estado el que le asigne kubox.
let add = (state) => state.set( state.get() + 1 );

let state = new Store(state,{
   count : {
       // El nombre de espacio de esta acción es countOne
       one : {add},
       // El nombre de espacio de esta acción es countTwo
       two : {add}
   }
});
/**
* La acción queda almacenada en:
* state.actions.<namespace>.<action>
*/
state.actions.countOne.add(); // {countOne: 1,countTwo: 0}
state.actions.countTwo.add(); // {countOne: 1,countTwo: 1}
```



En el ejemplo anterior se enseña como **Kubox**, limita la profundidad del estado que recibe de cada acción existente a base del **nombre de espacio**.



## Nombres de espacio(Namespace)

Kubox gestiona el estado a base de **nombres de espacio**, una acción recibirá siempre por parte de kubox como primer argumento un objeto con 2 métodos, estos métodos permiten interactuar con el estado sea de raíz o asociado solo al contexto dado por los **nombres de espacio**

* set : Este método permite modificar el estado
* get : Este método permite obtener el estado.

### Get 

El uso de `get` permite obtener el estado actual

```javascript
export function add(state){
   state.get()
}
```



### Set

El uso de `set` permite generar un nuevo estado,  si ud quiera pasar de un estado **A** a un estado **B** solo defina el estado **B** mediante el uso de `set(B)`.



```javascript
export function add(state){
   state.set(
           state.get() + 1
   )
}
```





> Las funciones creadas con este formato de argumentos son altamente reutilizables.



### Argumentos

Toda acción puede recibir más de un argumento.

```javascript
export function sum(state,a, b){
   state.set(a+b)
}

store.actions.total.sum(100,100) // {count:200}
```



## Suscriptores

Todo cambio de estado es anunciado a los suscriptores, para ello debe usar el método de la instancia `store.subscribe`.



```javascript
import Store from "kubox"

let store = new Store({})

store.subscribe((state)=>{
   console.log(state)
})
```



### Suscripción direccionada

Por defecto el suscriptor escucha todos los cambios, pero ud puede focalizar esta escucha a un solo a las acciones de un determinado  **Nombre de espacio**.



```javascript
store.subscribe((state)=>{
   console.log(state)
},"count")
```



> El suscriptor enseñado solo escuchara los cambios asociados a las acciones que pertenezcan al namespace **count**



## Middleware

Toda acción puede ser vista en el intento de modificación por el middleware. este recibe 2 argumentos :

1. state : {object}, este posee los métodos **set** y **get**.
2. change: {object}, este posee un detalle de quien intenta generar el cambio.
  * space : {string} , alias para el **nombre de espacio**
  * action : {string}, nombre de la acción que ejecuta el método `set`.
  * state : {any}, argumento dado al método `set`, para la actualización de estado.

```javascript
import Store from "kubox"
import state from "./state.js";
import actions from "./actions.js";

function middlewareLog(state,change){
   console.log({
       prev : state.get()
   });
   state.set({
       ...state.get(),
       [change.space] : change.state
   })
   console.log({
       next : state.get()
   });
}

let store = new Store(state,actions)

store.subscribe((state)=>{
   console.log(state)
})
```



> El middleware posee control absoluto sobre la definicion del estado.


## Utilidades

|Libreria | Npm | Github |
|:--------|:----|:-------|
| kubox-preact | [Link](https://www.npmjs.com/package/kubox-preact) | [Link](https://github.com/UpperCod/kubox-preact) | 
| kubox-react | [Link](https://www.npmjs.com/package/kubox-react) | [Link](https://github.com/UpperCod/kubox-react) | 
