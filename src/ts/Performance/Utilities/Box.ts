//
// NOTE! for the color tinting experiment only
//

export class Box {
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
