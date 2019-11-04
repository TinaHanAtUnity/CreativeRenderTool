import { AndroidAdUnitApi } from 'Ads/Native/Android/__mocks__/AdUnit';
import { AndroidVideoPlayerApi } from 'Ads/Native/Android/__mocks__/VideoPlayer';
import { IosAdUnitApi } from 'Ads/Native/iOS/__mocks__/AdUnit';
import { IosVideoPlayerApi } from 'Ads/Native/iOS/__mocks__/VideoPlayer';
import { AdsPropertiesApi } from 'Ads/Native/__mocks__/AdsProperties';
import { ListenerApi } from 'Ads/Native/__mocks__/Listener';
import { PlacementApi } from 'Ads/Native/__mocks__/Placement';
import { VideoPlayerApi } from 'Ads/Native/__mocks__/VideoPlayer';
import { WebPlayerApi } from 'Ads/Native/__mocks__/WebPlayer';
import { LoadApi } from 'Core/Native/__mocks__/LoadApi';
import { AdMobSignalFactory } from 'AdMob/Utilities/__mocks__/AdMobSignalFactory';
import { InterstitialWebPlayerContainer } from 'Ads/Utilities/__mocks__/WebPlayer/InterstitialWebPlayerContainer';

export const Ads = jest.fn(() => {
    return {
        Api: {
            AdsProperties: new AdsPropertiesApi(),
            Listener: new ListenerApi(),
            Placement: new PlacementApi(),
            VideoPlayer: new VideoPlayerApi(),
            WebPlayer: new WebPlayerApi(),
            Android: {
                AdUnit: new AndroidAdUnitApi(),
                VideoPlayer: new AndroidVideoPlayerApi()
            },
            iOS: {
                AdUnit: new IosAdUnitApi(),
                VideoPlayer: new IosVideoPlayerApi()
            },
            LoadApi: new LoadApi()
        },
        AdMobSignalFactory: new AdMobSignalFactory(),
        InterstitialWebPlayerContainer: new InterstitialWebPlayerContainer(),
        SessionManager: {},
        MissedImpressionManager: {},
        ContentTypeHandlerManager: {},
        Config: {},
        Container: {},
        PrivacyManager: {},
        PlacementManager: {},
        AssetManager: {},
        CampaignManager: {},
        RefreshManager: {},
        ThirdPartyEventManagerFactory: {},
        Analytics: {},
        Store: {},
        PrivacySDK: {}
    };
});
