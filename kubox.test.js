let Store = require("./dist/kubox.js");

describe("Test group 1, shallow object depth", () => {
    test("1: Simple store", () => {
        let state = { count: 0 },
            actions = {
                count: {
                    increment(state) {
                        state.set(state.get() + 1);
                    },
                    decrement(state) {
                        state.set(state.get() - 1);
                    }
                }
            },
            store = new Store(state, actions);

        store.subscribe(({ count }) => {
            expect(count).toBe(1);
        });

        store.actions.count.increment();
    });
    test("2: Simple store with deep namespace", () => {
        let state = { count: 0 },
            calc = {
                increment(state) {
                    state.set(state.get(0) + 1);
                },
                decrement(state) {
                    state.set(state.get(0) - 1);
                }
            },
            actions = {
                count: {
                    ...calc,
                    deep: calc
                }
            },
            store = new Store(state, actions);

        store.subscribe(({ count }) => {
            expect(count).toBe(1);
        });

        store.actions.count.increment();
        store.actions.countDeep.increment();
    });
});
