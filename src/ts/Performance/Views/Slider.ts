import { SliderEndScreenImageOrientation } from 'Performance/Models/SliderPerformanceCampaign';
import { stringify } from 'querystring';

export interface ISliderOptions {
    startIndex: number;
    threshold: number;
}

export interface ITransformationConfig {
    duration: number;
    easing: string;
}

export interface IDragOptions {
    fingerCount: number | boolean;
    startY: number;
    startX: number;
    curX: number;
    curY: number;
    swipeLength: number;
}

type OnSlideCallback = (options: { automatic: boolean }) => void;
type OnDownloadCallback = (event: Event) => void;
type VoidCallback = () => void;

const animationFrame = window.requestAnimationFrame || window.webkitRequestAnimationFrame;

export class Slider {
    private _onSlideCallback: OnSlideCallback;
    private _imageUrls: string[];
    private _slidesContainer: HTMLElement;
    private _slideCount: number;
    private _rootElement: HTMLElement;
    private _ready: Promise<void> | null;
    private _autoplayTimeoutId: number | null;
    private _onDownloadCallback: OnDownloadCallback;
    private _slides: (HTMLElement | null)[];
    private _currentSlideIndex: number;
    private _transformPropertyName: 'transform' | 'webkitTransform';
    private _transitionPropertyName: 'transition' | 'webkitTransition';
    private _isPaused: boolean;
    private _autoPlayTimer: NodeJS.Timeout;
    private _isInterrupted: boolean;
    private _isAnimating: boolean;
    private _slideSpeed: number;
    private _drag: IDragOptions;
    private _isDragging: boolean;
    private _minimalSwipeLength: number;
    private _indicatorWrap: HTMLElement;
    private _indicators: HTMLElement[];
    private _resizeTimeId: number | null;
    private _swipableIndexes: number[];

    constructor(slideImageUrls: string[], imageOrientation: SliderEndScreenImageOrientation, onSlideCallback: OnSlideCallback, onDownloadCallback: OnDownloadCallback) {
        this._onSlideCallback = onSlideCallback;
        this._onDownloadCallback = onDownloadCallback;
        this._currentSlideIndex = 0;
        const imageOrientationClassNamePrefix = imageOrientation === SliderEndScreenImageOrientation.LANDSCAPE ? 'landscape' : 'portrait';
        this._rootElement = this.createElement('div', 'slider-root-container', [`${imageOrientationClassNamePrefix}-slider-images`]);
        this._slidesContainer = this.createElement('div', 'slider-slides-container', ['slider-content']);
        this._drag = this.clearDrag();
        this._transformPropertyName = typeof document.documentElement.style.transform === 'string' ? 'transform' : 'webkitTransform';
        this._transitionPropertyName = typeof document.documentElement.style.transform === 'string' ? 'transition' : 'webkitTransition';
        this._isInterrupted = false;
        this._slideSpeed = 300;
        this._minimalSwipeLength = 60;
        this._swipableIndexes = [];
        this._imageUrls = slideImageUrls;

        const allSlidesCreatedPromise: Promise<HTMLElement | null>[] = [];
        const blurredBackground = this.createElement('div', 'slider-blurred-background', ['slider-blurred-background'], {
            'background-image': `url(${this._imageUrls[0]})`
        });
        this._rootElement.appendChild(blurredBackground);
        this._imageUrls.forEach((url, i) => {
            allSlidesCreatedPromise.push(this.createSlide(url).catch(() => null));
        });

        this._ready = Promise.all(allSlidesCreatedPromise).then((slides) => {
            this._slidesContainer.innerHTML = '';
            if (slides !== null && slides.length) {
                this._slides = slides;
            }

            slides.forEach((slide, index) => {
                if (slide) {
                    slide.setAttribute('slide-index', index.toString());
                    this._slidesContainer.appendChild(slide);
                }
            });

            this._slideCount = this._slides.length;
            this._rootElement.appendChild(this._slidesContainer);
            this.init();
            this._ready = null;
        });
    }

    private init(): void {
        this._isPaused = true;
        this.prepareCloneSlides();
        this._swipableIndexes = this.getSwipableIndexes();
        this.setPosition();
        this.prepareIndicators('slider-indicator', 'slider-dot', this._imageUrls.length, 0, 'active');
        this.updateIndicators();
        this.initializeTouchEvents();
    }

    private prepareIndicators(wrapClassName: string, className: string, howMany: number, activeIndex: number, activeClass: string) {
        const item = document.createElement('span');
        const indicatorWrap = document.createElement('div');
        const indicatorContainer = document.createElement('div');
        indicatorContainer.classList.add('indicator-container');
        const indicators = [];

        indicatorWrap.className = wrapClassName;

        item.className = className;
        for (let i = 1; i < howMany; i++) {
            indicators.push(indicatorWrap.appendChild(<HTMLElement>item.cloneNode(false)));
        }
        indicators.push(indicatorWrap.appendChild(item));
        indicators[activeIndex].className = 'slider-dot ' + activeClass;

        this._indicatorWrap = indicatorWrap;
        this._indicators = indicators;
        indicatorContainer.appendChild(indicatorWrap);
        this._rootElement.appendChild(indicatorContainer);
    }

    private updateIndicators(): void {
        for (const indicator of this._indicators) {
            indicator.classList.remove('active');
        }
        this._indicators[this._currentSlideIndex].classList.add('active');
    }

    private initializeTouchEvents() {
        // Resize event
        window.addEventListener('resize', (this.resizeHandler).bind(this));
        // Touch events
        this._rootElement.addEventListener('touchstart', (this.touchHandler).bind(this));
        this._rootElement.addEventListener('touchmove', (this.touchHandler).bind(this));
        this._rootElement.addEventListener('touchend', (this.touchHandler).bind(this));
    }

    private resizeHandler(): void {
        if (this._resizeTimeId) {
            clearTimeout(this._resizeTimeId);
        }

        if (typeof animationFrame === 'function') {
            animationFrame(() => this.setPosition());
        } else {
            // resize debounce
            this._resizeTimeId = window.setTimeout(() => this.setPosition(), 100);
        }
    }

    private touchHandler(event: TouchEvent) {
        this._drag.fingerCount = event && event.touches !== undefined ?
            event.touches.length : 1;

        switch (event.type) {
            case 'touchstart':
                this.touchstartHandler(event);
                break;
            case 'touchmove':
                this.touchmoveHandler(event);
                break;
            case 'touchend':
                this.touchendHandler();
                break;
            default:
        }
    }

    private clearDrag(): IDragOptions {
        return {
            fingerCount: 0,
            startY: 0,
            startX: 0,
            curX: 0,
            curY: 0,
            swipeLength: 0
        };
    }

    private touchendHandler() {
        this._isDragging = false;
        this._isInterrupted = false;

        if (this._drag.swipeLength <= 0) {
            return;
        }

        if (this._drag.swipeLength >= this._minimalSwipeLength) {
            let targetSlideIndex: number;
            const direction = this.swipeDirection();
            if (direction === 'left') {
                targetSlideIndex = this.calculateSwipableSlideIndex(this._currentSlideIndex + this.getSlideCount());
            } else {
                targetSlideIndex = this.calculateSwipableSlideIndex(this._currentSlideIndex - this.getSlideCount());
            }

            this.slideHandler(targetSlideIndex);
            this._drag = this.clearDrag();
        } else if (this._drag.startX !== this._drag.curX) {
            this.slideHandler(this._currentSlideIndex);
            this._drag = this.clearDrag();
        }
        this.updateIndicators();
    }

    private getSlideCount() {
        let swipedSlide;

        const centerOffset = Math.floor(this.getWidth(this._rootElement) / 2);
        const sliderOffsetLeftWithDrag = this.getCurrentSliderOffsetLeftWithDrag();
        const swipeTargetPos = (sliderOffsetLeftWithDrag * -1) + centerOffset;
        const slides = Array.from(this._slidesContainer.children);

        for (const slide of slides) {
            const el = <HTMLElement>slide;
            const rightBoundary = el.offsetWidth + el.offsetLeft;

            if (swipeTargetPos < rightBoundary) {
                swipedSlide = slide;
                break;
            }
        }

        let index = 0;
        if (swipedSlide && swipedSlide.hasAttribute('slide-index')) {
            index = parseInt(swipedSlide.getAttribute('slide-index')!, 10);
        }

        return Math.abs(index - this._currentSlideIndex) || 1;
    }

    private calculateSwipableSlideIndex(targetIndex: number): number {
        const lastSwipableIndex = this._swipableIndexes[this._swipableIndexes.length - 1];
        if (targetIndex >= lastSwipableIndex) {
            return lastSwipableIndex;
        }

        if (targetIndex <= this._swipableIndexes[0]) {
            return this._swipableIndexes[0];
        }

        return targetIndex;
    }

    private getSwipableIndexes(): number[] {
        const indexes = [];

        // Using for-of for NodeList will not work on some devices like on iOS 10.3
        // tslint:disable-next-line:prefer-for-of
        for (let i = 0; i < this._slidesContainer.children.length; i++) {
            const slide = this._slidesContainer.children[i];
            if (slide && slide.hasAttribute('slide-index')) {
                indexes.push(parseInt(slide.getAttribute('slide-index')!, 10));
            }
        }

        return indexes;
    }

    private touchstartHandler(event: TouchEvent) {
        let touches: Touch | undefined;
        this._isInterrupted = true;

        if (this._drag.fingerCount !== 1) {
            this._drag = this.clearDrag();
            return;
        }

        if (event !== undefined && event.touches !== undefined) {
            touches = event.touches[0];
        }

        this._drag.startX = this._drag.curX = touches !== undefined ? touches.pageX : 0;
        this._drag.startY = this._drag.curY = touches !== undefined ? touches.pageY : 0;
        this._isDragging = true;
    }

    private touchmoveHandler(event: TouchEvent) {
        const touches: TouchList | null = event !== undefined ? event.touches : null;

        if (!this._isDragging || touches && touches.length !== 1) {
            return;
        }

        this._drag.curX = touches && touches[0] !== undefined ? touches[0].pageX : 0;
        this._drag.curY = touches && touches[0] !== undefined ? touches[0].pageY : 0;
        this._drag.swipeLength = Math.round(Math.sqrt(Math.pow(this._drag.curX - this._drag.startX, 2)));

        if (event !== undefined && this._drag.swipeLength > 4) {
            event.preventDefault();
        }

        if (this._isAnimating === true) {
            return;
        }

        const sliderOffsetLeftWithDrag = this.getCurrentSliderOffsetLeftWithDrag();
        this.setTransition(sliderOffsetLeftWithDrag);
    }

    private getCurrentSliderOffsetLeftWithDrag() {
        const currentSliderOffsetLeft = this.getTransitionPosition(this._currentSlideIndex);

        if (this._drag.swipeLength <= 0) {
            return currentSliderOffsetLeft;
        }

        const positionOffset = this._drag.curX > this._drag.startX ? 1 : -1;
        return currentSliderOffsetLeft + this._drag.swipeLength * positionOffset;
    }

    private swipeDirection(): 'left' | 'right' {
        let xDistance: number;
        xDistance = this._drag.startX - this._drag.curX;
        if (xDistance > 0) {
            return 'left';
        } else {
            return 'right';
        }
    }

    private autoplay() {
        this.autoPlayClear();
        this._autoPlayTimer = setInterval((this.autoPlayIterator).bind(this), 2000);
    }

    private autoPlayClear() {
        if (this._autoPlayTimer) {
            clearInterval(this._autoPlayTimer);
        }
    }

    private autoPlayIterator() {
        const slideTo: number = this._currentSlideIndex + 1;
        if (!this._isPaused && !this._isInterrupted) {
            this.slideHandler(slideTo, true);
        }
    }

    private slideHandler(targetSlideIndex: number, automatic: boolean = false) {
        if (this._isAnimating === true) {
            return;
        }

        const targetTransitionPosition = this.getTransitionPosition(targetSlideIndex);

        clearInterval(this._autoPlayTimer);

        this._isAnimating = true;

        if (targetSlideIndex < 0) {
            this._currentSlideIndex = this._slideCount + targetSlideIndex;
        } else if (targetSlideIndex >= this._slideCount) {
            this._currentSlideIndex = targetSlideIndex - this._slideCount;
        } else {
            this._currentSlideIndex = targetSlideIndex;
        }

        this.animateSlide(targetTransitionPosition, () => {
            // slide calback
            this._onSlideCallback({ automatic });
            this.postSlide();
        });
        this.updateIndicators();
    }

    private postSlide() {
        this._isAnimating = false;
        this.setPosition();
        this.autoplay();
    }

    private animateSlide(targetTransitionPosition: number, callback: VoidCallback) {
        this.applyTransition();
        targetTransitionPosition = Math.ceil(targetTransitionPosition);
        this._slidesContainer.style[this._transformPropertyName] = `translate3d( ${targetTransitionPosition}px, 0px, 0px)`;
        if (callback) {
            setTimeout(() => {
                this.disableTransition();
                callback();
            }, this._slideSpeed);
        }
    }

    private disableTransition() {
        this._slidesContainer.style[this._transitionPropertyName] = '';
    }

    private applyTransition() {
        this._slidesContainer.style[this._transitionPropertyName] = `all ${this._slideSpeed}ms ease`;
    }

    private setPosition(): void {
        this._slidesContainer.style.width = `${this._slideCount * 3000}px`;
        this.setTransition(this.getTransitionPosition(this._currentSlideIndex));
    }

    private getTransitionPosition(slideIndex: number): number {
        const targetSlide = <HTMLElement> this._slidesContainer.children[slideIndex + 2];
        let targetTransitionPosition = targetSlide ? targetSlide.offsetLeft * -1 : 0;
        targetTransitionPosition += (this.getWidth(this._rootElement) - targetSlide.offsetWidth) / 2;

        return targetTransitionPosition;
    }

    private getWidth(node: HTMLElement): number {
        const computedStyle: CSSStyleDeclaration = getComputedStyle(node);
        let width: number = node.clientWidth;
        width -= parseFloat(<string>computedStyle.paddingLeft) + parseFloat(<string>computedStyle.paddingRight);
        return width;
    }

    private setTransition(position: number): void {
        const x: number = Math.ceil(position);
        this._slidesContainer.style[this._transformPropertyName] = `translate3d( ${x}px, 0px, 0px)`;
    }

    private prepareCloneSlides(): void {
        let slideIndex: number | null = null;
        const infiniteCount: number = 2;

        for (let i = this._slideCount; i > (this._slideCount - infiniteCount); i -= 1) {
            slideIndex = i - 1;
            let clone = this._slides[slideIndex];
            if (clone) {
                clone = <HTMLElement>clone.cloneNode(true);
                clone.setAttribute('slide-index', (slideIndex - this._slideCount).toString());
                clone.classList.add('slide-clone');
                this._slidesContainer.insertBefore(clone, this._slidesContainer.firstChild);
            }
        }
        for (let i = 0; i < infiniteCount + this._slideCount; i += 1) {
            slideIndex = i;
            let clone = this._slides[slideIndex];
            if (clone) {
                clone = <HTMLElement>clone.cloneNode(true);
                clone.setAttribute('slide-index', (slideIndex + this._slideCount).toString());
                clone.classList.add('slide-clone');
                this._slidesContainer.appendChild(clone);
            }
        }
    }

    public show(): boolean {
        // If this._ready has already resolved and set to null, slider was ready
        if (this._ready === null) {
            this._isPaused = false;
            this.setPosition();
            this.autoplay();
            return true;
        }
        return false;
    }

    public hide(): void {
        if (this._autoplayTimeoutId) {
            clearTimeout(this._autoplayTimeoutId);
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
        const item: HTMLElement = this.createElement('div', null, ['slider-item', 'slider-item']);
        if (image !== undefined) {
            item.appendChild(image);
            this._slidesContainer.appendChild(item);
        }
        return item;
    }

    public attachTo(container: HTMLElement): void {
        container.appendChild(this._rootElement);
    }

    private createElement(name: string, id: string | null, className: string[] = [], style: { [key: string]: string } = {}): HTMLElement {
        const el: HTMLElement = document.createElement(name);
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
}
