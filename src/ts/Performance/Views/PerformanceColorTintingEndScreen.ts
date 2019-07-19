import { Asset } from 'Ads/Models/Assets/Asset';
import { ICoreApi } from 'Core/ICore';
import { IEndScreenParameters } from 'Ads/Views/EndScreen';
import { PerformanceEndScreen } from 'Performance/Views/PerformanceEndScreen';
import { PerformanceCampaign } from 'Performance/Models/PerformanceCampaign';
import { HttpKafka, KafkaCommonObjectType } from 'Core/Utilities/HttpKafka';
import { IColorTheme } from 'Performance/Utilities/Swatch';
import { quantize } from 'Performance/Utilities/ColorUtils';

const PALETTE_COLOR_COUNT = 16;

export class PerformanceColorTintingEndScreen extends PerformanceEndScreen {
    private _coreApi: ICoreApi;
    private _performanceCampaign: PerformanceCampaign;
    private _image: Asset | undefined;
    private _startTime: number;

    constructor(parameters: IEndScreenParameters, campaign: PerformanceCampaign, country?: string) {
        super(parameters, campaign, country);

        this._performanceCampaign = campaign;
        this._coreApi = parameters.core;
    }

    public render(): void {
        super.render();
        this._startTime = new Date().getTime();

        document.documentElement.classList.add('color-tinting-endscreen');

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
        const chinaAdvertisementElement: HTMLElement | null = this._container.querySelector('.bottom-container .china-advertisement');

        if (backgroundElement && downloadContainer && gameNameContainer && gameRatingContainer && privacyIconContainer && unityIconContainer && chinaAdvertisementElement) {
            backgroundElement.style.backgroundColor = `rgb(${light.join(',')})`;
            downloadContainer.style.background = `rgb(${medium.join(',')})`;
            gameNameContainer.style.color = `rgb(${dark.join(',')})`;
            gameRatingContainer.style.color = `rgb(${dark.join(',')})`;
            privacyIconContainer.style.color = `rgb(${dark.join(',')})`;
            unityIconContainer.style.color = `rgb(${dark.join(',')})`;
            chinaAdvertisementElement.style.color = `rgb(${dark.join(',')})`;
            this.sendKafkaEvent('theme', colorTheme);
        } else {
            this.sendKafkaEvent('theming_failed');
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

            if (fileId) {
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

    private sendKafkaEvent(message: string, theme?: IColorTheme) {
        const kafkaObject: { [key: string]: unknown } = {};
        const timeSinceStart = new Date().getTime() - this._startTime;
        kafkaObject.type = 'color_tinting_data';
        kafkaObject.auctionId = this._performanceCampaign.getSession().getId();
        kafkaObject.message = message;
        kafkaObject.time_since_start = timeSinceStart;
        if (theme) {
            kafkaObject.theme = theme;
        }
        HttpKafka.sendEvent('ads.sdk2.events.aui.experiments.json', KafkaCommonObjectType.ANONYMOUS, kafkaObject);
    }
}
