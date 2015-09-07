import NativeBridge = require('NativeBridge');

class View {

    protected _nativeBridge: NativeBridge;

    constructor(nativeBridge: NativeBridge) {
        this._nativeBridge = nativeBridge;
    }

    id(): string {
        return null;
    }

    render(): HTMLElement {
        let container = document.createElement('div');
        container.id = this.id();
        return container;
    }

    show() {}
    hide() {}
}

export = View;