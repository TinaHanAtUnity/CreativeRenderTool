import { Platform } from 'Core/Constants/Platform';
import { Swipe } from 'Core/Utilities/Swipe';
import { Tap } from 'Core/Utilities/Tap';
import { Template } from 'Core/Utilities/Template';
import { IViewBinding } from 'Core/Views/IViewBinding';

export type TemplateDataType = string | number | boolean | null | undefined | string[];

export interface ITemplateData {
    [key: string]: TemplateDataType;
}

export abstract class View<T extends object> {

    private static addEventListener(binding: IViewBinding, element: HTMLElement, attachTap: boolean) {
        if(binding.event === 'swipe') {
            binding.swipe = new Swipe(element);
        }

        if(attachTap && binding.event === 'click') {
            binding.tap = new Tap(element);
        }
        element.addEventListener(binding.event, binding.listener, false);
    }

    protected _platform: Platform;
    protected abstract _template: Template;
    protected _templateData: { [key: string]: TemplateDataType | ITemplateData } = {};
    protected _bindings: IViewBinding[] = [];
    protected _container: HTMLElement;
    protected _handlers: T[] = [];

    protected _id: string;

    constructor(platform: Platform, id: string) {
        this._platform = platform;
        this._id = id;
    }

    public addEventHandler(handler: T): T {
        this._handlers.push(handler);
        return handler;
    }

    public removeEventHandler(handler: T): void {
        if(this._handlers.length) {
            if(typeof handler !== 'undefined') {
                this._handlers = this._handlers.filter(storedHandler => storedHandler !== handler);
            } else {
                this._handlers = [];
            }
        }
    }

    public render(): void {
        const container = this._container = document.createElement('div');
        container.id = this._id;
        container.innerHTML = this._template.render(this._templateData ? this._templateData : {});

        const attachTap = this._platform === Platform.IOS;

        this._bindings.forEach((binding: IViewBinding) => {
            if(binding.selector) {
                const elements: NodeList = container.querySelectorAll(binding.selector);
                // tslint:disable:prefer-for-of
                for(let i = 0; i < elements.length; ++i) {
                    const element = elements[i];
                    View.addEventListener(binding, <HTMLElement>element, attachTap);
                }
                // tslint:enable:prefer-for-of
            } else {
                View.addEventListener(binding, container, attachTap);
            }
        });
    }

    public container(): HTMLElement {
        return this._container;
    }

    public show(): void {
        if(this._container) {
            this._container.style.visibility = 'visible';
        }
    }

    public hide(): void {
        if(this._container) {
            this._container.style.visibility = 'hidden';
        }
    }
}
