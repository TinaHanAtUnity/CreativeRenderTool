import { MRAIDEventBridge } from 'ExternalEndScreen/MRAIDEventBridge/MRAIDEventBridge';
import { ExternalMRAIDEndScreenMetric, SDKMetrics } from 'Ads/Utilities/SDKMetrics';
export class MRAIDEventBridgeForIFrame extends MRAIDEventBridge {
    constructor(handler, core, iframe) {
        super(handler, core);
        this._iframe = iframe;
    }
    start() {
        this._messageListener = (event) => this.onMessageEvent(event);
        window.addEventListener('message', this._messageListener);
    }
    onMessageEvent(event) {
        switch (event.data.type) {
            case 'ready':
                this._handler.onReady();
                break;
            case 'close':
                this._handler.onClose();
                break;
            case 'open':
                this._handler.onOpen(event.data.url);
                break;
            case 'loaded':
                this._handler.onLoaded();
                break;
            default:
                SDKMetrics.reportMetricEventWithTags(ExternalMRAIDEndScreenMetric.UnknownMRAIDEvent, { event: event.data.type });
        }
    }
    postMessage(event, data) {
        if (this._iframe.contentWindow) {
            this._iframe.contentWindow.postMessage({
                type: event,
                value: data
            }, '*');
        }
    }
    stop() {
        window.removeEventListener('message', this._messageListener);
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTVJBSURFdmVudEJyaWRnZUZvcklGcmFtZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NyYy90cy9FeHRlcm5hbEVuZFNjcmVlbi9NUkFJREV2ZW50QnJpZGdlL01SQUlERXZlbnRCcmlkZ2VGb3JJRnJhbWUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUE0QixnQkFBZ0IsRUFBRSxNQUFNLHFEQUFxRCxDQUFDO0FBRWpILE9BQU8sRUFBRSw0QkFBNEIsRUFBRSxVQUFVLEVBQUUsTUFBTSwwQkFBMEIsQ0FBQztBQUVwRixNQUFNLE9BQU8seUJBQTBCLFNBQVEsZ0JBQWdCO0lBSTNELFlBQW1CLE9BQWlDLEVBQUUsSUFBYyxFQUFFLE1BQXlCO1FBQzNGLEtBQUssQ0FBQyxPQUFPLEVBQUUsSUFBSSxDQUFDLENBQUM7UUFFckIsSUFBSSxDQUFDLE9BQU8sR0FBRyxNQUFNLENBQUM7SUFDMUIsQ0FBQztJQUVTLEtBQUs7UUFDWCxJQUFJLENBQUMsZ0JBQWdCLEdBQUcsQ0FBQyxLQUFtQixFQUFFLEVBQUUsQ0FBQyxJQUFJLENBQUMsY0FBYyxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQzVFLE1BQU0sQ0FBQyxnQkFBZ0IsQ0FBQyxTQUFTLEVBQUUsSUFBSSxDQUFDLGdCQUFnQixDQUFDLENBQUM7SUFDOUQsQ0FBQztJQUVPLGNBQWMsQ0FBQyxLQUFtQjtRQUN0QyxRQUFRLEtBQUssQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFO1lBQ3JCLEtBQUssT0FBTztnQkFDUixJQUFJLENBQUMsUUFBUSxDQUFDLE9BQU8sRUFBRSxDQUFDO2dCQUN4QixNQUFNO1lBQ1YsS0FBSyxPQUFPO2dCQUNSLElBQUksQ0FBQyxRQUFRLENBQUMsT0FBTyxFQUFFLENBQUM7Z0JBQ3hCLE1BQU07WUFDVixLQUFLLE1BQU07Z0JBQ1AsSUFBSSxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztnQkFDckMsTUFBTTtZQUNWLEtBQUssUUFBUTtnQkFDVCxJQUFJLENBQUMsUUFBUSxDQUFDLFFBQVEsRUFBRSxDQUFDO2dCQUN6QixNQUFNO1lBQ1Y7Z0JBQ0ksVUFBVSxDQUFDLHlCQUF5QixDQUFDLDRCQUE0QixDQUFDLGlCQUFpQixFQUFFLEVBQUUsS0FBSyxFQUFFLEtBQUssQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQztTQUN4SDtJQUNMLENBQUM7SUFFUyxXQUFXLENBQUMsS0FBYSxFQUFFLElBQWM7UUFDL0MsSUFBSSxJQUFJLENBQUMsT0FBTyxDQUFDLGFBQWEsRUFBRTtZQUM1QixJQUFJLENBQUMsT0FBTyxDQUFDLGFBQWEsQ0FBQyxXQUFXLENBQUM7Z0JBQ25DLElBQUksRUFBRSxLQUFLO2dCQUNYLEtBQUssRUFBRSxJQUFJO2FBQ2QsRUFBRSxHQUFHLENBQUMsQ0FBQztTQUNYO0lBQ0wsQ0FBQztJQUVNLElBQUk7UUFDUCxNQUFNLENBQUMsbUJBQW1CLENBQUMsU0FBUyxFQUFFLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO0lBQ2pFLENBQUM7Q0FDSiJ9