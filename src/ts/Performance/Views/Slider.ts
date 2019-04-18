import { promises } from 'fs';

export interface ISliderOptions {
    duration: number;
    easing: string;
    slidesPerPage: number;
    startIndex: number;
    threshold: number;
}

export interface IDragOptions {
    startX: number;
    endX: number;
    startY: number;
    letItGo: boolean | null;
    preventClick: boolean;
}

type OnSlideCallback = (options: { automatic: boolean }) => void;

export class Slider {
    private config: ISliderOptions;
    private slidesContainerWidth: number;
    private imageUrls: string[];
    private currentSlide: number;
    private transformProperty: string | number;
    private _slidesContainer: HTMLElement;
    private _rootEl: HTMLElement;
    private pointerDown: boolean;
    private drag: IDragOptions;
    private slidesPerPage: number;
    private _ready: Promise<void> | null;
    private _resizeTimeId: number | null;
    private _autoplayTimeoutId: number | null;
    private _indicatorWrap: HTMLElement;
    private _indicators: HTMLElement[];
    private _isVisible: boolean;
    private _onSlideCallback: OnSlideCallback;

    constructor(urls: string[], imageOrientation: 'portrait' | 'landscape', onSlideCallback: OnSlideCallback) {
        this._onSlideCallback = onSlideCallback;

        this.config = {
            duration: 200,
            easing: 'ease',
            slidesPerPage: 1.2,
            startIndex: 0,
            threshold: 70
        };
        this.drag = {
            startX: 0,
            endX: 0,
            startY: 0,
            letItGo: null,
            preventClick: false
        };

        this._isVisible = true;
        imageOrientation === 'portrait' ? this.config.slidesPerPage = 1.666 : this.config.slidesPerPage = 1.2;
        this._rootEl = this.createElement('div', 'slider-root-container', ['slider-wrap', `${imageOrientation}-slider-images`]);
        this._slidesContainer = this.createElement('div', 'slider-slides-container', ['slider-content']);
        this.slidesPerPage = this.config.slidesPerPage;

        // TODO: Make sure we always have 3 images
        // Note: Bit stupid way to make sure the first image is the middle one etc. when the carousel is shown to the user
        this.imageUrls = [urls[1], urls[2], urls[0]];
        this.currentSlide = this.config.startIndex % this.imageUrls.length;
        this.transformProperty = Slider.webkitOrNot();

        const cloneSlidesAmount = 3;
        const allSlidesCreatedPromise = [];
        const blurredBackground = this.createElement('div', 'slider-blurred-background', ['slider-blurred-background'], {
            'background-image': `url(${urls[0]})`
        });

        this._rootEl.appendChild(blurredBackground);

        for (let i = this.imageUrls.length - cloneSlidesAmount; i < this.imageUrls.length; i++) {
            allSlidesCreatedPromise.push(this.createSlide(this.imageUrls[i]));
        }
        this.imageUrls.forEach((url, i) => {
            allSlidesCreatedPromise.push(this.createSlide(url));
        });

        this._ready = Promise.all(allSlidesCreatedPromise).then((slides) => {
            this._slidesContainer.innerHTML = '';
            slides.forEach((slide) => {
                this._slidesContainer.append(slide);
            });
            this._rootEl.appendChild(this._slidesContainer);
            this.slidesContainerWidth = this._slidesContainer.offsetWidth;
            this.init();
            this.resizeContainer();
            this._ready = null;

            if (this._isVisible) {
                this.autoplay();
            }
        });
    }

    public show(): boolean {
        this._isVisible = true;

        // If this._ready has already resolved and set to null, slider was ready
        if (this._ready === null) {
            this.autoplay();
            return true;
        }

        return false;
    }

    public hide(): void {
        this._isVisible = false;

        if (this._autoplayTimeoutId) {
            clearTimeout(this._autoplayTimeoutId);
        }
    }

    private slideToCurrent(slideOptions?: { enableTransition?: boolean; automatic?: boolean; triggeredByResize?: boolean }): void {
        const defaultOptions = { enableTransition: true, automatic: false, triggeredByResize: false };
        const options = slideOptions !== undefined ? { ...defaultOptions, ...slideOptions } : defaultOptions;
        if (!options.triggeredByResize) {
            this._onSlideCallback({ automatic: options.automatic });
        }

        this.autoplay();
        const currentSlide = this.currentSlide + this.slidesPerPage;

        const offset = -Math.abs(currentSlide * (this.slidesContainerWidth / this.slidesPerPage));
        if (options.enableTransition) {
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

        Slider.updateIndicator(this._indicators, Math.floor(currentSlide));
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
        this.slidesContainerWidth = this._rootEl.offsetWidth;
        const widthItem = this.slidesContainerWidth / this.slidesPerPage;
        const itemsToBuild = this.imageUrls.length + (this.slidesPerPage * 2);
        this._slidesContainer.style.width = `${(widthItem) * itemsToBuild}px`;
        this.disableTransition();
        this.slideToCurrent({ triggeredByResize: true });
    }

    private resizeHandler(): void {
        if (this._ready === null) {
            this.slideToCurrent({ triggeredByResize: true });
        } else {
            this._ready.then(() => {
                this.slideToCurrent({ triggeredByResize: true });
            });
        }
        if (this._resizeTimeId) {
            clearTimeout(this._resizeTimeId);
        }

        // resize debounce
        this.disableTransition();
        this._resizeTimeId = window.setTimeout(() => this.resizeContainer(), 100);
    }

    private createSlide(url: string): Promise<HTMLElement> {
        return new Promise((resolve) => {
            const image = new Image();
            image.onload = () => {
                resolve(this.generateSlideHTML('id', image));
            };
            image.src = url;
        });
    }

    private generateSlideHTML(id: string, image?: HTMLImageElement): HTMLElement {
        const item = this.createElement('div', null, ['slider-item', 'slider-item']);
        item.style.width = `${100 / (this.imageUrls.length + (this.slidesPerPage * 2))}%`;
        if (image !== undefined) {
            item.appendChild(image);
            this._slidesContainer.appendChild(item);
        }
        return item;
    }

    private init(): void {
        this.addEventHandlers();
        Slider.prepareIndicator(this, 'slider-indicator', 'slider-dot', this.imageUrls.length, 0, 'active');
        this._rootEl.style.overflow = 'hidden';
    }

    private autoplay(): void {
        if (!this._isVisible) {
            return;
        }

        if (this._autoplayTimeoutId !== null) {
            window.clearTimeout(this._autoplayTimeoutId);
        }

        const interval = 3000;
        this._autoplayTimeoutId = window.setTimeout(() => {
            this.slideForward(1, { automatic: true });
            this.autoplay();
        }, interval);
    }

    private stopAutoplay(): void {
        if (this._autoplayTimeoutId !== null) {
            window.clearTimeout(this._autoplayTimeoutId);
        }
    }

    private addEventHandlers(): void {
        // Keep track pointer hold and dragging distance
        this.pointerDown = false;
        this.drag = {
            startX: 0,
            endX: 0,
            startY: 0,
            letItGo: null,
            preventClick: false
        };

        // Resize event
        window.addEventListener('resize', (this.resizeHandler).bind(this));
        // Touch events
        this._slidesContainer.addEventListener('touchstart', (this.touchstartHandler).bind(this));
        this._slidesContainer.addEventListener('touchend', (this.touchendHandler).bind(this));
        this._slidesContainer.addEventListener('touchmove', (this.touchmoveHandler).bind(this));
    }

    public attachTo(container: HTMLElement): void {
        container.appendChild(this._rootEl);
    }

    private createElement(name: string, id: string | null, className: string[] = [], style: { [key: string]: string } = {}): HTMLElement {
        const el = document.createElement(name);
        if (id) {
            el.id = id;
        }
        el.classList.add(...className);

        this.setStyles(el, style);

        return el;
    }

    private setStyles(el: HTMLElement, style: { [key: string]: string } = {}): void {
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

            const currentSlide = this.currentSlide + this.slidesPerPage;
            const currentOffset = currentSlide * (this.slidesContainerWidth / this.slidesPerPage);
            const dragOffset = (this.drag.endX - this.drag.startX);
            const offset = currentOffset - dragOffset;
            this._slidesContainer.style[<number>this.transformProperty] = `translate3d(${offset * (-1)}px, 0, 0)`;
        }

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
        const movement = this.drag.endX - this.drag.startX;
        const movementDistance = Math.abs(movement);
        const howManySliderToSlide = Math.ceil(movementDistance / (this.slidesContainerWidth / this.slidesPerPage));

        const slideToNegativeClone = movement > 0 && this.currentSlide - howManySliderToSlide < 0;
        const slideToPositiveClone = movement < 0 && this.currentSlide + howManySliderToSlide > this.imageUrls.length - this.slidesPerPage;

        if (movement > 0 && movementDistance > this.config.threshold && this.imageUrls.length > this.slidesPerPage) {
            this.slideBackward(howManySliderToSlide);
        } else if (movement < 0 && movementDistance > this.config.threshold && this.imageUrls.length > this.slidesPerPage) {
            this.slideForward(howManySliderToSlide);
        } else {
            this.slideToCurrent({ enableTransition: slideToNegativeClone || slideToPositiveClone });
        }
    }

    private slideForward(slideAmount: number = 1, options = { automatic: false }): void {
        this.moveSlider(slideAmount, options);
    }

    private slideBackward(slideAmount: number = 1, options = { automatic: false }): void {
        this.moveSlider(slideAmount * -1, options);
    }

    private moveSlider(slideAmount: number, options = { automatic: false }): void {
        // early return when there is nothing to slide
        if (this.imageUrls.length <= this.slidesPerPage) {
            return;
        }

        const startingSlide = this.currentSlide;
        let shouldLoop = false;

        if (slideAmount > 0) {
            shouldLoop = (this.currentSlide + slideAmount) - 1 > this.imageUrls.length - this.slidesPerPage;
        } else {
            shouldLoop = this.currentSlide + slideAmount < 0;
        }

        if (shouldLoop) {
            this.disableTransition();

            const loopedSlideIndex = this.currentSlide + (Math.sign(slideAmount) * -1 * this.imageUrls.length);
            const loopedSlideIndexOffset = this.slidesPerPage;
            const moveTo = loopedSlideIndex + loopedSlideIndexOffset;
            const offset = moveTo * -1 * (this.slidesContainerWidth / this.slidesPerPage);
            const dragDistance = this.drag.endX - this.drag.startX;

            this._slidesContainer.style[<number>this.transformProperty] = `translate3d(${offset + dragDistance}px, 0, 0)`;
            this.currentSlide = loopedSlideIndex + slideAmount;
        } else {
            this.currentSlide = this.currentSlide + slideAmount;
        }

        if (startingSlide !== this.currentSlide) {
            this.slideToCurrent({ automatic: options.automatic });
        }
    }

    private static prepareIndicator(slider: Slider, wrapClassName: string, className: string, howMany: number, activeIndex: number, activeClass: String) {
        const item = document.createElement('span');
        const indicatorWrap = document.createElement('div');
        const indicatorContainer = document.createElement('div');
        indicatorContainer.classList.add('indicator-container');
        const indicators = [];
        let i;

        indicatorWrap.className = wrapClassName;

        item.className = className;
        for (i = 1; i < howMany; i++) {
            indicators.push(indicatorWrap.appendChild(<HTMLElement>item.cloneNode(false)));
        }
        indicators.push(indicatorWrap.appendChild(item));
        indicators[activeIndex].className = 'slider-dot ' + activeClass;

        slider._indicatorWrap = indicatorWrap;
        slider._indicators = indicators;
        indicatorContainer.appendChild(indicatorWrap);
        slider._rootEl.appendChild(indicatorContainer);

        setTimeout(() => {
            indicatorWrap.style.left = 20 + 'px';
        }, 0);
    }

    private static updateIndicator(indicators: HTMLElement[], currentIndex: number) {
        for (const indicator of indicators) {
            indicator.classList.remove('active');
        }
        if (currentIndex > (indicators.length - 1) || currentIndex < 0) {
            currentIndex = 0;
        }

        indicators[currentIndex].classList.add('active');
    }
}
