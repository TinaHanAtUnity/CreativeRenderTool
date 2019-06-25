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
    private _currentSlide: number;
    private _transformPropertyName: 'transform' | 'webkitTransform';
    private _transitionPropertyName: 'transition' | 'webkitTransition';
    private _isPaused: boolean;
    private _autoPlayTimer: NodeJS.Timeout;
    private _isInterrupted: boolean;
    private _isAnimating: boolean;
    private _swipeLeft: number | null;
    private _slideSpeed: number;
    private _drag: IDragOptions;
    private _isDragging: boolean;
    private _minimalSwipeLength: number;
    private _indicatorWrap: HTMLElement;
    private _indicators: HTMLElement[];
    private _resizeTimeId: number | null;
    private _swipableIndexes: number[];

    constructor(urls: string[], imageOrientation: SliderEndScreenImageOrientation, onSlideCallback: OnSlideCallback, onDownloadCallback: OnDownloadCallback, portraitImage?: string, landscapeImage?: string, squareImage?: string) {
        this._onSlideCallback = onSlideCallback;
        this._onDownloadCallback = onDownloadCallback;
        this._currentSlide = 0;
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

        this._imageUrls = [];
        let blurredBackgroundImageUrl: string;
        if (imageOrientation === SliderEndScreenImageOrientation.PORTRAIT && portraitImage) {
            this.addImageToList(portraitImage, urls);
            blurredBackgroundImageUrl = portraitImage;
        } else if (imageOrientation === SliderEndScreenImageOrientation.LANDSCAPE && landscapeImage) {
            this.addImageToList(landscapeImage, urls);
            blurredBackgroundImageUrl = landscapeImage;
        } else {
            // Note: Bit stupid way to make sure the first image is the middle one etc. when the carousel is shown to the user
            if (urls[1] !== undefined) {
                this._imageUrls.push(urls[1]);
            }
            if (urls[2] !== undefined) {
                this._imageUrls.push(urls[2]);
            }
            if (urls[0] !== undefined) {
                this._imageUrls.push(urls[0]);
            }
            blurredBackgroundImageUrl = urls[0];
        }

        const allSlidesCreatedPromise: Promise<HTMLElement | null>[] = [];
        const blurredBackground = this.createElement('div', 'slider-blurred-background', ['slider-blurred-background'], {
            'background-image': `url(${blurredBackgroundImageUrl})`
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

    private addImageToList(mainImage: string, urls: string[]): void {
        this._imageUrls.push(mainImage);
        if (urls[0] !== undefined) {
            this._imageUrls.push(urls[0]);
        }
        if (urls[1] !== undefined) {
            this._imageUrls.push(urls[1]);
        }
        if (urls[2] !== undefined) {
            this._imageUrls.push(urls[2]);
        }
    }

    private init(): void {
        this._isPaused = true;
        this.prepareCloneSlides();
        this._swipableIndexes = this.getSwipableIndexes();
        this.setPosition();
        this.prepareIndicators(this, 'slider-indicator', 'slider-dot', this._imageUrls.length, 0, 'active');
        this.updateIndicators();
        this.initializeTouchEvents();
    }

    private prepareIndicators(slider: Slider, wrapClassName: string, className: string, howMany: number, activeIndex: number, activeClass: string) {
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
        slider._rootElement.appendChild(indicatorContainer);

        setTimeout(() => {
            indicatorWrap.style.left = '20px';
        }, 0);
    }

    private updateIndicators(): void {
        for (const indicator of this._indicators) {
            indicator.classList.remove('active');
        }
        this._indicators[this._currentSlide].classList.add('active');
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
        let slideCount;
        let direction: string;

        this._isDragging = false;

        this._isInterrupted = false;

        if (this._drag.curX === undefined) {
            return false;
        }
        if (this._drag.swipeLength >= this._minimalSwipeLength) {
            direction = this.swipeDirection();
            switch (direction) {
                case 'left':
                    slideCount = this.checkSwipable(this._currentSlide + this.getSlideCount());
                    break;
                case 'right':
                    slideCount = this.checkSwipable(this._currentSlide - this.getSlideCount());
                    break;
                default:
            }
            this.slideHandler(<number>slideCount);
            this._drag = this.clearDrag();
        } else {
            if (this._drag.startX !== this._drag.curX) {
                this.slideHandler(this._currentSlide);
                this._drag = this.clearDrag();
            }
        }
        this.updateIndicators();
    }

    private getSlideCount() {
        let traversedIndex: number;
        let swipedSlide;
        let swipeTargetPos: number;
        let centerOffset: number;

        centerOffset = Math.floor(this.getWidth(this._rootElement) / 2);
        swipeTargetPos = (<number>this._swipeLeft * -1) + centerOffset;
        const slides = Array.from(this._slidesContainer.children);

        for (const slide of slides) {
            const el = <HTMLElement>slide;
            let slideOffsetLeftWidth: number;
            let slideOffsetLeft: number;
            let rightBoundary: number;
            slideOffsetLeftWidth = el.offsetWidth;
            slideOffsetLeft = el.offsetLeft;

            rightBoundary = slideOffsetLeft + slideOffsetLeftWidth;
            if (swipeTargetPos < rightBoundary) {
                swipedSlide = slide;
                break;
            }
        }

        let index: number;
        if (swipedSlide && swipedSlide.hasAttribute('slide-index')) {
            index = Number(swipedSlide.getAttribute('slide-index'));
        } else {
            index = 0;
        }
        traversedIndex = Math.abs(index - this._currentSlide) || 1;
        return traversedIndex;
    }

    private checkSwipable(index: number): number {
        let prevNavigable: number;

        prevNavigable = 0;
        if (index > this._swipableIndexes[this._swipableIndexes.length - 1]) {
            index = this._swipableIndexes[this._swipableIndexes.length - 1];
        } else {
            for (const i of this._swipableIndexes) {
                if (index < i) {
                    index = prevNavigable;
                    break;
                }
                prevNavigable = i;
            }
        }
        return index;
    }

    private getSwipableIndexes(): number[] {
        const indexes = [];
        for (const slide of this._slidesContainer.children) {
            if (slide && slide.hasAttribute('slide-index')) {
                indexes.push(Number(slide.getAttribute('slide-index')));
            }
        }

        return indexes;
    }

    private touchstartHandler(event: TouchEvent) {
        let touches: Touch | undefined;
        this._isInterrupted = true;

        if (this._drag.fingerCount !== 1) {
            this._drag = this.clearDrag();
            return false;
        }

        if (event !== undefined && event.touches !== undefined) {
            touches = event.touches[0];
        }

        this._drag.startX = this._drag.curX = touches !== undefined ? touches.pageX : 0;
        this._drag.startY = this._drag.curY = touches !== undefined ? touches.pageY : 0;
        this._isDragging = true;
    }

    private touchmoveHandler(event: TouchEvent) {
        let curLeft: number;
        let swipeLength: number;
        let positionOffset: number;
        let touches: TouchList | null;

        touches = event !== undefined ? event.touches : null;

        if (!this._isDragging || touches && touches.length !== 1) {
            return false;
        }

        curLeft = this.getTransitionPosition(this._currentSlide);

        this._drag.curX = touches && touches[0] !== undefined ? touches[0].pageX : 0;
        this._drag.curY = touches && touches[0] !== undefined ? touches[0].pageY : 0;
        this._drag.swipeLength = Math.round(Math.sqrt(Math.pow(this._drag.curX - this._drag.startX, 2)));

        if (event !== undefined && this._drag.swipeLength > 4) {
            event.preventDefault();
        }

        positionOffset = (this._drag.curX > this._drag.startX ? 1 : -1) * 1;
        swipeLength = this._drag.swipeLength;
        this._swipeLeft = curLeft + swipeLength * positionOffset;

        if (this._isAnimating === true) {
            this._swipeLeft = null;
            return false;
        }

        this.setTransition(this._swipeLeft);
    }

    private swipeDirection(): string {
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
        const slideTo: number = this._currentSlide + 1;
        if (!this._isPaused && !this._isInterrupted) {
            this.slideHandler(slideTo, true);
        }
    }

    private slideHandler(index: number, automatic: boolean = false) {
        let targetSlide: number;
        let oldSlideIndex: number;
        let slideLeft: number;
        let animSlide: number;
        let targetTransitionPosition: number | null = null;

        if (this._isAnimating === true) {
            return;
        }

        targetSlide = index;
        targetTransitionPosition = this.getTransitionPosition(targetSlide);
        slideLeft = this.getTransitionPosition(this._currentSlide);

        clearInterval(this._autoPlayTimer);

        if (targetSlide < 0) {
            animSlide = this._slideCount + targetSlide;
        } else if (targetSlide >= this._slideCount) {
            animSlide = targetSlide - this._slideCount;
        } else {
            animSlide = targetSlide;
        }

        this._isAnimating = true;

        oldSlideIndex = this._currentSlide;
        this._currentSlide = animSlide;

        this.animateSlide(targetTransitionPosition, () => {
            // slide calback
            this._onSlideCallback({ automatic: automatic });
            this.postSlide();
        });
        this.updateIndicators();
    }

    private postSlide() {
        this._isAnimating = false;
        this.setPosition();
        this._swipeLeft = null;
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
        this.setTransition(this.getTransitionPosition(this._currentSlide));
    }

    private getTransitionPosition(slideIndex: number): number {
        let targetTransitionPosition: number;
        const targetSlide = <HTMLElement>this._slidesContainer.children[slideIndex + 2];
        targetTransitionPosition = targetSlide ? targetSlide.offsetLeft * -1 : 0;
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
