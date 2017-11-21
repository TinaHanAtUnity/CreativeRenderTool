import * as sinon from 'sinon';

import { AdMobEventHandler } from 'EventHandlers/AdmobEventHandler';
import { AdMobAdUnit } from 'AdUnits/AdMobAdUnit';
import { NativeBridge } from 'Native/NativeBridge';
import { IntentApi } from 'Native/Api/Intent';
import { UrlSchemeApi } from 'Native/Api/UrlScheme';
import { Platform } from 'Constants/Platform';

describe('AdMobEventHandler', () => {
    let admobEventHandler: AdMobEventHandler;
    let adUnit: AdMobAdUnit;
    let nativeBridge: NativeBridge;

    beforeEach(() => {
        adUnit = sinon.createStubInstance(AdMobAdUnit);
        nativeBridge = sinon.createStubInstance(NativeBridge);
        nativeBridge.Intent = sinon.createStubInstance(IntentApi);
        nativeBridge.UrlScheme = sinon.createStubInstance(UrlSchemeApi);
        admobEventHandler = new AdMobEventHandler({
            adUnit, nativeBridge
        });
    });

    describe('on close', () => {
        it('should hide the ad unit', () => {
            admobEventHandler.onClose();
            sinon.assert.called(<sinon.SinonSpy>adUnit.hide);
        });
    });

    describe('on open URL', () => {
        const url = 'https://unityads.unity3d.com/open';

        describe('on iOS', () => {
            it('should open the UrlScheme', () => {
                (<sinon.SinonStub>nativeBridge.getPlatform).returns(Platform.IOS);
                admobEventHandler.onOpenURL(url);
                sinon.assert.calledWith(<sinon.SinonSpy>nativeBridge.UrlScheme.open, url);
            });
        });

        describe('on Android', () => {
            it('should open using the VIEW Intent', () => {
                (<sinon.SinonStub>nativeBridge.getPlatform).returns(Platform.ANDROID);
                admobEventHandler.onOpenURL(url);
                sinon.assert.calledWith(<sinon.SinonSpy>nativeBridge.Intent.launch, {
                    action: 'android.intent.action.VIEW',
                    uri: url
                });
            });
        });
    });
});
