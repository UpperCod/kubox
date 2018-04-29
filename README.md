# Kubox

Kubox manages the state based on actions with context and handling of easily debuggable asynchrony


## Action.

the action is the only one that can modify the state, by means of the first received argument, this argument has 2 methods:

* **set**: allows to edit, create a new status and notify subscribers of such change.
* **get**: allows you to obtain the current status.

### Example of an action.

```js
export default function(state){
   let before = state.get(); // {}
              state.set({hello:"Kubox"});
   let after = state.get(); // {hello:"kubox"}
}
```
> The Action is free to respond to the view with what it deems appropriate, but the only way to modify or obtain the state is through the **set** and **get** methods of the first argument delivered to the Action.

## Store(object state, object actions)

The **store** instance, requires 2 arguments:

1. **state** : *{object}*, initial state for the store.
2. **actions** : *{object}*, state modifying actions.

```js
import Store from "kubox";
import state from "./state";
import actions from "./actions";

export default new Store(state,actions);
```

The store instance defines the following properties:

* **state** : *{object}*, contains the current state of the store.
* **actions** : *{object}*, contains the actions assigned to the store.
* **subscribers** : *{object}*, contains the subscribers to the state changes within the store.
* **subscribe** : *{function}*, allows registering a subscriber to the store, this in turn returns a function to eliminate the registration as a subscriber.

### Actions

It is an object that groups all actions, this is scanned regardless of its depth at the time of instantiation of the store, to define all actions within the store.

### Example of actions

#### file actions.js

```js

function increment(state){
   state.set(
       (state.get()||0)+1
   );
}

function decrement(state){
   state.set(
       (state.get()||0)-1
   );
}

function replace(state,count){
   state.set(count);
}

export default {
   count : {
       increment,
       decrement,
       replace,
   }
}
```

#### file store.js

The instance of store defines the actions within the property of the instance `store.actions`, by means of the typing camelCase will generate the following names of actions.

```js
import actions from "./actions";

let store =  new Store({},actions);

store.actions.countIncrement() // store.state {count:1}
store.actions.countDecrement() // store.state {count:0}
store.actions.countReplace(10) // store.state {count:10}
```

> Any change that produces **countIncrement**, **countDecrement** and **countReplace**, will be contained in the property of the state **count**.

### action middleware

If you define an action in the root whose property name is **middleware**, this action will receive all the executions of the other **actions**, receiving the following additional arguments to the status control:

* **action** : *{string}*, name of the action that launches the change.
* **updater** : *{any}*, change thrown by the action.

In this way the middleware controls any change that points to the store from an action, this type of action is ideal for debug the store.

### Kubox flow.

![kubox flow](img/flow-min.png)

### subscribe(function handler[, string watch ])

You can register in the changes of the whole state or point to certain properties of the.

The subscriber was notified notified whenever it is sent from **set**.

