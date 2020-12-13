import { Platform } from 'Core/Constants/Platform';
import { Tap } from 'Core/Utilities/Tap';
import { HorizontalSwipe } from 'Core/Utilities/HorizontalSwipe';
import { DownSwipe } from 'Core/Utilities/DownSwipe';
export class View {
    constructor(platform, id, attachTap) {
        this._templateData = {};
        this._bindings = [];
        this._handlers = [];
        this._attachTap = false;
        this._platform = platform;
        this._id = id;
        if (attachTap !== undefined) {
            this._attachTap = attachTap;
        }
        else {
            this._attachTap = this._platform === Platform.IOS;
        }
    }
    static addEventListener(binding, element, attachTap) {
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
    addEventHandler(handler) {
        this._handlers.push(handler);
        return handler;
    }
    removeEventHandler(handler) {
        if (this._handlers.length) {
            if (typeof handler !== 'undefined') {
                this._handlers = this._handlers.filter(storedHandler => storedHandler !== handler);
            }
            else {
                this._handlers = [];
            }
        }
    }
    render() {
        const container = this._container = document.createElement('div');
        container.id = this._id;
        container.innerHTML = this._template.render(this._templateData ? this._templateData : {});
        this._bindings.forEach((binding) => {
            if (binding.selector) {
                const elements = container.querySelectorAll(binding.selector);
                // tslint:disable:prefer-for-of
                for (let i = 0; i < elements.length; ++i) {
                    const element = elements[i];
                    View.addEventListener(binding, element, this._attachTap);
                }
                // tslint:enable:prefer-for-of
            }
            else {
                View.addEventListener(binding, container, this._attachTap);
            }
        });
    }
    container() {
        return this._container;
    }
    show() {
        if (this._container) {
            this._container.style.visibility = 'visible';
        }
    }
    hide() {
        if (this._container) {
            this._container.style.visibility = 'hidden';
        }
    }
    tap(selector) {
        for (const binding of this._bindings) {
            if (!binding.selector) {
                continue;
            }
            if (binding.selector !== selector) {
                continue;
            }
            return binding.tap;
        }
        return undefined;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVmlldy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NyYy90cy9Db3JlL1ZpZXdzL1ZpZXcudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLFFBQVEsRUFBRSxNQUFNLHlCQUF5QixDQUFDO0FBQ25ELE9BQU8sRUFBRSxHQUFHLEVBQUUsTUFBTSxvQkFBb0IsQ0FBQztBQUd6QyxPQUFPLEVBQUUsZUFBZSxFQUFFLE1BQU0sZ0NBQWdDLENBQUM7QUFDakUsT0FBTyxFQUFFLFNBQVMsRUFBRSxNQUFNLDBCQUEwQixDQUFDO0FBUXJELE1BQU0sT0FBZ0IsSUFBSTtJQTRCdEIsWUFBWSxRQUFrQixFQUFFLEVBQVUsRUFBRSxTQUFtQjtRQVRyRCxrQkFBYSxHQUF3RCxFQUFFLENBQUM7UUFDeEUsY0FBUyxHQUFtQixFQUFFLENBQUM7UUFFL0IsY0FBUyxHQUFRLEVBQUUsQ0FBQztRQUl0QixlQUFVLEdBQVksS0FBSyxDQUFDO1FBR2hDLElBQUksQ0FBQyxTQUFTLEdBQUcsUUFBUSxDQUFDO1FBQzFCLElBQUksQ0FBQyxHQUFHLEdBQUcsRUFBRSxDQUFDO1FBRWQsSUFBSSxTQUFTLEtBQUssU0FBUyxFQUFFO1lBQ3pCLElBQUksQ0FBQyxVQUFVLEdBQUcsU0FBUyxDQUFDO1NBQy9CO2FBQU07WUFDSCxJQUFJLENBQUMsVUFBVSxHQUFHLElBQUksQ0FBQyxTQUFTLEtBQUssUUFBUSxDQUFDLEdBQUcsQ0FBQztTQUNyRDtJQUNMLENBQUM7SUFuQ08sTUFBTSxDQUFDLGdCQUFnQixDQUFDLE9BQXFCLEVBQUUsT0FBb0IsRUFBRSxTQUFrQjtRQUMzRixJQUFJLE9BQU8sQ0FBQyxLQUFLLEtBQUssT0FBTyxFQUFFO1lBQzNCLE9BQU8sQ0FBQyxLQUFLLEdBQUcsSUFBSSxlQUFlLENBQUMsT0FBTyxDQUFDLENBQUM7U0FDaEQ7UUFFRCxJQUFJLE9BQU8sQ0FBQyxLQUFLLEtBQUssV0FBVyxFQUFFO1lBQy9CLE9B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