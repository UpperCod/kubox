let Store = require("./build/umd");

test("create a simple counter to see if it modifies the state and notifies the subscriber", () => {
    let store = new Store();

    store.mapActions({
        count: {
            ingrement(state) {
                state.set((state.get() || 0) + 1);
            },
            decrement(state) {
                state.set((state.get() || 0) - 1);
            }
        }
    });

    store.subscribe(({ count }) => {
        expect(count).toBe(1);
    });

    store.actions.countIngrement();
});
