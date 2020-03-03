import { AdMobCampaign } from 'AdMob/Models/AdMobCampaign';
import { ProgrammaticAdMobParser } from 'AdMob/Parsers/ProgrammaticAdMobParser';
import { AuctionResponse } from 'Ads/Models/AuctionResponse';
import { Session } from 'Ads/Models/Session';
import { Backend } from 'Backend/Backend';
import { assert } from 'chai';
import { Platform } from 'Core/Constants/Platform';
import { ICore } from 'Core/ICore';
import { RequestManager } from 'Core/Managers/RequestManager';
import { NativeBridge } from 'Core/Native/Bridge/NativeBridge';
import { SdkApi } from 'Core/Native/Sdk';
import { FileId } from 'Core/Utilities/FileId';
import ValidAdMobCampaign from 'json/campaigns/admob/ValidAdMobCampaign.json';
import 'mocha';
import * as sinon from 'sinon';
import { TestFixtures } from 'TestHelpers/TestFixtures';
import { AuctionPlacement } from 'Ads/Models/AuctionPlacement';
import { CoreConfiguration } from 'Core/Models/CoreConfiguration';

[Platform.ANDROID, Platform.IOS].forEach(platform => {
    describe('ProgrammaticAdMobParser', () => {
        const placementId = 'TestPlacement';
        const mediaId = 'o2YMT0Cmps6xHiOwNMeCrH';
        const correlationId = '583dfda0d933a3630a53249c';
        const url = 'https://r2---sn-n4v7knll.googlevideo.com/videoplayback?id=a6e915b5b0f41a1c&itag=22&source=youtube&requiressl=yes&mm=31&mn=sn-n4v7knll&ms=au&mv=m&pl=19&ei=eo3rWuGXD8-KuAL6oLvQAQ&susc=yti&mime=video/mp4&lmt=1518153041357987&mt=1525386488&ip=4.14.109.2&ipbits=0&expire=1525415418&sparams=ip,ipbits,expire,id,itag,source,requiressl,mm,mn,ms,mv,pl,ei,susc,mime,lmt&signature=4834094C1C09F34DE9D6473658D0B1EE75DB3E10.830B2F45714128B27549A3B15E8BE3CB8EFCBE19&key=ck2';
        const urlNoMime = 'https://r2---sn-n4v7knll.googlevideo.com/videoplayback?id=a6e915b5b0f41a1c&itag=22&source=youtube&requiressl=yes&mm=31&mn=sn-n4v7knll&ms=au&mv=m&pl=19&ei=eo3rWuGXD8-KuAL6oLvQAQ&susc=yti&lmt=1518153041357987&mt=1525386488&ip=4.14.109.2&ipbits=0&expire=1525415418&sparams=ip,ipbits,expire,id,itag,source,requiressl,mm,mn,ms,mv,pl,ei,susc,mime,lmt&signature=4834094C1C09F34DE9D6473658D0B1EE75DB3E10.830B2F45714128B27549A3B15E8BE3CB8EFCBE19&key=ck2';

        let parser: ProgrammaticAdMobParser;
        let backend: Backend;
        let nativeBridge: NativeBridge;
        let core: ICore;
        let request: RequestManager;
        let session: Session;
        let setFileIdSpy: sinon.SinonSpy;

        describe('parsing a campaign', () => {
            let campaign: AdMobCampaign;

            const parse = (data: any) => {
                const auctionPlacement = new AuctionPlacement(placementId, mediaId);
                const response = new AuctionResponse([auctionPlacement], data, mediaId, correlationId);
                return parser.parse(response, session).then((parsedCampaign) => {
                    campaign = <AdMobCampaign>parsedCampaign;
                });
            };

            beforeEach(() => {
                backend = TestFixtures.getBackend(platform);
                nativeBridge = TestFixtures.getNativeBridge(platform, backend);
                core = TestFixtures.getCoreModule(nativeBridge);
                (<any>core.Api).Sdk = sinon.createStubInstance(SdkApi);
                core.Config = sinon.createStubInstance(CoreConfiguration);
                core.Ads = TestFixtures.getAdsModule(core);

                request = sinon.createStubInstance(RequestManager);
                core.RequestManager = request;

                session = TestFixtures.getSession();

                parser = new ProgrammaticAdMobParser(core);
                setFileIdSpy = sinon.spy(FileId, 'setFileID');
                (<sinon.SinonStub>request.followRedirectChain).returns(Promise.resolve(url));
            });

            afterEach(() => {
                setFileIdSpy.restore();
            });

            if (platform === Platform.ANDROID) {
                describe('on Android', () => {

                    beforeEach(() => {
                        sinon.stub(nativeBridge, 'getPlatform').returns(Platform.ANDROID);
                    });

                    describe('without a mime type in url', () => {

                        beforeEach(() => {
                            (<sinon.SinonStub>request.followRedirectChain).returns(Promise.resolve(urlNoMime));
                            return parse(ValidAdMobCampaign);
                        });

                        it('should FileId.setFileId without a mp4 mime type', () => {
                            sinon.assert.calledWith(setFileIdSpy, urlNoMime, 'G2KkvNWTNuU');
                        });
                    });

                    describe('with a mime type in url', () => {
                        beforeEach(() => {
                            (<sinon.SinonStub>request.followRedirectChain).returns(Promise.resolve(url));
                            return parse(ValidAdMobCampaign);
                        });

                        it('should FileId.setFileId without a mp4 mime type', () => {
                            sinon.assert.calledWith(setFileIdSpy, url, 'G2KkvNWTNuU');
                        });
                    });

                    describe('should cache', () => {

                        beforeEach(() => {
                            (<sinon.SinonStub>request.followRedirectChain).returns(Promise.resolve(url));
                            return parse(ValidAdMobCampaign);
                        });

                        afterEach(() => {
                            setFileIdSpy.resetHistory();
                        });

                        it('and call FileId.setFileId', () => {
                            sinon.assert.calledOnce(setFileIdSpy);
                            sinon.assert.calledWith(setFileIdSpy, url, 'G2KkvNWTNuU');
                        });
                    });

                });
            }

            if (platform === Platform.IOS) {
                describe('on iOS', () => {

                    beforeEach(() => {
                        sinon.stub(nativeBridge, 'getPlatform').returns(Platform.IOS);
                    });

                    describe('without a mime type in url', () => {

                        beforeEach(() => {
                            (<sinon.SinonStub>request.followRedirectChain).returns(Promise.resolve(urlNoMime));
                            return parse(ValidAdMobCampaign);
                        });

                        it('should not call FileId.setFileId', () => { // when no mime type should default to streaming
                            sinon.assert.notCalled(setFileIdSpy);
                        });
                    });

                    describe('with a mime type in url', () => {
                        beforeEach(() => {
                            (<sinon.SinonStub>request.followRedirectChain).returns(Promise.resolve(url));
                            return parse(ValidAdMobCampaign);
                        });

                        it('should FileId.setFileId with a mp4 mime type', () => {
                            sinon.assert.calledWith(setFileIdSpy, url, 'G2KkvNWTNuU.mp4');
                        });
                    });

                    describe('should cache', () => {

                        beforeEach(() => {
                            (<sinon.SinonStub>request.followRedirectChain).returns(Promise.resolve(url));
                            return parse(ValidAdMobCampaign);
                        });

                        afterEach(() => {
                            setFileIdSpy.resetHistory();
                        });

                        it('and call FileId.setFileId', () => {
                            sinon.assert.calledOnce(setFileIdSpy);
                            sinon.assert.calledWith(setFileIdSpy, url, 'G2KkvNWTNuU.mp4');
                        });
                    });
                });
            }

            describe('with a proper JSON payload', () => {

                const validateCampaign = () => {
                    const json = ValidAdMobCampaign;
                    assert.isNotNull(campaign);
                    assert.equal(campaign.getDynamicMarkup(), json.content, 'Markup is not equal');
                    assert.equal(campaign.getSession(), session, 'Session is not equal');
                    assert.deepEqual(campaign.getTrackingUrls(), json.trackingUrls, 'Tracking URLs are not equal');
                };

                describe(`on ${Platform[platform]}`, () => {
                    beforeEach(() => {
                        sinon.stub(nativeBridge, 'getPlatform').returns(platform);
                        setFileIdSpy.resetHistory();
                        return parse(ValidAdMobCampaign);
                    });

                    it('should have a video cached from the AdMob ad', () => {
                        const assets = campaign.getRequiredAssets();
                        assert.lengthOf(assets, 0, 'Campaign should not have required assets');
                    });

                    it('should have a video cached from the AdMob ad', () => {
                        const assets = campaign.getOptionalAssets();
                        assert.lengthOf(assets, 0, 'Campaign should not have optional assets');
                    });

                    it('should have valid data', validateCampaign);

                });

            });
        });
    });
});
