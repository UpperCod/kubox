import { h, Component } from "preact";

export const PROVIDER = "__KUBOX__";

export class Connect extends Component {
    getStore() {
        return this.context[PROVIDER];
    }
    subscribe(property) {
        let store = this.getStore();
        if (!store) throw "Store undefined";
        let unsubscribers = []
            .concat(property || "*")
            .map(prop => store.subscribe(prop, () => this.setState()));
        this.unsubscribe = () => {
            unsubscribers.forEach(unsubscribe => unsubscribe());
        };
    }
    componentWillMount() {
        this.subscribe(this.props.property);
    }
    componentWillReceiveProps(props) {
        if (this.unsubscribe) this.unsubscribe();
        this.subscribe(props.property);
    }
    render({ children }) {
        let { state, actions } = this.getStore();
        return children[0](state, actions);
    }
}

export class Provider extends Component {
    getChildContext() {
        return {
            [PROVIDER]: this.props.store
        };
    }
    render({ children }) {
        return children[0];
    }
}
