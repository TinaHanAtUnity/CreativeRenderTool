import { Class } from 'estree';

export interface ISliderOptions {
    duration: number;
    easing: string;
    perPage: number;
    startIndex: number;
    draggable: boolean;
    multipleDrag: boolean;
    threshold: number;
    loop: boolean;
    rtl: boolean;
    onInit: CallableFunction;
    onChange: CallableFunction;
}

export class Slider {
    private selector: HTMLElement;
    private options: ISliderOptions;
    private selectorWidth: number;
    private innerElements: any;
    private currentSlide: number;
    private transformProperty: any;
    private sliderFrame: HTMLElement;
    private pointerDown: boolean;
    private drag: object[any];

    constructor(urls: string[], options: ISliderOptions = {
        duration: 200,
        easing: 'ease-out',
        perPage: 1,
        startIndex: 0,
        draggable: true,
        multipleDrag: true,
        threshold: 20,
        loop: true,
        rtl: false,
        onInit: () => { },
        onChange: () => { }
    }) {
        this.options = options;
        this.drag = {
            startX: 0,
            endX: 0,
            startY: 0,
            letItGo: null,
            preventClick: false
        };

        this.sliderFrame = this.createElement('div', 'slider-slides-container', ['slider-content']);

        // const allSlidesCreatedPromise = urls.map((url, index) => {
        //     return this.createSlide(url, 'slide-' + index).then((slide) => {
        //         this.sliderFrame.appendChild(slide);
        //     });
        // });
        // Promise.all(allSlidesCreatedPromise).then(() => {
        //     this.innerElements = [].slice.call(this.sliderFrame.children);
        //     // update perPage number dependable of user value
        //     this.init();
        //     // this.resolveSlidesNumber();
        //     // this.buildSliderFrame();
        // });
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

        const item = this.createElement('div', id, ['slider-item', 'slider-item']);
        const span = this.createElement('span', id + 'img', [], style);

        if (image !== undefined) {
            item.appendChild(image);
            item.appendChild(span);
        }
        return item;
    }

    private resolveSlidesNumber(): void {
        this.selectorWidth = this.selector.offsetWidth;
        this.innerElements = [].slice.call(this.selector.children);
        this.currentSlide = this.options.loop ?
        this.options.startIndex % this.innerElements.length :
          Math.max(0, Math.min(this.options.startIndex, this.innerElements.length - this.options.perPage));
        this.transformProperty = Slider.webkitOrNot();

        // Bind all event handlers for referencability
        // ['resizeHandler', 'touchstartHandler', 'touchendHandler', 'touchmoveHandler', 'mousedownHandler', 'mouseupHandler', 'mouseleaveHandler', 'mousemoveHandler', 'clickHandler'].forEach(method => {
        //   this[method] = this[method].bind(this);
        // });
        // this.resizeHandler.bind(this);
        this.init();
    }

    private init(): void {
        this.attachEvents();
        this.sliderFrame.style.overflow = 'hidden';

        this.sliderFrame.style.direction = this.options.rtl ? 'rtl' : 'ltr';
        this.buildSliderFrame();
    }

    private attachEvents(): void {
        window.addEventListener('resize', (this.resizeHandler).bind(this));

        // If element is draggable / swipable, add event handlers
        if (this.options.draggable) {
            // Keep track pointer hold and dragging distance
            this.pointerDown = false;
            this.drag = {
              startX: 0,
              endX: 0,
              startY: 0,
              letItGo: null,
              preventClick: false
            };
        }
        // Touch events
        this.sliderFrame.addEventListener('touchstart', (this.touchstartHandler).bind(this));
        this.sliderFrame.addEventListener('touchend', (this.touchendHandler).bind(this));
        this.sliderFrame.addEventListener('touchmove', (this.touchmoveHandler).bind(this));
    }

    private touchmoveHandler(e: any) {
        e.stopPropagation();

        if (this.drag.letItGo === null) {
            this.drag.letItGo = Math.abs(this.drag.startY - e.touches[0].pageY) < Math.abs(this.drag.startX - e.touches[0].pageX);
        }

        if (this.pointerDown && this.drag.letItGo) {
            e.preventDefault();
            this.drag.endX = e.touches[0].pageX;
            this.sliderFrame.style.webkitTransition = `all 0ms ${this.options.easing}`;
            this.sliderFrame.style.transition = `all 0ms ${this.options.easing}`;

            const currentSlide = this.options.loop ? this.currentSlide + this.options.perPage : this.currentSlide;
            const currentOffset = currentSlide * (this.selectorWidth / this.options.perPage);
            const dragOffset = (this.drag.endX - this.drag.startX);
            const offset = this.options.rtl ? currentOffset + dragOffset : currentOffset - dragOffset;
            this.sliderFrame.style[this.transformProperty] = `translate3d(${(this.options.rtl ? 1 : -1) * offset}px, 0, 0)`;
        }
      }

    private touchstartHandler(e: any) {
        e.stopPropagation();
        this.pointerDown = true;
        this.drag.startX = e.touches[0].pageX;
        this.drag.startY = e.touches[0].pageY;
    }

    // touchend event handler
    private touchendHandler(e: any) {
        e.stopPropagation();
        this.pointerDown = false;
        this.enableTransition();
        if (this.drag.endX) {
          this.updateAfterDrag();
        }
        this.clearDrag();
    }

    // Recalculate drag /swipe event and reposition the frame of a slider
    private updateAfterDrag(): void {
        const movement = (this.options.rtl ? -1 : 1) * (this.drag.endX - this.drag.startX);
        const movementDistance = Math.abs(movement);
        const howManySliderToSlide = this.options.multipleDrag ? Math.ceil(movementDistance / (this.selectorWidth / this.options.perPage)) : 1;

        const slideToNegativeClone = movement > 0 && this.currentSlide - howManySliderToSlide < 0;
        const slideToPositiveClone = movement < 0 && this.currentSlide + howManySliderToSlide > this.innerElements.length - this.options.perPage;

        if (movement > 0 && movementDistance > this.options.threshold && this.innerElements.length > this.options.perPage) {
            this.prev(howManySliderToSlide);
        }
        else if (movement < 0 && movementDistance > this.options.threshold && this.innerElements.length > this.options.perPage) {
            this.next(howManySliderToSlide);
        }
        this.slideToCurrent(slideToNegativeClone || slideToPositiveClone);
    }

    // Go to previous slide.
    private prev(howManySlides = 1, callback: any): void {
        // early return when there is nothing to slide
        if (this.innerElements.length <= this.options.perPage) {
            return;
        }

        const beforeChange = this.currentSlide;

        if (this.options.loop) {
            const isNewIndexClone = this.currentSlide - howManySlides < 0;
            if (isNewIndexClone) {
                this.disableTransition();

                const mirrorSlideIndex = this.currentSlide + this.innerElements.length;
                const mirrorSlideIndexOffset = this.options.perPage;
                const moveTo = mirrorSlideIndex + mirrorSlideIndexOffset;
                const offset = (this.options.rtl ? 1 : -1) * moveTo * (this.selectorWidth / this.options.perPage);
                const dragDistance = this.options.draggable ? this.drag.endX - this.drag.startX : 0;

                this.sliderFrame.style[this.transformProperty] = `translate3d(${offset + dragDistance}px, 0, 0)`;
                this.currentSlide = mirrorSlideIndex - howManySlides;
            } else {
                this.currentSlide = this.currentSlide - howManySlides;
            }
        } else {
            this.currentSlide = Math.max(this.currentSlide - howManySlides, 0);
            }
            if (beforeChange !== this.currentSlide) {
                this.slideToCurrent(this.options.loop);
                this.options.onChange.call(this);
            if (callback) {
                callback.call(this);
            }
        }
    }

    private next(howManySlides = 1, callback: any) {
        // early return when there is nothing to slide
        if (this.innerElements.length <= this.options.perPage) {
            return;
        }

        const beforeChange = this.currentSlide;

        if (this.options.loop) {
            const isNewIndexClone = this.currentSlide + howManySlides > this.innerElements.length - this.options.perPage;
            if (isNewIndexClone) {
                this.disableTransition();

                const mirrorSlideIndex = this.currentSlide - this.innerElements.length;
                const mirrorSlideIndexOffset = this.options.perPage;
                const moveTo = mirrorSlideIndex + mirrorSlideIndexOffset;
                const offset = (this.options.rtl ? 1 : -1) * moveTo * (this.selectorWidth / this.options.perPage);
                const dragDistance = this.options.draggable ? this.drag.endX - this.drag.startX : 0;

                this.sliderFrame.style[this.transformProperty] = `translate3d(${offset + dragDistance}px, 0, 0)`;
                this.currentSlide = mirrorSlideIndex + howManySlides;
            } else {
                this.currentSlide = this.currentSlide + howManySlides;
            }
        } else {
            this.currentSlide = Math.min(this.currentSlide + howManySlides, this.innerElements.length - this.options.perPage);
        }
        if (beforeChange !== this.currentSlide) {
            this.slideToCurrent(this.options.loop);
            this.options.onChange.call(this);
            if (callback) {
                callback.call(this);
            }
        }
    }

    private resizeHandler(): void {
        // update perPage number dependable of user value
        this.resolveSlidesNumber();
        // relcalculate currentSlide
        // prevent hiding items when browser width increases
        if (this.currentSlide + this.options.perPage > this.innerElements.length) {
          this.currentSlide = this.innerElements.length <= this.options.perPage ? 0 : this.innerElements.length - this.options.perPage;
        }

        this.selectorWidth = this.selector.offsetWidth;
        this.buildSliderFrame();
    }

    private buildSliderFrame(): void {
        const widthItem = this.selectorWidth / this.options.perPage;
        const itemsToBuild = this.options.loop ? this.innerElements.length + (this.options.perPage * 2) : this.innerElements.length;

        // Create frame and apply styling
        this.sliderFrame = document.createElement('div');
        this.sliderFrame.style.width = `${widthItem * itemsToBuild}px`;
        this.enableTransition();
        if (this.options.draggable) {
            this.sliderFrame.style.cursor = '-webkit-grab';
        }
        // Create a document fragment to put slides into it
        const docFragment = document.createDocumentFragment();

        // Loop through the slides, add styling and add them to document fragment
        if (this.options.loop) {
            for (let i = this.innerElements.length - this.options.perPage; i < this.innerElements.length; i++) {
                const element = this.buildSliderFrameItem(this.innerElements[i].cloneNode(true));
                docFragment.appendChild(element);
            }
        }
        for (const i of this.innerElements) {
            const element = this.buildSliderFrameItem(this.innerElements[i]);
            docFragment.appendChild(element);
        }
        if (this.options.loop) {
            for (let i = 0; i < this.options.perPage; i++) {
              const element = this.buildSliderFrameItem(this.innerElements[i].cloneNode(true));
              docFragment.appendChild(element);
            }
        }
        // Add fragment to the frame
        this.sliderFrame.appendChild(docFragment);
        // Clear selector (just in case something is there) and insert a frame
        this.selector.innerHTML = '';
        this.selector.appendChild(this.sliderFrame);

        // Go to currently active slide after initial build
        this.slideToCurrent(false);
    }

    // Moves sliders frame to position of currently active slide
    private slideToCurrent(enableTransition: boolean): void {
        const currentSlide = this.options.loop ? this.currentSlide + this.options.perPage : this.currentSlide;
        const offset = (this.options.rtl ? 1 : -1) * currentSlide * (this.selectorWidth / this.options.perPage);
        if (enableTransition) {
            // Explanation:
            // https://youtu.be/cCOL7MC4Pl0
            requestAnimationFrame(() => {
              requestAnimationFrame(() => {
                this.enableTransition();
                this.sliderFrame.style[this.transformProperty] = `translate3d(${offset}px, 0, 0)`;
              });
            });
        } else {
            this.sliderFrame.style[this.transformProperty] = `translate3d(${offset}px, 0, 0)`;
        }

    }

    private enableTransition(): void {
        console.log(this.sliderFrame);
        this.sliderFrame.style.webkitTransition = `all ${this.options.duration}ms ${this.options.easing}`;
        this.sliderFrame.style.transition = `all ${this.options.duration}ms ${this.options.easing}`;
    }

    private buildSliderFrameItem(elm: HTMLElement): HTMLElement {
        console.log(elm);
        const elementContainer = document.createElement('div');
        elementContainer.style.cssFloat = this.options.rtl ? 'right' : 'left';
        elementContainer.style.width = `${this.options.loop ? 100 / (this.innerElements.length + (this.options.perPage * 2)) : 100 / (this.innerElements.length)}%`;
        elementContainer.appendChild(elm);
        return elementContainer;
    }

    private static webkitOrNot() {
        const style = document.documentElement.style;
        if (typeof style.transform === 'string') {
          return 'transform';
        }
        return 'WebkitTransform';
    }

    private createElement(name: string, id: string, className: string[] = [], style: { [key: string]: any } = {}): HTMLElement {
        const el = document.createElement(name);
        el.id = id;
        el.classList.add(...className);

        this.setStyles(el, style);

        return el;
    }

    private static bindEvents(slider: Slider) {
        const selector = slider.selector;
    }

    private setStyles(el: HTMLElement, style: { [key: string]: any } = {}) {
        Object.keys(style).forEach((key) => {
            el.style.setProperty(key, String(style[key]));
        });
    }

    public attachTo(container: HTMLElement) {
        container.appendChild(this.sliderFrame);
    }
}
