import { MissedImpressionManager } from 'Ads/Managers/MissedImpressionManager';
import { assert } from 'chai';
import { Platform } from 'Core/Constants/Platform';
import { StorageApi, StorageType } from 'Core/Native/Storage';
import { HttpKafka, KafkaCommonObjectType } from 'Core/Utilities/HttpKafka';
import 'mocha';
import * as sinon from 'sinon';
import { TestFixtures } from 'TestHelpers/TestFixtures';
describe('MissedImpressionManagerTest', () => {
    let missedImpressionManager;
    let platform;
    let backend;
    let nativeBridge;
    let core;
    let kafkaSpy;
    beforeEach(() => {
        platform = Platform.ANDROID;
        backend = TestFixtures.getBackend(platform);
        nativeBridge = TestFixtures.getNativeBridge(platform, backend);
        core = TestFixtures.getCoreApi(nativeBridge);
        core.Storage = new StorageApi(nativeBridge);
        missedImpressionManager = new MissedImpressionManager(core);
        kafkaSpy = sinon.spy(HttpKafka, 'sendEvent');
    });
    afterEach(() => {
        kafkaSpy.restore();
    });
    it('should send events when developer sets metadata', () => {
        core.Storage.onSet.trigger(StorageType[StorageType.PUBLIC], { 'mediation': { 'missedImpressionOrdinal': { 'value': 1, 'ts': 123456789 } } });
        assert.isTrue(kafkaSpy.calledOnce, 'missed impression event was not sent to httpkafka');
        assert.isTrue(kafkaSpy.calledWith('ads.sdk2.events.missedimpression.json', KafkaCommonObjectType.ANONYMOUS, { ordinal: 1 }), 'missed impression event arguments incorrect');
    });
    it('should not send events when other metadata is set', () => {
        core.Storage.onSet.trigger(StorageType[StorageType.PUBLIC], { 'player': { 'server_id': { 'value': 'test', 'ts': 123456789 } } });
        assert.isFalse(kafkaSpy.called, 'missed impression event was triggered for unrelated storage event');
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTWlzc2VkSW1wcmVzc2lvbk1hbmFnZXJUZXN0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vdGVzdC9Vbml0L0Fkcy9NaXNzZWRJbXByZXNzaW9uTWFuYWdlclRlc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLHVCQUF1QixFQUFFLE1BQU0sc0NBQXNDLENBQUM7QUFFL0UsT0FBTyxFQUFFLE1BQU0sRUFBRSxNQUFNLE1BQU0sQ0FBQztBQUM5QixPQUFPLEVBQUUsUUFBUSxFQUFFLE1BQU0seUJBQXlCLENBQUM7QUFHbkQsT0FBTyxFQUFFLFVBQVUsRUFBRSxXQUFXLEVBQUUsTUFBTSxxQkFBcUIsQ0FBQztBQUU5RCxPQUFPLEVBQUUsU0FBUyxFQUFFLHFCQUFxQixFQUFFLE1BQU0sMEJBQTBCLENBQUM7QUFDNUUsT0FBTyxPQUFPLENBQUM7QUFDZixPQUFPLEtBQUssS0FBSyxNQUFNLE9BQU8sQ0FBQztBQUMvQixPQUFPLEVBQUUsWUFBWSxFQUFFLE1BQU0sMEJBQTBCLENBQUM7QUFFeEQsUUFBUSxDQUFDLDZCQUE2QixFQUFFLEdBQUcsRUFBRTtJQUN6QyxJQUFJLHVCQUFnRCxDQUFDO0lBQ3JELElBQUksUUFBa0IsQ0FBQztJQUN2QixJQUFJLE9BQWdCLENBQUM7SUFDckIsSUFBSSxZQUEwQixDQUFDO0lBQy9CLElBQUksSUFBYyxDQUFDO0lBQ25CLElBQUksUUFBYSxDQUFDO0lBRWxCLFVBQVUsQ0FBQyxHQUFHLEVBQUU7UUFDWixRQUFRLEdBQUcsUUFBUSxDQUFDLE9BQU8sQ0FBQztRQUM1QixPQUFPLEdBQUcsWUFBWSxDQUFDLFVBQVUsQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUM1QyxZQUFZLEdBQUcsWUFBWSxDQUFDLGVBQWUsQ0FBQyxRQUFRLEVBQUUsT0FBTyxDQUFDLENBQUM7UUFDL0QsSUFBSSxHQUFHLFlBQVksQ0FBQyxVQUFVLENBQUMsWUFBWSxDQUFDLENBQUM7UUFDN0MsSUFBSSxDQUFDLE9BQU8sR0FBRyxJQUFJLFVBQVUsQ0FBQyxZQUFZLENBQUMsQ0FBQztRQUM1Qyx1QkFBdUIsR0FBRyxJQUFJLHVCQUF1QixDQUFDLElBQUksQ0FBQyxDQUFDO1FBQzVELFFBQVEsR0FBRyxLQUFLLENBQUMsR0FBRyxDQUFDLFNBQVMsRUFBRSxXQUFXLENBQUMsQ0FBQztJQUNqRCxDQUFDLENBQUMsQ0FBQztJQUVILFNBQVMsQ0FBQyxHQUFHLEVBQUU7UUFDWCxRQUFRLENBQUMsT0FBTyxFQUFFLENBQUM7SUFDdkIsQ0FBQyxDQUFDLENBQUM7SUFFSCxFQUFFLENBQUMsaURBQWlELEVBQUUsR0FBRyxFQUFFO1FBQ3ZELElBQUksQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxXQUFXLENBQUMsV0FBVyxDQUFDLE1BQU0sQ0FBQyxFQUFFLEVBQUUsV0FBVyxFQUFFLEVBQUUseUJBQXlCLEVBQUUsRUFBRSxPQUFPLEVBQUUsQ0FBQyxFQUFFLElBQUksRUFBRSxTQUFTLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQztRQUU3SSxNQUFNLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxVQUFVLEVBQUUsbURBQW1ELENBQUMsQ0FBQztRQUN4RixNQUFNLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxVQUFVLENBQUMsdUNBQXVDLEVBQUUscUJBQXFCLENBQUMsU0FBUyxFQUFFLEVBQUUsT0FBTyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsNkNBQTZDLENBQUMsQ0FBQztJQUNoTCxDQUFDLENBQUMsQ0FBQztJQUVILEVBQUUsQ0FBQyxtREFBbUQsRUFBRSxHQUFHLEVBQUU7UUFDekQsSUFBSSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLFdBQVcsQ0FBQyxXQUFXLENBQUMsTUFBTSxDQUFDLEVBQUUsRUFBRSxRQUFRLEVBQUUsRUFBRSxXQUFXLEVBQUUsRUFBRSxPQUFPLEVBQUUsTUFBTSxFQUFFLElBQUksRUFBRSxTQUFTLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQztRQUVqSSxNQUFNLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxNQUFNLEVBQUUsbUVBQW1FLENBQUMsQ0FBQztJQUN6RyxDQUFDLENBQUMsQ0FBQztBQUNQLENBQUMsQ0FBQyxDQUFDIn0=