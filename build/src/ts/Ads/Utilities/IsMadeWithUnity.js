import { StorageType } from 'Core/Native/Storage';
import { KafkaCommonObjectType, HttpKafka } from 'Core/Utilities/HttpKafka';
export class IsMadeWithUnity {
    static hasSentIsMadeWithUnity(storage) {
        return storage.get(StorageType.PRIVATE, 'user.hasSentIsMadeWithUnity').then((hasSentIsMadeWithUnity) => {
            return hasSentIsMadeWithUnity;
        }).catch(() => {
            return false;
        });
    }
    static setHasSentIsMadeWithUnity(storage) {
        storage.set(StorageType.PRIVATE, 'user.hasSentIsMadeWithUnity', true).then(() => {
            storage.write(StorageType.PRIVATE);
        });
    }
    static sendIsMadeWithUnity(storage, sdkDetectionInfo) {
        return this.hasSentIsMadeWithUnity(storage).then(hasSentIsMadeWithUnity => {
            if (!hasSentIsMadeWithUnity) {
                const isMadeWithUnityJson = {
                    'v': 1,
                    mwu: sdkDetectionInfo.isMadeWithUnity()
                };
                HttpKafka.sendEvent('ads.events.mwu.v1.json', KafkaCommonObjectType.ANONYMOUS, isMadeWithUnityJson).then(() => {
                    this.setHasSentIsMadeWithUnity(storage);
                });
            }
        });
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiSXNNYWRlV2l0aFVuaXR5LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vc3JjL3RzL0Fkcy9VdGlsaXRpZXMvSXNNYWRlV2l0aFVuaXR5LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBYyxXQUFXLEVBQUUsTUFBTSxxQkFBcUIsQ0FBQztBQUU5RCxPQUFPLEVBQUUscUJBQXFCLEVBQUUsU0FBUyxFQUFFLE1BQU0sMEJBQTBCLENBQUM7QUFFNUUsTUFBTSxPQUFPLGVBQWU7SUFDaEIsTUFBTSxDQUFDLHNCQUFzQixDQUFDLE9BQW1CO1FBQ3JELE9BQU8sT0FBTyxDQUFDLEdBQUcsQ0FBVSxXQUFXLENBQUMsT0FBTyxFQUFFLDZCQUE2QixDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsc0JBQXNCLEVBQUUsRUFBRTtZQUM1RyxPQUFPLHNCQUFzQixDQUFDO1FBQ2xDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxHQUFHLEVBQUU7WUFDVixPQUFPLEtBQUssQ0FBQztRQUNqQixDQUFDLENBQUMsQ0FBQztJQUNQLENBQUM7SUFFTyxNQUFNLENBQUMseUJBQXlCLENBQUMsT0FBbUI7UUFDeEQsT0FBTyxDQUFDLEdBQUcsQ0FBVSxXQUFXLENBQUMsT0FBTyxFQUFFLDZCQUE2QixFQUFFLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUU7WUFDckYsT0FBTyxDQUFDLEtBQUssQ0FBQyxXQUFXLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDdkMsQ0FBQyxDQUFDLENBQUM7SUFDUCxDQUFDO0lBRU0sTUFBTSxDQUFDLG1CQUFtQixDQUFDLE9BQW1CLEVBQUUsZ0JBQWtDO1FBQ3JGLE9BQU8sSUFBSSxDQUFDLHNCQUFzQixDQUFDLE9BQU8sQ0FBQyxDQUFDLElBQUksQ0FBQyxzQkFBc0IsQ0FBQyxFQUFFO1lBQ3RFLElBQUksQ0FBQyxzQkFBc0IsRUFBRTtnQkFDekIsTUFBTSxtQkFBbUIsR0FBWTtvQkFDakMsR0FBRyxFQUFFLENBQUM7b0JBQ04sR0FBRyxFQUFFLGdCQUFnQixDQUFDLGVBQWUsRUFBRTtpQkFDMUMsQ0FBQztnQkFFRixTQUFTLENBQUMsU0FBUyxDQUFDLHdCQUF3QixFQUFFLHFCQUFxQixDQUFDLFNBQVMsRUFBRSxtQkFBbUIsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUU7b0JBQzFHLElBQUksQ0FBQyx5QkFBeUIsQ0FBQyxPQUFPLENBQUMsQ0FBQztnQkFDNUMsQ0FBQyxDQUFDLENBQUM7YUFDTjtRQUNMLENBQUMsQ0FBQyxDQUFDO0lBQ1AsQ0FBQztDQUNKIn0=