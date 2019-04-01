import { BannerSize } from 'Banners/Utilities/BannerSize';
import { Platform } from 'Core/Constants/Platform';
import { AndroidDeviceInfo } from 'Core/Models/AndroidDeviceInfo';
import { IosDeviceInfo } from 'Core/Models/IosDeviceInfo';

import { assert } from 'chai';
import * as sinon from 'sinon';

describe('BannerSize', () => {

    describe('iOS', () => {

        let iOSDeviceInfo: IosDeviceInfo;

        beforeEach(() => {
            iOSDeviceInfo = sinon.createStubInstance(IosDeviceInfo);
        });

        it('should return 728x90 when model is iPad', () => {
            (<sinon.SinonStub>iOSDeviceInfo.getModel).returns('ipad');
            const bannerDimensions = BannerSize.getPlatformDimensions(Platform.IOS, iOSDeviceInfo);
            assert.equal(bannerDimensions, BannerSize.LargeBannerDimensions);
        });

        it('should return 320x50 when model is not an iPad', () => {
            (<sinon.SinonStub>iOSDeviceInfo.getModel).returns('literally-any-other-iDevice');
            const bannerDimensions = BannerSize.getPlatformDimensions(Platform.IOS, iOSDeviceInfo);
            assert.equal(bannerDimensions, BannerSize.SmallBannerDimensions);
        });
    });

    describe('Android', () => {

        let androidDeviceInfo: AndroidDeviceInfo;

        beforeEach(() => {
            androidDeviceInfo = sinon.createStubInstance(AndroidDeviceInfo);
            (<sinon.SinonStub>androidDeviceInfo.get).withArgs('screenHeight').returns(700);
            (<sinon.SinonStub>androidDeviceInfo.get).withArgs('screenWidth').returns(700);
        });

        it('should return 728x90 when screenHeight or screenWidth is over 7 inches', () => {
            (<sinon.SinonStub>androidDeviceInfo.getScreenDensity).returns(100);
            const bannerDimensions = BannerSize.getPlatformDimensions(Platform.ANDROID, androidDeviceInfo);
            assert.equal(bannerDimensions, BannerSize.LargeBannerDimensions);
        });

        it('should return 320x50 when screenHeight or screenWidth is under 7 inches', () => {
            (<sinon.SinonStub>androidDeviceInfo.getScreenDensity).returns(101);
            const bannerDimensions = BannerSize.getPlatformDimensions(Platform.ANDROID, androidDeviceInfo);
            assert.equal(bannerDimensions, BannerSize.SmallBannerDimensions);
        });
    });
});
