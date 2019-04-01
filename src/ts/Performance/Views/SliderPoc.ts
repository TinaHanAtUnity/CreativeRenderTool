
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
    private transformProperty: string;
    private _slidesContainer: HTMLElement;
    private _rootEl: HTMLElement;
    private pointerDown: boolean;
    private drag: IDragOptions;
    private slidesPerPage: number;
    private sliderFrame: HTMLElement;

    constructor(urls: string[], config: ISliderOptions = {
        duration: 200,
        easing: 'ease-out',
        slidesPerPage: 1.7,
        startIndex: 0,
        draggable: true,
        multipleDrag: false,
        threshold: 20,
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
        this._rootEl.appendChild(this._slidesContainer);
        this.selectorWidth = this._slidesContainer.offsetWidth;

        this.innerElements = [].slice.call(urls);
        this.currentSlide = this.config.loop ?
        this.config.startIndex % this.innerElements.length :
        Math.max(0, Math.min(this.config.startIndex, this.innerElements.length - this.slidesPerPage));
        this.transformProperty = Slider.webkitOrNot();

        // update slidesPerPage number dependable of user value
        this.resolveSlidesNumber();
        this.init();
    }

    public attachTo(container: HTMLElement) {
        container.appendChild(this._rootEl);
    }

    private init(): void {
        this.attachEvents();
        this._rootEl.style.overflow = 'hidden';
        this.buildSliderFrame();

    }

    private buildSliderFrame(): void {
        const widthItem = this.selectorWidth / this.slidesPerPage;
        const itemsToBuild = this.config.loop ? this.innerElements.length + (this.slidesPerPage * 2) : this.innerElements.length;

        // Create frame and apply styling
        // this.sliderFrame = document.createElement('div');
        // this.enableTransition();

        // if (this.config.draggable) {
        //     this.selector.style.cursor = '-webkit-grab';
        // }

        // Create a document fragment to put slides into it
        const docFragment = document.createDocumentFragment();
        // const slideWrapper = document.createElement('div');
        this._slidesContainer.style.width = `${widthItem * itemsToBuild}px`;
        // Loop through the slides, add styling and add them to document fragment
        if (this.config.loop) {
            for (let i = this.innerElements.length - this.slidesPerPage; i < this.innerElements.length; i++) {
                const element = this.buildSliderFrameItem(this.innerElements[i]);
                docFragment.appendChild(element);
            }
        }
        for (const item of this.innerElements) {
            const element = this.buildSliderFrameItem(item);
            docFragment.appendChild(element);
        }
        if (this.config.loop) {
            for (let i = 0; i < this.slidesPerPage; i++) {
                const element = this.buildSliderFrameItem(this.innerElements[i]);
                docFragment.appendChild(element);
            }
        }
        this._slidesContainer.innerHTML = '';
        // Add fragment to the frame
        // this.sliderFrame.appendChild(docFragment);
        // slideWrapper.appendChild(docFragment);
        this._slidesContainer.appendChild(docFragment);
        // Clear selector (just in case something is there) and insert a frame
        // this._rootEl.appendChild(this.sliderFrame);

        // Go to currently active slide after initial build
        this.slideToCurrent(true);
    }

    private slideToCurrent(enableTransition: boolean): void {
        const currentSlide = this.config.loop ? this.currentSlide + this.slidesPerPage : this.currentSlide;
        const offset = (this.config.rtl ? 1 : -1) * currentSlide * (this.selectorWidth / this.slidesPerPage);

        if (enableTransition) {
            // https://youtu.be/cCOL7MC4Pl0
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    this.enableTransition();
                    this._slidesContainer.style[this.transformProperty] = `translate3d(${offset}px, 0, 0)`;
                });
            });
        } else {
            this._slidesContainer.style[this.transformProperty] = `translate3d(${offset}px, 0, 0)`;
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

    private buildSliderFrameItem(url: string): HTMLDivElement {
        const elementContainer = document.createElement('div');
        const slideWrapper = document.createElement('div');
        elementContainer.classList.add('slider-item');
        // slideWrapper.classList.add('slide-wrapper');
        elementContainer.style.cssFloat = this.config.rtl ? 'right' : 'left';
        elementContainer.style.width = `${this.config.loop ? 100 / (this.innerElements.length + (this.slidesPerPage * 2)) : 100 / (this.innerElements.length)}%`;
        const style = {};

        if (url) {
            Object.assign(style, {
                'background-image': `url(${url})`
            });
        }
        const image = new Image();
        image.src = url;

        elementContainer.appendChild(image);
        // slideWrapper.appendChild(elementContainer);
        // console.log(slideWrapper)
        return elementContainer;
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

    private resizeHandler(): void {
        this.resolveSlidesNumber();

        this.selectorWidth = this._rootEl.offsetWidth;
        if (this.currentSlide + this.slidesPerPage > this.innerElements.length) {
            this.currentSlide = this.innerElements.length <= this.slidesPerPage ? 0 : this.innerElements.length - this.slidesPerPage;
          }
        this.selectorWidth = this._rootEl.offsetWidth;
        this.buildSliderFrame();
    }

    private touchstartHandler(e: TouchEvent): void {
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
            this._slidesContainer.style[this.transformProperty] = `translate3d(${(this.config.rtl ? 1 : -1) * offset}px, 0, 0)`;
        }

    }

    private mousedownHandler(e: MouseEvent): void {
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
            this.sliderFrame.style.webkitTransition = `all 0ms ${this.config.easing}`;
            this.sliderFrame.style.transition = `all 0ms ${this.config.easing}`;

            const currentSlide = this.config.loop ? this.currentSlide + this.slidesPerPage : this.currentSlide;
            const currentOffset = currentSlide * (this.selectorWidth / this.slidesPerPage);
            const dragOffset = (this.drag.endX - this.drag.startX);
            const offset = this.config.rtl ? currentOffset + dragOffset : currentOffset - dragOffset;
            this.sliderFrame.style[this.transformProperty] = `translate3d(${(this.config.rtl ? 1 : -1) * offset}px, 0, 0)`;
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

                this._slidesContainer.style[this.transformProperty] = `translate3d(${offset + dragDistance}px, 0, 0)`;
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

                this._slidesContainer.style[this.transformProperty] = `translate3d(${offset + dragDistance}px, 0, 0)`;
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

    private static webkitOrNot(): string {
        const style = document.documentElement.style;
        if (typeof style.transform === 'string') {
          return 'transform';
        }
        return 'WebkitTransform';
    }

    private resolveSlidesNumber(): void {
        if (typeof this.config.slidesPerPage === 'number') {
          this.slidesPerPage = this.config.slidesPerPage;
        } else if (typeof this.config.slidesPerPage === 'object') {
          this.slidesPerPage = 1;
        //   for (const viewport in <Object>this.config.slidesPerPage) {
        //     if (window.innerWidth >= viewport) {
        //       this.slidesPerPage = this.config.slidesPerPage[viewport];
        //     }
        //   }
        }
      }

    // private createSlide(url: string, id: string): Promise<HTMLElement> {
    //     return new Promise((resolve) => {
    //         if (url) {
    //             const image = new Image();
    //             image.onload = () => {
    //                 resolve(this.generateSlideHTML(id, image));
    //             };
    //             image.src = url;
    //         } else {
    //             resolve(this.generateSlideHTML(id));
    //         }
    //     });
    // }

    // private generateSlideHTML = (id: string, image?: HTMLImageElement) => {
    //     const src = image && image.src;
    //     const style = {};

    //     if (src) {
    //         Object.assign(style, {
    //             'background-image': `url(${src})`
    //         });
    //     }

    //     const item = this.createElement('div', id, ['slider-item', 'slider-item']);
    //     const span = this.createElement('span', id + 'img', [], style);

    //     if (image !== undefined) {
    //         item.appendChild(image);
    //         item.appendChild(span);
    //     }
    //     return item;
    // }

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
}
