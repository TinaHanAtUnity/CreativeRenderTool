import { MissedImpressionManager } from 'Ads/Managers/MissedImpressionManager';
import { assert } from 'chai';
import { NativeBridge } from 'Core/Native/Bridge/NativeBridge';
import { StorageApi, StorageType } from 'Core/Native/Storage';

import { HttpKafka, KafkaCommonObjectType } from 'Core/Utilities/HttpKafka';
import 'mocha';
import * as sinon from 'sinon';
import { TestFixtures } from 'TestHelpers/TestFixtures';
import { Platform } from 'Core/Constants/Platform';
import { Backend } from 'Backend/Backend';
import { ICoreApi } from 'Core/ICore';

describe('MissedImpressionManagerTest', () => {
    let missedImpressionManager: MissedImpressionManager;
    let platform: Platform;
    let backend: Backend;
    let nativeBridge: NativeBridge;
    let core: ICoreApi;
    let kafkaSpy: any;

    beforeEach(() => {
        platform = Platform.ANDROID;
        backend = TestFixtures.getBackend(platform);
        nativeBridge = TestFixtures.getNativeBridge(platform, backend);
        core = TestFixtures.getCoreApi(nativeBridge);
        core.Storage = new StorageApi(nativeBridge);
        missedImpressionManager = new MissedImpressionManager(core.Storage);
        kafkaSpy = sinon.spy(HttpKafka, 'sendEvent');
    });

    afterEach(() => {
        kafkaSpy.restore();
    });

    it('should send events when developer sets metadata', () => {
        core.Storage.onSet.trigger(StorageType[StorageType.PUBLIC], {'mediation': { 'missedImpressionOrdinal': {'value': 1, 'ts': 123456789 }}});

        assert.isTrue(kafkaSpy.calledOnce, 'missed impression event was not sent to httpkafka');
        assert.isTrue(kafkaSpy.calledWith('ads.sdk2.events.missedimpression.json', KafkaCommonObjectType.ANONYMOUS, { ordinal: 1 }), 'missed impression event arguments incorrect');
    });

    it('should not send events when other metadata is set', () => {
        core.Storage.onSet.trigger(StorageType[StorageType.PUBLIC], {'player': {'server_id': { 'value': 'test', 'ts': 123456789 }}});

        assert.isFalse(kafkaSpy.called, 'missed impression event was triggered for unrelated storage event');
    });
});
