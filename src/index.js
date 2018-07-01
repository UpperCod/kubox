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
            set = state => {
                this.state = space ? { ...this.state, [space]: state } : state;
                group.forEach(prop =>
                    (this.handlers[prop] || []).forEach(handler =>
                        handler(this.state, prop)
                    )
                );
                return get();
            },
            get = () => (space ? this.state[space] : this.state);

        for (let prop in actions) {
            let action = actions[prop],
                aliasAction = space ? toCamelCase(prop + " " + space) : prop,
                aliasSpace = space ? toCamelCase(space + " " + prop) : prop;
            if (typeof action === "object") {
                this.setActions(action, middleware, aliasSpace);
            } else {
                let state = {
                    set: middleware
                        ? state =>
                              /**
                               *  @param {object} arguments[0] - The first argument of the middleware
                               * is the set and get non-blocking
                               *  @param {function} arguments[0].set - updates and notifies subscribers
                               * of said update
                               *  @param {function} arguments[0].get - get the current status
                               *  @param {object} arguments[1] - the second argument is a record of the
                               * action that the store tries to update
                               *  @param {object} arguments[1].state - the status update sent by the action
                               *  @param {string} arguments[1].action - name of the action that executes
                               * the change
                               *  @param {string} arguments[1].space - Namespace of the action if the
                               * change points only to one property
                               */
                              middleware(
                                  { set, get },
                                  {
                                      state,
                                      action: aliasAction,
                                      space: aliasSpace
                                  }
                              )
                        : set,
                    get
                };
                /**
                 * Create a function that creates access to the store for the action,
                 * this in turn transfers the arguments given to the action
                 */
                this.actions[aliasAction] = (...args) => action(state, ...args);
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
