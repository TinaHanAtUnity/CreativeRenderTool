import { Platform } from 'Core/Constants/Platform';
import { Tap } from 'Core/Utilities/Tap';
import { Template } from 'Core/Utilities/Template';
import { IViewBinding } from 'Core/Views/IViewBinding';
import { HorizontalSwipe } from 'Core/Utilities/HorizontalSwipe';
import { DownSwipe } from 'Core/Utilities/DownSwipe';

export type TemplateDataType = string | number | boolean | null | undefined | string[];

export interface ITemplateData {
    [key: string]: TemplateDataType;
}

export abstract class View<T extends object> {

    private static addEventListener(binding: IViewBinding, element: HTMLElement, attachTap: boolean) {
        if (binding.event === 'swipe') {
            binding.swipe = new HorizontalSwipe(element);
        }

        if (binding.event === 'swipedown') {
            binding.swipe = new DownSwipe(element);
        }

        if (attachTap && binding.event === 'click') {
            binding.tap = new Tap(element);
        }
        element.addEventListener(binding.event, binding.listener, false);
    }

    protected _platform: Platform;
    protected _template: Template;
    protected _templateData: { [key: string]: TemplateDataType | ITemplateData } = {};
    protected _bindings: IViewBinding[] = [];
    protected _container: HTMLElement;
    protected _handlers: T[] = [];

    protected _id: string;

    private _attachTap: boolean = false;

    constructor(platform: Platform, id: string, attachTap?: boolean) {
        this._platform = platform;
        this._id = id;

        if (attachTap !== undefined) {
            this._attachTap = attachTap;
        } else {
            this._attachTap = this._platform === Platform.IOS;
        }
    }

    public addEventHandler(handler: T): T {
        this._handlers.push(handler);
        return handler;
    }

    public removeEventHandler(handler: T): void {
        if (this._handlers.length) {
            if (typeof handler !== 'undefined') {
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

        this._bindings.forEach((binding: IViewBinding) => {
            if (binding.selector) {
                const elements: NodeList = container.querySelectorAll(binding.selector);
                // tslint:disable:prefer-for-of
                for (let i = 0; i < elements.length; ++i) {
                    const element = elements[i];
                    View.addEventListener(binding, <HTMLElement>element, this._attachTap);
                }
                // tslint:enable:prefer-for-of
            } else {
                View.addEventListener(binding, container, this._attachTap);
            }
        });
    }

    public container(): HTMLElement {
        return this._container;
    }

    public show(): void {
        if (this._container) {
            this._container.style.visibility = 'visible';
        }
    }

    public hide(): void {
        if (this._container) {
            this._container.style.visibility = 'hidden';
        }
    }
}
