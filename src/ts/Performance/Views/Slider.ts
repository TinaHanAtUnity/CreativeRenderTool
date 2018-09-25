export class Slider {
    private _rootEl: HTMLElement;
    private _sliderScrollableContainer: HTMLElement;
    private _slidesContainer: HTMLElement;
    private _paginationIndicatorsContainer: HTMLElement;
    private _paginationIndicators: HTMLElement[] = [];
    private _originalSlidesOrder: HTMLElement[] = [];
    private _width: number;
    private _height: number;

    constructor(urls: string[], size: { width: number; height: number } = {width: 0, height: 0}) {
        const {width, height} = size;

        /* TODO: Max size */
        urls.length = 3;

        this._rootEl = this.createElement('div', 'slider-root-container', [], {
            'height': '100%',
            'width': '100%'
        });

        this._sliderScrollableContainer = this.createElement('div', 'slider-scrollable-container', [], {
            'overflow-x': 'scroll',
            'overflow-y': 'hidden'
        });

        this._slidesContainer = this.createElement('div', 'slider-slides-container');

        this._sliderScrollableContainer.addEventListener('scroll', () => {
            window.requestAnimationFrame(this.handleScrolling.bind(this));
        });

        this._rootEl.appendChild(this._sliderScrollableContainer).appendChild(this._slidesContainer);

        const allSlidesCreatedPromise = urls.map((url, index) => {
            return this.createSlide(url, 'slide-' + index).then((slide) => {
                this._originalSlidesOrder.push(slide);
                this._slidesContainer.appendChild(slide);
            });
        });

        Promise.all(allSlidesCreatedPromise).then(() => {
            this._rootEl.appendChild(this.createPagination());

            if (width !== 0 && height !== 0) {
                this.resize(width, height, true);
            }

            // this.startAnimation();
        });
    }

    public attachTo(container: HTMLElement) {
        container.appendChild(this._rootEl);
    }

    private handleScrolling() {
        const leftBoundary = (<HTMLElement>this._slidesContainer.firstChild).offsetWidth * 0.5;
        const rightBoundary = this._slidesContainer.offsetWidth - (<HTMLElement>this._slidesContainer.lastChild).offsetWidth * 1.5;

        if (this._sliderScrollableContainer.scrollLeft <= leftBoundary) {
            this.moveSlide(true);
        }

        if (this._sliderScrollableContainer.scrollLeft >= rightBoundary) {
            this.moveSlide();
        }

        this.updatePagination();
    }

    private moveSlide(left: boolean = false) {
        if (left) {
            const slide = <HTMLElement>(<HTMLElement>this._slidesContainer.lastChild).cloneNode(true);
            this._slidesContainer.insertBefore(slide, this._slidesContainer.firstChild);
            this._slidesContainer.removeChild(<HTMLElement>this._slidesContainer.lastChild);
            this._sliderScrollableContainer.scrollLeft += this._width;
        } else {
            const slide = <HTMLElement>(<HTMLElement>this._slidesContainer.firstChild).cloneNode(true);
            this._slidesContainer.appendChild(slide);
            this._slidesContainer.removeChild(<HTMLElement>this._slidesContainer.firstChild);
            this._sliderScrollableContainer.scrollLeft -= this._width;
        }

        this.resize(this._width, this._height);
    }

    private startAnimation() {
        const speed = 2;
        setInterval(() => {
            this._sliderScrollableContainer.scrollLeft += speed;
        }, 20);
    }

    public resize(width: number, height: number, scroll = false) {
        const slidesDOM = this._slidesContainer.querySelectorAll('.slide');

        this.setStyles(this._slidesContainer, {
            'width': `${width * slidesDOM.length}px`,
            'height': `${height}px`
        });

        for (const [index, slide] of slidesDOM.entries()) {
            this.setStyles(<HTMLElement>slide, {
                'width': `${width}px`,
                'height': `${height}px`,
                'left': `${width * index}px`
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

        if (scroll) {
            const middleSlide = Math.floor(this._originalSlidesOrder.length / 2);
            this._sliderScrollableContainer.scrollLeft = (<HTMLElement>this._slidesContainer.children[middleSlide]).offsetLeft;
        }

        this.updatePagination();

        this._width = width;
        this._height = height;
    }

    private updatePagination() {
        const slides = this._slidesContainer.getElementsByClassName('slide');
        const scrollPosition = this._sliderScrollableContainer.scrollLeft;
        let activeSide: HTMLElement;

        for (const slide of slides) {
            if ((<HTMLElement>slide).offsetLeft >= scrollPosition && (<HTMLElement>slide).offsetLeft + (<HTMLElement>slide).offsetWidth >= scrollPosition) {
                activeSide = <HTMLElement>slide;
                break;
            }
        }

        const activeIndex = this._originalSlidesOrder.findIndex((slide) => {
            return slide.id === activeSide.id;
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
            const image = new Image();
            image.onload = () => {
                const slide = this.createElement('div', id, ['slide'], {
                    'background-image': `url(${image.src})`,
                    'background-size': '100% 100%',
                    'display': 'inline-block',
                    'width': `${this._width}px`,
                    'height': `${this._height}px`
                });

                resolve(slide);
            };

            image.src = url;
        });
    }

    private createPagination() {
        this._paginationIndicatorsContainer = this.createElement('div', 'slider-pagination-container', [], {
            'position': 'relative',
            'text-align': 'center'
        });

        this._paginationIndicators = this._originalSlidesOrder.map((slide, index) => {
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
