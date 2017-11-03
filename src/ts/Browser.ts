import 'Workarounds';
import { Platform } from 'Constants/Platform';
import { UnityAds } from 'Native/Backend/UnityAds';
import { IUnityAdsListener } from 'Native/Backend/IUnityAdsListener';
import { FinishState } from 'Constants/FinishState';
import { UnityAdsError } from 'Constants/UnityAdsError';
import { Sdk } from 'Native/Backend/Api/Sdk';
import { DeviceInfo } from 'Native/Backend/Api/DeviceInfo';
import { PlacementState } from 'Models/Placement';
import { CampaignManager } from 'Managers/CampaignManager';

const resizeHandler = (event?: Event) => {
    const currentOrientation = document.body.classList.contains('landscape') ? 'landscape' : document.body.classList.contains('portrait') ? 'portrait' : null;
    const newOrientation: string = window.innerWidth / window.innerHeight >= 1 ? 'landscape' : 'portrait';
    if(currentOrientation) {
        if(currentOrientation !== newOrientation) {
            document.body.classList.remove(currentOrientation);
            document.body.classList.add(newOrientation);
        }
    } else {
        document.body.classList.add(newOrientation);
    }
};
resizeHandler();
window.addEventListener('resize', resizeHandler, false);

const toInt = (element: HTMLInputElement): number => parseInt(element.value, 10);
const toBoolean = (element: HTMLInputElement): boolean => element.checked;

const setClientInfo = () => {
    const fields = [
        ['appName', 'setAppName'],
        ['appVersion', 'setAppVersion'],
        ['sdkVersion', 'setSdkVersion', toInt],
        ['sdkVersionName', 'setSdkVersionName'],
        ['debuggable', 'setDebuggable', toBoolean],
        ['configUrl', 'setConfigUrl'],
        ['webViewUrl', 'setWebViewUrl'],
        ['webViewHash', 'setWebViewHash'],
        ['webViewVersion', 'setWebViewVersion'],
        ['initTimeStamp', 'setInitTimeStamp', toInt],
        ['reinitialized', 'setReinitialized', toBoolean]
    ];
    fields.forEach(([field, setter, parser]: [string, string, (element: HTMLInputElement) => any]) => {
        const element = <HTMLInputElement>window.parent.document.getElementById(field);
        Sdk[setter](parser ? parser(element) : element.value);
    });
};

const setAndroidDeviceInfo = () => {
    const fields = [
        ['AdvertisingTrackingId'],
        ['LimitAdTrackingFlag', toBoolean],
        ['AndroidId'],
        ['Manufacturer'],
        ['Model'],
        ['OsVersion'],
        ['ApiLevel', toInt],
        ['Rooted', toBoolean],
        ['ScreenWidth', toInt],
        ['ScreenHeight', toInt],
        ['ScreenDensity', toInt],
        ['ScreenLayout', toInt],
        ['ScreenBrightness', toInt],
        ['SystemLanguage'],
        ['TimeZone'],
        ['TotalSpace', toInt],
        ['FreeSpace', toInt],
        ['TotalMemory', toInt],
        ['FreeMemory', toInt],
        ['ConnectionType'],
        ['NetworkType', toInt],
        ['NetworkOperator'],
        ['NetworkOperatorName'],
        ['Headset', toBoolean],
        ['DeviceVolume', toInt],
        ['BatteryLevel', toInt],
        ['BatteryStatus', toInt],
        ['RingerMode', toInt]
    ];
    fields.forEach(([field, parser]: [string, (element: HTMLInputElement) => any]) => {
        const element = <HTMLInputElement>window.parent.document.getElementById('android' + field);
        DeviceInfo['set' + field](parser ? parser(element) : element.value);
    });
};

const setIosDeviceInfo = () => {
    const fields = [
        ['AdvertisingTrackingId'],
        ['LimitAdTrackingFlag', toBoolean],
        ['Manufacturer'],
        ['Model'],
        ['OsVersion'],
        ['Rooted', toBoolean],
        ['ScreenWidth', toInt],
        ['ScreenHeight', toInt],
        ['ScreenScale', toInt],
        ['ScreenBrightness', toInt],
        ['SystemLanguage'],
        ['TimeZone'],
        ['TotalSpace', toInt],
        ['FreeSpace', toInt],
        ['TotalMemory', toInt],
        ['FreeMemory', toInt],
        ['ConnectionType'],
        ['NetworkType', toInt],
        ['NetworkOperator'],
        ['NetworkOperatorName'],
        ['Headset', toBoolean],
        ['DeviceVolume', toInt],
        ['BatteryLevel', toInt],
        ['BatteryStatus', toInt],
        ['UserInterfaceIdiom', toInt],
        ['Simulator', toBoolean]
    ];
    fields.forEach(([field, parser]: [string, (element: HTMLInputElement) => any]) => {
        const element = <HTMLInputElement>window.parent.document.getElementById('ios' + field);
        DeviceInfo['set' + field](parser ? parser(element) : element.value);
    });
};

if(window.parent !== window) {
    const abGroupElement = <HTMLInputElement>window.parent.document.getElementById('abGroup');
    const campaignIdElement = <HTMLInputElement>window.parent.document.getElementById('campaignId');
    const countryElement = <HTMLInputElement>window.parent.document.getElementById('country');
    const platformElement = <HTMLInputElement>window.parent.document.getElementById('platform');
    const gameIdElement = <HTMLInputElement>window.parent.document.getElementById('gameId');
    const testModeElement = <HTMLInputElement>window.parent.document.getElementById('testMode');
    const autoSkipElement = <HTMLInputElement>window.parent.document.getElementById('autoSkip');
    const initializeButton = <HTMLButtonElement>window.parent.document.getElementById('initialize');
    const campaignResponseElement = <HTMLInputElement>window.parent.document.getElementById('campaignResponse');

    const initialize = () => {
        abGroupElement.disabled = true;
        campaignIdElement.disabled = true;
        countryElement.disabled = true;
        platformElement.disabled = true;
        gameIdElement.disabled = true;
        testModeElement.disabled = true;
        autoSkipElement.disabled = true;
        initializeButton.disabled = true;

        const publicStorage: any = {
            test: {}
        };

        if(abGroupElement.value.length) {
            publicStorage.test.abGroup = {
                value: parseInt(abGroupElement.value, 10),
                ts: Date.now()
            };
        }
        if(campaignIdElement.value.length) {
            publicStorage.test.campaignId = {
                value: campaignIdElement.value,
                ts: Date.now()
            };
        }
        if(countryElement.value.length) {
            publicStorage.test.country = {
                value: countryElement.value,
                ts: Date.now()
            };
        }
        if(autoSkipElement.checked) {
            publicStorage.test.autoSkip = {
                value: true,
                ts: Date.now()
            };
        }
        if(campaignResponseElement.value.length) {
            CampaignManager.setCampaignResponse(campaignResponseElement.value);
        }

        window.sessionStorage.clear();
        window.sessionStorage.setItem('PUBLIC', JSON.stringify(publicStorage));

        setClientInfo();

        // tslint:disable:no-console
        const listener: IUnityAdsListener = {
            onUnityAdsReady: (placement: string) => {
                console.log('onUnityAdsReady: ' + placement);
                const placementButton = <HTMLButtonElement>window.parent.document.getElementById(placement);
                if(typeof location !== 'undefined' && location.search.indexOf('headless=1') !== -1) {
                    UnityAds.show(placement);
                } else {
                    const placementButtonlistener = (placementButtonEvent: Event) => {
                        placementButtonEvent.preventDefault();
                        placementButton.disabled = true;
                        placementButton.removeEventListener('click', placementButtonlistener, false);
                        UnityAds.show(placement);
                    };
                    placementButton.disabled = false;
                    placementButton.addEventListener('click', placementButtonlistener, false);
                }
            },
            onUnityAdsStart: (placement: string) => {
                console.log('onUnityAdsStart: ' + placement);
            },
            onUnityAdsFinish: (placement: string, state: FinishState) => {
                console.log('onUnityAdsFinish: ' + placement + ' - ' + state);
            },
            onUnityAdsError: (error: UnityAdsError, message: string) => {
                console.log('onUnityAdsError: ' + error + ' - ' + message);
            },
            onUnityAdsClick: (placement: string) => {
                console.log('onUnityAdsClick: ' + placement);
            },
            onUnityAdsPlacementStateChanged: (placement: string, oldState: PlacementState, newState: PlacementState) => {
                console.log('onUnityAdsPlacementStateChanged: ' + placement + ' ' + PlacementState[oldState] + ' -> ' + PlacementState[newState]);
            }
        };
        // tslint:enable:no-console

        switch(platformElement.value) {
            case 'android':
                setAndroidDeviceInfo();
                UnityAds.initialize(Platform.ANDROID, gameIdElement.value, listener, testModeElement.checked);
                break;

            case 'ios':
                setIosDeviceInfo();
                UnityAds.initialize(Platform.IOS, gameIdElement.value, listener, testModeElement.checked);
                break;

            default:
                throw new Error('Unity Ads webview init failure: no platform defined, unable to initialize native bridge');
        }
    };

    const getHeadlessName = 'getHeadless';
    if(window.parent[getHeadlessName]()) {
        initialize();
    } else {
        initializeButton.addEventListener('click', (event: Event) => {
            event.preventDefault();
            initialize();
        }, false);
    }
}
