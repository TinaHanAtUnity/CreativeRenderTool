import { Observable } from 'Core/Utilities/__mocks__/Observable';
export const WebPlayerApi = jest.fn(() => {
    return {
        onPageStarted: Observable(),
        onPageFinished: Observable(),
        onWebPlayerEvent: Observable(),
        onCreateWindow: Observable(),
        shouldOverrideUrlLoading: Observable(),
        onCreateWebView: Observable(),
        onFrameUpdate: Observable(),
        onGetFrameResponse: Observable(),
        setUrl: jest.fn(),
        setData: jest.fn(),
        setDataWithUrl: jest.fn(),
        setSettings: jest.fn(),
        clearSettings: jest.fn(),
        setEventSettings: jest.fn(),
        sendEvent: jest.fn(),
        getFrame: jest.fn(),
        handleEvent: jest.fn()
    };
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiV2ViUGxheWVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vc3JjL3RzL0Fkcy9OYXRpdmUvX19tb2Nrc19fL1dlYlBsYXllci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFDQSxPQUFPLEVBQWtCLFVBQVUsRUFBRSxNQUFNLHFDQUFxQyxDQUFDO0FBc0JqRixNQUFNLENBQUMsTUFBTSxZQUFZLEdBQUcsSUFBSSxDQUFDLEVBQUUsQ0FBQyxHQUFHLEVBQUU7SUFDckMsT0FBeUI7UUFDckIsYUFBYSxFQUFFLFVBQVUsRUFBRTtRQUMzQixjQUFjLEVBQUUsVUFBVSxFQUFFO1FBQzVCLGdCQUFnQixFQUFFLFVBQVUsRUFBRTtRQUM5QixjQUFjLEVBQUUsVUFBVSxFQUFFO1FBQzVCLHdCQUF3QixFQUFFLFVBQVUsRUFBRTtRQUN0QyxlQUFlLEVBQUUsVUFBVSxFQUFFO1FBQzdCLGFBQWEsRUFBRSxVQUFVLEVBQUU7UUFDM0Isa0JBQWtCLEVBQUUsVUFBVSxFQUFFO1FBQ2hDLE1BQU0sRUFBRSxJQUFJLENBQUMsRUFBRSxFQUFFO1FBQ2pCLE9BQU8sRUFBRSxJQUFJLENBQUMsRUFBRSxFQUFFO1FBQ2xCLGNBQWMsRUFBRSxJQUFJLENBQUMsRUFBRSxFQUFFO1FBQ3pCLFdBQVcsRUFBRSxJQUFJLENBQUMsRUFBRSxFQUFFO1FBQ3RCLGFBQWEsRUFBRSxJQUFJLENBQUMsRUFBRSxFQUFFO1FBQ3hCLGdCQUFnQixFQUFFLElBQUksQ0FBQyxFQUFFLEVBQUU7UUFDM0IsU0FBUyxFQUFFLElBQUksQ0FBQyxFQUFFLEVBQUU7UUFDcEIsUUFBUSxFQUFFLElBQUksQ0FBQyxFQUFFLEVBQUU7UUFDbkIsV0FBVyxFQUFFLElBQUksQ0FBQyxFQUFFLEVBQUU7S0FDekIsQ0FBQztBQUNOLENBQUMsQ0FBQyxDQUFDIn0=