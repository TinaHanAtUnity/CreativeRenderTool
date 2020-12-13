export const SensorInfoApi = jest.fn(() => {
    return {
        stopAccelerometerUpdates: jest.fn(),
        Ios: {
            startAccelerometerUpdates: jest.fn().mockImplementation(() => Promise.resolve())
        }
    };
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiU2Vuc29ySW5mby5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy90cy9Db3JlL05hdGl2ZS9fX21vY2tzX18vU2Vuc29ySW5mby50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFTQSxNQUFNLENBQUMsTUFBTSxhQUFhLEdBQUcsSUFBSSxDQUFDLEVBQUUsQ0FBQyxHQUFHLEVBQUU7SUFDdEMsT0FBdUI7UUFDbkIsd0JBQXdCLEVBQUUsSUFBSSxDQUFDLEVBQUUsRUFBRTtRQUNuQyxHQUFHLEVBQUU7WUFDRCx5QkFBeUIsRUFBRSxJQUFJLENBQUMsRUFBRSxFQUFFLENBQUMsa0JBQWtCLENBQUMsR0FBRyxFQUFFLENBQUMsT0FBTyxDQUFDLE9BQU8sRUFBRSxDQUFDO1NBQ25GO0tBQ0osQ0FBQztBQUNOLENBQUMsQ0FBQyxDQUFDIn0=