
type OnDownloadCallback = (event: Event) => void;

export interface IParallaxLayerParams {
  xOffset: number;
  yOffset: number;
  distance: number;
  transformOffset: number;
}

export class ParallaxLayer {
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

    public loadImage(url: string, onDownloadCallback: OnDownloadCallback): Promise<ParallaxLayer> {
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
            img.addEventListener('click', onDownloadCallback);
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
      this._img.style.left = `${this._xOffset}px`;
    }
}
