import { parse } from 'path';

export interface ISliderOptions {
    current: number;
    duration: number;
    minPercentToSlide: number | null;
    autoplay: boolean;
    direction: 'left' | 'right' | 'restore';
    interval: number;
}

export class Slider {
    private _rootEl: HTMLElement;

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
    private _interval: number;

    private options: ISliderOptions;

    private _ready: Promise<void> | null;

    constructor(urls: string[], options: ISliderOptions = {
        current: 0,
        duration: 0.8,
        minPercentToSlide: null,
        autoplay: true,
        direction: 'left',
        interval:50000
    }) {
        this.options = options;

        this._current = options.current;

        this._rootEl = this.createElement('div', 'slider-root-container', ['slider-wrap']);

        const blurredBackground = this.createElement('div', 'slider-blurred-background', ['slider-blurred-background'], {
            'background-image': `url(${urls[0]})`
        });
        this._rootEl.appendChild(blurredBackground);

        this._slidesContainer = this.createElement('div', 'slider-slides-container', ['slider-content']);
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

            Slider.prepareSlideItem(this, this._slidesContainer, this._items, this._count, options.current, this._width);
            Slider.prepareIndicator(this, 'slider-indicator', 'slider-dot', this._count, this._current, 'active');
            Slider.bindEvents(this, Slider.startHandler, Slider.moveHandler, Slider.endHandler);

            this._ready = null;
        });
    }

    public attachTo(container: HTMLElement) {
        container.appendChild(this._rootEl);
    }

    public show() {
        if(this.options.autoplay) {
            this._interval = Math.max(2000, this.options.interval * 1000);
            this.autoplay();
        }
    }

    public resize(...args: any[]) {
        if (this._ready === null) {
            Slider.resizeHandler(this);
        } else {
            this._ready.then(() => Slider.resizeHandler(this));
        }
    }

    public autoplay() {
        if (this._timeId !== null) {
            window.clearTimeout(this._timeId);
        }

        const interval = this._interval;
        this._timeId = window.setTimeout(() => {
            this.slide(this.options.direction, 0);
            this.autoplay();
        }, interval);
    }

    private static setTransformStyle(el: Node, value: any) {
        (<HTMLElement>el).style.transform = value;
        (<HTMLElement>el).style.setProperty('-webkit-transform', value);
    }

    private static setTransitionStyle(el: Node, value: any) {
        (<HTMLElement>el).style.transition = value;
        (<HTMLElement>el).style.setProperty('-webkit-transition', value);
    }

    private static startHandler(ev: Event, slider: Slider) {
        if(slider.options.autoplay && slider._timeId !== null) {
            clearTimeout(slider._timeId);
            slider._timeId = 0;
        }
    }

    private static moveHandler(ev: Event, slider: Slider, diffX: number) {
        const list = slider._items;
        const cur = list[0];
        const pre = list[list.length - 1];
        const next = list[1];
        Slider.setTransition(pre, cur, next, '', '', '');
        Slider.move(pre, cur, next, diffX, slider._width);
    }

    private static endHandler(ev: Event, slider: Slider, diffX: number) {
        let direction: 'left' | 'right' | 'restore';
        if(Math.abs(diffX) < slider._compareDistance) {
            direction = 'restore';
        } else {
            direction = diffX < 0 ? 'left' : 'right';
        }
        slider.slide(direction, diffX);
        if(slider.options.autoplay) {
            slider.autoplay();
        }
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
        const item = this.createElement('div', id, ['slider-item', 'slider-item']);

        if (image !== undefined) {
            item.appendChild(image);
        }

        return item;
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

    private static prepareSlideItem(slider: Slider, container: HTMLElement, list: Node[], count: number, index: number, width: number) {
        const realCount: number = count;
        let lastIndex: number;
        let item;
        let clone: Node;
        let i;
        let _count = count;
        let _index = index;
        const _width = width;
        let _list = list;

        if(_count === 2) {
            clone = _list[0].cloneNode(true);
            container.appendChild(clone);
            _list.push(clone);

            clone = _list[1].cloneNode(true);
            container.appendChild(clone);
            _list.push(clone);

            _count = 4;
        }

        lastIndex = _count - 1;

        if(_index > lastIndex || _index < 0) {
            _index = 0;
        }
        if(_index !== 0) {
            _list = _list.splice(_index, _count - _index).concat(_list);
        }

        let anyNode = <any>_list[0];
        anyNode.uuid = 0;

        anyNode = <any>_list[lastIndex];
        anyNode.uuid = lastIndex;

        Slider.setTransformStyle(_list[0], 'translate3d(0, 0, 0)');
        Slider.setTransformStyle(_list[lastIndex], 'translate3d(-' + _width + 'px, 0, 0)');

        for (i = 1; i < lastIndex; i++) {
            item = _list[i];
            anyNode = <any>_list[0];
            anyNode.uuid = i;
            Slider.setTransformStyle(item, 'translate3d(' + _width + 'px, 0, 0)');
        }

        slider._slidesContainer = container;
        slider._items = _list;
        slider._realCount = realCount;
        slider._count = _count;
        slider._current = _index;
    }

    private static bindEvents(slider: Slider, startHandler: any, moveHandler: any, endHandler: any) {
        const container = slider._slidesContainer;
        let startX: number;
        let startY: number;
        let endX: number;
        let endY: number;
        let diffX: number;
        let diffY: number;
        let touch: boolean;
        let action: any;
        let  scroll: boolean;
        let sort: boolean;
        let swipe: boolean;
        let sortTimer: number;

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
            sortTimer = window.setTimeout(() => {
                sort = true;
            }, 200);
            startHandler(ev, slider);

            if (ev.type === 'mousedown') {
                ev.preventDefault();
                document.addEventListener('mousemove', onMove, false);
                document.addEventListener('mouseup', onEnd, false);
            }
        }

        function onMove(ev: Event) {
            if(!action) {
                return;
            }
            endX = getCoord(ev, 'X');
            endY = getCoord(ev, 'Y');
            diffX = endX - startX;
            diffY = endY - startY;

            if (!sort && !swipe && !scroll) {
                if (Math.abs(diffY) > 10) {
                    scroll = true;
                    // Android 4.0(maybe more?) will not fire touchend event
                    const customEvent = document.createEvent('Event');
                    if (ev.target !== null) {
                        ev.target.dispatchEvent(customEvent);
                    }
                } else if (Math.abs(diffX) > 7) {
                    swipe = true;
                }
            }
            if (swipe) {
                ev.preventDefault();
                moveHandler(ev, slider, diffX);
            }
            if(sort) {
                ev.preventDefault();
            }

            if (Math.abs(diffX) > 5 || Math.abs(diffY) > 5) {
                clearTimeout(sortTimer);
            }
        }

        function onEnd(ev: Event) {
            if(!action) {
                return;
            }
            action = false;
            if (swipe) {
                endHandler(ev, slider, diffX);
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
        slider._resizeTimeId = window.setTimeout(() => {
            slider._width = slider._slidesContainer.clientWidth;
            if(slider.options.minPercentToSlide) {
                slider._compareDistance = slider._width * slider.options.minPercentToSlide;
            }
            Slider.resetStyle(slider);
            if(slider.options.autoplay) {
                slider.autoplay();
            }
        }, 200);
    }

    private static resetStyle(slider: Slider) {
        const lastIndex = slider._count - 1;
        const width = slider._width;
        const list = slider._items;
        let i;
        const indicatorWrap = slider._indicatorWrap;

        Slider.setTransformStyle(list[lastIndex], 'translate3d(-' + width + 'px, 0, 0)');
        for (i = 1; i < lastIndex; i++) {
            Slider.setTransformStyle(list[i], 'translate3d(' + width + 'px, 0, 0)');
        }
        indicatorWrap.style.left = (slider._width - parseFloat(getComputedStyle(indicatorWrap).width!.replace('px', ''))) / 2 + 'px';
    }

    private static setTransition(pre: Node, cur: Node, next: Node, preTransition: String, curTransition: String, nextTransition: String) {
        let _preTransition = preTransition;
        let _curTransition = curTransition;
        let _nextTransition = nextTransition;

        if(typeof _preTransition === 'undefined') {
            _preTransition = '';
        }
        if(typeof _curTransition === 'undefined') {
            _curTransition = preTransition;
        }
        if(typeof _nextTransition === 'undefined') {
            _nextTransition = _curTransition;
        }
        Slider.setTransitionStyle(pre, _preTransition);
        Slider.setTransitionStyle(cur, _curTransition);
        Slider.setTransitionStyle(next, _nextTransition);
    }

    private static move(pre: Node, cur: Node, next: Node, distance: number, width: number) {
        Slider.setTransformStyle(cur, 'translate3d(' + distance + 'px, 0, 0)');
        Slider.setTransformStyle(pre, 'translate3d(' + (distance - width) + 'px, 0, 0)');
        Slider.setTransformStyle(next, 'translate3d(' + (distance + width) + 'px, 0, 0)');
    }

    public slide(direction: 'left' | 'right' | 'restore', diffX: number) {
        let _direction = direction;
        let _diffX = diffX;
        const list = this._items;
        const current = this._current;
        const count = this._count;
        const width = this._width;
        let duration = this.options.duration;
        let transitionText: String;
        let cur: Node;
        let pre: Node;
        let next: Node;

        _direction = _direction || this.options.direction;
        _diffX = _diffX || 0;

        if(_direction === 'left') {
            const element = list.shift();
            if (element === undefined) {
                throw new Error('list cannot be empty');
            }
            list.push(element);
            this._current = (current + 1) % count;
            duration *= 1 - Math.abs(_diffX) / width;
        } else if(_direction === 'right') {
            const element = list.pop();
            if (element === undefined) {
                throw new Error('list cannot be empty');
            }
            list.unshift(element);
            this._current = (current - 1 + count) % count;
            duration *= 1 - Math.abs(_diffX) / width;
        } else {
            duration *= Math.abs(_diffX) / width;
        }
        cur = list[0];
        pre = list[count - 1];
        next = list[1];

        transitionText = 'transform ' + duration + 's linear';
        if(_direction === 'left' || (_direction === 'restore' && _diffX > 0)) {
            Slider.setTransition(pre, cur, next, transitionText, transitionText, '');
        } else if(_direction === 'right' || (_direction === 'restore' && _diffX < 0)) {
            Slider.setTransition(pre, cur, next, '', transitionText, transitionText);
        }
        Slider.move(pre, cur, next, 0, width);

        if(this._realCount === 2) {
            this._current = this._current % 2;
            Slider.updateIndicator(this._indicators, current % 2 , this._current);
        } else {
            Slider.updateIndicator(this._indicators, current, this._current);
        }
    }

    private static prepareIndicator(slider: Slider, wrapClassName: String, className: String, howMany: number, activeIndex: number, activeClass: String) {
        const item = document.createElement('span');
        const indicatorWrap = document.createElement('div');
        const indicators = [];
        let i;

        indicatorWrap.className = 'slider-indicator';

        item.className = 'slider-dot';
        for(i = 1; i < howMany; i++) {
            indicators.push(indicatorWrap.appendChild(<HTMLElement>item.cloneNode(false)));
        }
        indicators.push(indicatorWrap.appendChild(item));
        indicators[activeIndex].className = 'slider-dot ' + activeClass;

        slider._indicatorWrap = indicatorWrap;
        slider._indicators = indicators;
        slider._rootEl.appendChild(indicatorWrap);

        setTimeout(() => {
            indicatorWrap.style.left = (slider._width - parseFloat(getComputedStyle(indicatorWrap).width!.replace('px', ''))) / 2 + 'px';
        }, 0);
    }

    private static updateIndicator(indicators: HTMLElement[], pre: number, cur: number) {
        indicators[pre].className = 'slider-dot';
        indicators[cur].className = 'slider-dot active';
    }

}
