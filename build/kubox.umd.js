(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
    typeof define === 'function' && define.amd ? define(factory) :
    (global.Kubox = factory());
}(this, (function () { 'use strict';

    /**
     * Apply the camel case format
     * @param {string} string - string to modify
     * @return {string} string with the change already applied
     */
    function toCamelCase(string) {
        return string.replace(/[\s\t\n\-\_]+(\w)/g, function (all, letter) { return letter.toUpperCase(); }
        );
    }
    /**
     * Instance a store that allows you to store subscriptions, status and actions
     * @method setActions(actions,middleware,space)
     * @method subscribe(handler,space)
     */
    var Store = function Store(state, actions, middleware) {
        if ( state === void 0 ) state = {};
        if ( actions === void 0 ) actions = {};

        this.state = state;
        this.actions = {};
        this.handlers = {};
        this.setActions(actions, middleware);
    };
    /**
     * This function creates a set and get context to execute within each action
     * @param {object} actions - ations to register in this.actions
     * @param {function} middleware - middleware for the group of actions,
     *  this function is called every time the action executes the set function
     * @param {string} [space] - namespace of actions
     */
    Store.prototype.setActions = function setActions (actions, middleware, space) {
            var this$1 = this;
            if ( space === void 0 ) space = "";

        var group = ["*"].concat(space),
            set = function (state) {
                    var obj;

                this$1.state = space ? Object.assign({}, this$1.state, ( obj = {}, obj[space] = state, obj )) : state;
                group.forEach(function (prop) { return (this$1.handlers[prop] || []).forEach(function (handler) { return handler(this$1.state, prop); }
                    ); }
                );
                return get();
            },
            get = function () { return (space ? this$1.state[space] : this$1.state); };

        var loop = function ( prop ) {
            var action = actions[prop],
                aliasAction = space ? toCamelCase(prop + " " + space) : prop,
                aliasSpace = space ? toCamelCase(space + " " + prop) : prop;
            if (typeof action === "object") {
                this$1.setActions(action, middleware, aliasSpace);
            } else {
                var state = {
                    set: middleware
                        ? function (state) { return middleware(
                                  { set: set, get: get },
                                  {
                                      state: state,
                                      action: aliasAction,
                                      space: aliasSpace
                                  }
                              ); }
                        : set,
                    get: get
                };
                /**
                 * Create a function that creates access to the store for the action,
                 * this in turn transfers the arguments given to the action
                 */
                this$1.actions[aliasAction] = function () {
                        var args = [], len = arguments.length;
                        while ( len-- ) args[ len ] = arguments[ len ];

                        return action.apply(void 0, [ state ].concat( args ));
                    };
            }
        };

            for (var prop in actions) loop( prop );
    };
    /**
     * Subscribers can point to changes made by specific namespace actions
     * in this way the execution of subscribers is optimized
     * @param {function} handler - subscribed to the state changes
     * @param {string} space - You can point to a specific namespace, avoiding listening to
     * the changes of others by other actions
     */
    Store.prototype.subscribe = function subscribe (handler, space) {
            if ( space === void 0 ) space = "*";

        var handlers = (this.handlers[space] = this.handlers[space] || []);
        handlers.push(handler);
        return function () { return handlers.splice(handlers.indexOf(handler) >>> 0, 1); };
    };

    return Store;

})));
