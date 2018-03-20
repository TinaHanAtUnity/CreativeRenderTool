import 'mocha';
import { assert } from 'chai';
import * as sinon from 'sinon';

import { HttpKafka } from 'Utilities/HttpKafka';
import { MissedImpressionManager } from 'Managers/MissedImpressionManager';
import { NativeBridge } from 'Native/NativeBridge';
import { TestFixtures } from '../TestHelpers/TestFixtures';
import { StorageApi, StorageType } from 'Native/Api/Storage';

describe('MissedImpressionManagerTest', () => {
    let missedImpressionManager: MissedImpressionManager;
    let nativeBridge: NativeBridge;
    let kafkaSpy: any;

    beforeEach(() => {
        nativeBridge = TestFixtures.getNativeBridge();
        nativeBridge.Storage = new StorageApi(nativeBridge);
        missedImpressionManager = new MissedImpressionManager(nativeBridge);
        kafkaSpy = sinon.spy(HttpKafka, 'sendEvent');
    });

    afterEach(() => {
        kafkaSpy.restore();
    });

    it('should send events when developer sets metadata', () => {
        nativeBridge.Storage.onSet.trigger(StorageType[StorageType.PUBLIC], {"mediation":{"missedImpressionOrdinal":{"value":1,"ts":123456789}}});

        assert.isTrue(kafkaSpy.calledOnce, 'missed impression event was not sent to httpkafka');
        assert.isTrue(kafkaSpy.calledWith('ads.sdk2.events.missedimpression.json', { ordinal: 1 }), 'missed impression event arguments incorrect');
    });

    it('should not send events when other metadata is set', () => {
        nativeBridge.Storage.onSet.trigger(StorageType[StorageType.PUBLIC], {"player":{"server_id":{"value":"test","ts":123456789}}});

        assert.isFalse(kafkaSpy.called, 'missed impression event was triggered for unrelated storage event');
    });
});
