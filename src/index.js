/**
 * Apply the camel case format
 * @param {string} string - string to modify
 * @return {string} string with the change already applied
 */
function toCamelCase(string) {
    return string.replace(/[\s\t\n\-\_]+(\w)/g, (all, letter) =>
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
    constructor(state = {}, actions = {}, middleware) {
        this.state = state;
        this.actions = {};
        this.handlers = {};
        this.setActions(actions, middleware);
    }
    /**
     * This function creates a set and get context to execute within each action
     * @param {object} actions - ations to register in this.actions
     * @param {function} middleware - middleware for the group of actions,
     *  this function is called every time the action executes the set function
     * @param {string} [space] - namespace of actions
     */
    setActions(actions, middleware, space = "") {
        let group = ["*"].concat(space),
            set = space => state => {
                this.state = space ? { ...this.state, [space]: state } : state;
                group.forEach(prop =>
                    (this.handlers[prop] || []).forEach(handler =>
                        handler(this.state, prop)
                    )
                );
                return this.state;
            },
            get = space => () => (space ? this.state[space] : this.state);

        for (let prop in actions) {
            let action = actions[prop],
                alias = space ? toCamelCase(space + " " + prop) : prop;
            if (typeof action === "object") {
                this.setActions(action, middleware, alias);
            } else {
                let state = {
                    set: middleware
                        ? state =>
                              middleware(
                                  { set: set(), get: get() },
                                  {
                                      state,
                                      action: alias,
                                      space
                                  }
                              )
                        : set(space),
                    get: get(space)
                };
                /**
                 * Create a function that creates access to the store for the action,
                 * this in turn transfers the arguments given to the action
                 */
                this.actions[alias] = (...args) => action(state, ...args);
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
