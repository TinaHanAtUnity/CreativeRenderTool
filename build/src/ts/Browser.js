import 'Workarounds';
import { UnityAds } from 'Backend/UnityAds';
import { Platform } from 'Core/Constants/Platform';
import { Backend } from 'Backend/Backend';
import { ARUtil } from 'AR/Utilities/ARUtil';
import { CurrentPermission, PermissionsUtil } from 'Core/Utilities/Permissions';
import { AdsConfigurationParser } from 'Ads/Parsers/AdsConfigurationParser';
import { StorageType } from 'Core/Native/Storage';
import { CampaignManager } from 'Ads/Managers/CampaignManager';
document.addEventListener('DOMContentLoaded', () => {
    const resizeHandler = (event) => {
        const currentOrientation = document.body.classList.contains('landscape') ? 'landscape' : document.body.classList.contains('portrait') ? 'portrait' : null;
        const newOrientation = window.innerWidth / window.innerHeight >= 1 ? 'landscape' : 'portrait';
        if (currentOrientation) {
            if (currentOrientation !== newOrientation) {
                document.body.classList.remove(currentOrientation);
                document.body.classList.add(newOrientation);
            }
        }
        else {
            document.body.classList.add(newOrientation);
        }
    };
    resizeHandler();
    window.addEventListener('resize', resizeHandler, false);
    const urlParams = new URLSearchParams(window.parent.location.search);
    let type = urlParams.get('type');
    let content = urlParams.get('content');
    switch (type) {
        case 'programmatic-banner-html':
            if (content !== null) {
                window.parent.document.write(decodeURI(content));
            }
            return;
        case 'programmatic-static-interstitial-html':
            if (content !== null) {
                window.parent.document.write(decodeURI(content));
            }
            return;
        case 'programmatic-mraid':
            if (content !== null) {
                window.parent.document.write(decodeURI(content));
            }
            return;
        case 'programmatic-mraid-playable':
            if (content !== null) {
                const html = '<iframe width="100%" height="100%" frameborder="0" src="' + decodeURI(content) + '"></iframe>';
                window.parent.document.write(html);
            }
            return;
        case 'programmatic-vast':
            type = 'programmatic/vast';
            content = encodeURI(content == null ? '' : content);
            break;
        case 'comet-campaign':
            type = 'comet/campaign';
            break;
        case 'programmatic-admob-video':
            type = 'programmatic/admob-video';
            break;
        default:
    }
    const platform = urlParams.get('platform');
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
        '         "contentType":"' + type + '",\n' +
        '         "content":"' + content + '",\n' +
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
        const listener = {
            onUnityAdsReady: (placement) => {
                console.log('onUnityAdsReady: ' + placement);
                const placementButton = window.parent.document.getElementById(placement);
                if (placementButton) {
                    const placementButtonlistener = (placementButtonEvent) => {
                        placementButtonEvent.preventDefault();
                        placementButton.disabled = true;
                        placementButton.removeEventListener('click', placementButtonlistener, false);
                        UnityAds.show(placement);
                    };
                    placementButton.addEventListener('click', placementButtonlistener, false);
                    placementButton.disabled = false;
                }
            },
            onUnityAdsStart: (placement) => {
                console.log('onUnityAdsStart: ' + placement);
            },
            onUnityAdsFinish: (placement, state) => {
                console.log('onUnityAdsFinish: ' + placement + ' - ' + state);
            },
            onUnityAdsError: (error, message) => {
                console.log('onUnityAdsError: ' + error + ' - ' + message);
            },
            onUnityAdsClick: (placement) => {
                console.log('onUnityAdsClick: ' + placement);
            },
            onUnityAdsPlacementStateChanged: (placement, oldState, newState) => {
                console.log('onUnityAdsPlacementStateChanged: ' + placement + ' ' + oldState + ' -> ' + newState);
            }
        };
        // tslint:enable:no-console
        ARUtil.isARSupported = () => Promise.resolve(false);
        PermissionsUtil.checkPermissionInManifest = () => Promise.resolve(false);
        PermissionsUtil.checkPermissions = (platform1, core, permission) => Promise.resolve(CurrentPermission.DENIED);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQnJvd3Nlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy90cy9Ccm93c2VyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sYUFBYSxDQUFDO0FBRXJCLE9BQU8sRUFBRSxRQUFRLEVBQUUsTUFBTSxrQkFBa0IsQ0FBQztBQUM1QyxPQUFPLEVBQUUsUUFBUSxFQUFFLE1BQU0seUJBQXlCLENBQUM7QUFDbkQsT0FBTyxFQUFFLE9BQU8sRUFBRSxNQUFNLGlCQUFpQixDQUFDO0FBQzFDLE9BQU8sRUFBRSxNQUFNLEVBQUUsTUFBTSxxQkFBcUIsQ0FBQztBQUM3QyxPQUFPLEVBQUUsaUJBQWlCLEVBQUUsZUFBZSxFQUFtQixNQUFNLDRCQUE0QixDQUFDO0FBRWpHLE9BQU8sRUFBRSxzQkFBc0IsRUFBRSxNQUFNLG9DQUFvQyxDQUFDO0FBQzVFLE9BQU8sRUFBRSxXQUFXLEVBQUUsTUFBTSxxQkFBcUIsQ0FBQztBQUNsRCxPQUFPLEVBQUUsZUFBZSxFQUFFLE1BQU0sOEJBQThCLENBQUM7QUFFL0QsUUFBUSxDQUFDLGdCQUFnQixDQUFDLGtCQUFrQixFQUFFLEdBQUcsRUFBRTtJQUUvQyxNQUFNLGFBQWEsR0FBRyxDQUFDLEtBQWEsRUFBRSxFQUFFO1FBQ3BDLE1BQU0sa0JBQWtCLEdBQUcsUUFBUSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsUUFBUSxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLFFBQVEsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUM7UUFDMUosTUFBTSxjQUFjLEdBQVcsTUFBTSxDQUFDLFVBQVUsR0FBRyxNQUFNLENBQUMsV0FBVyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxVQUFVLENBQUM7UUFD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