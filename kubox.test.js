let Store = require("./dist/kubox.js");

test("create a simple counter to see if it modifies the state and notifies the subscriber", () => {
    let store = new Store({
        count: 0
    });

    store.setActions({
        count: {
            increment(state) {
                state.set(state.get() + 1);
            },
            decrement(state) {
                state.set(state.get() - 1);
            }
        }
    });

    store.subscribe(({ count }) => {
        expect(count).toBe(1);
    });

    store.actions.countIncrement();
});
