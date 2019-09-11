import { ParallaxCamera } from 'Performance/Utilities/ParallaxCamera';
import { ParallaxLayer } from 'Performance/Utilities/ParallaxLayer';

type OnDownloadCallback = (event: Event) => void;

const requestAnimationFrame = window.requestAnimationFrame || window.webkitRequestAnimationFrame;
const cancelAnimationFrame = window.cancelAnimationFrame || window.webkitCancelAnimationFrame;

const MAX_DEVICE_ROTATION = Math.PI / 6;

export class ParallaxScreen {
    private _layers: ParallaxLayer[];
    private _raf: number;
    private _parallaxCamera: ParallaxCamera;
    private _ready: boolean;
    private _rootElement: HTMLElement;
    private _currentX: number;

    constructor(screenshots: string[], parallaxLayerParams: number[][], onDownloadCallback: OnDownloadCallback) {
        this._ready = false;
        this._layers = [];
        this._parallaxCamera = new ParallaxCamera(MAX_DEVICE_ROTATION);
        this._currentX = 0;

        const layerPromises = screenshots.map((url: string, i: number) => {
            const screenshotPosition = parallaxLayerParams[i];
            const params = {
                xOffset: screenshotPosition[0],
                yOffset: screenshotPosition[1],
                distance: screenshotPosition[2],
                transformOffset: screenshotPosition[3]
            };
            const layer = new ParallaxLayer(params);
            return layer.loadImage(url, onDownloadCallback);
        });

        Promise.all(layerPromises).then((layers) => {
            this._layers = layers;
            this._ready = true;
        });
    }

    private resizeHandler(): void {
        setTimeout(() => this.resizeLayers(), 100);
    }

    private resizeLayers = (): boolean => {
        if (!this._ready || !this._rootElement || !this._rootElement.parentElement) {
            return false;
        }

        const background = this._layers[0];
        const [width, height] = background.getSize();

        const rootStyle = window.getComputedStyle(this._rootElement.parentElement);
        const rootHeight = parseInt(rootStyle.getPropertyValue('height'), 10);
        const rootWidth = parseInt(rootStyle.getPropertyValue('width'), 10);

        if (!rootHeight || !rootWidth) {
            return false;
        }

        const scale = rootHeight / height;
        const xOffset = (1 / 2) * (width * scale - rootWidth);
        this._layers.forEach((layer) => layer.scale(scale, rootWidth, rootHeight, xOffset, width));
        return true;
    }

    public show(): boolean {
        if (!this._ready || !this._rootElement || !this._rootElement.parentElement) {
            return false;
        }

        window.addEventListener('resize', (this.resizeHandler).bind(this));

        if (!this.resizeLayers()) {
            return false;
        }

        this._layers.forEach((layer) => layer.attachTo(this._rootElement));
        this._parallaxCamera.load();
        this._raf = requestAnimationFrame(this.update);
        return true;
    }

    public hide(): void {
        this._parallaxCamera.unload();
        cancelAnimationFrame(this._raf);
    }

    public attachTo(element: HTMLElement): void {
      this._rootElement = element;
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
