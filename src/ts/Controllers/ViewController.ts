import View = require('Views/View');

class ViewController {

    private _containers = {};

    private static _body = document.getElementsByTagName('body')[0];

    constructor() {

    }

    insertView(view: View) {
        let container = view.render();
        this._containers[view.id()] = container;
        this.hideView(view);
        ViewController._body.appendChild(container);
    }

    removeView(view: View) {
        let container = this._containers[view.id()];
        container.parentNode.removeChild(container);
        delete this._containers[view.id()];
    }

    showView(view: View) {
        let container = this._containers[view.id()];
        container.style.visibility = 'visible';
    }

    hideView(view: View) {
        let container = this._containers[view.id()];
        container.style.visibility = 'hidden';
    }

}

export = ViewController;