export class Slider {
    private _slides: HTMLDivElement[] = [];
    private _rootEl: HTMLDivElement;
    private _scrollableContainer: HTMLDivElement;

    constructor(images: string[], size: { width: number; height: number } = {width: 0, height: 0}) {
        const {width, height} = size;

        this._rootEl = document.createElement('div');
        this._rootEl.classList.add('slider-root-container');

        this._rootEl.style.overflowX = 'scroll';
        this._rootEl.style.overflowY = 'scroll';

        this._scrollableContainer = document.createElement('div');
        this._scrollableContainer.classList.add('slider-scrollable-container');

        this._rootEl.appendChild(this._scrollableContainer);

        const initialise = images.map((url, index) => {
            return this.createSlide(url, 'slide-' + index).then((image) => {
                this._scrollableContainer.appendChild(image);
            });
        });

        Promise.all(initialise).then(() => {
            this.resize(width, height);
        });
    }

    private createSlide(url: string, id: string): Promise<HTMLDivElement> {
        return new Promise((resolve) => {
            const image = new Image();

            image.onload = () => {
                const slide = document.createElement('div');

                slide.id = id;
                slide.classList.add('slide');

                slide.style.backgroundImage = `url(${image.src})`;
                slide.style.backgroundSize = '100% 100%';

                // slide.style.width = image.width + 'px';
                // slide.style.height = image.height + 'px';

                /* Horizontal */
                // slide.style.display = 'inline-block';

                this._slides.push(slide);

                resolve(slide);
            };

            image.src = url;
        });
    }

    public resize(width: number, height: number) {
        this._scrollableContainer.style.width = `${width * this._slides.length}px`;
        this._scrollableContainer.style.height = `${height}px`;

        this._slides.map((slide, index) => {
            slide.style.width = `${width}px`;
            slide.style.height = `${height}px`;
            slide.style.left = `${width * index}px`;
        });
    }

    public attachTo(container: HTMLElement) {
        container.appendChild(this._rootEl);
    }

}
