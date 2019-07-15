//
// NOTE! for the color tinting experiment only
//

import { Swatch } from 'Performance/Utilities/Swatch';
import { Box } from 'Performance/Utilities/Box';
import { PQueue } from 'Performance/Utilities/PQueue';

function getHistogram(pixels: Uint8ClampedArray): number[][] {
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

// Divides color space into boxes of equal color volume. Inspired heavily by Android's ColorCutQuantizer, modified median-cut algorithm.
export function quantize(pixels: Uint8ClampedArray, maxColors: number): { swatches: Swatch[]; dominant: Swatch | undefined } {
    const colors = getHistogram(pixels);
    const swatches = [];
    let dominantSwatch;

    if (colors.length <= maxColors) {
        for (const color of colors) {
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
        if (!dominantSwatch || swatch.population > dominantSwatch.population) {
            dominantSwatch = swatch;
        }
    }

    return {
        swatches: swatches,
        dominant: dominantSwatch
    };
}
