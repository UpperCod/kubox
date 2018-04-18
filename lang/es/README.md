# 🥊 Kubox

Kubox es un administrador de estado muy pequeño **(694 bytes gzip)**, que le permite simplificar eliminando por ejemplo conceptos como **actionTypes**.
```bash
#yarn
yarn add -D kubox
#npm
npm install -D kubox
```

## Introducción

### Reducer

El principio es simple y se basa en `Array.prototype.reduce`, una función que retorna un nuevo valor a base del argumento entregado.

```js
function append(list = [], value){
   return list.concat(value);
}

let list = [];

list = append(list,1) // [1];
list = append(list,2) // [1,2];
```

Pero un estado no es solo una función, normalmente se compone de muchas funciones reducers, lo que aumenta la complejidad en gestión, pero kubox lo simplifica 😉.

## Kubox([ object state = {} [, objec  reducers = {} ]])

La instancia de **kubox** le permite definir de forma rápida el estado y reducers.

```js
import Store from "kubox";

let store = new Store(
   { // objeto estado
       loading : false
   },
   { // objeto reducers
       loadingSwitch({loading = false}){
           return {loading : !loading}
       }
   }
);

store.actions.loadingSwitch();
```

## Kubox::reducers(object reducers [, string  nameSpace = ""])

**Kubox** simplifica la gestión en ejecución de estos reducers, creando y almacenando dentro de `Store.actions`  una nueva función, capaz de modificar el estado del `Store`.

### Ejemplo

```js
import Store from "kubox";

let initState = {
   task = [],
}

let store = new Store(initState);

let reducers = {
   task : {
       create(list = [],data){
           return list.concat({
               id : list.length,
               data
           });
       },
       remove(list = [],id){
           return list.filter((list)=>list.id !== id);
       },
       update(list = [],{id,data}){
           return list.map((log)=>log.id === id ? {id,data} : log);
       }
   }
};

store.reducers( reducers)

store.subscribe((state)=>{
   console.log(state.task) // [{id:0,data:'hello!'}]
})

store.actions.taskCreate('hello!')
```

> Por favor note que la propiedad `reducers.task.create` se ejecuta como una acción mediante la propiedad `store.action.taskCreate`, esto se debe al escaneo profundo generado por **Kubox** para crear una función action, para  ello utiliza el formato de tipeo **camelCase**, anteponiendo la **propiedad** que contiene las funciones reducers **create, remove y update**. Esto para crear actions que apunten a dichas funciones **taskCreate, taskRemove y taskUpdate**.

### CamelCase

Kubox transforma los reducers en funciones agrupadas dentro de `store.actions` usando el formato CamelCase, evitando objetos con estructura complicada y profunda.

#### Reducers de entrada

**Kubox** tomará la propiedad **task** para almacenar el estado generado por **create**, y a su vez creará un action llamado **taskCreate**, para ejecutar el reducer **create**.

```js reducer de entrada
store.reducers({
   task : {
       create(list = [],data){
           return list.concat({
               id : list.length,
               data
           });
       },
       remove(list = [],id){
           return list.filter((list)=>list.id !== id);
       },
       update(list = [],{id,data}){
           return list.map((log)=>log.id === id ? {id,data} : log);
       }

   }
})
```

#### Action de salida

Por Favor note que ahora `task.create` es una función action, los parámetros datos a `taskCreate` serán entregados a `task.create`, pero siempre anteponiendo el estado como primer argumento.

```js
store.actions.taskCreate('hello!')
store.actions.taskRemove(1)
store.actions.taskUpdate({id:1,data:'hello!!!'});
```

> esto permite que ud no se preocupe de generar alias para lograr ejecutar ciertos procesos.

## Asincronía

Ud puede manejar cambios de estado asíncrono mediante funciones asíncronas, promesas o generadores. esto es gracia a que **Kubox** analiza el retorno del reducer, reciclando la respuesta esperando llegar al valor final.

### Async y await

Las promesas son una mejor forma de modificar el estado si se desea notificar un solo retorno.

```js
store.reducers({
   async debounce(){
       await new Promise((resolve)=>{
           setTimeout(resolve,1000);
       })
       return false;
   }
})
```

### Generadores

Los generadores son una mejor forma de modificar el estado si se desea notificar múltiples retornos.

```js
store.reducers({
   *debounce(){
       yield {loading:true}; // {loading:true}
       yield new Promise((resolve)=>{
           setTimeout(resolve,1000);
       })
       yield {loading:false}; // {loading:false}
   }
})
```

## Kubox::subscribe( function handler [, string nameSpace = "*"] )

todo cambio solo será emitido a los **suscriptores**, por defecto los suscriptores se suscriben a todo cambio en el estado, pero ud puede cambiar eso apuntando  el suscriptor a una propiedad específica `store.subscibe(handler,'task')`, evitando recibir una sobrecarga por cualquier cambio en el store.

```js
import Store from "kubox";

let store = new Store({});

store.reducers({
   loading(state,nextState){
       return {loading : nextState};
   }
})

store.subscribe((state)=>{
   console.log(state) // {loading:true}
})

store.actions.loading(true);

```

## kubox-preact

Una pequeña librería para compartir el estado administrado por Kubox

```js
import Store from "kubox";
import {h, render} from "preact";
import {Provider, Connect} from "kubox-preact";

function Header({title}){
   return <h1>{title}</h1>  
}

let store = new Store(
   {
       title : "Hello!"
   },
   {
       title : {
           update(state, title){
               return title;
           }
       }
   }
);

render(
   <Provider store={store}>
       <div>
           <Connect>
               {(state,actions)=><Header title={state.title}/>}
           </Connect>
           <Connect>
               {(state,actions)=><div>
                   <button onclick={()=>action.titleUpdate("Hello!")}>
                       select title : Hello!
                   </button>
                   <button onclick={()=>action.titleUpdate("Bye!")}>
                       select title : Bye!
                   </button>
               </div>}
           </Connect>
       </div>
   </Provider>   
   document.querySelector('main')
)
```

