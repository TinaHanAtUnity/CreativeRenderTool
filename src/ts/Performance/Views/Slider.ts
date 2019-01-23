import { parse } from 'path';

export interface ISliderOptions {
    current: number;
    duration: number;
    minPercentToSlide: number | null;
    autoplay: boolean;
    direction: 'left' | 'right' | 'restore';
    interval: number;
}

    /* tslint:disable:no-function-expression prefer-const no-var-keyword no-parameter-reassignment*/
var nextTick = function(fn: any) {
        setTimeout(fn, 0);
};
 var capitalizeFirstLetter = function(text: any) {
    return text.charAt(0).toUpperCase() + text.slice(1);
};

var createEvent = function(type: any, bubbles: any, cancelable: any) {
    var e;

    e = document.createEvent('Event');
    e.initEvent(type, bubbles, cancelable);

    return e;
};
/* tslint:enable:no-function-expression prefer-const no-var-keyword no-parameter-reassignment */

export class Slider {
    private _rootEl: HTMLElement;

    // Evetyhing scrollable should be inside this container
    private _sliderScrollableContainer: HTMLElement;

    // Slides shown to user including head, tail and duplicated slides
    private _slidesContainer: HTMLElement;
    private _items: Node[];
    private _count: number;
    private _realCount: number;
    private _width: number;
    private _compareDistance: number;
    private _timeId: number | null;
    private _resizeTimeId: number | null;
    private _current: number;
    private _indicatorWrap: HTMLElement;
    private _indicators: HTMLElement[];

    private options: ISliderOptions;

    private _ready: Promise<void>;

    constructor(urls: string[], size: { width: number; height: number } = {width: 0, height: 0}, options: ISliderOptions = {
        current: 0,
        duration: 0.8,
        minPercentToSlide: null,
        autoplay: true,
        direction: 'left',
        interval:5
    }) {
        const {width, height} = size;

        this.options = options;

        this._current = options.current;

        this._rootEl = this.createElement('div', 'slider-root-container', ['z-slide-wrap']);

        this._slidesContainer = this.createElement('div', 'slider-slides-container', ['z-slide-content']);

        this._rootEl.appendChild(this._slidesContainer);

        const allSlidesCreatedPromise = urls.map((url, index) => {
            return this.createSlide(url, 'slide-' + index).then((slide) => {
                this._slidesContainer.appendChild(slide);
            });
        });

        this._ready = Promise.all(allSlidesCreatedPromise).then(() => {
            const items = this._slidesContainer.querySelectorAll('.slider-item');
            this._items  = Array.prototype.slice.call(items);

            this._count = this._items.length;
            if(this._count === 1) {
                return;
            }

            this._width = this._slidesContainer.clientWidth;
            this._compareDistance = 0;
            this._timeId = null;
            if(options.minPercentToSlide) {
                this._compareDistance = this._width * options.minPercentToSlide;
            }

            Slider.prepareSlideItem(this, this._slidesContainer, this._items, this._count, options.current, width);
            Slider.prepareIndicator(this, 'z-slide-indicator', 'z-slide-dot', this._count, this._current, 'active');
            Slider.bindEvents(this, Slider.startHandler, Slider.moveHandler, Slider.endHandler);

            // auto play
            //if(options.autoplay) {
            ///    this.interval = Math.max(2000, options.interval * 1000);
            //    this.autoplay();
            //}
        });
    }

    private static setTransformStyle(el: Node, value: any) {
        (<HTMLElement>el).style.transform = value;
        (<HTMLElement>el).style.setProperty('-webkit-transform', value);
    }

    private static setTransitionStyle(el: Node, value: any) {
        (<HTMLElement>el).style.transition = value;
        (<HTMLElement>el).style.setProperty('-webkit-transition', value);
    }

    // swipestart handler
    private static startHandler(ev: Event, slider: Slider) {
        if(slider.options.autoplay && slider._timeId !== null) {
            clearTimeout(slider._timeId);
        }
    }

    // swipemove handler
    private static moveHandler(ev: Event, slider: Slider, diffX: number) {
        const list = slider._items;
        const cur = list[0];
        const pre = list[list.length - 1];
        const next = list[1];
        Slider.setTransition(pre, cur, next, '', '', '');
        Slider.move(pre, cur, next, diffX, slider._width);
    }

    // swipeend handler
    private static endHandler(ev: Event, slider: Slider, diffX: number) {
        let direction: 'left' | 'right' | 'restore';
        if(Math.abs(diffX) < slider._compareDistance) {
            direction = 'restore';
        } else {
            direction = diffX < 0 ? 'left' : 'right';
        }
        slider.slide(direction, diffX);
        //if(slider.options.autoplay) {
        //    slider.autoplay();
        //}
    }

    private createSlide(url: string, id: string): Promise<HTMLElement> {
        return new Promise((resolve) => {
            if (url) {
                const image = new Image();
                image.onload = () => {
                    resolve(this.generateSlideHTML(id, image));
                };

                image.src = url;
            } else {
                resolve(this.generateSlideHTML(id));
            }
        });
    }

    private generateSlideHTML = (id: string, image?: HTMLImageElement) => {
        const src = image && image.src;
        const style = {};

        if (src) {
            Object.assign(style, {
                'background-image': `url(${src})`
            });
        }

        const item = this.createElement('div', id, ['slider-item', 'z-slide-item']);
        const span = this.createElement('span', id+'img', ['slider-item-image'], style);

        item.appendChild(span);

        return item;
    }

    public attachTo(container: HTMLElement) {
        container.appendChild(this._rootEl);
    }

    public resize(...args: any[]) {
        Slider.resizeHandler(this);
    }

    private createElement(name: string, id: string, className: string[] = [], style: { [key: string]: any } = {}): HTMLElement {
        const el = document.createElement(name);
        el.id = id;
        el.classList.add(...className);

        this.setStyles(el, style);

        return el;
    }

    private setStyles(el: HTMLElement, style: { [key: string]: any } = {}) {
        Object.keys(style).forEach((key) => {
            el.style.setProperty(key, String(style[key]));
        });
    }

    /* tslint:disable:no-function-expression prefer-const no-var-keyword no-parameter-reassignment */
    private static prepareSlideItem(slider: Slider, container: HTMLElement, list: Node[], count: number, index: number, width: number) {
        const realCount: number = count;
        let lastIndex: number;
        let item;
        let clone: Node;
        let i;

        if(count === 2) { // clone and insert to dom
            clone = list[0].cloneNode(true);
            container.appendChild(clone);
            list.push(clone);

            clone = list[1].cloneNode(true);
            container.appendChild(clone);
            list.push(clone);

            count = 4;
        }

        lastIndex = count - 1;

        if(index > lastIndex || index < 0) {
            index = 0;
        }
        if(index !== 0) {
            list = list.splice(index, count - index).concat(list);
        }

        let anyNode = <any>list[0];
        anyNode.uuid = 0;

        anyNode = <any>list[lastIndex];
        anyNode.uuid = lastIndex;

        Slider.setTransformStyle(list[0], 'translate3d(0, 0, 0)');
        Slider.setTransformStyle(list[lastIndex], 'translate3d(-' + width + 'px, 0, 0)');

        for (i = 1; i < lastIndex; i++) {
            item = list[i];
            anyNode = <any>list[0];
            anyNode.uuid = i;
            Slider.setTransformStyle(item, 'translate3d(' + width + 'px, 0, 0)');
        }

        slider._slidesContainer = container;
        slider._items = list;
        slider._realCount = realCount;
        slider._count = count;
        slider._current = index;
    }

    private static bindEvents(slider: Slider, startHandler: any, moveHandler: any, endHandler: any) {
        var container = slider._slidesContainer;
        var startX: number;
        var startY: number;
        var endX: number;
        var endY: number;
        var diffX: number;
        var diffY: number;
        var touch: boolean;
        var action: any;
        var scroll: boolean;
        var sort: boolean;
        var swipe: boolean;
        var sortTimer: number;

        function getCoord(e: any, c: String) {
            return /touch/.test(e.type) ? e.changedTouches[0]['page' + c] : e['page' + c];
        }

        function testTouch(e: Event) {
            if (e.type === 'touchstart') {
                touch = true;
            } else if (touch) {
                touch = false;
                return false;
            }
            return true;
        }

        function onStart(ev: Event) {
            if(action || !testTouch(ev)) {
                return;
            }
            action = true;
            startX = getCoord(ev, 'X');
            startY = getCoord(ev, 'Y');
            diffX = 0;
            diffY = 0;
            sortTimer = window.setTimeout(function() {
                sort = true;
            }, 200);
            startHandler(ev, slider);

            // swipestart
            if (ev.target !== null) {
                ev.target.dispatchEvent(createEvent('swipestart', true, true));
            }

            if (ev.type === 'mousedown') {
                ev.preventDefault();
                document.addEventListener('mousemove', onMove, false);
                document.addEventListener('mouseup', onEnd, false);
            }
        }

        function onMove(ev: Event) {
            var customEvent;
            if(!action) {
                return;
            }
            endX = getCoord(ev, 'X');
            endY = getCoord(ev, 'Y');
            diffX = endX - startX;
            diffY = endY - startY;

            if (!sort && !swipe && !scroll) {
                if (Math.abs(diffY) > 10) { // It's a scroll
                    scroll = true;
                    // Android 4.0(maybe more?) will not fire touchend event
                    customEvent = createEvent('touchend', true, true);
                    if (ev.target !== null) {
                        ev.target.dispatchEvent(customEvent);
                    }
                } else if (Math.abs(diffX) > 7) { // It's a swipe
                    swipe = true;
                }
            }
            if (swipe) {
                ev.preventDefault(); // Kill page scroll
                moveHandler(ev, slider, diffX); // Handle swipe
                customEvent = createEvent('swipe', true, true);
                (<any>customEvent).movement = {
                    diffX: diffX,
                    diffY: diffY
                };
                container.dispatchEvent(customEvent);
            }
            if(sort) {
                ev.preventDefault();
                customEvent = createEvent('sort', true, true);
                container.dispatchEvent(customEvent);
            }

            if (Math.abs(diffX) > 5 || Math.abs(diffY) > 5) {
                clearTimeout(sortTimer);
            }
        }

        function onEnd(ev: Event) {
            var customEvent;
            if(!action) {
                return;
            }
            action = false;
            if (swipe) {
                // Handle swipe end
                endHandler(ev, slider, diffX);

                // trigger 'swipeend'
                customEvent = createEvent('swipeend', true, true);
                (<any>customEvent).customData = {
                    diffX: diffX,
                    diffY: diffY
                };
                container.dispatchEvent(customEvent);
            } else if (sort) {
                // trigger 'sortend'
                customEvent = createEvent('sortend', true, true);
                container.dispatchEvent(customEvent);
            } else if (!scroll && Math.abs(diffX) < 5 && Math.abs(diffY) < 5) { // Tap
                if (ev.type === 'touchend') { // Prevent phantom clicks
                    // ev.preventDefault();
                    // let elements like `a` do default behavior
                }
                // trigger 'tap'
                customEvent = createEvent('tap', true, true);
                container.dispatchEvent(customEvent);
            }
            swipe = false;
            sort = false;
            scroll = false;

            clearTimeout(sortTimer);

            if (ev.type === 'mouseup') {
                document.removeEventListener('mousemove', onMove);
                document.removeEventListener('mouseup', onEnd);
            }
        }

        container.addEventListener('mousedown', onStart, false);
        container.addEventListener('touchstart', onStart, false);
        container.addEventListener('touchmove', onMove, false);
        container.addEventListener('touchend', onEnd, false);
        container.addEventListener('touchcancel', onEnd, false);
    }

    private static resizeHandler(slider: Slider) {
        if(slider.options.autoplay && slider._timeId !== null) {
            clearTimeout(slider._timeId);
            slider._timeId = null;
        }
        if(slider._resizeTimeId) {
            clearTimeout(slider._resizeTimeId);
        }
        slider._resizeTimeId = window.setTimeout(function() {
            slider._width = slider._slidesContainer.clientWidth;
            if(slider.options.minPercentToSlide) {
                slider._compareDistance = slider._width * slider.options.minPercentToSlide;
            }
            Slider.resetStyle(slider);
            //if(slider.options.autoplay) {
            //    slider.autoplay();
            //}
        }, 200);
    }

    private static resetStyle(slider: Slider) {
        var lastIndex = slider._count - 1;
        var width = slider._width;
        var list = slider._items;
        var i;
        var indicatorWrap = slider._indicatorWrap;

        Slider.setTransformStyle(list[lastIndex], 'translate3d(-' + width + 'px, 0, 0)');
        for (i = 1; i < lastIndex; i++) {
            Slider.setTransformStyle(list[i], 'translate3d(' + width + 'px, 0, 0)');
        }
        indicatorWrap.style.left = (slider._width - parseFloat(getComputedStyle(indicatorWrap)!.width!.replace('px', ''))) / 2 + 'px';
    }

    private static setTransition(pre: Node, cur: Node, next: Node, preTransition: String, curTransition: String, nextTransition: String) {
        if(typeof preTransition === 'undefined') {
            preTransition = '';
        }
        if(typeof curTransition === 'undefined') {
            curTransition = preTransition;
        }
        if(typeof nextTransition === 'undefined') {
            nextTransition = curTransition;
        }
        Slider.setTransitionStyle(pre, preTransition);
        Slider.setTransitionStyle(cur, curTransition);
        Slider.setTransitionStyle(next, nextTransition);
    }

    private static move(pre: Node, cur: Node, next: Node, distance: number, width: number) {
        Slider.setTransformStyle(cur, 'translate3d(' + distance + 'px, 0, 0)');
        Slider.setTransformStyle(pre, 'translate3d(' + (distance - width) + 'px, 0, 0)');
        Slider.setTransformStyle(next, 'translate3d(' + (distance + width) + 'px, 0, 0)');
    }

    public slide(direction: 'left' | 'right' | 'restore', diffX: number) {
        const list = this._items;
        const current = this._current;
        const count = this._count;
        const width = this._width;
        let duration = this.options.duration;
        let transitionText: String;
        let cur: Node;
        let pre: Node;
        let next: Node;
        let customEvent: Event;

        direction = direction || this.options.direction;
        diffX = diffX || 0;

        if(direction === 'left') {
            const element = list.shift();
            if (element === undefined) {
                throw new Error('list cannot be empty');
            }
            list.push(element);
            this._current = (current + 1) % count;
            duration *= 1 - Math.abs(diffX) / width;
        } else if(direction === 'right') {
            const element = list.pop();
            if (element === undefined) {
                throw new Error('list cannot be empty');
            }
            list.unshift(element);
            this._current = (current - 1 + count) % count;
            duration *= 1 - Math.abs(diffX) / width;
        } else {
            duration *= Math.abs(diffX) / width;
        }
        cur = list[0];
        pre = list[count - 1];
        next = list[1];

        transitionText = 'transform ' + duration + 's linear';
        if(direction === 'left' || (direction === 'restore' && diffX > 0)) {
            Slider.setTransition(pre, cur, next, transitionText, transitionText, '');
        } else if(direction === 'right' || (direction === 'restore' && diffX < 0)) {
            Slider.setTransition(pre, cur, next, '', transitionText, transitionText);
        }
        Slider.move(pre, cur, next, 0, width);

        if(this._realCount === 2) {
            this._current = this._current % 2;
            Slider.updateIndicator(this._indicators, current % 2 , this._current);
        } else {
            Slider.updateIndicator(this._indicators, current, this._current);
        }

        customEvent = createEvent('slideend', true, true);
        (<any>customEvent).slider = this;
        (<any>customEvent).currentItem = cur;
        this._slidesContainer.dispatchEvent(customEvent);
    }

    private static prepareIndicator(slider: Slider, wrapClassName: String, className: String, howMany: number, activeIndex: number, activeClass: String) {
        const item = document.createElement('span');
        const indicatorWrap = document.createElement('div');
        var indicators = [];
        var i;

        indicatorWrap.className = 'z-slide-indicator';

        item.className = 'z-slide-dot';
        for(i = 1; i < howMany; i++) {
            indicators.push(indicatorWrap.appendChild(<HTMLElement>item.cloneNode(false)));
        }
        indicators.push(indicatorWrap.appendChild(item));
        indicators[activeIndex].className = 'z-slide-dot ' + activeClass;

        slider._indicatorWrap = indicatorWrap;
        slider._indicators = indicators;
        slider._rootEl.appendChild(indicatorWrap);

        nextTick(function() {
            indicatorWrap.style.left = (slider._width - parseFloat(getComputedStyle(indicatorWrap)!.width!.replace('px', ''))) / 2 + 'px';
        });
    }

    // update indicator style
    private static updateIndicator(indicators: HTMLElement[], pre: number, cur: number) {
        indicators[pre].className = 'z-slide-dot';
        indicators[cur].className = 'z-slide-dot active';
    }

    /* tslint:enable:no-function-expression prefer-const no-var-keyword no-parameter-reassignment */
}
