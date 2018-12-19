export enum ClickDelayRange {
    LOW = 4000, // 4000 ms
    MID = 8000,
    HIGH = 12000
}

export class ClickDiagnostics {
    public static getClickDelayRange(duration: number): string {
        if (duration <= ClickDelayRange.LOW) {
            return 'LOW';
        } else if (duration > ClickDelayRange.LOW && duration <= ClickDelayRange.MID) {
            return 'MID';
        } else if (duration > ClickDelayRange.MID && duration <= ClickDelayRange.HIGH) {
            return 'HIGH';
        } else {
            return 'VERY_HIGH';
        }
    }
}
