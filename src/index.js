import { toCamelCase } from "./utils";

export default class Store {
    /**
     *
     * @param {*} state
     */
    constructor(state = {}, reducers = {}) {
        this.state = state;
        this.actions = {};
        this.subscribers = {};
        this.reducers(reducers);
    }
    /**
     * Update allows you to update the status and notify subscribers
     * @param {object} updater
     * @return {undefined}
     */
    update(updater) {
        if (typeof updater !== "object") return;
        let keys = Object.keys(updater);
        if (!keys.length) return;
        this.state = { ...this.state, ...updater };
        keys.concat("*").forEach(property => {
            let subscribe = this.subscribers[property] || [];
            subscribe.forEach(handler => handler(this.state));
        });
    }
    /**
     * Each time update is executed, it removes the modified properties,
     * you can subscribe to those store properties.
     * @param {function} handler - will be notified when the store changes
     * @param {string} type - permite apuntar el suscriptor solo a una propiedad el estado
     * @return {function} delete the subscription to the state.
     */
    subscribe(handler, type = "*") {
        if (typeof handler !== "function") return;
        let subscribe = (this.subscribers[type] = this.subscribers[type] || []);
        subscribe.push(handler);
        return function unsubscribe() {
            subscribe.splice(subscribe.indexOf(handler) >>> 0, 1);
        };
    }
    /**
     * Allows you to recover or define actions within the store.
     * @param {object} reducers - object that groups reducers
     * @param {string} [nameSpace] - Define the name of space, this is used
     *                               recursively when scanning the object.
     * @return {undefined}
     */
    reducers(reducers, nameSpace = "") {
        if (typeof reducers !== "object") return;
        for (let property in reducers) {
            let action = this.nameSpace(nameSpace, property),
                reducer = reducers[property];
            if (typeof reducer === "object") {
                this.reducers(reducer, action);
            }
            if (typeof reducer === "function") {
                this.actions[action] = this.createReducer(reducer, nameSpace);
            }
        }
    }
    /**
     * @param {string} [nameSpace] - Allows you to obtain all or
     *                               part of it based of nameSpace.
     * @return {state}
     */
    getState(nameSpace) {
        return nameSpace ? this.state[nameSpace] : this.state;
    }
    /**
     * Create a nameSpace, uniendo nameSpace y add.
     * @param {string} nameSpace -
     * @param {string} add -
     */
    nameSpace(nameSpace, add) {
        return toCamelCase(nameSpace + (nameSpace ? " " : "") + add);
    }
    /**
     * Execute an action as a reduce and evaluate its return.
     * @param {function} callback - action that runs as a reduce.
     * @param {string} [nameSpace] - allows access to the entire state or only part of the.
     *                               Necessary argument for the
     *                               execution of iterators within recycle.
     * @return {function} - this function is the action working as a reduce.
     */
    createReducer(callback, nameSpace) {
        return (...args) =>
            this.recycle(
                callback(this.getState(nameSpace), ...args),
                update => {
                    this.update(
                        nameSpace
                            ? {
                                  [nameSpace]: update
                              }
                            : update
                    );
                },
                nameSpace
            );
    }
    /**
     * Evaluate an argument to define its final value.
     * If it is a promise, it will wait to define its value.
     * If it is a generator, the iteration ends to define its value.
     * @param {any} update
     * @param {function} callback
     * @param {string} [nameSpace]
     */
    recycle(update, callback, nameSpace) {
        if (typeof update === "object") {
            if (typeof update.then === "function") {
                update.then(update =>
                    this.recycle(update, callback, nameSpace)
                );
                return;
            }
            if (typeof update.next === "function") {
                let iterator = update.next(this.getState(nameSpace));
                if (!iterator.done) {
                    this.recycle(iterator.value, value => {
                        callback(value);
                        this.recycle(update, callback, nameSpace);
                    });
                }
                return;
            }
        }
        callback(update);
    }
}
