(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global.Kubox = factory());
}(this, (function () { 'use strict';

/**
 * Convert a dash / dot / underline / separation of spaces in camelCase: foo-bar → fooBar
 * @param {string} string
 * @returns {string}
 */
function toCamelCase(string) {
    return string.replace(/[\s\t\n\-\_]+(\w)/g, function (all, letter) { return letter.toUpperCase(); }
    );
}

var Store = function Store(state, reducers) {
    if ( state === void 0 ) state = {};
    if ( reducers === void 0 ) reducers = {};

    this.state = state;
    this.actions = {};
    this.subscribers = {};
    this.reducers(reducers);
};
/**
 * Update allows you to update the status and notify subscribers
 * @param {object} updater
 * @return {undefined}
 */
Store.prototype.update = function update (updater) {
        var this$1 = this;

    if (typeof updater !== "object") { return; }
    var keys = Object.keys(updater);
    if (!keys.length) { return; }
    this.state = Object.assign({}, this.state, updater);
    keys.concat("*").forEach(function (property) {
        var subscribe = this$1.subscribers[property] || [];
        subscribe.forEach(function (handler) { return handler(this$1.state); });
    });
};
/**
 * Each time update is executed, it removes the modified properties,
 * you can subscribe to those store properties.
 * @param {function} handler - will be notified when the store changes
 * @param {string} type - permite apuntar el suscriptor solo a una propiedad el estado
 * @return {function} delete the subscription to the state.
 */
Store.prototype.subscribe = function subscribe (handler, type) {
        if ( type === void 0 ) type = "*";

    if (typeof handler !== "function") { return; }
    var subscribe = (this.subscribers[type] = this.subscribers[type] || []);
    subscribe.push(handler);
    return function unsubscribe() {
        subscribe.splice(subscribe.indexOf(handler) >>> 0, 1);
    };
};
/**
 * Allows you to recover or define actions within the store.
 * @param {object} reducers - object that groups reducers
 * @param {string} [nameSpace] - Define the name of space, this is used
 *                           recursively when scanning the object.
 * @return {undefined}
 */
Store.prototype.reducers = function reducers (reducers$1, nameSpace) {
        var this$1 = this;
        if ( nameSpace === void 0 ) nameSpace = "";

    if (typeof reducers$1 !== "object") { return; }
    for (var property in reducers$1) {
        var action = this$1.nameSpace(nameSpace, property),
            reducer = reducers$1[property];
        if (typeof reducer === "object") {
            this$1.reducers(reducer, action);
        }
        if (typeof reducer === "function") {
            this$1.actions[action] = this$1.createReducer(reducer, nameSpace);
        }
    }
};
/**
 * @param {string} [nameSpace] - Allows you to obtain all or
 *                           part of it based of nameSpace.
 * @return {state}
 */
Store.prototype.getState = function getState (nameSpace) {
    return nameSpace ? this.state[nameSpace] : this.state;
};
/**
 * Create a nameSpace, uniendo nameSpace y add.
 * @param {string} nameSpace -
 * @param {string} add -
 */
Store.prototype.nameSpace = function nameSpace (nameSpace$1, add) {
    return toCamelCase(nameSpace$1 + (nameSpace$1 ? " " : "") + add);
};
/**
 * Execute an action as a reduce and evaluate its return.
 * @param {function} callback - action that runs as a reduce.
 * @param {string} [nameSpace] - allows access to the entire state or only part of the.
 *                           Necessary argument for the
 *                           execution of iterators within recycle.
 * @return {function} - this function is the action working as a reduce.
 */
Store.prototype.createReducer = function createReducer (callback, nameSpace) {
        var this$1 = this;

    return function () {
                var args = [], len = arguments.length;
                while ( len-- ) args[ len ] = arguments[ len ];

                return this$1.recycle(
            callback.apply(void 0, [ this$1.getState(nameSpace) ].concat( args )),
            function (update) {
                    var obj;

                this$1.update(
                    nameSpace
                        ? ( obj = {}, obj[nameSpace] = update, obj)
                        : update
                );
            },
            nameSpace
        );
        };
};
/**
 * Evaluate an argument to define its final value.
 * If it is a promise, it will wait to define its value.
 * If it is a generator, the iteration ends to define its value.
 * @param {any} update
 * @param {function} callback
 * @param {string} [nameSpace]
 */
Store.prototype.recycle = function recycle (update, callback, nameSpace) {
        var this$1 = this;

    if (typeof update === "object") {
        if (typeof update.then === "function") {
            update.then(function (update) { return this$1.recycle(update, callback, nameSpace); }
            );
            return;
        }
        if (typeof update.next === "function") {
            var iterator = update.next(this.getState(nameSpace));
            if (!iterator.done) {
                this.recycle(iterator.value, function (value) {
                    callback(value);
                    this$1.recycle(update, callback, nameSpace);
                });
            }
            return;
        }
    }
    callback(update);
};

return Store;

})));
