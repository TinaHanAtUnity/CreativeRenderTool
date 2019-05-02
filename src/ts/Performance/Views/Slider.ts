import { promises } from 'fs';

export interface ISliderOptions {
    duration: number;
    easing: string;
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
type OnDownloadCallback = (event: Event) => void;

const animationFrame = window.requestAnimationFrame || window.webkitRequestAnimationFrame;

export class Slider {
    private config: ISliderOptions;
    private slidesContainerVisibleWidth: number;
    private imageUrls: string[];
    private currentSlide: number;
    private transformPropertyName: 'transform' | 'webkitTransform';
    private transitionPropertyName: 'transition' | 'webkitTransition';
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
    private _onDownloadCallback: OnDownloadCallback;

    constructor(urls: string[], imageOrientation: 'portrait' | 'landscape', onSlideCallback: OnSlideCallback, onDownloadCallback: OnDownloadCallback) {
        this._onSlideCallback = onSlideCallback;
        this._onDownloadCallback = onDownloadCallback;

        this.config = {
            duration: 200,
            easing: 'ease',
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
        imageOrientation === 'portrait' ? this.slidesPerPage = 1.666 : this.slidesPerPage = 1.3;
        this._rootEl = this.createElement('div', 'slider-root-container', ['slider-wrap', `${imageOrientation}-slider-images`]);
        this._slidesContainer = this.createElement('div', 'slider-slides-container', ['slider-content']);

        // TODO: Make sure we always have 3 images
        // Note: Bit stupid way to make sure the first image is the middle one etc. when the carousel is shown to the user
        this.imageUrls = [urls[1], urls[2], urls[0]];
        this.currentSlide = this.config.startIndex % this.imageUrls.length;
        this.transformPropertyName = typeof document.documentElement.style.transform === 'string' ? 'transform' : 'webkitTransform';
        this.transitionPropertyName = typeof document.documentElement.style.transform === 'string' ? 'transition' : 'webkitTransition';

        const cloneSlidesAmount = 3;
        const allSlidesCreatedPromise = [];
        const blurredBackground = this.createElement('div', 'slider-blurred-background', ['slider-blurred-background'], {
            'background-image': `url(${urls[0]})`
        });
        this._rootEl.appendChild(blurredBackground);

        for (let i = this.imageUrls.length - cloneSlidesAmount; i < this.imageUrls.length; i++) {
            allSlidesCreatedPromise.push(this.createSlide(this.imageUrls[i]).catch(() => null));
        }
        this.imageUrls.forEach((url, i) => {
            allSlidesCreatedPromise.push(this.createSlide(url).catch(() => null));
        });

        this._ready = Promise.all(allSlidesCreatedPromise).then((slides) => {
            this._slidesContainer.innerHTML = '';
            slides.forEach((slide) => {
                if (slide) {
                    this._slidesContainer.appendChild(slide);
                }
            });

            this._rootEl.appendChild(this._slidesContainer);
            this.slidesContainerVisibleWidth = this._slidesContainer.offsetWidth;
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

        const offset = -Math.abs(currentSlide * (this.slidesContainerVisibleWidth / this.slidesPerPage));
        if (options.enableTransition) {
            // explanation for this one - https://youtu.be/cCOL7MC4Pl0
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    this.transformSlidesContainer(offset);
                });
            });
        } else {
            this.transformSlidesContainer(offset, 0);
        }
        Slider.updateIndicator(this._indicators, Math.floor(currentSlide));
    }

    private transformSlidesContainer(offset: number, duration: number = this.config.duration): void {
        this._slidesContainer.style[this.transitionPropertyName] = `all ${duration}ms ${this.config.easing}`;
        this._slidesContainer.style[this.transformPropertyName] = `translate3d(${offset}px, 0, 0)`;
    }

    private resizeContainer(): void {
        this.slidesContainerVisibleWidth = this._rootEl.offsetWidth;
        const widthItem = this.slidesContainerVisibleWidth / this.slidesPerPage;
        const itemsToBuild = this.imageUrls.length + (this.slidesPerPage * 2);
        this._slidesContainer.style.width = `${(widthItem) * itemsToBuild}px`;
        this.slideToCurrent({ enableTransition: false, triggeredByResize: true });
    }

    private resizeHandler(): void {
        if (this._resizeTimeId) {
            clearTimeout(this._resizeTimeId);
        }

        if (typeof animationFrame === 'function') {
            animationFrame(() => this.resizeContainer());
        } else {
            // resize debounce
            this._resizeTimeId = window.setTimeout(() => this.resizeContainer(), 100);
        }
    }

    private createSlide(url: string): Promise<HTMLElement> {
        return new Promise((resolve) => {
            const image = new Image();
            image.onload = () => {
                resolve(this.generateSlideHTML('id', image));
            };
            image.src = url;
            image.addEventListener('click', (this._onDownloadCallback));
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
            const currentSlide = this.currentSlide + this.slidesPerPage;
            const currentOffset = currentSlide * (this.slidesContainerVisibleWidth / this.slidesPerPage);
            const dragOffset = (this.drag.endX - this.drag.startX);
            const offset = currentOffset - dragOffset;
            this.transformSlidesContainer(offset * -1, 0);
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
        const howManySliderToSlide = Math.ceil(movementDistance / (this.slidesContainerVisibleWidth / this.slidesPerPage));

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
            const loopedSlideIndex = this.currentSlide + (Math.sign(slideAmount) * -1 * this.imageUrls.length);
            const loopedSlideIndexOffset = this.slidesPerPage;
            const moveTo = loopedSlideIndex + loopedSlideIndexOffset;
            const offset = moveTo * -1 * (this.slidesContainerVisibleWidth / this.slidesPerPage);
            const dragDistance = this.drag.endX - this.drag.startX;
            this.transformSlidesContainer(offset + dragDistance, 0);
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
