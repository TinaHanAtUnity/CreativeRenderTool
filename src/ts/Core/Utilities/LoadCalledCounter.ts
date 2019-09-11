import { INativeResponse } from 'Core/Managers/RequestManager';
import { ABGroup } from 'Core/Models/ABGroup';
import { HttpKafka, KafkaCommonObjectType } from 'Core/Utilities/HttpKafka';

export interface ILoadCalledCounterParams {
    gameId: string;
    placementId: string;
    country: string;
    count: number;
    abGroup: ABGroup;
    organizationId: string | undefined;
    sdkVersion: number;
    gamerToken: string;
}

export class LoadCalledCounter {

    public static report(params: ILoadCalledCounterParams): Promise<INativeResponse> {
        const kafkaObject: { [key: string]: unknown } = {
            gameId: params.gameId,
            placementId: params.placementId,
            count: params.count,
            country: params.country,
            abGroup: params.abGroup,
            organizationId: params.organizationId || '',
            sdkVersion: params.sdkVersion,
            gamerToken: params.gamerToken,
            ts: Date.now()
        };

        return HttpKafka.sendEvent('ads.load.counting', KafkaCommonObjectType.EMPTY, kafkaObject);
    }
}
