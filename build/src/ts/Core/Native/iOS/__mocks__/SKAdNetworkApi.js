export const SKAdNetworkApi = jest.fn(() => {
    return {
        available: jest.fn().mockResolvedValue(Promise.resolve(true)),
        updateConversionValue: jest.fn().mockResolvedValue(Promise.resolve()),
        registerAppForAdNetworkAttribution: jest.fn().mockResolvedValue(Promise.resolve())
    };
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiU0tBZE5ldHdvcmtBcGkuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9zcmMvdHMvQ29yZS9OYXRpdmUvaU9TL19fbW9ja3NfXy9TS0FkTmV0d29ya0FwaS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFRQSxNQUFNLENBQUMsTUFBTSxjQUFjLEdBQUcsSUFBSSxDQUFDLEVBQUUsQ0FBQyxHQUFHLEVBQUU7SUFDdkMsT0FBMkI7UUFDdkIsU0FBUyxFQUFFLElBQUksQ0FBQyxFQUFFLEVBQUUsQ0FBQyxpQkFBaUIsQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQzdELHFCQUFxQixFQUFFLElBQUksQ0FBQyxFQUFFLEVBQUUsQ0FBQyxpQkFBaUIsQ0FBQyxPQUFPLENBQUMsT0FBTyxFQUFFLENBQUM7UUFDckUsa0NBQWtDLEVBQUUsSUFBSSxDQUFDLEVBQUUsRUFBRSxDQUFDLGlCQUFpQixDQUFDLE9BQU8sQ0FBQyxPQUFPLEVBQUUsQ0FBQztLQUNyRixDQUFDO0FBQ04sQ0FBQyxDQUFDLENBQUMifQ==