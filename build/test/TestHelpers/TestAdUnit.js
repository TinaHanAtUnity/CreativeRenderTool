import { AbstractAdUnit } from 'Ads/AdUnits/AbstractAdUnit';
export class TestAdUnit extends AbstractAdUnit {
    constructor(parameters) {
        super(parameters);
    }
    show() {
        return Promise.resolve();
    }
    hide() {
        return Promise.resolve();
    }
    isShowing() {
        return false;
    }
    description() {
        return 'test';
    }
    isCached() {
        return false;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVGVzdEFkVW5pdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3Rlc3QvVGVzdEhlbHBlcnMvVGVzdEFkVW5pdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsY0FBYyxFQUFxQixNQUFNLDRCQUE0QixDQUFDO0FBRy9FLE1BQU0sT0FBTyxVQUFXLFNBQVEsY0FBYztJQUUxQyxZQUFZLFVBQXVDO1FBQy9DLEtBQUssQ0FBQyxVQUFVLENBQUMsQ0FBQztJQUN0QixDQUFDO0lBRU0sSUFBSTtRQUNQLE9BQU8sT0FBTyxDQUFDLE9BQU8sRUFBRSxDQUFDO0lBQzdCLENBQUM7SUFFTSxJQUFJO1FBQ1AsT0FBTyxPQUFPLENBQUMsT0FBTyxFQUFFLENBQUM7SUFDN0IsQ0FBQztJQUVNLFNBQVM7UUFDWixPQUFPLEtBQUssQ0FBQztJQUNqQixDQUFDO0lBRU0sV0FBVztRQUNkLE9BQU8sTUFBTSxDQUFDO0lBQ2xCLENBQUM7SUFFTSxRQUFRO1FBQ1gsT0FBTyxLQUFLLENBQUM7SUFDakIsQ0FBQztDQUNKIn0=