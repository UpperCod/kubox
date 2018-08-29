# Kubox

Kubox, is a small (<600bytes gzip) state manager, such as **Redux**, **Mobx** or another library.

Kubox manages the state based on **namespace**, these are created from an object of actions, Kubox maps this object and obtains **namespace** based on the properties that this object possesses, the The purpose of these **namespace** is to limit the scope of the actions only to the **namespace**.


```js
import Store from "kubox";
// The root state must always be an object.
let state = {countOne : 0, countTwo:0};
// This function only knows the state scope assigned by kubox.
let add = (state) => state.set( state.get() + 1 );

let state = new Store(state,{
   count : {
       // The namespace of this action is countOne
       one : {add},
       // The namespace of this action is countTwo
       two : {add}
   }
});
/**
* The action is stored in:
* state.actions.<namespace>.<action>
*/
state.actions.countOne.add(); // {countOne: 1,countTwo: 0}
state.actions.countTwo.add(); // {countOne: 1,countTwo: 1}
```
 

In the previous example it is taught as **Kubox**, it limits the depth of the state it receives from each existing action based on the **namespace**.


## Namespace

Kubox manages the state based on **namespace**, an action will always receive by kubox as the first argument an object with 2 methods, these methods allow to interact with the state either by root or associated only to the context given by the **namespace**.

* set: This method allows you to modify the status.
* get: This method allows you to obtain the status.

### Get

The use of `get` allows to obtain the current state

```javascript
export function add(state){
   state.get()
}
```


### Set

The use of `set` allows you to generate a new state, if you want to go from a **A** state to a **B** state, just define the **B** state by using `set(B)`.

```javascript
export function add(state){
   state.set(
           state.get() + 1
   )
}
```


> The functions created with this argument format are highly reusable.


### Arguments

Every action can receive more than one argument.

```javascript
export function sum(state,a, b){
   state.set(a+b)
}

store.actions.total.sum(100,100) // {count:200}
```


## Subscribers

All the change of state is announced to the subscribers, for this you must use the method of the instance `store.subscribe`.

```javascript
import Store from "kubox"

let store = new Store({})

store.subscribe((state)=>{
   console.log(state)
})
```


### Directed subscription

By default the subscriber hears all the changes, but you can focus this listening to only the actions of a given **namespace**.

```javascript
store.subscribe((state)=>{
   console.log(state)
},"count")
```


> The taught subscriber will only hear the changes associated with the actions that belong to the namespace **count**


## Middleware

Any action can be seen in the attempted modification by the middleware. This receives 2 arguments:

1. state: {object}, this has the ** set ** and ** get ** methods.
2. change: {object}, this has a detail of who tries to generate the change.
   * space: {string}, alias for the ** space name **
   * action: {string}, name of the action that executes the `set` method.
   * state: {any}, argument given to the `set` method, for the state update.

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


> The middleware has absolute control over the definition of the state.


## Utilities

|Libreria | Npm | Github |
|:--------|:----|:-------|
| kubox-preact | [Link](https://www.npmjs.com/package/kubox-preact) | [Link](https://github.com/UpperCod/kubox-preact) | 
| kubox-react | [Link](https://www.npmjs.com/package/kubox-react) | [Link](https://github.com/UpperCod/kubox-react) | 
