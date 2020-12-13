import { Observable } from 'Core/Utilities/__mocks__/Observable';
export const FocusManager = jest.fn(() => {
    return {
        onAppForeground: Observable(),
        onAppBackground: Observable(),
        onActivityResumed: Observable(),
        onActivityPaused: Observable(),
        onActivityDestroyed: Observable(),
        onScreenOn: Observable(),
        setListenAppForeground: jest.fn(),
        setListenAppBackground: jest.fn(),
        setListenAndroidLifecycle: jest.fn(),
        setListenScreen: jest.fn(),
        isAppForeground: jest.fn()
    };
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRm9jdXNNYW5hZ2VyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vc3JjL3RzL0NvcmUvTWFuYWdlcnMvX19tb2Nrc19fL0ZvY3VzTWFuYWdlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFDQSxPQUFPLEVBQWtCLFVBQVUsRUFBRSxNQUFNLHFDQUFxQyxDQUFDO0FBZ0JqRixNQUFNLENBQUMsTUFBTSxZQUFZLEdBQUcsSUFBSSxDQUFDLEVBQUUsQ0FBQyxHQUFHLEVBQUU7SUFDckMsT0FBeUI7UUFDckIsZUFBZSxFQUFFLFVBQVUsRUFBRTtRQUM3QixlQUFlLEVBQUUsVUFBVSxFQUFFO1FBQzdCLGlCQUFpQixFQUFFLFVBQVUsRUFBRTtRQUMvQixnQkFBZ0IsRUFBRSxVQUFVLEVBQUU7UUFDOUIsbUJBQW1CLEVBQUUsVUFBVSxFQUFFO1FBQ2pDLFVBQVUsRUFBRSxVQUFVLEVBQUU7UUFDeEIsc0JBQXNCLEVBQUUsSUFBSSxDQUFDLEVBQUUsRUFBRTtRQUNqQyxzQkFBc0IsRUFBRSxJQUFJLENBQUMsRUFBRSxFQUFFO1FBQ2pDLHlCQUF5QixFQUFFLElBQUksQ0FBQyxFQUFFLEVBQUU7UUFDcEMsZUFBZSxFQUFFLElBQUksQ0FBQyxFQUFFLEVBQUU7UUFDMUIsZUFBZSxFQUFFLElBQUksQ0FBQyxFQUFFLEVBQUU7S0FDN0IsQ0FBQztBQUNOLENBQUMsQ0FBQyxDQUFDIn0=