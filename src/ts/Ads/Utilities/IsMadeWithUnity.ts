import { StorageApi, StorageType } from 'Core/Native/Storage';
import { SdkDetectionInfo } from 'Core/Models/SdkDetectionInfo';
import { KafkaCommonObjectType, HttpKafka } from 'Core/Utilities/HttpKafka';

export class IsMadeWithUnity {
    private static hasSentIsMadeWithUnity(storage: StorageApi): Promise<boolean> {
        return storage.get<boolean>(StorageType.PRIVATE, 'user.hasSentIsMadeWithUnity').then((hasSentIsMadeWithUnity) => {
            return hasSentIsMadeWithUnity;
        }).catch(() => {
            return false;
        });
    }

    private static setHasSentIsMadeWithUnity(storage: StorageApi): void {
        storage.set<boolean>(StorageType.PRIVATE, 'user.hasSentIsMadeWithUnity', true).then(() => {
            storage.write(StorageType.PRIVATE);
        });
    }

    public static sendIsMadeWithUnity(storage: StorageApi, sdkDetectionInfo: SdkDetectionInfo): Promise<void> {
        return this.hasSentIsMadeWithUnity(storage).then(hasSentIsMadeWithUnity => {
            if (!hasSentIsMadeWithUnity) {
                const isMadeWithUnityJson: unknown = {
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