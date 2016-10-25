import { Template } from 'Utilities/Template';
import { IViewBinding } from 'Views/IViewBinding';
import { Tap } from 'Utilities/Tap';
import { NativeBridge } from 'Native/NativeBridge';
import { Platform } from 'Constants/Platform';

export class View {

    protected _nativeBridge: NativeBridge;

    protected _template: Template;
    protected _templateData: { [key: string]: any; };
    protected _bindings: IViewBinding[];
    protected _container: HTMLElement;

    protected _id: string;

    constructor(nativeBridge: NativeBridge, id: string) {
        this._nativeBridge = nativeBridge;
        this._id = id;
    }

    public render(): void {
        this._container = document.createElement('div');
        this._container.id = this._id;
        this._container.innerHTML = this._template.render(this._templateData ? this._templateData : {});

        let attachTap = this._nativeBridge.getPlatform() === Platform.IOS;

        this._bindings.forEach((binding: IViewBinding) => {
            let elements: NodeList = this._container.querySelectorAll(binding.selector);
            for(let i: number = 0; i < elements.length; ++i) {
                let element: Node = elements[i];
                if(attachTap && binding.event === 'click') {
                    binding.tap = new Tap(<HTMLElement>element);
                }
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
