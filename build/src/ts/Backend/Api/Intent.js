import { BackendApi } from 'Backend/BackendApi';
export class Intent extends BackendApi {
    launch(intentData) {
        if ('uri' in intentData) {
            window.open(intentData.uri);
        }
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiSW50ZW50LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vc3JjL3RzL0JhY2tlbmQvQXBpL0ludGVudC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsVUFBVSxFQUFFLE1BQU0sb0JBQW9CLENBQUM7QUFFaEQsTUFBTSxPQUFPLE1BQU8sU0FBUSxVQUFVO0lBRTNCLE1BQU0sQ0FBQyxVQUFzQztRQUNoRCxJQUFJLEtBQUssSUFBSSxVQUFVLEVBQUU7WUFDckIsTUFBTSxDQUFDLElBQUksQ0FBUyxVQUFVLENBQUMsR0FBRyxDQUFDLENBQUM7U0FDdkM7SUFDTCxDQUFDO0NBRUoifQ==