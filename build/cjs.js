'use strict';

function toCamelCase(string) {
    return string.replace(/[\s\t\n\-\_]+(\w)/g, function (all, letter) { return letter.toUpperCase(); }
    );
}

function nameSpace(parent, child) {
    return toCamelCase(parent + (parent ? " " : "") + child);
}

function update(store, updater) {
    if (typeof nextState !== "object") { return; }
    var changes = Object.keys(updater);
    if (!changes.length) { return; }
    store.state = Object.assign({}, store.state, updater);
    changes
        .concat("*")
        .forEach(function (property) { return (store.subscribers[property] || []).forEach(function (handler) { return handler(store.state); }
            ); }
        );
}

var Store = function Store(state, actions) {
    if ( state === void 0 ) state = {};
    if ( actions === void 0 ) actions = {};

    this.state = state;
    this.actions = {};
    this.subscribers = {};
    this.mapActions(actions);
};
Store.prototype.subscribe = function subscribe (handler, type) {
        if ( type === void 0 ) type = "*";

    if (typeof handler !== "function") { return; }
    var subscribe = (this.subscribers[type] = this.subscribers[type] || []);
    subscribe.push(handler);
    return function unsubscribe() {
        subscribe.splice(subscribe.indexOf(handler) >>> 0, 1);
    };
};
Store.prototype.mapActions = function mapActions (actions, space) {
        var this$1 = this;
        if ( space === void 0 ) space = "";

    if (typeof actions !== "object") { return; }
    for (var index in actions) {
        var value = actions[index];
        if (typeof value === "object") {
            this$1.mapActions(value, nameSpace(space, index));
        }
        if (typeof value === "function") {
            this$1.action(index, value, space);
        }
    }
};
Store.prototype.action = function action (index, callback, space) {
        var this$1 = this;
        if ( space === void 0 ) space = "";

    index = nameSpace(space, index);
    return (this.actions[index] = function () {
                var args = [], len = arguments.length;
                while ( len-- ) args[ len ] = arguments[ len ];

                return callback.apply(
            void 0, [ {
                set: function (updater) {
                        var obj;

                    updater = space ? ( obj = {}, obj[space] = updater, obj) : updater;
                    return index !== "middleware" && this$1.actions.middleware
                        ? this$1.actions.middleware(index, updater)
                        : update(this$1, updater);
                },
                get: function () { return (space ? this$1.state[space] : this$1.state); }
            } ].concat( args )
        );
        });
};

module.exports = Store;
