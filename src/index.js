import { toCamelCase } from "./utils";

function nameSpace(parent, child) {
    return toCamelCase(parent + (parent ? " " : "") + child);
}

function update(store, updater) {
    if (typeof nextState !== "object") return;
    let changes = Object.keys(updater);
    if (!changes.length) return;
    store.state = { ...store.state, ...updater };
    changes
        .concat("*")
        .forEach(property =>
            (store.subscribers[property] || []).forEach(handler =>
                handler(store.state)
            )
        );
}

export default class Store {
    constructor(state = {}, actions = {}) {
        this.state = state;
        this.actions = {};
        this.subscribers = {};
        this.mapActions(actions);
    }
    subscribe(handler, type = "*") {
        if (typeof handler !== "function") return;
        let subscribe = (this.subscribers[type] = this.subscribers[type] || []);
        subscribe.push(handler);
        return function unsubscribe() {
            subscribe.splice(subscribe.indexOf(handler) >>> 0, 1);
        };
    }
    mapActions(actions, space = "") {
        if (typeof actions !== "object") return;
        for (let index in actions) {
            let value = actions[index];
            if (typeof value === "object") {
                this.mapActions(value, nameSpace(space, index));
            }
            if (typeof value === "function") {
                this.action(index, value, space);
            }
        }
    }
    action(index, callback, space = "") {
        index = nameSpace(space, index);
        return (this.actions[index] = (...args) =>
            callback(
                {
                    set: updater => {
                        updater = space ? { [space]: updater } : updater;
                        return index !== "middleware" && this.actions.middleware
                            ? this.actions.middleware(index, updater)
                            : update(this, updater);
                    },
                    get: () => (space ? this.state[space] : this.state)
                },
                ...args
            ));
    }
}
