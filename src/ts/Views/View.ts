import Observable from 'Utilities/Observable';
import Template from 'Utilities/Template';

import { IViewBinding } from 'ViewBinding';

export default class View extends Observable {

    protected _template: Template;
    protected _templateData: { [key: string]: string; };
    protected _bindings: IViewBinding[];
    protected _container: HTMLElement;

    protected _id: string;

    constructor(id: string) {
        super();
        this._id = id;
    }

    public render(): void {
        this._container = document.createElement('div');
        this._container.id = this._id;
        this._container.innerHTML = this._template.render(this._templateData);

        this._bindings.forEach((binding: IViewBinding) => {
            let elements: NodeList = this._container.querySelectorAll(binding.selector);
            for (let i: number = 0; i < elements.length; ++i) {
                let element: Node = elements[i];
                element.addEventListener(binding.event, binding.listener, false);
            }
        });
    }

    public container(): HTMLElement {
        return this._container;
    }

    public show(): void {
        this._container.style.visibility = 'visible';
    }

    public hide(): void {
        this._container.style.visibility = 'hidden';
    }
}
