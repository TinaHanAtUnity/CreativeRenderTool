import 'Workarounds';
import { Platform } from 'Common/Constants/Platform';
import { UnityAds } from 'Backend/UnityAds';
import { IUnityAdsListener } from 'Backend/IUnityAdsListener';
import { Sdk } from 'Backend/Api/Sdk';
import { DeviceInfo } from 'Backend/Api/DeviceInfo';
import { CampaignManager } from 'Ads/Managers/CampaignManager';

document.addEventListener('DOMContentLoaded', () => {
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
    const JS_FUNC_NAME_GET_HEADLESS = 'getHeadless';

    const setClientInfo = () => {
        const fields: Array<[string, string, ((element: HTMLInputElement) => any) | undefined]> = [
            ['appName', 'setAppName', undefined],
            ['appVersion', 'setAppVersion', undefined],
            ['sdkVersion', 'setSdkVersion', toInt],
            ['sdkVersionName', 'setSdkVersionName', undefined],
            ['debuggable', 'setDebuggable', toBoolean],
            ['configUrl', 'setConfigUrl', undefined],
            ['webViewUrl', 'setWebViewUrl', undefined],
            ['webViewHash', 'setWebViewHash', undefined],
            ['webViewVersion', 'setWebViewVersion', undefined],
            ['initTimeStamp', 'setInitTimeStamp', toInt],
            ['reinitialized', 'setReinitialized', toBoolean]
        ];
        fields.forEach(([field, setter, parser]: [string, string, ((element: HTMLInputElement) => any) | undefined]) => {
            const element = <HTMLInputElement>window.parent.document.getElementById(field);
            (<any>Sdk)[setter](parser ? parser(element) : element.value);
        });
    };

    const setAndroidDeviceInfo = () => {
        const fields: Array<[string, ((element: HTMLInputElement) => any) | undefined]> = [
            ['AdvertisingTrackingId', undefined],
            ['LimitAdTrackingFlag', toBoolean],
            ['AndroidId', undefined],
            ['Manufacturer', undefined],
            ['Model', undefined],
            ['OsVersion', undefined],
            ['ApiLevel', toInt],
            ['Rooted', toBoolean],
            ['ScreenWidth', toInt],
            ['ScreenHeight', toInt],
            ['ScreenDensity', toInt],
            ['ScreenLayout', toInt],
            ['ScreenBrightness', toInt],
            ['SystemLanguage', undefined],
            ['TimeZone', undefined],
            ['TotalSpace', toInt],
            ['FreeSpace', toInt],
            ['TotalMemory', toInt],
            ['FreeMemory', toInt],
            ['ConnectionType', undefined],
            ['NetworkType', toInt],
            ['NetworkOperator', undefined],
            ['NetworkOperatorName', undefined],
            ['Headset', toBoolean],
            ['DeviceVolume', toInt],
            ['BatteryLevel', toInt],
            ['BatteryStatus', toInt],
            ['RingerMode', toInt]
        ];
        fields.forEach(([field, parser]: [string, ((element: HTMLInputElement) => any) | undefined]) => {
            const element = <HTMLInputElement>window.parent.document.getElementById('android' + field);
            (<any>DeviceInfo)['set' + field](parser ? parser(element) : element.value);
        });
    };

    const setIosDeviceInfo = () => {
        const fields: Array<[string, ((element: HTMLInputElement) => any) | undefined]> = [
            ['AdvertisingTrackingId', undefined],
            ['LimitAdTrackingFlag', toBoolean],
            ['Manufacturer', undefined],
            ['Model', undefined],
            ['OsVersion', undefined],
            ['Rooted', toBoolean],
            ['ScreenWidth', toInt],
            ['ScreenHeight', toInt],
            ['ScreenScale', toInt],
            ['ScreenBrightness', toInt],
            ['SystemLanguage', undefined],
            ['TimeZone', undefined],
            ['TotalSpace', toInt],
            ['FreeSpace', toInt],
            ['TotalMemory', toInt],
            ['FreeMemory', toInt],
            ['ConnectionType', undefined],
            ['NetworkType', toInt],
            ['NetworkOperator', undefined],
            ['NetworkOperatorName', undefined],
            ['Headset', toBoolean],
            ['DeviceVolume', toInt],
            ['BatteryLevel', toInt],
            ['BatteryStatus', toInt],
            ['UserInterfaceIdiom', toInt],
            ['Simulator', toBoolean]
        ];
        fields.forEach(([field, parser]: [string, ((element: HTMLInputElement) => any) | undefined]) => {
            const element = <HTMLInputElement>window.parent.document.getElementById('ios' + field);
            (<any>DeviceInfo)['set' + field](parser ? parser(element) : element.value);
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
                    if(placementButton) {
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
                onUnityAdsFinish: (placement: string, state: string) => {
                    console.log('onUnityAdsFinish: ' + placement + ' - ' + state);
                },
                onUnityAdsError: (error: string, message: string) => {
                    console.log('onUnityAdsError: ' + error + ' - ' + message);
                },
                onUnityAdsClick: (placement: string) => {
                    console.log('onUnityAdsClick: ' + placement);
                },
                onUnityAdsPlacementStateChanged: (placement: string, oldState: string, newState: string) => {
                    console.log('onUnityAdsPlacementStateChanged: ' + placement + ' ' + oldState + ' -> ' + newState);
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

        if((<any>window).parent[JS_FUNC_NAME_GET_HEADLESS]()) {
            initialize();
        } else {
            initializeButton.addEventListener('click', (event: Event) => {
                event.preventDefault();
                initialize();
            }, false);
            (<any>window).parent.document.getElementById('initialize').disabled = false;
        }
    }
});
