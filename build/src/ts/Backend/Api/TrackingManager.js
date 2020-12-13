import { BackendApi } from 'Backend/BackendApi';
import { TrackingAuthorizationStatus } from 'Core/Native/iOS/TrackingManager';
export class TrackingManager extends BackendApi {
    available() {
        return true;
    }
    getTrackingAuthorizationStatus() {
        return TrackingAuthorizationStatus.Authorized;
    }
    requestTrackingAuthorization() {
        return;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVHJhY2tpbmdNYW5hZ2VyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vc3JjL3RzL0JhY2tlbmQvQXBpL1RyYWNraW5nTWFuYWdlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsVUFBVSxFQUFFLE1BQU0sb0JBQW9CLENBQUM7QUFDaEQsT0FBTyxFQUFFLDJCQUEyQixFQUFFLE1BQU0saUNBQWlDLENBQUM7QUFFOUUsTUFBTSxPQUFPLGVBQWdCLFNBQVEsVUFBVTtJQUNwQyxTQUFTO1FBQ1osT0FBTyxJQUFJLENBQUM7SUFDaEIsQ0FBQztJQUVNLDhCQUE4QjtRQUNqQyxPQUFPLDJCQUEyQixDQUFDLFVBQVUsQ0FBQztJQUNsRCxDQUFDO0lBRU0sNEJBQTRCO1FBQy9CLE9BQU87SUFDWCxDQUFDO0NBQ0oifQ==