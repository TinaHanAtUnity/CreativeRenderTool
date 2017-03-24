import 'Workarounds';
import { Platform } from 'Constants/Platform';
import { UnityAds } from 'Native/Backend/UnityAds';
import { IUnityAdsListener } from 'Native/Backend/IUnityAdsListener';
import { FinishState } from 'Constants/FinishState';
import { UnityAdsError } from 'Constants/UnityAdsError';
import { Sdk } from 'Native/Backend/Api/Sdk';
import { DeviceInfo } from 'Native/Backend/Api/DeviceInfo';
import { PlacementState } from 'Models/Placement';

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

const setClientInfo = () => {
    const fields = [
        ['appName', 'setAppName'],
        ['appVersion', 'setAppVersion'],
        ['sdkVersion', 'setSdkVersion'],
        ['sdkVersionName', 'setSdkVersionName'],
        ['debuggable', 'setDebuggable', true],
        ['configUrl', 'setConfigUrl'],
        ['webViewUrl', 'setWebViewUrl'],
        ['webViewHash', 'setWebViewHash'],
        ['webViewVersion', 'setWebViewVersion']
    ];
    fields.forEach(([field, setter, flag]: [string, string, boolean]) => {
        const element = <HTMLInputElement>window.parent.document.getElementById(field);
        Sdk[setter](flag ? element.checked : element.value);
    });
};

const setAndroidDeviceInfo = () => {
    const fields = [
        ['AdvertisingTrackingId'],
        ['LimitAdTrackingFlag'],
        ['AndroidId'],
        ['Manufacturer'],
        ['Model'],
        ['OsVersion'],
        ['ApiLevel'],
        ['Rooted', true],
        ['ScreenWidth'],
        ['ScreenHeight'],
        ['ScreenDensity'],
        ['ScreenLayout'],
        ['ScreenBrightness'],
        ['SystemLanguage'],
        ['TimeZone'],
        ['TotalSpace'],
        ['FreeSpace'],
        ['TotalMemory'],
        ['FreeMemory'],
        ['ConnectionType'],
        ['NetworkType'],
        ['NetworkOperator'],
        ['NetworkOperatorName'],
        ['Headset', true],
        ['DeviceVolume'],
        ['BatteryLevel'],
        ['BatteryStatus'],
        ['RingerMode']
    ];
    fields.forEach(([field, flag]: [string, boolean]) => {
        const element = <HTMLInputElement>window.parent.document.getElementById('android' + field);
        DeviceInfo['set' + field](flag ? element.checked : element.value);
    });
};

const setIosDeviceInfo = () => {
    const fields = [
        ['AdvertisingTrackingId'],
        ['LimitAdTrackingFlag'],
        ['Manufacturer'],
        ['Model'],
        ['OsVersion'],
        ['Rooted', true],
        ['ScreenWidth'],
        ['ScreenHeight'],
        ['ScreenScale'],
        ['ScreenBrightness'],
        ['SystemLanguage'],
        ['TimeZone'],
        ['TotalSpace'],
        ['FreeSpace'],
        ['TotalMemory'],
        ['FreeMemory'],
        ['ConnectionType'],
        ['NetworkType'],
        ['NetworkOperator'],
        ['NetworkOperatorName'],
        ['Headset', true],
        ['DeviceVolume'],
        ['BatteryLevel'],
        ['BatteryStatus'],
        ['UserInterfaceIdiom'],
        ['Simulator', true]
    ];
    fields.forEach(([field, flag]: [string, boolean]) => {
        const element = <HTMLInputElement>window.parent.document.getElementById('ios' + field);
        DeviceInfo['set' + field](flag ? element.checked : element.value);
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

    initializeButton.addEventListener('click', (event: Event) => {
        event.preventDefault();

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
            publicStorage.test.campaignResponse = {
                value: campaignResponseElement.value,
                ts: Date.now()
            };
        }

        window.sessionStorage.clear();
        window.sessionStorage.setItem('PUBLIC', JSON.stringify(publicStorage));

        setClientInfo();

        // tslint:disable:no-console
        const listener: IUnityAdsListener = {
            onUnityAdsReady: (placement: string) => {
                console.log('onUnityAdsReady: ' + placement);
                const placementButton = <HTMLButtonElement>window.parent.document.getElementById(placement);
                const listener = (placementButtonEvent: Event) => {
                    placementButtonEvent.preventDefault();
                    placementButton.disabled = true;
                    placementButton.removeEventListener('click', listener, false);
                    UnityAds.show(placement);
                };
                placementButton.disabled = false;
                placementButton.addEventListener('click', listener, false);
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

    }, false);
}
