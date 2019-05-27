import { SliderEndScreenImageOrientation } from 'Performance/Models/SliderPerformanceCampaign';

export interface ISliderOptions {
    startIndex: number;
    threshold: number;
}

export interface ITransformationConfig {
    duration: number;
    easing: string;
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

const TRANSFORMATION_CONFIG: ITransformationConfig = {
    duration: 300,
    easing: 'ease'
};

const AUTOMATIC_TRANSFORMATION_CONFIG: ITransformationConfig = {
    duration: 600,
    easing: 'ease-in-out'
};

const INSTANT_TRANSFORMATION_CONFIG: ITransformationConfig = {
    duration: 0,
    easing: 'ease'
};

export class Slider {
    private _config: ISliderOptions;
    private _slidesContainerVisibleWidth: number;
    private _imageUrls: string[];
    private _currentSlide: number;
    private _transformPropertyName: 'transform' | 'webkitTransform';
    private _transitionPropertyName: 'transition' | 'webkitTransition';
    private _slidesContainer: HTMLElement;
    private _rootEl: HTMLElement;
    private _pointerDown: boolean;
    private _drag: IDragOptions;
    private _slidesPerPage: number;
    private _ready: Promise<void> | null;
    private _resizeTimeId: number | null;
    private _autoplayTimeoutId: number | null;
    private _indicatorWrap: HTMLElement;
    private _indicators: HTMLElement[];
    private _isVisible: boolean;
    private _onSlideCallback: OnSlideCallback;
    private _onDownloadCallback: OnDownloadCallback;

    constructor(urls: string[], imageOrientation: SliderEndScreenImageOrientation, onSlideCallback: OnSlideCallback, onDownloadCallback: OnDownloadCallback, portraitImage?: string, landscapeImage?: string, squareImage?: string) {
        this._onSlideCallback = onSlideCallback;
        this._onDownloadCallback = onDownloadCallback;

        this._config = {
            startIndex: 0,
            threshold: 70
        };
        this._drag = {
            startX: 0,
            endX: 0,
            startY: 0,
            letItGo: null,
            preventClick: false
        };

        this._isVisible = true;
        this._slidesPerPage = imageOrientation === SliderEndScreenImageOrientation.LANDSCAPE ? 1.3 : 1.666;
        const imageOrientationClassNamePrefix = imageOrientation === SliderEndScreenImageOrientation.LANDSCAPE ? 'landscape' : 'portrait';
        this._rootEl = this.createElement('div', 'slider-root-container', ['slider-wrap', `${imageOrientationClassNamePrefix}-slider-images`]);
        this._slidesContainer = this.createElement('div', 'slider-slides-container', ['slider-content']);

        // TODO: Make sure we always have 3 images
        // Note: Bit stupid way to make sure the first image is the middle one etc. when the carousel is shown to the user
        this._imageUrls = [];
        if (imageOrientation === SliderEndScreenImageOrientation.PORTRAIT && portraitImage) {
          this._imageUrls.push(urls[0], portraitImage, urls[2]);
          console.error('Portrait');
        } else if (imageOrientation === SliderEndScreenImageOrientation.LANDSCAPE && landscapeImage) {
          this._imageUrls.push(urls[0], landscapeImage, urls[2]);
          console.error('Landscape');
        } else {
          this._imageUrls.push(urls[1], urls[2], urls[0]);
          console.error('old');
        }
        this._currentSlide = this._config.startIndex % this._imageUrls.length;
        this._transformPropertyName = typeof document.documentElement.style.transform === 'string' ? 'transform' : 'webkitTransform';
        this._transitionPropertyName = typeof document.documentElement.style.transform === 'string' ? 'transition' : 'webkitTransition';

        const cloneSlidesAmount = 3;
        const allSlidesCreatedPromise = [];
        const blurredBackground = this.createElement('div', 'slider-blurred-background', ['slider-blurred-background'], {
            'background-image': `url(${urls[0]})`
        });
        this._rootEl.appendChild(blurredBackground);

        for (let i = this._imageUrls.length - cloneSlidesAmount; i < this._imageUrls.length; i++) {
            allSlidesCreatedPromise.push(this.createSlide(this._imageUrls[i]).catch(() => null));
        }
        this._imageUrls.forEach((url, i) => {
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
            this._slidesContainerVisibleWidth = this._slidesContainer.offsetWidth;
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
        const currentSlide = this._currentSlide + this._slidesPerPage;

        const offset = -Math.abs(currentSlide * (this._slidesContainerVisibleWidth / this._slidesPerPage));
        const config = options.automatic ? AUTOMATIC_TRANSFORMATION_CONFIG : TRANSFORMATION_CONFIG;
        if (options.enableTransition) {
            // explanation for this one - https://youtu.be/cCOL7MC4Pl0
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    this.transformSlidesContainer(offset, config);
                });
            });
        } else {
            this.transformSlidesContainer(offset, INSTANT_TRANSFORMATION_CONFIG);
        }
        Slider.updateIndicator(this._indicators, Math.floor(currentSlide));
    }

    private transformSlidesContainer(offset: number, config: ITransformationConfig = AUTOMATIC_TRANSFORMATION_CONFIG): void {
        this._slidesContainer.style[this._transitionPropertyName] = `all ${config.duration}ms ${config.easing}`;
        this._slidesContainer.style[this._transformPropertyName] = `translate3d(${offset}px, 0, 0)`;
    }

    private resizeContainer(): void {
        this._slidesContainerVisibleWidth = this._rootEl.offsetWidth;
        const widthItem = this._slidesContainerVisibleWidth / this._slidesPerPage;
        const itemsToBuild = this._imageUrls.length + (this._slidesPerPage * 2);
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
        item.style.width = `${100 / (this._imageUrls.length + (this._slidesPerPage * 2))}%`;
        if (image !== undefined) {
            item.appendChild(image);
            this._slidesContainer.appendChild(item);
        }
        return item;
    }

    private init(): void {
        this.addEventHandlers();
        Slider.prepareIndicator(this, 'slider-indicator', 'slider-dot', this._imageUrls.length, 0, 'active');
        this._rootEl.style.overflow = 'hidden';
    }

    private autoplay(): void {
        if (!this._isVisible) {
            return;
        }

        if (this._autoplayTimeoutId !== null) {
            window.clearTimeout(this._autoplayTimeoutId);
        }

        const interval = 2500;
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
        this._pointerDown = false;
        this._drag = {
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
        this._pointerDown = true;
        this._drag.startX = e.touches[0].pageX;
        this._drag.startY = e.touches[0].pageY;
    }

    private touchendHandler(e: TouchEvent): void {
        e.stopPropagation();
        this._pointerDown = false;
        if (this._drag.endX) {
            this.updateAfterDrag();
        }
        this.clearDrag();
        this.autoplay();
    }

    private touchmoveHandler(e: TouchEvent): void {
        e.stopPropagation();

        if (this._drag.letItGo === null) {
            this._drag.letItGo = Math.abs(this._drag.startY - e.touches[0].pageY) < Math.abs(this._drag.startX - e.touches[0].pageX);
        }

        if (this._pointerDown && this._drag.letItGo) {
            e.preventDefault();
            this._drag.endX = e.touches[0].pageX;
            const currentSlide = this._currentSlide + this._slidesPerPage;
            const currentOffset = currentSlide * (this._slidesContainerVisibleWidth / this._slidesPerPage);
            const dragOffset = (this._drag.endX - this._drag.startX);
            const offset = currentOffset - dragOffset;
            this.transformSlidesContainer(offset * -1, INSTANT_TRANSFORMATION_CONFIG);
        }

    }
    private clearDrag(): void {
        this._drag = {
            startX: 0,
            endX: 0,
            startY: 0,
            letItGo: null,
            preventClick: this._drag.preventClick
        };
    }

    private updateAfterDrag(): void {
        const movement = this._drag.endX - this._drag.startX;
        const movementDistance = Math.abs(movement);
        const howManySliderToSlide = Math.ceil(movementDistance / (this._slidesContainerVisibleWidth / this._slidesPerPage));

        const slideToNegativeClone = movement > 0 && this._currentSlide - howManySliderToSlide < 0;
        const slideToPositiveClone = movement < 0 && this._currentSlide + howManySliderToSlide > this._imageUrls.length - this._slidesPerPage;

        if (movement > 0 && movementDistance > this._config.threshold && this._imageUrls.length > this._slidesPerPage) {
            this.slideBackward(howManySliderToSlide);
        } else if (movement < 0 && movementDistance > this._config.threshold && this._imageUrls.length > this._slidesPerPage) {
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
        if (this._imageUrls.length <= this._slidesPerPage) {
            return;
        }

        const startingSlide = this._currentSlide;
        let shouldLoop = false;

        if (slideAmount > 0) {
            shouldLoop = (this._currentSlide + slideAmount) - 1 > this._imageUrls.length - this._slidesPerPage;
        } else {
            shouldLoop = this._currentSlide + slideAmount < 0;
        }

        if (shouldLoop) {
            const loopedSlideIndex = this._currentSlide + (Math.sign(slideAmount) * -1 * this._imageUrls.length);
            const loopedSlideIndexOffset = this._slidesPerPage;
            const moveTo = loopedSlideIndex + loopedSlideIndexOffset;
            const offset = moveTo * -1 * (this._slidesContainerVisibleWidth / this._slidesPerPage);
            const dragDistance = this._drag.endX - this._drag.startX;
            this.transformSlidesContainer(offset + dragDistance, INSTANT_TRANSFORMATION_CONFIG);
            this._currentSlide = loopedSlideIndex + slideAmount;
        } else {
            this._currentSlide = this._currentSlide + slideAmount;
        }

        if (startingSlide !== this._currentSlide) {
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
