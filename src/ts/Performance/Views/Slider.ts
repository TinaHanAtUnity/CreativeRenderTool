export class Slider {
    private _rootEl: HTMLElement;

    // Evetyhing scrollable should be inside this container
    private _sliderScrollableContainer: HTMLElement;

    // Slides shown to user including head, tail and duplicated slides
    private _slidesContainer: HTMLElement;

    private _paginationIndicatorsContainer: HTMLElement;
    private _paginationIndicators: HTMLElement[] = [];

    // Keep actual slides order, without head, tail and duplicated slides to handle pagination and for infinite scrolling
    private _slidesOrder: HTMLElement[] = [];

    // Height and width of slide
    private _width: number;
    private _height: number;

    private _infiniteScrolling: boolean = true;

    // Resolved once all images are downloaded
    private _ready: Promise<void>;

    // Container holds image that should be prefilled in infinite scrolling
    private _sliderHead: HTMLElement;
    private _sliderTail: HTMLElement;

    constructor(urls: string[], size: { width: number; height: number } = {width: 0, height: 0}) {
        const {width, height} = size;

        /* TODO: Maybe do configurable */
        urls.length = 3;

        this._rootEl = this.createElement('div', 'slider-root-container', [], {
            'height': '100%',
            'width': '100%'
        });

        this._sliderScrollableContainer = this.createElement('div', 'slider-scrollable-container', [], {
            'overflow-x': 'scroll',
            'overflow-y': 'hidden',
            '-webkit-overflow-scrolling': 'touch'
        });

        this._slidesContainer = this.createElement('div', 'slider-slides-container');

        // For infinite scroll, we can try to highjack ontouchstart, ontouchmove and ontouchend
        // to calculate distance and based on that scroll slider.
        // Overall it could be a better solution, if native scrolling on ios will not start to cooperate better
        this._sliderScrollableContainer.addEventListener('scroll', () => {
            window.requestAnimationFrame(this.handleScrolling.bind(this, event));
        });

        this._rootEl.appendChild(this._sliderScrollableContainer).appendChild(this._slidesContainer);

        const allSlidesCreatedPromise = urls.map((url, index) => {
            return this.createSlide(url, 'slide-' + index).then((slide) => {
                this._slidesOrder.push(slide);
                this._slidesContainer.appendChild(slide);
            });
        });

        /* Only when all images are loaded */
        // TODO: Handle if images are not loaded in time
        this._ready = Promise.all(allSlidesCreatedPromise).then(() => {

            this._rootEl.appendChild(this.createPagination());

            if (this._infiniteScrolling) {
                this.createSlide('', 'slide-head').then((slide) => {
                    slide.style.backgroundImage = this._slidesOrder[0].style.backgroundImage;
                    this._sliderHead = this._slidesContainer.appendChild(slide);
                });

                this.createSlide('', 'slide-tail').then((slide) => {
                    slide.style.backgroundImage = this._slidesOrder[this._slidesOrder.length - 1].style.backgroundImage;
                    this._sliderTail = this._slidesContainer.insertBefore(slide, this._slidesContainer.firstChild);
                });
            }

            // TODO: This should not be a case usually, if you use this slider outside of webview.
            // TODO: The reason is SDK's webview does not provide width in height in `constructor` of endscreen method.
            // TODO: But we want to start download images as soon as possible, so we initialise slider there.
            // TODO: Maybe separate load images method and call it separately or have slider.show() method or similar.
            if (width !== 0 && height !== 0) {
                this.resize(width, height, true);
            }
        });
    }

    public attachTo(container: HTMLElement) {
        container.appendChild(this._rootEl);
    }

    private handleScrolling() {
        if (this._infiniteScrolling) {
            // In what point in scroll line slider applies infinite scroll effect
            const leftBoundary = (<HTMLElement>this._slidesContainer.firstChild).offsetWidth * 0.5;
            const rightBoundary = this._slidesContainer.offsetWidth - (<HTMLElement>this._slidesContainer.lastChild).offsetWidth * 2.125;

            if (this._sliderScrollableContainer.scrollLeft <= leftBoundary) {
                this.moveSlide(true);
            }

            if (this._sliderScrollableContainer.scrollLeft >= rightBoundary) {
                this.moveSlide();
            }
        }

        this.updatePagination();
    }

    public scrollToMiddleSlide() {
        const middleSlide = Math.floor(this._slidesContainer.children.length / 2);
        this._sliderScrollableContainer.scrollLeft = (<HTMLElement>this._slidesContainer.children[middleSlide]).offsetLeft;
    }

    private moveSlide(left: boolean = false) {
        // Copy first/last element => append/insertBefore this._sliderContainer.children;
        // This method (or similar e.g. also removing cloned child) works fine in browser and tested android devices.
        // But not on iOS when scrolling specifically to the left.
        // Reason: insertBefore makes this._sliderContainer.children to grow to the right, and does not move scroll position
        // Also ios scrolling bounce effect does not contribute to this situation well
        if (left) {
            this.createSlide('', 'slide-tail').then((tailSlide) => {
                const nextSlide = this._slidesOrder[this._slidesOrder.length - 1];
                this._sliderTail.id = nextSlide.id;
                this._sliderTail.style.backgroundImage = nextSlide.style.backgroundImage;
                tailSlide.style.backgroundImage = this._slidesOrder[this._slidesOrder.length - 2].style.backgroundImage;
                this._sliderTail = this._slidesContainer.insertBefore(tailSlide, this._slidesContainer.firstChild);
                this._slidesOrder.unshift(<HTMLElement>this._slidesOrder.pop());
                this._sliderScrollableContainer.scrollLeft += this._width;
            });
        } else {
            this.createSlide('', 'slide-head').then((headSlide) => {
                const nextSlide = this._slidesOrder[0];
                this._sliderHead.id = nextSlide.id;
                this._sliderHead.style.backgroundImage = nextSlide.style.backgroundImage;
                headSlide.style.backgroundImage = this._slidesOrder[1].style.backgroundImage;
                this._sliderHead = this._slidesContainer.appendChild(headSlide);
                this._slidesOrder.push(<HTMLElement>this._slidesOrder.shift());
            });
        }

        this.resize(this._width, this._height);
    }

    private startAnimation() {
        // Simplest auto scrolling implementation
        const speed = 2;
        setInterval(() => {
            this._sliderScrollableContainer.scrollLeft += speed;
        }, 20);
    }

    public resize(...args: any[]) {
        this._ready.then(() => {
            this.doResize.apply(this, args);
        });
    }

    private doResize(width: number, height: number) {
        const slidesDOM = this._slidesContainer.querySelectorAll('.slide');

        this.setStyles(this._slidesContainer, {
            'width': `${width * slidesDOM.length}px`,
            'height': `${height}px`
        });

        for (const slide of slidesDOM) {
            this.setStyles(<HTMLElement>slide, {
                'width': `${width}px`,
                'height': `${height}px`
            });
        }

        this.setStyles(this._paginationIndicatorsContainer, {
            'height': `${height * 0.085}px`,
            'bottom': `${height * 0.085}px`
        });

        this._paginationIndicators.map(indicator => {
            this.setStyles(indicator, {
                'height': `${height * 0.025}px`,
                'width': `${height * 0.025}px`,
                'margin': `0 ${height * 0.005}px`
            });
        });

        this._width = width;
        this._height = height;
    }

    private updatePagination() {
        const slides = this._slidesContainer.getElementsByClassName('slide');
        const scrollPosition = this._sliderScrollableContainer.scrollLeft;
        let activeSlide: HTMLElement;

        for (const slide of slides) {
            if ((<HTMLElement>slide).offsetLeft >= scrollPosition && (<HTMLElement>slide).offsetLeft + (<HTMLElement>slide).offsetWidth >= scrollPosition) {
                activeSlide = <HTMLElement>slide;
                break;
            }
        }

        const activeIndex = this._slidesOrder.findIndex((slide) => {
            return slide.id === (activeSlide && activeSlide.id);
        });

        this._paginationIndicators.map((indicator, index) => {
            this.changeIndicatorState(index, index === activeIndex);
        });
    }

    private changeIndicatorState(index: number, active: boolean = false) {
        if (active) {
            this.setStyles(this._paginationIndicators[index], {
                'opacity': 0.25
            });
        } else {
            this.setStyles(this._paginationIndicators[index], {
                'opacity': 1
            });
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
        const src = image && image.src;
        const style = {
            'display': 'inline-block',
            'width': `${this._width}px`,
            'height': `${this._height}px`,
            'background-size': '100% 100%'
        };

        if (src) {
            Object.assign(style, {
                'background-image': `url(${src})`
            });
        }

        return this.createElement('div', id, ['slide'], style);
    }

    private createPagination() {
        this._paginationIndicatorsContainer = this.createElement('div', 'slider-pagination-container', [], {
            'position': 'relative',
            'text-align': 'center'
        });

        this._paginationIndicators = this._slidesOrder.map((slide, index) => {
            const indicator = this.createElement('div', 'slider-pagination-' + index, ['slider-pagination-indicator'], {
                'display': 'inline-block',
                'background': 'white',
                'border-radius': '50%'
            });
            return this._paginationIndicatorsContainer.appendChild(indicator);
        });

        return this._paginationIndicatorsContainer;
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

}
