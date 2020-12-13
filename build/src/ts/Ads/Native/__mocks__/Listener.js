import { Observable } from 'Core/Utilities/__mocks__/Observable';
export const ListenerApi = jest.fn(() => {
    return {
        onPlacementStateChangedEventSent: Observable(),
        sendFinishEvent: jest.fn().mockImplementation(() => Promise.resolve()),
        sendPlacementStateChangedEvent: jest.fn().mockImplementation(() => Promise.resolve()),
        sendReadyEvent: jest.fn().mockImplementation(() => Promise.resolve()),
        sendClickEvent: jest.fn().mockImplementation(() => Promise.resolve())
    };
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTGlzdGVuZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvdHMvQWRzL05hdGl2ZS9fX21vY2tzX18vTGlzdGVuZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQ0EsT0FBTyxFQUFrQixVQUFVLEVBQUUsTUFBTSxxQ0FBcUMsQ0FBQztBQVVqRixNQUFNLENBQUMsTUFBTSxXQUFXLEdBQUcsSUFBSSxDQUFDLEVBQUUsQ0FBQyxHQUFHLEVBQUU7SUFDcEMsT0FBcUI7UUFDakIsZ0NBQWdDLEVBQUUsVUFBVSxFQUFFO1FBQzlDLGVBQWUsRUFBRSxJQUFJLENBQUMsRUFBRSxFQUFFLENBQUMsa0JBQWtCLENBQUMsR0FBRyxFQUFFLENBQUMsT0FBTyxDQUFDLE9BQU8sRUFBRSxDQUFDO1FBQ3RFLDhCQUE4QixFQUFFLElBQUksQ0FBQyxFQUFFLEVBQUUsQ0FBQyxrQkFBa0IsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxPQUFPLENBQUMsT0FBTyxFQUFFLENBQUM7UUFDckYsY0FBYyxFQUFFLElBQUksQ0FBQyxFQUFFLEVBQUUsQ0FBQyxrQkFBa0IsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxPQUFPLENBQUMsT0FBTyxFQUFFLENBQUM7UUFDckUsY0FBYyxFQUFFLElBQUksQ0FBQyxFQUFFLEVBQUUsQ0FBQyxrQkFBa0IsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxPQUFPLENBQUMsT0FBTyxFQUFFLENBQUM7S0FDeEUsQ0FBQztBQUNOLENBQUMsQ0FBQyxDQUFDIn0=