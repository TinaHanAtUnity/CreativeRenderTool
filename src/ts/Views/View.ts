import Observable = require('Utilities/Observable');
import Template = require('Utilities/Template');

import ViewBinding = require('ViewBinding');

class View extends Observable {

    protected _template: Template;
    protected _templateData: { [key: string]: string; };
    protected _bindings: ViewBinding[];
    protected _container: HTMLElement;

    protected _id: string;

    constructor(id: string) {
        super();
        this._id = id;
    }

    render() {
        this._container = document.createElement('div');
        this._container.id = this._id;
        this._container.innerHTML = this._template.render(this._templateData);

        for(let binding of this._bindings) {
            let elements = this._container.querySelectorAll(binding.selector);
            for(let i = 0; i < elements.length; ++i) {
                let element = elements[i];
                element.addEventListener(binding.event, binding.listener, false);
            }
        }
    }

    container() {
        return this._container;
    }

    show() {
        this._container.style.visibility = 'visible';
    }

    hide() {
        this._container.style.visibility = 'hidden';
    }
}

export = View;