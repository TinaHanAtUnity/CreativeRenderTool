import { promises } from 'fs';

export interface ISliderOptions {
    duration: number;
    easing: string;
    slidesPerPage: number;
    startIndex: number;
    draggable: boolean;
    multipleDrag: boolean;
    threshold: number;
    loop: boolean;
    rtl: boolean;
}

export interface IDragOptions {
    startX: number;
    endX: number;
    startY: number;
    letItGo: boolean | null;
    preventClick: boolean;
}

export class Slider {
    private config: ISliderOptions;
    private selectorWidth: number;
    private innerElements: string[];
    private currentSlide: number;
    private transformProperty: string | number;
    private _slidesContainer: HTMLElement;
    private _rootEl: HTMLElement;
    private pointerDown: boolean;
    private drag: IDragOptions;
    private slidesPerPage: number;
    private _ready: Promise<void> | null;
    private _resizeTimeId: number | null;
    private _timeId: number | null;
    private _indicatorWrap: HTMLElement;
    private _indicators: HTMLElement[];

    constructor(urls: string[], config: ISliderOptions = {
        duration: 200,
        easing: 'ease-out',
        slidesPerPage: 1.6666,
        startIndex: 0,
        draggable: true,
        multipleDrag: false,
        threshold: 70,
        loop: true,
        rtl: false
    }) {
        this.config = config;
        this.drag = {
            startX: 0,
            endX: 0,
            startY: 0,
            letItGo: null,
            preventClick: false
        };

        this._rootEl = this.createElement('div', 'slider-root-container', ['slider-wrap']);
        this._slidesContainer = this.createElement('div', 'slider-slides-container', ['slider-content']);
        this.slidesPerPage = this.config.slidesPerPage;
        this.innerElements = [].slice.call(urls);
        this.currentSlide = this.config.loop ?
        this.config.startIndex % this.innerElements.length :
        Math.max(0, Math.min(this.config.startIndex, this.innerElements.length - this.slidesPerPage));
        this.transformProperty = Slider.webkitOrNot();

        const cloneSlidesAmount = 3;
        const allSlidesCreatedPromise = [];
        const blurredBackground = this.createElement('div', 'slider-blurred-background', ['slider-blurred-background'], {
            'background-image': `url(${urls[0]})`
        });

        this._rootEl.appendChild(blurredBackground);

        if (this.config.loop) {
            for (let i = this.innerElements.length - cloneSlidesAmount; i < this.innerElements.length; i++) {
                allSlidesCreatedPromise.push(this.createSlide(this.innerElements[i]));
            }
        }
        for (const i of this.innerElements) {
            allSlidesCreatedPromise.push(this.createSlide(i));
        }
        if (this.config.loop) {
            for (let i = 0; i < cloneSlidesAmount; i++) {
                allSlidesCreatedPromise.push(this.createSlide(this.innerElements[i]));
            }
        }

        this._ready = Promise.all(allSlidesCreatedPromise).then((slides) => {
            this._slidesContainer.innerHTML = '';
            slides.forEach((slide) => {
                this._slidesContainer.append(slide);
            });
            this._rootEl.appendChild(this._slidesContainer);
            this.selectorWidth = this._slidesContainer.offsetWidth;
            this.init();
            this.resizeContainer();
            this.slideToCurrent(true);
            this._ready = null;
        });
    }

    private slideToCurrent(enableTransition: boolean): void {
        this.autoplay();
        const currentSlide = this.config.loop ? this.currentSlide + this.slidesPerPage : this.currentSlide;
        console.log(Math.floor(currentSlide));

        const offset = (this.config.rtl ? 1 : -1) * currentSlide * (this.selectorWidth / this.slidesPerPage);
        if (enableTransition) {
            // explanation for this one - https://youtu.be/cCOL7MC4Pl0
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    this.enableTransition();
                    this._slidesContainer.style[<number>this.transformProperty] = `translate3d(${offset}px, 0, 0)`;
                });
            });
        } else {
            this._slidesContainer.style[<number>this.transformProperty] = `translate3d(${offset}px, 0, 0)`;
        }
    }

    private enableTransition(): void {
        this._slidesContainer.style.webkitTransition = `all ${this.config.duration}ms ${this.config.easing}`;
        this._slidesContainer.style.transition = `all ${this.config.duration}ms ${this.config.easing}`;
    }

    private disableTransition(): void {
        this._slidesContainer.style.webkitTransition = `all 0ms ${this.config.easing}`;
        this._slidesContainer.style.transition = `all 0ms ${this.config.easing}`;
    }

    private resizeContainer(): void {
        this.selectorWidth = this._rootEl.offsetWidth;
        const widthItem = this.selectorWidth / this.slidesPerPage;
        const itemsToBuild = this.config.loop ? this.innerElements.length + (this.slidesPerPage * 2) : this.innerElements.length;
        this._slidesContainer.style.width = `${widthItem * itemsToBuild}px`;
        this.slideToCurrent(true);
    }

    private resizeHandler(): void {
        if (this._ready === null) {
            this.slideToCurrent(true);
        } else {
            this._ready.then(() => {
                this.slideToCurrent(true);
            });
        }
        if(this._resizeTimeId) {
            clearTimeout(this._resizeTimeId);
        }

        // resize debounce
        this._resizeTimeId = window.setTimeout(() => this.resizeContainer(), 200);
    }

    private createSlide(url: string): Promise<HTMLElement> {
        return new Promise((resolve) => {
            if (url) {
                const image = new Image();
                image.onload = () => {
                    resolve(this.generateSlideHTML('id', image));

                    // TODO: This can be probable replaced when the metadata.json has data for us
                    if (image.width > image.height) {
                        this._rootEl.classList.add('landscape-slider-images');
                    } else {
                        this._rootEl.classList.add('portrait-slider-images');
                    }
                };
                image.src = url;
            } else {
                resolve(this.generateSlideHTML('íd'));
            }
        });
    }

    private generateSlideHTML(id: string, image?: HTMLImageElement) {
        const item = this.createElement('div', id, ['slider-item', 'slider-item']);
        item.style.cssFloat = this.config.rtl ? 'right' : 'left';
        item.style.width = `${this.config.loop ? 100 / (this.innerElements.length + (this.slidesPerPage * 2)) : 100 / (this.innerElements.length)}%`;
        if (image !== undefined) {
            item.appendChild(image);
            this._slidesContainer.appendChild(item);
        }

        return item;
    }

    private init(): void {
        this.attachEvents();
        Slider.prepareIndicator(this, 'slider-indicator', 'slider-dot', 3, 0, 'active');
        this._rootEl.style.overflow = 'hidden';
        window.addEventListener('resize', (this.resizeHandler).bind(this));
    }

    private autoplay() {
        if (this._timeId !== null) {
            window.clearTimeout(this._timeId);
        }

        const interval = 3000;
        this._timeId = window.setTimeout(() => {
            this.next();
            this.autoplay();
        }, interval);
    }

    private stopAutoplay() {
        if (this._timeId !== null) {
            window.clearTimeout(this._timeId);
        }
    }

    private attachEvents(): void {
        window.addEventListener('resize', (this.resizeHandler).bind(this));
        if (this.config.draggable) {
            // Keep track pointer hold and dragging distance
            this.pointerDown = false;
            this.drag = {
              startX: 0,
              endX: 0,
              startY: 0,
              letItGo: null,
              preventClick: false
            };

            // Touch events
            this._slidesContainer.addEventListener('touchstart', (this.touchstartHandler).bind(this));
            this._slidesContainer.addEventListener('touchend', (this.touchendHandler).bind(this));
            this._slidesContainer.addEventListener('touchmove', (this.touchmoveHandler).bind(this));

            // Mouse events
            this._slidesContainer.addEventListener('mousedown', (this.mousedownHandler).bind(this));
            this._slidesContainer.addEventListener('mouseup', (this.mouseupHandler).bind(this));
            this._slidesContainer.addEventListener('mouseleave', (this.mouseleaveHandler).bind(this));
            this._slidesContainer.addEventListener('mousemove', (this.mousemoveHandler).bind(this));

            // Click
            this._slidesContainer.addEventListener('click', (this.clickHandler).bind(this));
        }
    }

    public attachTo(container: HTMLElement) {
        container.appendChild(this._rootEl);
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

    private static webkitOrNot(): string {
        const style = document.documentElement.style;
        if (typeof style.transform === 'string') {
          return 'transform';
        }
        return 'WebkitTransform';
    }

    private touchstartHandler(e: TouchEvent): void {
        this.stopAutoplay();
        e.stopPropagation();
        this.pointerDown = true;
        this.drag.startX = e.touches[0].pageX;
        this.drag.startY = e.touches[0].pageY;
    }

    private touchendHandler(e: TouchEvent): void {
        e.stopPropagation();
        this.pointerDown = false;
        this.enableTransition();
        if (this.drag.endX) {
          this.updateAfterDrag();
        }
        this.clearDrag();
        this.autoplay();
    }

    private touchmoveHandler(e: TouchEvent): void {
        e.stopPropagation();

        if (this.drag.letItGo === null) {
            this.drag.letItGo = Math.abs(this.drag.startY - e.touches[0].pageY) < Math.abs(this.drag.startX - e.touches[0].pageX);
        }

        if (this.pointerDown && this.drag.letItGo) {
            e.preventDefault();
            this.drag.endX = e.touches[0].pageX;
            this._slidesContainer.style.webkitTransition = `all 0ms ${this.config.easing}`;
            this._slidesContainer.style.transition = `all 0ms ${this.config.easing}`;

            const currentSlide = this.config.loop ? this.currentSlide + this.slidesPerPage : this.currentSlide;
            const currentOffset = currentSlide * (this.selectorWidth / this.slidesPerPage);
            const dragOffset = (this.drag.endX - this.drag.startX);
            const offset = this.config.rtl ? currentOffset + dragOffset : currentOffset - dragOffset;
            this._slidesContainer.style[<number>this.transformProperty] = `translate3d(${(this.config.rtl ? 1 : -1) * offset}px, 0, 0)`;
        }

    }

    private mousedownHandler(e: MouseEvent): void {
        this.stopAutoplay();
        e.preventDefault();
        e.stopPropagation();
        this.pointerDown = true;
        this.drag.startX = e.pageX;
    }

    private mouseupHandler(e: MouseEvent): void {
        e.stopPropagation();
        this.pointerDown = false;
        this.enableTransition();
        if (this.drag.endX) {
          this.updateAfterDrag();
        }
        this.clearDrag();
        this.autoplay();
    }

    private mouseleaveHandler(e: MouseEvent): void {
        if (this.pointerDown) {
            this.pointerDown = false;
            this.drag.endX = e.pageX;
            this.drag.preventClick = false;
            this.enableTransition();
            this.updateAfterDrag();
            this.clearDrag();
        }
    }

    private mousemoveHandler(e: MouseEvent): void {
        e.preventDefault();
        const target = <HTMLElement>e.target;
        if (this.pointerDown) {
            if (target.nodeName === 'A') {
                this.drag.preventClick = true;
            }

            this.drag.endX = e.pageX;
            this._slidesContainer.style.webkitTransition = `all 0ms ${this.config.easing}`;
            this._slidesContainer.style.transition = `all 0ms ${this.config.easing}`;

            const currentSlide = this.config.loop ? this.currentSlide + this.slidesPerPage : this.currentSlide;
            const currentOffset = currentSlide * (this.selectorWidth / this.slidesPerPage);
            const dragOffset = (this.drag.endX - this.drag.startX);
            const offset = this.config.rtl ? currentOffset + dragOffset : currentOffset - dragOffset;
            this._slidesContainer.style[<number>this.transformProperty] = `translate3d(${(this.config.rtl ? 1 : -1) * offset}px, 0, 0)`;
        }
    }

    private clickHandler(e: MouseEvent): void {
        if (this.drag.preventClick) {
            e.preventDefault();
        }
        this.drag.preventClick = false;
    }

    private clearDrag(): void {
        this.drag = {
            startX: 0,
            endX: 0,
            startY: 0,
            letItGo: null,
            preventClick: this.drag.preventClick
        };
    }

    private updateAfterDrag(): void {
        const movement = (this.config.rtl ? -1 : 1) * (this.drag.endX - this.drag.startX);
        const movementDistance = Math.abs(movement);
        const howManySliderToSlide = this.config.multipleDrag ? Math.ceil(movementDistance / (this.selectorWidth / this.slidesPerPage)) : 1;

        const slideToNegativeClone = movement > 0 && this.currentSlide - howManySliderToSlide < 0;
        const slideToPositiveClone = movement < 0 && this.currentSlide + howManySliderToSlide > this.innerElements.length - this.slidesPerPage;

        if (movement > 0 && movementDistance > this.config.threshold && this.innerElements.length > this.slidesPerPage) {
          this.prev(howManySliderToSlide);
        } else if (movement < 0 && movementDistance > this.config.threshold && this.innerElements.length > this.slidesPerPage) {
          this.next(howManySliderToSlide);
        }
        this.slideToCurrent(slideToNegativeClone || slideToPositiveClone);
    }

    private next(howManySlides = 1): void {
        // early return when there is nothing to slide
        if (this.innerElements.length <= this.slidesPerPage) {
            return;
        }

        const beforeChange = this.currentSlide;

        if (this.config.loop) {
            const isNewIndexClone = this.currentSlide + howManySlides > this.innerElements.length - this.slidesPerPage;
            if (isNewIndexClone) {
                this.disableTransition();

                const mirrorSlideIndex = this.currentSlide - this.innerElements.length;
                const mirrorSlideIndexOffset = this.slidesPerPage;
                const moveTo = mirrorSlideIndex + mirrorSlideIndexOffset;
                const offset = (this.config.rtl ? 1 : -1) * moveTo * (this.selectorWidth / this.slidesPerPage);
                const dragDistance = this.config.draggable ? this.drag.endX - this.drag.startX : 0;

                this._slidesContainer.style[<number>this.transformProperty] = `translate3d(${offset + dragDistance}px, 0, 0)`;
                this.currentSlide = mirrorSlideIndex + howManySlides;
            } else {
                this.currentSlide = this.currentSlide + howManySlides;
            }
        } else {
            this.currentSlide = Math.min(this.currentSlide + howManySlides, this.innerElements.length - this.slidesPerPage);
        }
        if (beforeChange !== this.currentSlide) {
            this.slideToCurrent(this.config.loop);
        }
    }

    private prev(howManySlides = 1): void {
        // early return when there is nothing to slide
        if (this.innerElements.length <= this.slidesPerPage) {
            return;
        }

        const beforeChange = this.currentSlide;

        if (this.config.loop) {
            const isNewIndexClone = this.currentSlide - howManySlides < 0;
            if (isNewIndexClone) {
                this.disableTransition();

                const mirrorSlideIndex = this.currentSlide + this.innerElements.length;
                const mirrorSlideIndexOffset = this.slidesPerPage;
                const moveTo = mirrorSlideIndex + mirrorSlideIndexOffset;
                const offset = (this.config.rtl ? 1 : -1) * moveTo * (this.selectorWidth / this.slidesPerPage);
                const dragDistance = this.config.draggable ? this.drag.endX - this.drag.startX : 0;

                this._slidesContainer.style[<number>this.transformProperty] = `translate3d(${offset + dragDistance}px, 0, 0)`;
                this.currentSlide = mirrorSlideIndex - howManySlides;
            } else {
                this.currentSlide = this.currentSlide - howManySlides;
            }
        } else {
            this.currentSlide = Math.max(this.currentSlide - howManySlides, 0);
        }

        if (beforeChange !== this.currentSlide) {
            this.slideToCurrent(this.config.loop);
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
            indicatorWrap.style.left = 20 + 'px';
        }, 0);
    }

    private static updateIndicator(indicators: HTMLElement[], pre: number, cur: number) {
        indicators[pre].className = 'slider-dot';
        indicators[cur].className = 'slider-dot active';
    }

}
