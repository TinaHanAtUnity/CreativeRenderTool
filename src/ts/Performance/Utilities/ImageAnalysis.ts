//
// NOTE! for the color tinting experiment only
//

import { Asset } from 'Ads/Models/Assets/Asset';
import { Swatch } from 'Performance/Utilities/Swatch';
import { PQueue } from 'Performance/Utilities/PQueue';
import { Box } from 'Performance/Utilities/Box';
import { CacheApi } from 'Core/Native/Cache';

const PALETTE_COLOR_COUNT = 16;

export class ImageAnalysis {

    public static analyseImage(cache: CacheApi, asset: Asset): Promise<Swatch[]> {
        return new Promise<Swatch[]>(resolve => {
            ImageAnalysis.getImagePixelData(cache, asset).then((rgbaData: Uint8ClampedArray) => {
                const swatches = ImageAnalysis.quantize(rgbaData, PALETTE_COLOR_COUNT);
                resolve(swatches);
            });
        });
    }

    public static quantize(pixels: Uint8ClampedArray, maxColors: number): Swatch[] {
        const colors = ImageAnalysis.getHistogram(pixels);
        const swatches = [];

        if (colors.length <= maxColors) {
            for (const color of colors) {
                const [r, g, b, population] = color;
                const swatch = new Swatch([r, g, b], population);
                swatches.push(swatch);
            }

            swatches.sort((a, b) => b.population - a.population);
            return swatches;
        }

        // split color space into boxes of ~equal size using median cut
        const box = new Box(colors);
        const pq = new PQueue<Box>((a: Box, b: Box) => b.volume() - a.volume());

        pq.push(box);
        while (pq.size() < maxColors) {
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
        for (let i = 0; i < length; i++) {
            const largestBox = pq.pop();
            if (!largestBox) {
                continue;
            }

            const swatch = new Swatch(largestBox.avg(), largestBox.population());
            swatches.push(swatch);
        }

        swatches.sort((a, b) => b.population - a.population);
        return swatches;
    }

    private static getHistogram(pixels: Uint8ClampedArray): number[][] {
        const histogram: number[][] = [];
        const histogramMap: { [id: number]: number[] } = {};
        const length: number = pixels.length;

        // Check every 5th pixel (4 channels) instead of scaling the canvas, since
        // imageSmoothingEnabled did not work well enough and generated extra colors
        for (let i = 0; i < length; i += 4 * 5) {
            // assuming we don't have transparent end screens, skip alpha channel
            const pixelKey: number = pixels[i] * 0x10000 + pixels[i + 1] * 0x100 + pixels[i + 2];
            // color is an array where [r, g, b, population]
            let color = histogramMap[pixelKey];
            if (!color) {
                color = [pixels[i], pixels[i + 1], pixels[i + 2], 0];
                histogramMap[pixelKey] = color;
                histogram.push(color);
            }

            // calculate population to get color density
            color[3] += 1;
        }

        return histogram;
    }

    public static getImagePixelData(cache: CacheApi, asset: Asset): Promise<Uint8ClampedArray> {
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

            ImageAnalysis.getImageSrc(cache, asset).then((src: string) => {
                img.crossOrigin = 'Anonymous';
                img.src = src;
            });
        });
    }

    public static getImageSrc(cache: CacheApi, asset: Asset): Promise<string> {
        return new Promise((resolve) => {
            const fileId = asset.getFileId();
            const originalUrl = asset.getOriginalUrl();
            const imageExt = originalUrl.split('.').pop();

            if (fileId) {
                cache.getFileContent(fileId, 'Base64').then((res: string) => {
                    resolve(`data:image/${imageExt};base64,${res}`);
                }).catch(() => {
                    resolve(originalUrl);
                });
            } else {
                resolve(originalUrl);
            }
        });
    }
}
