import { Template } from 'Utilities/Template';
import { IViewBinding } from 'Views/IViewBinding';
import { Tap } from 'Utilities/Tap';
import { NativeBridge } from 'Native/NativeBridge';
import { Platform } from 'Constants/Platform';
import { Swipe } from 'Utilities/Swipe';

export class View {

    private static addEventListener(binding: IViewBinding, element: HTMLElement, attachTap: boolean) {
        if(binding.event === 'swipe') {
            binding.swipe = new Swipe(<HTMLElement>element);
        }

        if(attachTap && binding.event === 'click') {
            binding.tap = new Tap(<HTMLElement>element);
        }
        element.addEventListener(binding.event, binding.listener, false);
    }

    protected _nativeBridge: NativeBridge;

    protected _template: Template;
    protected _templateData: { [key: string]: string | number | boolean | undefined; };
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

        const attachTap = this._nativeBridge.getPlatform() === Platform.IOS;

        this._bindings.forEach((binding: IViewBinding) => {
            if(binding.selector) {
                const elements: NodeList = this._container.querySelectorAll(binding.selector);
                // tslint:disable:prefer-for-of
                for(let i = 0; i < elements.length; ++i) {
                    const element = elements[i];
                    View.addEventListener(binding, <HTMLElement>element, attachTap);
                }
                // tslint:enable:prefer-for-of
            } else {
                View.addEventListener(binding, this._container, attachTap);
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
