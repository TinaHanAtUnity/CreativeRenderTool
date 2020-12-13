//
// NOTE! for the color tinting experiment only
//
import { Swatch } from 'Performance/Utilities/Swatch';
import { PQueue } from 'Performance/Utilities/PQueue';
import { Box } from 'Performance/Utilities/Box';
const PALETTE_COLOR_COUNT = 16;
export class ImageAnalysis {
    static analyseImage(imageUrl) {
        return new Promise(resolve => {
            ImageAnalysis.getImagePixelData(imageUrl).then((rgbaData) => {
                const swatches = ImageAnalysis.quantize(rgbaData, PALETTE_COLOR_COUNT);
                resolve(swatches);
            });
        });
    }
    static quantize(pixels, maxColors) {
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
        const pq = new PQueue((a, b) => b.volume() - a.volume());
        pq.push(box);
        while (pq.size() < maxColors) {
            const largestBox = pq.pop();
            if (!largestBox) {
                break;
            }
            const boxes = largestBox.split();
            boxes.forEach((b) => {
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
    static getHistogram(pixels) {
        const histogram = [];
        const histogramMap = {};
        const length = pixels.length;
        // Check every 5th pixel (4 channels) instead of scaling the canvas, since
        // imageSmoothingEnabled did not work well enough and generated extra colors
        for (let i = 0; i < length; i += 4 * 5) {
            // assuming we don't have transparent end screens, skip alpha channel
            const pixelKey = pixels[i] * 0x10000 + pixels[i + 1] * 0x100 + pixels[i + 2];
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
    static getImagePixelData(imageUrl) {
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
                }
                else {
                    reject('context_failed');
                }
            });
            img.addEventListener('error', () => {
                reject('image_load_failed');
            });
            img.crossOrigin = 'Anonymous';
            img.src = imageUrl;
        });
    }
    static getImageSrc(cache, asset) {
        return new Promise((resolve) => {
            const fileId = asset.getFileId();
            const originalUrl = asset.getOriginalUrl();
            const imageExt = originalUrl.split('.').pop();
            if (fileId) {
                cache.getFileContent(fileId, 'Base64').then((res) => {
                    resolve(`data:image/${imageExt};base64,${res}`);
                }).catch(() => {
                    resolve(originalUrl);
                });
            }
            else {
                resolve(originalUrl);
            }
        });
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiSW1hZ2VBbmFseXNpcy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NyYy90cy9QZXJmb3JtYW5jZS9VdGlsaXRpZXMvSW1hZ2VBbmFseXNpcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxFQUFFO0FBQ0YsOENBQThDO0FBQzlDLEVBQUU7QUFHRixPQUFPLEVBQUUsTUFBTSxFQUFFLE1BQU0sOEJBQThCLENBQUM7QUFDdEQsT0FBTyxFQUFFLE1BQU0sRUFBRSxNQUFNLDhCQUE4QixDQUFDO0FBQ3RELE9BQU8sRUFBRSxHQUFHLEVBQUUsTUFBTSwyQkFBMkIsQ0FBQztBQUdoRCxNQUFNLG1CQUFtQixHQUFHLEVBQUUsQ0FBQztBQUUvQixNQUFNLE9BQU8sYUFBYTtJQUVmLE1BQU0sQ0FBQyxZQUFZLENBQUMsUUFBZ0I7UUFDdkMsT0FBTyxJQUFJLE9BQU8sQ0FBVyxPQUFPLENBQUMsRUFBRTtZQUNuQyxhQUFhLENBQUMsaUJBQWlCLENBQUMsUUFBUSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsUUFBMkIsRUFBRSxFQUFFO2dCQUMzRSxNQUFNLFFBQVEsR0FBRyxhQUFhLENBQUMsUUFBUSxDQUFDLFFBQVEsRUFBRSxtQkFBbUIsQ0FBQyxDQUFDO2dCQUN2RSxPQUFPLENBQUMsUUFBUSxDQUFDLENBQUM7WUFDdEIsQ0FBQyxDQUFDLENBQUM7UUFDUCxDQUFDLENBQUMsQ0FBQztJQUNQLENBQUM7SUFFTSxNQUFNLENBQUMsUUFBUSxDQUFDLE1BQXlCLEVBQUUsU0FBaUI7UUFDL0QsTUFBTSxNQUFNLEdBQUcsYUFBYSxDQUFDLFlBQVksQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUNsRCxNQUFNLFFBQVEsR0FBRyxFQUFFLENBQUM7UUFFcEIsSUFBSSxNQUFNLENBQUMsTUFBTSxJQUFJLFNBQVMsRUFBRTtZQUM1QixLQUFLLE1BQU0sS0FBSyxJQUFJLE1BQU0sRUFBRTtnQkFDeEIsTUFBTSxDQUFDLENBQUMsRUFBRSxD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