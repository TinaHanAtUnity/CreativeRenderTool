import { ParallaxCamera } from 'Performance/Utilities/ParallaxCamera';

const requestAnimationFrame = window.requestAnimationFrame || window.webkitRequestAnimationFrame;
const cancelAnimationFrame = window.cancelAnimationFrame || window.webkitCancelAnimationFrame;

export interface IParallaxLayerParams {
  xOffset: number;
  yOffset: number;
  distance: number;
  transformOffset: number;
};

class ParallaxLayer {
    private _xOffset: number;
    private _yOffset: number;
    private _distance: number;
    private _img: HTMLImageElement;
    private _parent: HTMLElement;
    private _params: IParallaxLayerParams;
    private _xMaximum: number;
    private _width: number;
    private _height: number;

    constructor(params: IParallaxLayerParams) {
        this._params = params;
        this._xOffset = params.xOffset;
        this._yOffset = params.yOffset;
        this._distance = params.distance;
        this._xMaximum = 0;
    }

    public attachTo(element: HTMLElement): void {
        this._parent = element;
        if (this._img) {
            element.appendChild(this._img);
        }
    }

    public loadImage(url: string): Promise<ParallaxLayer> {
        return new Promise((resolve) => {
            const img = new Image();
            img.onload = (event: Event) => {
                const loadedImg = <HTMLImageElement>event.target;
                this._img = loadedImg;
                this._width = loadedImg.width;
                this._height = loadedImg.height;
                this.transform(0);
                resolve(this);
            };
            img.src = url;
        });
    }

    public transform(x: number): void {
        const xPos = x * this._distance * this._xMaximum;
        this._img.style.transform = `translate3d(${xPos}px, 0, 0)`;
    }

    public getSize(): number[] {
      return [this._width, this._height];
    }

    public scale(scale: number, width: number, height: number, xRootOffset: number, parentWidth: number): void {
      this._img.style.width = `${this._width * scale / width * 100}%`;
      this._img.style.height = `${this._height * scale / height * 100}%`;

      this._img.style.top = `${this._params.yOffset * scale}px`;
      this._xMaximum = xRootOffset;
      this._xOffset = this._params.xOffset * scale - xRootOffset * this._params.transformOffset;
      this._img.style.left = `${this._xOffset}px`
    }
}

export class ParallaxScreen {
    private _layers: ParallaxLayer[];
    private _raf: number;
    private _parallaxCamera: ParallaxCamera;
    private _ready: boolean;
    private _root: HTMLElement;
    private _landscape: boolean;
    private _currentX: number;

    constructor(screenshots: string[], parallaxLayerParams: number[][]) {
        this._ready = false;
        this._layers = [];
        const maxAngle = Math.PI / 6;
        this._parallaxCamera = new ParallaxCamera(maxAngle);
        this._landscape = false;
        this._currentX = 0;

        const layerPromises = screenshots.map((url: string, i: number) => {
            const screenshotPosition = parallaxLayerParams[i];
            const params = {
                xOffset: screenshotPosition[0],
                yOffset: screenshotPosition[1],
                distance: screenshotPosition[2],
                transformOffset: screenshotPosition[3],
            };
            const layer = new ParallaxLayer(params);
            return layer.loadImage(url);
        });

        Promise.all(layerPromises).then((layers) => {
            this._layers = layers;
            this._ready = true;
        });
    }

    private resizeHandler(): void {
        setTimeout(() => this.setPosition(), 100);
    }

    setPosition = () => {
        if (this._ready && this._root && this._root.parentElement) {
            const background = this._layers[0];
            const [width, height] = background.getSize();

            const rootStyle = window.getComputedStyle(this._root.parentElement);
            const rootHeight = parseInt(rootStyle.getPropertyValue('height'));
            const rootWidth = parseInt(rootStyle.getPropertyValue('width'));

            if (!rootHeight || !rootWidth) {
              return false;
            }

            const scale = rootHeight / height;
            const xOffset = (1 / 2) * (width * scale - rootWidth);
            this._layers.forEach((layer) => layer.scale(scale, rootWidth, rootHeight, xOffset, width));

            this._landscape = rootWidth < rootHeight;
        }
    }

    public show(): boolean {
        if (this._ready && this._root && this._root.parentElement) {
            window.addEventListener('resize', (this.resizeHandler).bind(this));
            const background = this._layers[0];
            const [width, height] = background.getSize();

            const rootStyle = window.getComputedStyle(this._root.parentElement);
            const rootHeight = parseInt(rootStyle.getPropertyValue('height'));
            const rootWidth = parseInt(rootStyle.getPropertyValue('width'));

            if (!rootHeight || !rootWidth) {
              return false;
            }

            const scale = rootHeight / height;
            const xOffset = (1 / 2) * (width * scale - rootWidth);
            this._layers.forEach((layer) => {
              layer.scale(scale, rootWidth, rootHeight, xOffset, width);
              layer.attachTo(this._root);
            });
            this._parallaxCamera.load();
            this._raf = requestAnimationFrame(this.update);

            this._landscape = rootWidth < rootHeight;
            return true;
        }
        return false;
    }

    public hide(): void {
        this._parallaxCamera.unload();
    }

    public attachTo(element: HTMLElement): void {
      this._root = element;
    }

    private transformLayers(x: number): void {
        this._currentX += (x - this._currentX) / 30;
        this._layers.forEach(l => l.transform(this._currentX));
    }

    private update = () => {
        this._raf = requestAnimationFrame(this.update);
        this._parallaxCamera.update();
        const cameraPosition = this._parallaxCamera.position();
        const cameraAzimuthAngle = cameraPosition.azimuth();
        // dividing angle by maxAngle will normalize the value between [-1, 1]
        const normalizedAngle = cameraAzimuthAngle / this._parallaxCamera.maxAngle();
        this.transformLayers(normalizedAngle);
    }
}
