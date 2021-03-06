export class TimeUtils {
    static getNextUTCDayDeltaSeconds(fromInMilliseconds) {
        const oneDayInMilliseconds = 24 * 60 * 60 * 1000;
        const nextDay = new Date(fromInMilliseconds + oneDayInMilliseconds);
        nextDay.setUTCHours(0, 0, 0, 0);
        return Math.floor((nextDay.getTime() - fromInMilliseconds) / 1000);
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVGltZVV0aWxzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vc3JjL3RzL0Fkcy9VdGlsaXRpZXMvVGltZVV0aWxzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUNBLE1BQU0sT0FBTyxTQUFTO0lBQ1gsTUFBTSxDQUFDLHlCQUF5QixDQUFDLGtCQUEwQjtRQUM5RCxNQUFNLG9CQUFvQixHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLElBQUksQ0FBQztRQUNqRCxNQUFNLE9BQU8sR0FBRyxJQUFJLElBQUksQ0FBQyxrQkFBa0IsR0FBRyxvQkFBb0IsQ0FBQyxDQUFDO1FBQ3BFLE9BQU8sQ0FBQyxXQUFXLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7UUFFaEMsT0FBTyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsT0FBTyxDQUFDLE9BQU8sRUFBRSxHQUFHLGtCQUFrQixDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUM7SUFDdkUsQ0FBQztDQUNKIn0=