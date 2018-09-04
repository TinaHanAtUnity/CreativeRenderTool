import { EndScreen, IEndScreenParameters } from 'Views/EndScreen';
import { PerformanceCampaign } from 'Models/Campaigns/PerformanceCampaign';
import { Platform } from 'Constants/Platform';

import { SmartCloseButtonTest } from 'Models/ABGroup';
import { Diagnostics } from 'Utilities/Diagnostics';

export class PerformanceEndScreen extends EndScreen {
    private _campaign: PerformanceCampaign;
    private _canvas: HTMLCanvasElement;

    constructor(parameters: IEndScreenParameters, campaign: PerformanceCampaign) {
        super(parameters);

        const adjustedRating: number = campaign.getRating() * 20;
        this._templateData = {
            'gameName': campaign.getGameName(),
            'gameIcon': campaign.getGameIcon().getUrl(),
            // NOTE! Landscape orientation should use a portrait image and portrait orientation should use a landscape image
            'endScreenLandscape': campaign.getPortrait().getUrl(),
            'endScreenPortrait': campaign.getLandscape().getUrl(),
            'rating': adjustedRating.toString(),
            'ratingCount': this._localization.abbreviate(campaign.getRatingCount()),
            'endscreenAlt': this.getEndscreenAlt(campaign)
        };

        this._campaign = campaign;
    }

    public show(): void {
        super.show();

        if (SmartCloseButtonTest.isValid(this._abGroup)) {
            try {
                if (typeof this._canvas === 'undefined') {
                    const closeRegion = <HTMLElement>this._container.querySelector('.btn-close-region');
                    const closeIcon = <HTMLElement>this._container.querySelector('span.icon-close');
                    this._createCanvas().then(() => {
                        const canvas = this._canvas;
                        const ctx = <CanvasRenderingContext2D>canvas.getContext('2d');

                        const data = ctx.getImageData(closeRegion.offsetLeft + closeIcon.offsetLeft, closeRegion.offsetTop + closeIcon.offsetTop, closeIcon.offsetWidth, closeIcon.offsetHeight).data;

                        this._calculateWeightedAverageColor(data).then(res => {
                            const {weightedR, weightedG, weightedB} = res;
                            if (PerformanceEndScreen._isDark(weightedR, weightedG, weightedB)) {
                                closeRegion.classList.add('light');
                            } else {
                                closeRegion.classList.add('dark');
                            }

                            /* Clean up */
                            (<HTMLElement>this._canvas.parentElement).removeChild(this._canvas);
                        });
                    });
                }
            } catch (e) {
                this._nativeBridge.Sdk.logError('smart color button failed: ' + e);

                Diagnostics.trigger('smart_color_button_failed', {
                    message: e.message
                });
            }
        }
    }

    protected onDownloadEvent(event: Event): void {
        event.preventDefault();
        this._handlers.forEach(handler => handler.onEndScreenDownload({
            clickAttributionUrl: this._campaign.getClickAttributionUrl(),
            clickAttributionUrlFollowsRedirects: this._campaign.getClickAttributionUrlFollowsRedirects(),
            bypassAppSheet: this._campaign.getBypassAppSheet(),
            appStoreId: this._campaign.getAppStoreId(),
            store: this._campaign.getStore(),
            adUnitStyle: this._adUnitStyle
        }));
    }

    private _createCanvas(): Promise<void> {
        return new Promise((resolve) => {
            const backgroundImage = <HTMLElement>this._container.querySelector('.game-background-portrait');

            const img = new Image();

            this._canvas = document.createElement('canvas');

            this._canvas.width = backgroundImage.offsetWidth;
            this._canvas.height = backgroundImage.offsetHeight;
            this._canvas.style.top = '0';
            this._canvas.style.position = 'absolute';
            this._canvas.style.pointerEvents = 'none';
            this._canvas.style.visibility = 'hidden';

            const ctx = <CanvasRenderingContext2D>this._canvas.getContext('2d');

            img.onload = () => {
                const canvasWidth = ctx.canvas.width;
                const canvasHeight = ctx.canvas.height;

                const imageWidth = img.width;
                const imageHeight = img.height;

                const ratio = Math.min(canvasWidth / imageWidth, canvasHeight / imageHeight);

                let targetWidth = imageWidth * ratio;
                let targetHeight = imageHeight * ratio;

                let coverRatio = 1;

                if (targetWidth < canvasWidth) {
                    coverRatio = canvasWidth / targetWidth;
                }

                if (Math.abs(coverRatio - 1) < 1e-14 && targetHeight < canvasHeight) {
                    coverRatio = canvasHeight / targetHeight;
                }

                targetWidth *= coverRatio;
                targetHeight *= coverRatio;

                let imageSubWidth = imageWidth / (targetWidth / canvasWidth);
                let imageSubHeight = imageHeight / (targetHeight / canvasHeight);

                if (imageSubWidth > imageWidth) {
                    imageSubWidth = imageWidth;
                }

                if (imageSubHeight > imageHeight) {
                    imageSubHeight = imageHeight;
                }

                // Always center image in container
                const offsetX = (imageWidth - imageSubWidth) * 0.5;
                const offsetY = (imageHeight - imageSubHeight) * 0.5;

                ctx.drawImage(img, offsetX, offsetY, imageSubWidth, imageSubHeight, 0, 0, canvasWidth, canvasHeight);
                resolve();
            };

            /* Canvas CORS fix */
            img.crossOrigin = 'Anonymous';

            let sampleImage = this._campaign.getLandscape().getUrl();

            /* On iOS cached images cannot passed CORS, so we use original URL */
            if (this._nativeBridge.getPlatform() === Platform.IOS) {
                sampleImage = this._campaign.getLandscape().getOriginalUrl();
            }

            img.src = sampleImage.replace('file://', '');
            this._container.appendChild(this._canvas);
        });
    }

    private _calculateWeightedAverageColor(data: Uint8ClampedArray): Promise<{ weightedR: number; weightedG: number; weightedB: number }> {
        return new Promise((resolve) => {
            let totalR = 0;
            let totalG = 0;
            let totalB = 0;
            let weightedR = 0;
            let weightedG = 0;
            let weightedB = 0;
            let weightTotal = 0;
            const pixels = data.length;

            for (let i = 0; i < pixels; i += 4) {
                // [r1, g1, b1, a1, r2, g2, b2, a2, r3 ...]
                const r = data[i];
                const g = data[i + 1];
                const b = data[i + 2];
                const a = data[i + 3];

                totalR += r;
                totalG += g;
                totalB += b;

                const alphaWeight = a / 255;
                weightedR += r * alphaWeight;
                weightedG += g * alphaWeight;
                weightedB += b * alphaWeight;
                weightTotal += alphaWeight;

                // Resolve promise once we are done with all pixels
                if (i + 4 >= pixels) {
                    weightedR = weightedR / weightTotal | 0;
                    weightedG = weightedG / weightTotal | 0;
                    weightedB = weightedB / weightTotal | 0;

                    resolve({weightedR, weightedG, weightedB});
                }
            }
        });
    }

    private static _isDark(r: number, g: number, b: number) {
        return PerformanceEndScreen._getBrightness(r, g, b) < 128;
    }

    private static _getBrightness(r: number, g: number, b: number) {
        // http://www.w3.org/TR/AERT#color-contrast
        return (r * 299 + g * 587 + b * 114) / 1000;
    }
}
