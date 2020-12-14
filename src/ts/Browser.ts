import 'Workarounds';
import { IUnityAdsListener } from 'Backend/IUnityAdsListener';
import { UnityAds } from 'Backend/UnityAds';
import { Platform } from 'Core/Constants/Platform';
import { Backend } from 'Backend/Backend';
import { ARUtil } from 'AR/Utilities/ARUtil';
import { CurrentPermission, PermissionsUtil, PermissionTypes } from 'Core/Utilities/Permissions';
import { ICoreApi } from 'Core/ICore';
import { AdsConfigurationParser } from 'Ads/Parsers/AdsConfigurationParser';
import { StorageType } from 'Core/Native/Storage';
import { CampaignManager } from 'Ads/Managers/CampaignManager';

document.addEventListener('DOMContentLoaded', () => {

    const resizeHandler = (event?: Event) => {
        const currentOrientation = document.body.classList.contains('landscape') ? 'landscape' : document.body.classList.contains('portrait') ? 'portrait' : null;
        const newOrientation: string = window.innerWidth / window.innerHeight >= 1 ? 'landscape' : 'portrait';
        if (currentOrientation) {
            if (currentOrientation !== newOrientation) {
                document.body.classList.remove(currentOrientation);
                document.body.classList.add(newOrientation);
            }
        } else {
            document.body.classList.add(newOrientation);
        }
    };
    resizeHandler();
    window.addEventListener('resize', resizeHandler, false);

    const urlParams = new URLSearchParams(window.parent.location.search);
    const type = urlParams.get('type');
    const content = urlParams.get('content');
    const platform = urlParams.get('platform');

    const delay = (ms: number) => {
        return new Promise(resolve => setTimeout(resolve, ms));
    };

    const campaign = '{\n' +
        '   "auctionId":"b33c7a80-76b4-4c88-bad1-ecfbb6fe02b3",\n' +
        '   "correlationId":"ijHwk5hw46yqKJ0aZnQTCV",\n' +
        '   "placements":{\n' +
        '      "video":{\n' +
        '         "mediaId":"5fadf4d89ee40f7df510b6d8-5fab57f310012121acfacaa3",\n' +
        '         "tracking":{\n' +
        '            "events":{\n' +
        '               "click":{\n' +
        '                  "urlIndices":[\n' +
        '                     0\n' +
        '                  ],\n' +
        '                  "params":{\n' +
        '                     "eventType":"click",\n' +
        '                     "placement":"video"\n' +
        '                  }\n' +
        '               },\n' +
        '               "complete":{\n' +
        '                  "urlIndices":[\n' +
        '                     0\n' +
        '                  ],\n' +
        '                  "params":{\n' +
        '                     "eventType":"complete",\n' +
        '                     "placement":"video"\n' +
        '                  }\n' +
        '               },\n' +
        '               "error":{\n' +
        '                  "urlIndices":[\n' +
        '                     0\n' +
        '                  ],\n' +
        '                  "params":{\n' +
        '                     "eventType":"error",\n' +
        '                     "placement":"video"\n' +
        '                  }\n' +
        '               },\n' +
        '               "firstQuartile":{\n' +
        '                  "urlIndices":[\n' +
        '                     0\n' +
        '                  ],\n' +
        '                  "params":{\n' +
        '                     "eventType":"firstQuartile",\n' +
        '                     "placement":"video"\n' +
        '                  }\n' +
        '               },\n' +
        '               "loaded":{\n' +
        '                  "urlIndices":[\n' +
        '                     0\n' +
        '                  ],\n' +
        '                  "params":{\n' +
        '                     "eventType":"loaded",\n' +
        '                     "placement":"video"\n' +
        '                  }\n' +
        '               },\n' +
        '               "midpoint":{\n' +
        '                  "urlIndices":[\n' +
        '                     0\n' +
        '                  ],\n' +
        '                  "params":{\n' +
        '                     "eventType":"midpoint",\n' +
        '                     "placement":"video"\n' +
        '                  }\n' +
        '               },\n' +
        '               "show":{\n' +
        '                  "urlIndices":[\n' +
        '                     0\n' +
        '                  ],\n' +
        '                  "params":{\n' +
        '                     "eventType":"show",\n' +
        '                     "placement":"video"\n' +
        '                  }\n' +
        '               },\n' +
        '               "skip":{\n' +
        '                  "urlIndices":[\n' +
        '                     0\n' +
        '                  ],\n' +
        '                  "params":{\n' +
        '                     "eventType":"skip",\n' +
        '                     "placement":"video"\n' +
        '                  }\n' +
        '               },\n' +
        '               "stalled":{\n' +
        '                  "urlIndices":[\n' +
        '                     0\n' +
        '                  ],\n' +
        '                  "params":{\n' +
        '                     "eventType":"stalled",\n' +
        '                     "placement":"video"\n' +
        '                  }\n' +
        '               },\n' +
        '               "start":{\n' +
        '                  "urlIndices":[\n' +
        '                     1,\n' +
        '                     0\n' +
        '                  ],\n' +
        '                  "params":{\n' +
        '                     "datapts":"yL3VFka9pOQYIvmVko-I6QL2RPM60vUrySeJvguqi1RBW_jsPSpJ2os8DNoNVdHYsL683GnIl3sCAxVls9XoGTosFqCQTz9zmXLZqdHZs5rsUnCiTDsa6v8KOJtxFtP-1glFmV4t-XB5LuRooRBhdNxL0ZQjj-Mj1Im6g6k6AWfhO24WUgjfWu4_h_NeTE0ptGYeb-6Se63Hxak45CX9x-hwag8Qa7nmLcPqSf576lh5QZY1_BRgWkcwg-17B_rb43HDD3m6Vjf4YMArCpOg2UGerSErOSQF6QehoecM7Xy9sOqQT8gDqRp2BkvjnA80SZs8zh3z1sFmnfdfPVVLZporcsC5jCqNaTf69jzuuMERv-MCOf_2oIl3ud0gG3kS4PCxIuaatp3mGV21ZUSzcmQnVQEc278oigpPXagTsqh_3lgHOZCKwsJuIPqAA14eS6ELjt3Zv8Fn7fqACwZYJwTsrBTujS4qFyfnIq1uadNAakK9_tjDzh-Pt7o3bfw-BWSqcIAtWhyhPWHgztepuvHelEPhQRYhR5C9quuijeHiR7pfEPWxBklLjOF1U14d5Z-Sjgg_cC99Y_08lbKlegFL_lHicpn89uPwfEeUkhDQTwkQ8PNOwlVGA9nR4f8AiSgRfjmeDL7dME0m8UjONH286V7X8B8Ly5yZB16qkK58kehrm5TciMiACJwf3bzScl_Yh5bpi_XEKtw2pHnSbXq5GaE9K9Fms08ivme4rStmOCb9pxnLrGBUsGKtirwUJoOK5mMEegu_YiAqOH3HNjePBNSDdE9Twi9bF3VT06SyDDdDz5D7nd6PzMWof-Uf1SVoIJ5OR4XGoMd104CUOzMBkKx_hCERIkqQzqUa_RTgxOc2f51ZsvAnMccwmwh4Gf2HJPDodl8_X5w4ouOMqgDDyhlh5S8h_3VZm_ILhLBIAGlrO0s5tjlF_TsoOFv-WJY-ktyuvC7bymIJFmdvZoBoQ0ikB9JzuHRSTqTt7GiE_38CusnwQt9nz9w6BDlgIeQWQYEzYhHP4c1XAM89n_wULZ89zYtLRPfhxWZZ3zMdjWjOMgVinU9mTYo2p-H--6iRViQyDzDE0QKJ9fqCyZ6rZp0vlDVC0zKkMGzhrRqpUY33pZA4Cys5970Q1Mvk8rV92a89mjqFklJbbju8PZNHmk_jMQNBuggbzB64cdSSJCyYjNad6bXqOVZjAhu-TE6aoCGk4EcclBCEmuD_sBqfNIpoPnaNm1JzACkJu1aHLQRADUV68-f4vsPfr_VSc3MCAOUQMw2IEwjsFWpUwsXHj3JY5E75aqCAH2xp4YBho6DYsmF-5NFKoBucP8tw5AOtoRpf7sRzb9cb6XX6lPg_cPkmOUWdhhUGTPI4yz9r-mx8xJxNmu6LvOfv83X0oKhnE0qIIBvwYFdKqV7s0WBwPX1-Y97suM8ifyllzT7STMshHNNWnY4xx-SHBrgT8_3mJnpbN090FbAiqJgpQqYSxcIc4gOCTFz3pCHw1GKZqMm4ClC_nmmtRcUJSJNT9XhdLraytf2IRBarQIGeF-C25EjLTWr6Kk-M1ocR7QJIzNPI0qLCj8UHBXK_HZ1CQV-HGBLZVxljesnn6OVnbIkidGeC_INa5NHaKnqoQHIFNX2rIdQriNlKVjzTqrlI9vwuPouO-k4N4gc0Hd_AuTLJbGx-vnyFlhy8RH3eL1EkUpqksPwaJymgwZNWUWXtPVZqbh218e93t7xtJw%3D%3D",\n' +
        '                     "eventType":"start",\n' +
        '                     "placement":"video"\n' +
        '                  }\n' +
        '               },\n' +
        '               "thirdQuartile":{\n' +
        '                  "urlIndices":[\n' +
        '                     0\n' +
        '                  ],\n' +
        '                  "params":{\n' +
        '                     "eventType":"thirdQuartile",\n' +
        '                     "placement":"video"\n' +
        '                  }\n' +
        '               },\n' +
        '               "videoEndCardClick":{\n' +
        '                  "urlIndices":[\n' +
        '                     0\n' +
        '                  ],\n' +
        '                  "params":{\n' +
        '                     "eventType":"videoEndCardClick",\n' +
        '                     "placement":"video"\n' +
        '                  }\n' +
        '               }\n' +
        '            }\n' +
        '         },\n' +
        '         "rs":"+A733wvU1aKwyYe34aYQdwYny3wMbwRUuei1rhoLtjU="\n' +
        '      }\n' +
        '   },\n' +
        '   "media":{\n' +
        '      "5fadf4d89ee40f7df510b6d8-5fab57f310012121acfacaa3":{\n' +
        '         "contentType":"comet/campaign",\n' +
        '         "content":"' + decodeURI(content === null ? '' : content) + '",\n' +
        '         "campaignId":"5fadf4d89ee40f7df510b6d8-5fab57f310012121acfacaa3",\n' +
        '         "seatId":9000,\n' +
        '         "adType":"VIDEO"\n' +
        '      }\n' +
        '   },\n' +
        '   "trackingTemplates":[\n' +
        '      "https://tracking.prd.mz.internal.unity3d.com/operative/{{placement}}?data=H4sIAAAAAAAA_0xRzZKiPBR9mmZjaYVf6QULG1FjC04riLCxAokSCAkfRFGf_itmnO7Zcc49P_cSlC1bcW0cW0EN3ZAbYY6mK-iaSyo4xE6m6_kU2WA8tTJjbOS2Pc4QVsckP2eZdSZAy3Qlu3LMCMROLurJlVP50PEE4W5C7qhuGFFyVDeIXoZAAExjqlmmha3zVNOAoVrEMqaakgvOye_a8NEQp6dnquTiymX7cKK9gsmN5sRHFXE2S-8vFJgwJyD3azcylXOLatKLtgpQTZwfeCBtRwV3lAuqhy1VwzZVhdGayhkOW5RXlF8c2V6Jwm5m55wR64hSE0zRsM6ftG-4bTHliDngh_ou4EQOhb8PAIpo5PYqPY4yRvCffNF9axuG5Fm0tYM4bgXFStPS2wz_rR-Qd5ekHbp-qAVtO7kj_11JJ_-hl6gm3r35h_GJLAR2Nt4ShtCfhd4JBqG38_bh7_GvVpwpG-7-Y-nylhA-J7yj8uEYNngxK0IvhXTU6dR6MXv6JI5m2YZuTt-NFxlTLAtHBYMPf_9wDQBTkahzgCJFRbhDHusiW-Z0S9cwekI1oLCDfGfmLrRg1RwP7vp9Mohw7NNt6T0Dt6fJselhKWgQzvqgnJl-7Mk03pVbF4Dt3LtvQlan4Uz6oacm4aVPy5mahEUBaU8T_aOBpbhvw1kH6-CRxguQxl9DNhiytvPIDMJL78-H-Q7AUvQbd83IajZoNH9-0bfz6hnM_Q7WrBgW9cNc3bjrJjl-vTS5Gjwr_aV55g9owXpR5Q-VJ7HKNnFwy-q0SfXDIznumkwzrjg2G7xiRbryX9_VM3XNMtMA3bjrDq-SIbsP9j3NV-vbcIM_rzrIAzWh0ILc0_0IgChiMNSZFh0PKPPYLlWLNIkuZhJF2n7lgaiyQVzidaKuw1BrfF9PK39xgAfe7Hfxbv3FDzLTEh0fd15YpZ9ZLYtgmb__2g8PU_Q5hZZfzh7nr8m9XD4_2s4sTnd_TFw3O7F56oHy1JXteHOqik-DfxhCPWUXpSfZjZI-Qo4vnpQx9KYtzAkYvWm2j3LKpeiKN_1jBLkkbOSjfLTdj44jFZxU42S9ae-jWdMwEpPsk8rBq08nujXYP1ehv3nT3BGjFRktSV6JQe4WrajJm7awpxMwMTQbTGx7tEdn1NJv__8AAAD__wEAAP__CjUhxOwEAAA=\u0026adType=VIDEO\u0026bidBundle=\u0026buyerID=\u0026creativeId=\u0026dealCode=\u0026dspId=comet\u0026eventType={{eventType}}\u0026seatId=9000\u0026spt=cpi\u0026gamerSid=%GAMER_SID%\u0026adUnitId=%AD_UNIT_ID%\u0026adFormat=%AD_FORMAT%",\n' +
        '      "https://tracking.prd.mz.internal.unity3d.com/impression/{{placement}}?adFormat=%25AD_FORMAT%25\u0026adUnitId=%25AD_UNIT_ID%25\u0026data={{datapts}}\u0026gamerSid=%25GAMER_SID%25\u0026isomenabled=%25OM_ENABLED%25\u0026key=11\u0026omvendors=%25OM_VENDORS%25"\n' +
        '   ]\n' +
        '}\n';
    const initialize = () => {
        AdsConfigurationParser.setIsBrowserBuild(true);

        CampaignManager.setCampaignResponse(campaign);

        // tslint:disable:no-console
        const listener: IUnityAdsListener = {
            onUnityAdsReady: (placement: string) => {
                console.log('onUnityAdsReady: ' + placement);
                delay(2000).then(() => {
                    UnityAds.show(placement);
                });
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
        PermissionsUtil.checkPermissions = (platform1: Platform, core: ICoreApi, permission: PermissionTypes) => Promise.resolve(CurrentPermission.DENIED);

        switch (platform) {
            case 'android':
                UnityAds.setBackend(new Backend(Platform.ANDROID));
                UnityAds.getBackend().Api.Request.setPassthrough(true);
                UnityAds.getBackend().Api.Storage.set(StorageType.PUBLIC, 'test.forceLoadV5.value', false);
                UnityAds.initialize(Platform.ANDROID, '14851', listener, false, false);
                break;

            case 'ios':
                UnityAds.setBackend(new Backend(Platform.IOS));
                UnityAds.getBackend().Api.Request.setPassthrough(true);
                UnityAds.getBackend().Api.Storage.set(StorageType.PUBLIC, 'test.forceLoadV5.value', false);
                UnityAds.initialize(Platform.IOS, '14851', listener, false, false);
                break;

            default:
                throw new Error('Unity Ads webview init failure: no platform defined, unable to initialize native bridge');
        }
    };
    initialize();
});
