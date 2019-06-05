import { Asset } from 'Ads/Models/Assets/Asset';
import { ICoreApi } from 'Core/ICore';
import { IEndScreenParameters } from 'Ads/Views/EndScreen';
import { PerformanceEndScreen } from 'Performance/Views/PerformanceEndScreen';
import { PerformanceCampaign } from 'Performance/Models/PerformanceCampaign';
import { HttpKafka, KafkaCommonObjectType } from 'Core/Utilities/HttpKafka';

const PALETTE_COLOR_COUNT = 16;
const BACKGROUND_MIN_BRIGHTNESS = 0.85;
const BUTTON_BRIGHTNESS = 0.4;
const GAME_NAME_BRIGHTNESS = 0.25;

interface IColorTheme {
    light: number[];
    medium: number[];
    dark: number[];
};

// https://en.wikipedia.org/wiki/HSL_and_HSV
function RGBToHSL(r: number, g: number, b: number): number[] {
    const rf = r / 255;
    const gf = g / 255;
    const bf = b / 255;

    const max = Math.max(rf, gf, bf);
    const min = Math.min(rf, gf, bf);
    const chroma = max - min;

    const l = (max + min) / 2;
    let hue = 0;
    let saturation = 0;

    if (max === min) {
        hue = 0;
    } else if (max === rf) {
        hue = (gf - bf) / chroma;
    } else if (max === gf) {
        hue = ((bf - rf) / chroma) + 2;
    } else if (max === bf) {
        hue = ((rf - gf) / chroma) + 4;
    }

    hue = (hue * 60 + 360) % 360;

    if (l > 0 && l < 1) {
        saturation = chroma / (1 - Math.abs(max + min - 1));
    }

    return [hue, saturation, l];
}

function HSLToRGB(h: number, s: number, l: number): number[] {
    const chroma = (1 - Math.abs(l * 2 - 1)) * s;
    const tmpH = (h / 60);
    const x = chroma * (1 - Math.abs((tmpH % 2) - 1));
    const m = l - chroma / 2;

    let rgb = [0, 0, 0];

    if (h === 0) {
        rgb = [0, 0, 0];
    } else if (tmpH >= 0 && tmpH <= 1) {
        rgb = [chroma, x, 0];
    } else if (tmpH >= 1 && tmpH <= 2) {
        rgb = [x, chroma, 0];
    } else if (tmpH >= 2 && tmpH <= 3) {
        rgb = [0, chroma, x];
    } else if (tmpH >= 3 && tmpH <= 4) {
        rgb = [0, x, chroma];
    } else if (tmpH >= 4 && tmpH <= 5) {
        rgb = [x, 0, chroma];
    } else if (tmpH >= 5 && tmpH <= 6) {
        rgb = [chroma, 0, x];
    }

    rgb[0] = Math.round((rgb[0] + m) * 0xFF);
    rgb[1] = Math.round((rgb[1] + m) * 0xFF);
    rgb[2] = Math.round((rgb[2] + m) * 0xFF);

    return rgb;
}

class Box {
    private _minR: number;
    private _minG: number;
    private _minB: number;
    private _maxR: number;
    private _maxG: number;
    private _maxB: number;
    private _avgR: number;
    private _avgG: number;
    private _avgB: number;
    private _diffR: number;
    private _diffG: number;
    private _diffB: number;
    private _colors: number[][];
    private _volume: number;
    private _population: number;

    constructor(colors: number[][]) {
        this._minR = 256;
        this._minG = 256;
        this._minB = 256;
        this._maxR = -1;
        this._maxG = -1;
        this._maxB = -1;
        this._avgR = 0;
        this._avgG = 0;
        this._avgB = 0;

        let population = 0;
        for (const color of colors) {
            const [r, g, b, colorPopulation] = color;

            if (r < this._minR) {
                this._minR = r;
            }
            if (g < this._minG) {
                this._minG = g;
            }
            if (b < this._minB) {
                this._minB = b;
            }
            if (r > this._maxR) {
                this._maxR = r;
            }
            if (g > this._maxG) {
                this._maxG = g;
            }
            if (b > this._maxB) {
                this._maxB = b;
            }

            population += colorPopulation;

            this._avgR += colorPopulation * r;
            this._avgG += colorPopulation * g;
            this._avgB += colorPopulation * b;
        }

        this._diffR = this._maxR - this._minR + 1;
        this._diffG = this._maxG - this._minG + 1;
        this._diffB = this._maxB - this._minB + 1;

        this._volume = this.volume();

        this._avgR = Math.round(this._avgR / population);
        this._avgG = Math.round(this._avgG / population);
        this._avgB = Math.round(this._avgB / population);

        this._colors = colors;
        this._population = population;
    }

    public population(): number {
        return this._population;
    }

    public volume(): number {
        return this._diffR * this._diffG * this._diffB;
    }

    public avg(): number[] {
        return [this._avgR, this._avgG, this._avgB];
    }

    public split(): Box[] {
        if (this.volume() <= 1) {
            return [this];
        }
        const colorChannel = this.longestColorChannel();
        const sortFn = (a: number[], b: number[]) => (b[colorChannel] - a[colorChannel]);
        const sortedColors = this._colors.sort(sortFn);
        const length = sortedColors.length;
        const splitPoint = Math.floor(length / 2);

        return [
            new Box(sortedColors.slice(0, splitPoint)),
            new Box(sortedColors.slice(splitPoint, length - 1))
        ];
    }

    private longestColorChannel(): number {
        const rLength = this._maxR - this._minR;
        const gLength = this._maxG - this._minG;
        const bLength = this._maxB - this._minB;

        if (rLength >= gLength && rLength >= bLength) {
            return 0;
        } else if (gLength >= rLength && gLength >= bLength) {
            return 1;
        } else {
            return 2;
        }
    }
}

class Swatch {
    private _color: number[];
    private _hsl: number[];
    private _r: number;
    private _g: number;
    private _b: number;

    public population: number;
    public selected: boolean;

    constructor(color: number[], population: number) {
        const [r, g, b] = color;
        this._r = r;
        this._g = g;
        this._b = b;
        this._color = color;

        this.population = population;
        this.selected = false;
    }

    public rgb(): number[] {
        return this._color;
    }

    public hsl(): number[] {
        if (!this._hsl) {
            this._hsl = RGBToHSL(this._r, this._g, this._b);
        }
        return this._hsl;
    }

    public getColorTheme(): IColorTheme {
        const hsl = this.hsl();
        const lightColor = HSLToRGB(hsl[0], hsl[1], Math.max(hsl[2], BACKGROUND_MIN_BRIGHTNESS));
        const mediumColor = HSLToRGB(hsl[0], hsl[1], BUTTON_BRIGHTNESS);
        const darkColor = HSLToRGB(hsl[0], hsl[1], GAME_NAME_BRIGHTNESS);
        return {
            light: lightColor,
            medium: mediumColor,
            dark: darkColor
        };
    }
}

class PQueue {
    private _arr: Box[];
    private _comparator: (a: Box, b: Box) => number;

    constructor(comparator: (a: Box, b: Box) => number) {
        this._arr = [];
        this._comparator = comparator;
    }

    public push(elem: Box) {
        this._arr.push(elem);
        this._arr.sort(this._comparator);
    }

    public pop(): Box | undefined {
        return this._arr.shift();
    }

    public size(): number {
        return this._arr.length;
    }
}

function getHistogram(pixels: Uint8ClampedArray): number[][] {
    const histogram: number[][] = [];
    const histogramMap: { [id: number]: number[] } = {};
    const length: number = pixels.length;

    // Check every 5th pixel (4 channels) instead of scaling the canvas, since
    // imageSmoothingEnabled did not work well enough and generated extra colors
    for (let i = 0; i < length; i += 4 * 5) {
        // assuming we don't have transparent end screens, skip alpha channel
        const pixelKey: number = pixels[i] * 0x10000 + pixels[i + 1] * 0x100 + pixels[i + 2];
        let color = histogramMap[pixelKey];
        if (!color) {
            color = [pixels[i], pixels[i + 1], pixels[i + 2], 0];
            histogramMap[pixelKey] = color;
            histogram.push(color);
        }
        color[3] += 1;
    }

    return histogram;
}

function quantize(pixels: Uint8ClampedArray, maxColors: number): { swatches: Swatch[]; dominant: Swatch | undefined } {
    const colors = getHistogram(pixels);
    const swatches = [];
    let dominantSwatch;

    if (colors.length <= maxColors) {
        for(const color of colors) {
            const [r, g, b, population] = color;
            const swatch = new Swatch([r, g, b], population);
            swatches.push(swatch);
            if (!dominantSwatch || swatch.population > dominantSwatch.population) {
                dominantSwatch = swatch;
            }
        }

        return {
            swatches: swatches,
            dominant: dominantSwatch
        };
    }

    // split color space into boxes of ~equal size using median cut
    const box = new Box(colors);
    const pq = new PQueue((a: Box, b: Box) => b.volume() - a.volume());

    pq.push(box);
    while(pq.size() < maxColors) {
        const largestBox = pq.pop();
        if (!largestBox) {
            break;
        }
        const boxes = largestBox.split();
        boxes.forEach((b: Box) => {
            pq.push(b);
        });

        // break if couldn't divide the smallest box
        if (boxes.length < 2) {
            break;
        }
    }

    const length = pq.size();
    for(let i = 0; i < length; i++) {
        const largestBox = pq.pop();
        if (!largestBox) {
            continue;
        }

        const swatch = new Swatch(largestBox.avg(), largestBox.population());
        swatches.push(swatch);
        if (!dominantSwatch || swatch.population > dominantSwatch.population) {
            dominantSwatch = swatch;
        }
    }

    return {
        swatches: swatches,
        dominant: dominantSwatch
    };
}

export class PerformanceColorTintingEndScreen extends PerformanceEndScreen {
    private _coreApi: ICoreApi;
    private _performanceCampaign: PerformanceCampaign;
    private _image: Asset | undefined;

    constructor(parameters: IEndScreenParameters, campaign: PerformanceCampaign, country?: string) {
        super(parameters, campaign, country);

        this._performanceCampaign = campaign;
        this._coreApi = parameters.core;
    }

    public render(): void {
        super.render();

        const squareImage = this._performanceCampaign.getSquare();
        const landscapeImage = this._performanceCampaign.getLandscape();
        const portraitImage = this._performanceCampaign.getPortrait();

        const deviceInfo = this._coreApi.DeviceInfo;
        Promise.all([deviceInfo.getScreenWidth(), deviceInfo.getScreenHeight()])
        .then(([screenWidth, screenHeight]) => {
            const isLandscape = screenWidth > screenHeight;
            let image;
            if (squareImage) {
                image = squareImage;
            } else if (isLandscape && portraitImage) {
                image = portraitImage; // when the device is in landscape mode, we are showing a portrait image
            } else if (landscapeImage) {
                image = landscapeImage;
            } else {
                image = portraitImage;
            }

            if (image) {
                this.getImagePixelData(image).then((rgbaData: Uint8ClampedArray) => {
                    const swatches = quantize(rgbaData, PALETTE_COLOR_COUNT);
                    if (!swatches || !swatches.dominant) {
                        this.sendKafkaEvent('invalid_swatches');
                        return;
                    }

                    const colorTheme = swatches.dominant.getColorTheme();
                    this.applyColorTheme(colorTheme);
                }).catch((msg: string) => {
                    this.sendKafkaEvent(msg);
                });
            }
        });
    }

    private applyColorTheme(colorTheme: IColorTheme): void {
        const { light, medium, dark } = colorTheme;
        if (!light || !medium || !dark) {
            this.sendKafkaEvent('invalid_theme');
            return;
        }

        const backgroundElement: HTMLElement | null = this._container.querySelector('.end-screen-info-background');
        const downloadContainer: HTMLElement | null = this._container.querySelector('.download-container');
        const gameNameContainer: HTMLElement | null = this._container.querySelector('.name-container');
        const gameRatingContainer: HTMLElement | null = this._container.querySelector('.game-rating-count');
        const privacyIconContainer: HTMLElement | null = this._container.querySelector('.bottom-container .icon-gdpr');
        const unityIconContainer: HTMLElement | null = this._container.querySelector('.bottom-container .unityads-logo');

        if (backgroundElement && downloadContainer && gameNameContainer && gameRatingContainer && privacyIconContainer && unityIconContainer) {
            backgroundElement.style.backgroundColor = `rgb(${light.join(',')})`;
            downloadContainer.style.background = `rgb(${medium.join(',')})`;
            gameNameContainer.style.color = `rgb(${dark.join(',')})`;
            gameRatingContainer.style.color = `rgb(${dark.join(',')})`;
            privacyIconContainer.style.color = `rgb(${dark.join(',')})`;
            unityIconContainer.style.color = `rgb(${dark.join(',')})`;
        }
    }

    private getImagePixelData(asset: Asset): Promise<Uint8ClampedArray> {
        return new Promise((resolve, reject) => {
            const img = new Image();
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');

            img.addEventListener('load', () => {
                if (ctx) {
                    const { width, height } = img;
                    canvas.width = width;
                    canvas.height = height;
                    ctx.drawImage(img, 0, 0, width, height);
                    const imgData = ctx.getImageData(0, 0, width, height);
                    resolve(imgData.data);
                } else {
                    reject('context_failed');
                }
            });

            img.addEventListener('error', () => {
                reject('image_load_failed');
            });

            this.getImageSrc(asset).then((src: string) => {
                img.crossOrigin = 'Anonymous';
                img.src = src;
            });
        });
    }

    private getImageSrc(asset: Asset): Promise<string> {
        return new Promise((resolve) => {
            const fileId = asset.getFileId();
            const originalUrl = asset.getOriginalUrl();
            const imageExt = originalUrl.split('.').pop();

            if(fileId) {
                this._coreApi.Cache.getFileContent(fileId, 'Base64').then((res: string) => {
                    resolve(`data:image/${imageExt};base64,${res}`);
                }).catch(() => {
                    resolve(originalUrl);
                });
            } else {
                resolve(originalUrl);
            }
        });
    }

    private sendKafkaEvent(message: string) {
        const kafkaObject: { [key: string]: unknown } = {};
        kafkaObject.type = 'color_tinting_data';
        kafkaObject.auctionId = this._performanceCampaign.getSession().getId();
        kafkaObject.message = message;
        HttpKafka.sendEvent('ads.sdk2.events.aui.experiments.json', KafkaCommonObjectType.ANONYMOUS, kafkaObject);
    }
}
