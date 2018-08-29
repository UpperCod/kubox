/**
 * Apply the camel case format
 * @param {string} string - string to modify
 * @return {string} string with the change already applied
 */
function toCamelCase(string) {
    return string.replace(/[^\w\_]+(\w)/g, (all, letter) =>
        letter.toUpperCase()
    );
}
/**
 * Instance a store that allows you to store subscriptions, status and actions
 * @method setActions(actions,middleware,space)
 * @method subscribe(handler,space)
 */
export default class Store {
    /**
     * @param {object} [state] - initial state of the store
     * @param {object} [actions] - initial actions of the store
     * @param {function} [middleware] - middleware for initial actions
     */
    constructor(state, actions, middleware) {
        this.state = state || {};
        this.actions = {};
        this.handlers = {};
        this.setActions(actions, (this.middleware = middleware));
    }
    /**
     * This function creates a set and get context to execute within each action
     * @param {object} actions - ations to register in this.actions
     * @param {function} middleware - middleware for the group of actions,
     *  this function is called every time the action executes the set function
     * @param {string} [space] - namespace of actions
     */
    setActions(actions, middleware, space = "") {
        middleware = middleware || this.middleware;

        let use = this.actions,
            notify = ["*"].concat(space),
            set = space => state => {
                this.state = space ? { ...this.state, [space]: state } : state;
                notify.forEach(space => {
                    (this.handlers[space] || []).forEach(handler =>
                        handler(this.state, space)
                    );
                });
                return this.state;
            },
            get = space => fn => {
                let state = space ? this.state[space] : this.state;
                return typeof fn === "function"
                    ? fn(state)
                    : state !== undefined
                        ? state
                        : fn;
            };

        if (space) use = use[space] || (use[space] = {});

        for (let prop in actions) {
            let action = actions[prop];
            if (typeof action === "object") {
                this.setActions(
                    action,
                    middleware,
                    space ? toCamelCase(space + " " + prop) : prop
                );
            } else {
                let state = {
                    set: middleware
                        ? state =>
                              middleware(
                                  { set: set(), get: get() },
                                  {
                                      space,
                                      action: prop,
                                      state
                                  }
                              )
                        : set(space),
                    get: get(space)
                };
                use[prop] = (...args) => action(state, ...args);
            }
        }
    }
    /**
     * Subscribers can point to changes made by specific namespace actions
     * in this way the execution of subscribers is optimized
     * @param {function} handler - subscribed to the state changes
     * @param {string} space - You can point to a specific namespace, avoiding listening to
     * the changes of others by other actions
     */
    subscribe(handler, space = "*") {
        let handlers = (this.handlers[space] = this.handlers[space] || []);
        handlers.push(handler);
        return () => handlers.splice(handlers.indexOf(handler) >>> 0, 1);
    }
}
