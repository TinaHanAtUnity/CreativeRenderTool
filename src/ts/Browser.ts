import 'Workarounds';
import { CampaignManager } from 'Ads/Managers/CampaignManager';
import { IUnityAdsListener } from 'Backend/IUnityAdsListener';
import { UnityAds } from 'Backend/UnityAds';
import { Platform } from 'Core/Constants/Platform';
import { Backend } from 'Backend/Backend';
import { VideoOverlay } from 'Ads/Views/VideoOverlay';
import { ConfigManager } from 'Core/Managers/ConfigManager';
import { toAbGroup } from 'Core/Models/ABGroup';
import { ARUtil } from 'AR/Utilities/ARUtil';
import { CurrentPermission, PermissionsUtil, PermissionTypes } from 'Core/Utilities/Permissions';
import { ICoreApi } from 'Core/ICore';

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
    const JS_FUNC_NAME_GET_HEADLESS_LOAD = 'getHeadlessLoad';

    const setClientInfo = () => {
        const fields: [string, string, ((element: HTMLInputElement) => unknown) | undefined][] = [
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
        fields.forEach(([field, setter, parser]: [string, string, ((element: HTMLInputElement) => unknown) | undefined]) => {
            const element = <HTMLInputElement>window.parent.document.getElementById(field);
            // tslint:disable-next-line
            (<any>UnityAds.getBackend().Api.Sdk)[setter](parser ? parser(element) : element.value);
        });
    };

    const setAndroidDeviceInfo = () => {
        const fields: [string, ((element: HTMLInputElement) => unknown) | undefined][] = [
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
            ['RingerMode', toInt],
            ['Imei', undefined]
        ];
        fields.forEach(([field, parser]: [string, ((element: HTMLInputElement) => unknown) | undefined]) => {
            const element = <HTMLInputElement>window.parent.document.getElementById('android' + field);
            // tslint:disable-next-line
            (<any>UnityAds.getBackend().Api.DeviceInfo)['set' + field](parser ? parser(element) : element.value);
        });
    };

    const setIosDeviceInfo = () => {
        const fields: [string, ((element: HTMLInputElement) => unknown) | undefined][] = [
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
        fields.forEach(([field, parser]: [string, ((element: HTMLInputElement) => unknown) | undefined]) => {
            const element = <HTMLInputElement>window.parent.document.getElementById('ios' + field);
            // tslint:disable-next-line
            (<any>UnityAds.getBackend().Api.DeviceInfo)['set' + field](parser ? parser(element) : element.value);
        });
    };

    if(window.parent !== window) {
        const abGroupElement = <HTMLInputElement>window.parent.document.getElementById('abGroup');
        const campaignIdElement = <HTMLInputElement>window.parent.document.getElementById('campaignId');
        const countryElement = <HTMLInputElement>window.parent.document.getElementById('country');
        const platformElement = <HTMLInputElement>window.parent.document.getElementById('platform');
        const gameIdElement = <HTMLInputElement>window.parent.document.getElementById('gameId');
        const testModeElement = <HTMLInputElement>window.parent.document.getElementById('testMode');
        const loadModeElement = <HTMLInputElement>window.parent.document.getElementById('loadMode');
        const autoSkipElement = <HTMLInputElement>window.parent.document.getElementById('autoSkip');
        const initializeButton = <HTMLButtonElement>window.parent.document.getElementById('initialize');
        const loadButton = <HTMLButtonElement>window.parent.document.getElementById('load');
        const campaignResponseElement = <HTMLInputElement>window.parent.document.getElementById('campaignResponse');

        const initialize = () => {
            abGroupElement.disabled = true;
            campaignIdElement.disabled = true;
            countryElement.disabled = true;
            platformElement.disabled = true;
            gameIdElement.disabled = true;
            testModeElement.disabled = true;
            loadButton.disabled = !loadModeElement.checked;
            loadModeElement.disabled = true;
            autoSkipElement.disabled = true;
            initializeButton.disabled = true;

            if (abGroupElement.value.length) {
                ConfigManager.setAbGroup(toAbGroup(parseInt(abGroupElement.value, 10)));
            }

            if (campaignIdElement.value.length) {
                CampaignManager.setCampaignId(campaignIdElement.value);
            }

            if (countryElement.value.length) {
                CampaignManager.setCountry(countryElement.value);
            }

            if (autoSkipElement.checked) {
                VideoOverlay.setAutoSkip(autoSkipElement.checked);
            }

            if (campaignResponseElement.value.length) {
                CampaignManager.setCampaignResponse(campaignResponseElement.value);
            }

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

            ARUtil.isARSupported = () => Promise.resolve(false);
            PermissionsUtil.checkPermissionInManifest = () => Promise.resolve(false);
            PermissionsUtil.checkPermissions = (platform: Platform, core: ICoreApi, permission: PermissionTypes) => Promise.resolve(CurrentPermission.DENIED);

            switch(platformElement.value) {
                case 'android':
                    UnityAds.setBackend(new Backend(Platform.ANDROID));
                    UnityAds.getBackend().Api.Request.setPassthrough(true);
                    setClientInfo();
                    setAndroidDeviceInfo();
                    UnityAds.initialize(Platform.ANDROID, gameIdElement.value, listener, testModeElement.checked, loadModeElement.checked);
                    break;

                case 'ios':
                    UnityAds.setBackend(new Backend(Platform.IOS));
                    UnityAds.getBackend().Api.Request.setPassthrough(true);
                    setClientInfo();
                    setIosDeviceInfo();
                    UnityAds.initialize(Platform.IOS, gameIdElement.value, listener, testModeElement.checked, loadModeElement.checked);
                    break;

                default:
                    throw new Error('Unity Ads webview init failure: no platform defined, unable to initialize native bridge');
            }
        };

        // tslint:disable-next-line
        if((<any>window).parent[JS_FUNC_NAME_GET_HEADLESS]()) {
            initialize();
        // tslint:disable-next-line
         } else if((<any>window).parent[JS_FUNC_NAME_GET_HEADLESS_LOAD]()) {
            loadModeElement.checked = true;
            initialize();
            UnityAds.load('rewardedVideo');
        } else {
            initializeButton.addEventListener('click', (event: Event) => {
                event.preventDefault();
                initialize();
            }, false);

            loadButton.addEventListener('click', (event: Event) => {
                event.preventDefault();
                UnityAds.load('defaultVideoAndPictureZone');
                UnityAds.load('incentivizedZone');
            }, false);

            // tslint:disable-next-line
            (<any>window).parent.document.getElementById('initialize').disabled = false;
            loadButton.disabled = true;
        }
    }
});
