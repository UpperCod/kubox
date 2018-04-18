# 🥊 Kubox

Kubox is a very small state administrator **(694 bytes gzip)**.

```bash
#yarn
yarn add -D kubox
#npm
npm install -D kubox
```

## Introduction

### Reducer

The principle is simple and is based on `Array.prototype.reduce`, a function that returns a new value based on the delivered argument.

```js
function append(list = [], value) {
    return list.concat(value);
}

let list = [];

list = append(list, 1); // [1];
list = append(list, 2); // [1,2];
```

But a state is not just a function, it usually consists of many reducing functions, which increases the complexity in management, but kubox simplifies it 😉.


## Kubox([ object state = {} [, objec  reducers = {} ]])

The **kubox** instance allows you to quickly define the **state** and **reducers**.

```js
import Store from "kubox";

let store = new Store(
    {
        // object state
        loading: false
    },
    {
        // object reducers
        loadingSwitch({ loading = false }) {
            return { loading: !loading };
        }
    }
);

store.actions.loadingSwitch();
```

## Kubox::reducers(object reducers [, string  nameSpace = ""])

**Kubox** simplifies the management in execution of these reducers, creating and storing within `Store.actions` a new function, capable of modifying the state of the `Store`.

### Example

```js
import Store from "kubox";

let initState = {
   task = [],
};

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

store.reducers( reducers);

store.subscribe((state)=>{
   console.log(state.task) // [{id:0,data:'hello!'}]
});

store.actions.taskCreate('hello!');
```

 > Please note that the property `reducers.task.create` is executed as an action using the property `store.action.taskCreate`, this is due to the deep scan generated by **Kubox** to create an action function, with the typing format **camelCase**, prefixing the **property** that contains the reducers functions **create, remove and update**. This to create actions that point to these functions **taskCreate, taskRemove and taskUpdate**.

### CamelCase

Kubox transforms the reducers into grouped functions within `store.actions` using the CamelCase format, avoiding objects with a complicated and deep structure.

#### Reducers of entry

**Kubox** will take the property **task** to store the state generated by **create**, and in turn will create an action called **taskCreate**, to execute the reducer **create**.

```js 
store.reducers({
    task: {
        create(list = [], data) {
            return list.concat({
                id: list.length,
                data
            });
        },
        remove(list = [], id) {
            return list.filter(list => list.id !== id);
        },
        update(list = [], { id, data }) {
            return list.map(log => (log.id === id ? { id, data } : log));
        }
    }
});
```

#### Output actions

Please note that now `task.create` is an action function, the data parameters to `taskCreate` will be delivered to `task.create`, but always prefixing the **state** as the first argument.

```js
store.actions.taskCreate("hello!");
store.actions.taskRemove(1);
store.actions.taskUpdate({ id: 1, data: "hello!!!" });
```

> This allows you not to worry about generating aliases to achieve certain processes.

## Asynchrony

You can handle asynchronous state changes through asynchronous functions, promises or generators. this is thanks to **Kubox** analyzing the return of the reducer, recycling the answer hoping to reach the final value.

### Async and await

Promises are a better way to modify the state if you want to report a single return.

```js
store.reducers({
    async debounce() {
        await new Promise(resolve => {
            setTimeout(resolve, 1000);
        });
        return false;
    }
});
```

### Generators

Generators are a better way to modify the state if you wish to report multiple returns.

```js
store.reducers({
    *debounce() {
        yield { loading: true }; // {loading:true}
        yield new Promise(resolve => {
            setTimeout(resolve, 1000);
        });
        yield { loading: false }; // {loading:false}
    }
});
```

## Kubox::subscribe( function handler [, string nameSpace = "*"] )

all change will only be issued to **subscribers**, by default subscribers subscribe to any change in the state, but you can change that by pointing the subscriber to a specific property `store.subscibe (handler, 'task')` , avoiding receiving an overload for any change in the store.

```js
import Store from "kubox";

let store = new Store({});

store.reducers({
    loading(state, nextState) {
        return { loading: nextState };
    }
});

store.subscribe(state => {
    console.log(state); // {loading:true}
});

store.actions.loading(true);
```

## kubox-preact

A small library to share the state managed by Kubox, [view more](https://github.com/uppercod/kubox-preact).



```js
import Store from "kubox";
import { h, render } from "preact";
import { Provider, Connect } from "kubox-preact";

function Header({ title }) {
    return <h1>{title}</h1>;
}

let store = new Store(
    {
        title: "Hello!"
    },
    {
        title: {
            update(state, title) {
                return title;
            }
        }
    }
);

render(
    <Provider store={store}>
        <div>
            <Connect>
                {(state, actions) => <Header title={state.title} />}
            </Connect>
            <Connect>
                {(state, actions) => (
                    <div>
                        <button onclick={() => action.titleUpdate("Hello!")}>
                            select title : Hello!
                        </button>
                        <button onclick={() => action.titleUpdate("Bye!")}>
                            select title : Bye!
                        </button>
                    </div>
                )}
            </Connect>
        </div>
    </Provider>,
    document.querySelector("main")
);
```

