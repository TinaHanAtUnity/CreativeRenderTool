import 'mocha';
import { assert } from 'chai';
import * as sinon from 'sinon';
import { SessionManager, SessionManagerEventMetadataCreator } from 'Managers/SessionManager';
import { EventManager } from 'Managers/EventManager';
import { DeviceInfo } from 'Models/DeviceInfo';
import { ClientInfo } from 'Models/ClientInfo';
import { NativeBridge } from 'Native/NativeBridge';
import { Platform } from 'Constants/Platform';
import { WakeUpManager } from 'Managers/WakeUpManager';
import { Placement } from 'Models/Placement';
import { TestFixtures } from '../TestHelpers/TestFixtures';
import { Overlay } from 'Views/Overlay';
import { VastAdUnit } from 'AdUnits/VastAdUnit';
import { VastCampaign } from 'Models/Vast/VastCampaign';
import { Request } from 'Utilities/Request';
import EventTestVast from 'xml/EventTestVast.xml';
import { Activity } from 'AdUnits/Containers/Activity';

describe('SessionManagerTest', () => {
    const handleInvocation = sinon.spy();
    const handleCallback = sinon.spy();
    let nativeBridge: NativeBridge;

    let sessionManager: SessionManager;
    let eventManager: EventManager;
    let deviceInfo: DeviceInfo;
    let resolvedPromise: Promise<string>;
    let vastCampaign: VastCampaign;
    let sessionManagerEventMetadataCreator: SessionManagerEventMetadataCreator;
    let vastAdUnit: VastAdUnit;

    const clientInfo = new ClientInfo(Platform.ANDROID, [
        '12345',
        false,
        'com.unity3d.ads.example',
        '2.0.0-test2',
        '2000',
        '2.0.0-alpha2',
        true,
        'http://example.com/config.json',
        'http://example.com/index.html',
        null
    ]);

    beforeEach(() => {
        nativeBridge = new NativeBridge({
            handleInvocation,
            handleCallback
        });

        const vastParser = TestFixtures.getVastParser();
        const vastXml = EventTestVast;
        const vast = vastParser.parseVast(vastXml);
        vastCampaign = new VastCampaign(vast, '12345', 'gamerId', 1);

        const request = new Request(nativeBridge, new WakeUpManager(nativeBridge));
        eventManager = new EventManager(nativeBridge, request);
        deviceInfo = new DeviceInfo(nativeBridge);
        resolvedPromise = Promise.resolve('id1');
        sinon.stub(eventManager, 'getUniqueEventId').returns(resolvedPromise);
        sinon.stub(deviceInfo, 'getConnectionType').returns(Promise.resolve('wifi'));
        sessionManagerEventMetadataCreator = new SessionManagerEventMetadataCreator(eventManager, clientInfo, deviceInfo, nativeBridge);
        const adUnit = new Activity(nativeBridge, TestFixtures.getDeviceInfo(Platform.ANDROID));
        vastAdUnit = new VastAdUnit(nativeBridge, adUnit, <Placement><any>{}, vastCampaign, <Overlay><any>{hide: sinon.spy()}, null);
    });

    it('should send successful brand video click through event', () => {
        sinon.stub(sessionManagerEventMetadataCreator, 'createUniqueKafkaEventMetadata').returns(Promise.resolve({}));
        sinon.stub(eventManager, 'brandEvent').returns(sinon.spy());
        sessionManager = new SessionManager(nativeBridge, TestFixtures.getClientInfo(), new DeviceInfo(nativeBridge), eventManager, sessionManagerEventMetadataCreator);
        sinon.stub(vastAdUnit, 'getVideoClickThroughURL').returns('http://foo.com');

        sessionManager.sendBrandClickThrough(vastAdUnit);

        return resolvedPromise.then(() => {
            sinon.assert.calledOnce(<sinon.SinonSpy>sessionManagerEventMetadataCreator.createUniqueKafkaEventMetadata);
            sinon.assert.calledWith(<sinon.SinonSpy>eventManager.brandEvent, 'vclickthru', {});
        });
    });

    it('should send successful brand companion click through event', () => {
        sinon.stub(sessionManagerEventMetadataCreator, 'createUniqueKafkaEventMetadata').returns(Promise.resolve({}));
        sinon.stub(eventManager, 'brandEvent').returns(sinon.spy());
        sessionManager = new SessionManager(nativeBridge, TestFixtures.getClientInfo(), new DeviceInfo(nativeBridge), eventManager, sessionManagerEventMetadataCreator);
        sinon.stub(vastAdUnit, 'getVideoClickThroughURL').returns('http://foo.com');

        sessionManager.sendCompanionClickThrough(vastAdUnit);

        return resolvedPromise.then(() => {
            sinon.assert.calledOnce(<sinon.SinonSpy>sessionManagerEventMetadataCreator.createUniqueKafkaEventMetadata);
            sinon.assert.calledWith(<sinon.SinonSpy>eventManager.brandEvent, 'cclickthru', {});
        });
    });

    it('should create kafka event metadata', (done) => {
        sessionManagerEventMetadataCreator.createUniqueKafkaEventMetadata(vastAdUnit).then((json) => {
            assert.equal(json.id, 'id1');
            assert.equal(json.ab, 1);
            assert.equal(json.cmp, '12345');
            assert.equal(json.ctyp, 'brand');
            assert.equal(json.uid, 'gamerId');
            assert.equal(json.sdkv, '2000');
            assert.equal(json.conn, 'wifi');

            done();
        });
    });
});
