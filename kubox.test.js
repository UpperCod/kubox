let Store = require("./build/umd");

test("create a simple counter to see if it modifies the state and notifies the subscriber", () => {
    let store = new Store();

    store.reducers({
        count: {
            ingrement(state = 0) {
                return ++state;
            },
            decrement(state = 0) {
                return --state;
            }
        }
    });

    store.subscribe(({ count }) => {
        expect(count).toBe(1);
    });

    store.actions.countIngrement();
});
