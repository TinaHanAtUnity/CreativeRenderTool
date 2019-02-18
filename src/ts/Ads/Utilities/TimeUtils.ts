
export class TimeUtils {
    public static getNextUTCDayDeltaSeconds(fromInMilliseconds: number): number {
        const oneDayInMilliseconds = 24 * 60 * 60 * 1000;
        const nextDay = new Date(fromInMilliseconds + oneDayInMilliseconds);
        nextDay.setUTCHours(0, 0, 0, 0);

        return Math.floor((nextDay.getTime() - fromInMilliseconds) / 1000);
    }
}
