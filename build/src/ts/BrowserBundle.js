(function () {
    'use strict';

    class DOMUtils {
        // This implementation is taken from https://developer.mozilla.org/en/docs/Web/API/DOMParser
        static parseFromString(markup, type) {
            if (/^\s*text\/html\s*(?:;|$)/i.test(type)) {
                const doc = document.implementation.createHTMLDocument('');
                if (markup.toLowerCase().indexOf('<!doctype') > -1) {
                    doc.documentElement.innerHTML = markup;
                }
                else {
                    doc.body.innerHTML = markup;
                }
                return doc;
            }
            else {
                return DOMUtils.nativeParse.apply(new DOMParser(), [markup, type]);
            }
        }
    }
    DOMUtils.nativeParse = DOMParser.prototype.parseFromString;

    class Polyfiller {
        static getObjectValuesFunction() {
            return (object) => {
                return Object.keys(object).map((values) => object[values]);
            };
        }
    }

    // In certain versions of Android, we found that DOMParser might not support
    // parsing text/html mime types.
    // tslint:disable:no-empty
    (((DOMParser) => {
        // Firefox/Opera/IE throw errors on unsupported types
        try {
            // WebKit returns null on unsupported types
            if ((new DOMParser()).parseFromString('', 'text/html')) {
                // text/html parsing is natively supported
                return;
            }
        }
        catch (ex) {
        }
        DOMParser.prototype.parseFromString = DOMUtils.parseFromString;
    })(DOMParser));
    // tslint:enable:no-empty
    /*
     *  Object.values() has issues with older Android Devices.
     */
    if (!Object.values) {
        Object.values = Polyfiller.getObjectValuesFunction();
    }
    Array.prototype.unique = function () {
        // tslint:disable-next-line
        return this.filter((val, index) => this.indexOf(val) === index);
    };

    document.addEventListener('DOMContentLoaded', () => {
        //const mraid = '<!DOCTYPE html> <html> <head> <meta charset="utf-8"> <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" > <title>Ad</title> </head> <body> <script src="mraid.js"></script> <script>var AK_CLICK_URL="https://click-us.adikteev.com/v1/click?creativeGroupId=124557&creativeGroupName=202009_MRAID_Launch&creativeId=226018&creativeName=MRAID_300x250_KingsGroup_GOG_Launch_Sep20&creativeType=creative_mraid_banner&retina=0&campaign=31496&supplier=342&supplier_name=unity&adSession=TObgYDo8EeuecrkmZak4SA&bidrequest_id=721d7fee-4563-49bf-b67f-cc10f53063ae&user_id=&w=300&h=250&deviceId=502dfa5f7353b5ed82fdaf2c916c493e4bd1ad5e&algorithm=ExternalCtrEstimation&crAlgorithm=ExternalCrEstimation&country=USA&country_a2=US&city=&idfa=502dfa5f7353b5ed82fdaf2c916c493e4bd1ad5e&idfa_plain=37945664-7DF3-4780-BFE7-74B793206A85&publisherAppId=372836496&publisherAnonymousId=4135f3e520a7259bb728f90f4e969c68&publisher_name=Coin%20Dozer&";</script> <script src="https://cdn-ww.adikteev.com/creatives/bf30dea6-3843-3029-3d1c-d146cc4ba17c.js"></script> <img src="https://impression-us.adikteev.com/3.0/?creativeGroupId=124557&creativeGroupName=202009_MRAID_Launch&creativeId=226018&creativeName=MRAID_300x250_KingsGroup_GOG_Launch_Sep20&creativeType=creative_mraid_banner&retina=0&campaign=31496&supplier=342&supplier_name=unity&adSession=TObgYDo8EeuecrkmZak4SA&bidrequest_id=721d7fee-4563-49bf-b67f-cc10f53063ae&user_id=&w=300&h=250&deviceId=502dfa5f7353b5ed82fdaf2c916c493e4bd1ad5e&algorithm=ExternalCtrEstimation&crAlgorithm=ExternalCrEstimation&country=USA&country_a2=US&city=&idfa=502dfa5f7353b5ed82fdaf2c916c493e4bd1ad5e&idfa_plain=37945664-7DF3-4780-BFE7-74B793206A85&publisherAppId=372836496&publisherAnonymousId=4135f3e520a7259bb728f90f4e969c68&publisher_name=Coin%20Dozer&deviceFamily=iphone&device_name=Apple%20iPhone10%2C5&connection_type=cellular" style="display:none;"/> </body> </html>\n'
        //const banner_html = '<script type="text/javascript">rubicon_cb = Math.random(); rubicon_rurl = document.referrer; if(top.location==document.location){rubicon_rurl = document.location;} rubicon_rurl = escape(rubicon_rurl);\\n      window.rubicon_ad = "3395053" + "." + "js";window.rubicon_creative = "3486753" + "." + "js";</script><div data-rp-type="trp-display-creative" data-rp-impression-id="c7ebf003-ed8f-4547-a6c8-e5dd05327d95" data-rp-aqid="2307:rdyyf3i5" data-rp-acct-id="20014"><img src="https://ca4-bid.adsrvr.org/bid/feedback/rubicon?iid=0eec388a-a128-4008-aa54-6ac6ddabc141&crid=rdyyf3i5&wp=814A30C31197EDF3&aid=1&wpc=USD&sfe=12087c64&puid=&tdid=&pid=febofrs&ag=balq8ht&adv=hgoqa3d&sig=1ajzOdO8h0cX4gl0DgQ16-oOEjCjPmJ54TUu0glNjfew.&bp=3.9037175&cf=1893005&fq=0&td_s=1456732568&rcats=&mcat=&mste=&mfld=4&mssi=None&mfsi=9cuouub8z7&uhow=83&agsa=&rgco=United%20States&rgre=Delaware&rgme=504&rgci=Newark&rgz=19702&svbttd=1&dt=Mobile&osf=iOS&os=iOS142&br=WebView&rlangs=en&mlang=&svpid=20014&did=&rcxt=InApp&lat=39.632702&lon=-75.699799&tmpc=&daid=2d14c44f-1ae1-40ae-b58e-ab8a9e7fc578&vp=0&osi=&osv=&sft=1&bx=60&bffi=41&mk=Apple&mdl=iPhone&c=OAJQAQ..&dur=ChoKB3JraHc0eW4Q3dAFIgsIlsivfRIEbm9uZQo2Ch1jaGFyZ2UtYWxsSW50ZWdyYWxCcmFuZFNhZmV0eSIVCPn__________wESCGludGVncmFsCjYKHWNoYXJnZS1hbGxJbnRlZ3JhbFZpZXdhYmlsaXR5IhUI-P__________ARIIaW50ZWdyYWwKPQokY2hhcmdlLWFsbEludGVncmFsU3VzcGljaW91c0FjdGl2aXR5IhUI9f__________ARIIaW50ZWdyYWwQ3dAF&durs=r8fFGw&crrelr=&ipl=1484620&fpa=870&pcm=3&vc=3&said=c3f3675ef23ddecafe8b885674b0a20b5b469021&ict=Unknown&auct=1&im=1" width="1" height="1" style="display: none;"/><ins class=\'dcmads\' style=\'display:inline-block;width:320px;height:50px\'data-dcm-placement=\'N6643.284566THETRADEDESK/B24800832.284177433\'data-dcm-rendering-mode=\'script\'    data-dcm-https-only    data-dcm-gdpr-applies=\'gdpr=0\'    data-dcm-gdpr-consent=\'gdpr_consent=\'    data-dcm-addtl-consent=\'addtl_consent=${ADDTL_CONSENT}\'    data-dcm-resettable-device-id=\'\'    data-dcm-app-id=\'\'    data-dcm-click-tracker=\'http://insight.adsrvr.org/track/clk?imp=0eec388a-a128-4008-aa54-6ac6ddabc141&ag=balq8ht&sfe=12087c64&sig=KDh25yLEjqCHYgKKfZV2l84k2pvnuDrIDIhM5NsZt8w.&crid=rdyyf3i5&cf=1893005&fq=0&td_s=1456732568&rcats=&mcat=&mste=&mfld=4&mssi=None&mfsi=9cuouub8z7&sv=rubicon&uhow=83&agsa=&wp=814A30C31197EDF3&rgco=United%20States&rgre=Delaware&rgme=504&rgci=Newark&rgz=19702&dt=Mobile&osf=iOS&os=iOS142&br=WebView&svpid=20014&rlangs=en&mlang=&did=&rcxt=InApp&tmpc=&vrtd=&osi=&osv=&daid=2d14c44f-1ae1-40ae-b58e-ab8a9e7fc578&dnr=0&vpb=&c=OAJQAQ..&dur=ChoKB3JraHc0eW4Q3dAFIgsIlsivfRIEbm9uZQo2Ch1jaGFyZ2UtYWxsSW50ZWdyYWxCcmFuZFNhZmV0eSIVCPn__________wESCGludGVncmFsCjYKHWNoYXJnZS1hbGxJbnRlZ3JhbFZpZXdhYmlsaXR5IhUI-P__________ARIIaW50ZWdyYWwKPQokY2hhcmdlLWFsbEludGVncmFsU3VzcGljaW91c0FjdGl2aXR5IhUI9f__________ARIIaW50ZWdyYWwQ3dAF&durs=r8fFGw&crrelr=&npt=&svscid=1456732568&mk=Apple&mdl=iPhone&ipl=1484620&fpa=870&pcm=3&ict=Unknown&said=c3f3675ef23ddecafe8b885674b0a20b5b469021&auct=1&r=\'>  <script src=\'https://www.googletagservices.com/dcm/dcmads.js\'></script></ins><SCRIPT TYPE="application/javascript" SRC="https://pixel.adsafeprotected.com/rjss/st/511566/49325483/skeleton.js"></SCRIPT> <NOSCRIPT><IMG SRC="https://pixel.adsafeprotected.com/rfw/st/511566/49325482/skeleton.gif?gdpr=0&gdpr_consent=&gdpr_pd=0" BORDER=0 WIDTH=1 HEIGHT=1 ALT="\\"></NOSCRIPT><span id="te-clearads-js-tradedesk01cont1"><script type="text/javascript" src="https://choices.truste.com/ca?pid=tradedesk01&aid=tradedesk01&cid=usy756f_balq8ht_rdyyf3i5&c=tradedesk01cont1&js=pmw0&w=320&h=50&sid=ev9-FM60pzWefkMAiM77ugE-aNy2u3kzAYRYrOVH6CAKZFd9zCTl0CxJbkTUuxCJqAKfKCfzl1E_CGM8sK4j1pHD9n_Ok4zptAZ71g06UbxN_scyQ9JHMzhX72-nSO4X"></script></span></div>';
        const text = '<img src="https://tk0x1.com/sj/tr?et=INBOX_OPEN&id=5fd0fc642a1cb0e4b46ad5e8&meta=MjA0NzIzMDo4MTc0OTA6MmE1MGJiMDAtNGZhMS00ZmU5LWJkNTgtNmMxZGRiMmU4ZTZj&ctx=CiQyYTUwYmIwMC00ZmExLTRmZTktYmQ1OC02YzFkZGIyZThlNmMSAk1YGNLyMSD--XwqCAgBEJijAhgKODZAAgk&name=dsp_html_loaded" width=1 height=1 style="display:none"/><img src="https://tk0x1.com/sj/tr?et=ON_LOAD&id=5fd0fc642a1cb0e4b46ad5e8&meta=MjA0NzIzMDo4MTc0OTA6MmE1MGJiMDAtNGZhMS00ZmU5LWJkNTgtNmMxZGRiMmU4ZTZj&ctx=CiQyYTUwYmIwMC00ZmExLTRmZTktYmQ1OC02YzFkZGIyZThlNmMSAk1YGNLyMSD--XwqCAgBEJijAhgKODZAAgk" width=1 height=1 style="display:none"/>    <script type="text/javascript"> rubicon_cb = Math.random(); rubicon_rurl = document.referrer; if(top.location==document.location){rubicon_rurl = document.location;} rubicon_rurl = escape(rubicon_rurl);window.rubicon_ad ="3450172" + "." + "js";window.rubicon_creative = "3563774" + "." + "js";</script><div data-rp-type="trp-display-creative" data-rp-impression-id="3ae89bf7-1926-4feb-ab2f-d435e0d9368e" data-rp-aqid="2974:2929437" data-rp-acct-id="20744"><div style="width: 0; height: 0; overflow: hidden;"><img border="0" width="1" height="1" src="https://pr.ybp.yahoo.com/bw/rubicon/imp/zhYiqI6djr6B4ryn4T3F7CuSZxCJQLvIwcijgnhdeIX18sZwU8iiCrWTr80-l2duu6twLn0qHL5XaJ2ADB3ZVVJw7GM_-8rNddzRqcFlI5CYSJnycidwekWHkfs-EvWf5CgdwSwSYQlzbhU4wgVsYDHNGgZy8J43ZGJGV1TXHWgg1Pj3Nx2iWk1X_A2Umy5TwhKkyArUImRye8-OHMej1RVYwEaAsve1El1tB8VaUm8G6dbnLEobzvGsD3Rnudq63u7cRpWf95K6pTLE5chSdhybLttl423rH-yz8xAQQYPm2KndX9STXHyvTU2C7Yujj9oJjyegDFfauahGaQPkp6TYXqcm0bVkPLi3kvQYfFuWo_IE2nRL5fjV0SwA6qZU0SQNTIOBbmWy8xuXynSKana9m_s8zhVyAeHmE6wpkLh5HsbxvBBsrfmK7aVjn2YoJHcA5DsKq9lIQWuOa9jP5wh4A9RDWYTJw8wjRcEPPhzrIO-ikVg2cc2Faf78vpXeFye7i7YGZiKlZ3wYvkXos7yTqlGqpRv7gULdrjeGS5KU0LCJnIvk9hkX3I4m5zNlsfgx5-UEgqg9gxouooC7oH0OCYqHQil0fSd6606MM-6c_YYdrymL5fnzhfj1_t4RjVNe2tWUHlbnS_0HGSxPEygdU8sUNw8hjbRpFGjNwIO92BUEpYxW37fy1CTZvLNEWNiwpmlrmr4DjQY01X9teI_a_jT_Qi5dCQZMy4mYRT6MzetuVSFIvmBD_gKnjKX_78AkNlI7J-1mqO26MQi7yv63bUuaiuz1jOCVt4HsIMEOz4QUxNqF7kvdB0nEf0iqyB9_HX-RhDbNLwbUofaAh68PUmf9VKHpp-ClZ2XHb8naEQ_VjDVMudsLrcMQVif4TqgQFe-LokSjnv52ADk5NBwvHbOkxuT6w62IY-JtkYqaIzbFsNEuJcNftUBsfDHCuYzzKasGfoUhpa4Q-ToD2oAqU_xG5WkEk9oWRf9XIrwZRnbEF1JKcsjqUVkKfUuVlf--r1E8-ez85s7nzEmp41hmGYknJb-JGuH94XB5WzL2_-gBTmH57Cr1gfjOVk7qAb9W3oTs-z4c3YsI2nWETANPmKN3YJUrrF_N11lbheVxzovnM261CzqpNXUdI5569sWLtAyhXo3MPf9-7qzBx8uiywJWwvFw7vBLac7LBJ9d0F0F4VEsS7lXTYzgr7Ii6nYtwYrHm5_eaZctOyqS-sbVQvk9OTy9UvHkTcWArjOYjODNS5GuoKRwoIRo9d7oMcXiOBwnyAGl-kTdryZjhPh4nJo-L9e4AiVKJpQ_XSfMObjTQyzh_Mzc-D64_eSEbs3MFwg0DReLrIrVSqjF8sBdItWM-L-kJ48gxZBwrIQ/ai/ca1c59645c3b6a49e3386c53bf3b07196709ffeb_15/wp/621E1320FFFD59E9" alt="" /><img border="0" width="1" height="1" src="https://beacon-eu-ams3.rubiconproject.com/beacon/d/3ae89bf7-1926-4feb-ab2f-d435e0d9368e?oo=0&accountId=20744&siteId=274238&zoneId=1500950&sizeId=15&e=6A1E40E384DA563B2D8B67A878EA1E510A62EFD5D1BA3479C6E7AC9E991E0F52A9C56EAB020706C8AA2A98C85C8DBF9D43DB83E445ADAC68D7310B38E2B4AFB2FE34692F1D4D5E6DA61F048890D11D2EDBCD69D848D03A5B908B03A19E92189CF09C6103C1DF2AA2C2D7CCACF2A8446C75A050C8697C068A12826695013CAF05BC67EE0A89F358C4CDDF8011EB96895649EFE27DDEA36CF124F5207A2458AD77BD3A25CF684609233BCAC78D2429BA0F0F760CC444DF4D09C293AB389E320516CFFF4E00B8176B4C25751A6F51DFC79E" alt="" /></div><script type="text/javascript" src="https://pr.ybp.yahoo.com/ab/secure/true/imp/Wuc9sicquh1N2RJMi7OEcMmK_WlBtUYEKWTrAyIyB34rQx15AumFyou9lW00H_ulIPLVnGrvJvNZHio7EdH-yBgIRR7MwuclnCtDtvq3fGq_wENUdteM-U2BbMXnbYrnyBRThFUA8dt7Z2M-LZTc5FFixFSG3YKzKRieSsYKBJgBhfx-09ocqKcdNSV46GtzTkbQt9QAKJ5fAfOS41QEj7Brs8QzcK6ESh6PmxX5Qtn1nrj_iU8OrX5ffuXfXjUNcD1_XVaUeOB0GZctlQ5gsuuFAj7sogC4jJA7xLk3FWKwhW6cDtrjerFa9xQAP6EH_KNm_S8GJUeYr2BHQz7VmRTTMa0fIgJcb9ega3VYc5Lx0MURmA0p6t4LtZsy5idpH7OaQ6UFEFRHskq_oTBsJo05-si_GuJZ2_6wxEwXGa8n6lAAA6x5wFQLcj_lhaXiyV_Eq7dWSli14kfS-iPVeuhmnq_zbCZuOBgt7RbyRnqJMTrEE_Nz4AN0QZToAKvCm-D10LntAnu3011pKOZsyixuTMJXwmhFzV6tnrL71Xf4nT5iu10MqU0nra1PJiQSU6ejoVM6oYTdO0xAFdIFOS9Y7ryHV3uHsUv05nZ3bD52uBDoVntN1kr6swk903rhGt0t13FV4m5OmaMe5EKnfpq9xpC-Ga65EZ0SIEfz6MASu2owKwFOu8gWnJt3GfsmpnqDrh3VRJwjwysnvsBTcxhNtTTb1EtXF2PXDzwRekY4fToLPYMiredOOvhWlkk5-APHLJUVozbgCLFv24Lf95dpnEqS0Jxe0deNyxtLflvvrp0a3ACjWNuUAdnwg2azAX0UjiRPh9dbza401h127g7YHafDFAMxPNVsBgLptACPzOTq6ocFlrh3r5CyAVRmQR5JO1e__cGwDiBXdJYkl_Wya9spAPAsGGsiqbN9U1tLrq45_98embMXf0dRQ9LZk4O8B_3lJeSdIMNdVIpZlOuHbiiaMS9Nl241ycTshqKzTN0_7FszEjUthwkd40XMcmf_x7d3L_mPDqURSlLXDUXtqNIsOCkbbS5Ljl_NsBXdREa_Cpfi9-JabbNchjVdIv9B3vnwU44T6k2vLX8fkL3lF4Fbufyp2BI2xxPFn358KyCo1FbM1PScuaJu0Z9q-EISfYrj_g-HAlv7KM06TYC-fYa7hTwsfbZeSWh4uyzZHclkl9mqTnmjdysvu7Nj8skaPMf8yM8afmGqkC5lYitJUhp2jfIn6RmGDqH7p3n_wmWUpxyLEdE9IoIQEwy-WQ0uW0sqVJshgFDwqtPavP3HMg_wdy2dlPlukxlf5amYzxp0rca0P15qHe2-aEsYPqwty2VbmgizWRp1veLD4tk7jAK3m95ckyKwPYQc840/wp/621E1320FFFD59E9"></script></div>';
        window.parent.document.write(text);
        //window.parent.document.appendChild(div);
        /*const resizeHandler = (event?: Event) => {
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

        const toInt = (element: HTMLInputElement): number => parseInt(element.value, 10);
        const toBoolean = (element: HTMLInputElement): boolean => element.checked;
        const JS_FUNC_NAME_GET_HEADLESS = 'getHeadless';
        const JS_FUNC_NAME_GET_HEADLESS_LOAD = 'getHeadlessLoad';
        const JS_FUNC_NAME_GET_HEADLESS_LOAD_ADAPTER = 'getHeadlessLoadAdapter';

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
                ['RingerMode', toInt]
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

        if (window.parent !== window) {
            const p = <HTMLInputElement>window.parent.document.createElement('p');
            p.textContent = window.parent.location.search.substring(1);
            const container = <HTMLInputElement>window.parent.document.getElementById('hello');
            if (container) {
                container.appendChild(p);
            }

            const abGroupElement = <HTMLInputElement>window.parent.document.getElementById('abGroup');
            const campaignIdElement = <HTMLInputElement>window.parent.document.getElementById('campaignId');
            const countryElement = <HTMLInputElement>window.parent.document.getElementById('country');
            const platformElement = <HTMLInputElement>window.parent.document.getElementById('platform');
            const gameIdElement = <HTMLInputElement>window.parent.document.getElementById('gameId');
            const testModeElement = <HTMLInputElement>window.parent.document.getElementById('testMode');
            const loadModeElement = <HTMLInputElement>window.parent.document.getElementById('loadMode');
            const autoSkipElement = <HTMLInputElement>window.parent.document.getElementById('autoSkip');
            const useStagingElement = <HTMLInputElement>window.parent.document.getElementById('useStaging');
            const initializeButton = <HTMLButtonElement>window.parent.document.getElementById('initialize');
            const loadButtonDefault = <HTMLButtonElement>window.parent.document.getElementById('loadDefault');
            const loadButtonIncentivize = <HTMLButtonElement>window.parent.document.getElementById('loadIncentivize');
            const campaignResponseElement = <HTMLInputElement>window.parent.document.getElementById('campaignResponse');
            const endScreenUrlElement = <HTMLInputElement>window.parent.document.getElementById('endScreenUrl');
            const forceLoadV5Element = <HTMLInputElement>window.parent.document.getElementById('forceLoadV5');

            const initialize = () => {
                window.localStorage.setItem('abGroup', abGroupElement.value);
                window.localStorage.setItem('campaignId', campaignIdElement.value);
                window.localStorage.setItem('country', countryElement.value);
                window.localStorage.setItem('platform', platformElement.value);
                window.localStorage.setItem('gameId', gameIdElement.value);
                window.localStorage.setItem('testMode', testModeElement.checked.toString());
                window.localStorage.setItem('loadMode', loadModeElement.checked.toString());
                window.localStorage.setItem('autoSkip', autoSkipElement.checked.toString());
                window.localStorage.setItem('useStaging', useStagingElement.checked.toString());
                window.localStorage.setItem('forceLoadV5', forceLoadV5Element.checked.toString());

                abGroupElement.disabled = true;
                campaignIdElement.disabled = true;
                countryElement.disabled = true;
                platformElement.disabled = true;
                gameIdElement.disabled = true;
                testModeElement.disabled = true;
                useStagingElement.disabled = true;
                loadButtonDefault.disabled = !loadModeElement.checked;
                loadButtonIncentivize.disabled = !loadModeElement.checked;
                loadModeElement.disabled = true;
                autoSkipElement.disabled = true;
                initializeButton.disabled = true;

                AdsConfigurationParser.setIsBrowserBuild(true);

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

                if (endScreenUrlElement.value.length) {
                    CometCampaignParser.setForceEndScreenUrl(endScreenUrlElement.value);
                }

                // tslint:disable:no-console
                const listener: IUnityAdsListener = {
                    onUnityAdsReady: (placement: string) => {
                        console.log('onUnityAdsReady: ' + placement);
                        const placementButton = <HTMLButtonElement>window.parent.document.getElementById(placement);
                        if (placementButton) {
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

                if (useStagingElement.checked) {
                    ProgrammaticOperativeEventManager.setTestBaseUrl('https://auction.staging.unityads.unity3d.com');
                    CampaignManager.setBaseUrl('https://auction.staging.unityads.unity3d.com');
                    AuctionRequest.setBaseUrl('https://auction.staging.unityads.unity3d.com');
                    ConfigManager.setTestBaseUrl('https://ads-game-configuration.staging.unityads.unity3d.com');
                    MetricInstance.setBaseUrl('https://sdk-diagnostics.stg.mz.internal.unity3d.com');
                    HttpKafka.setTestBaseUrl('https://httpkafka.staging.unityads.unity3d.com/v1/events');
                }

                switch (platformElement.value) {
                    case 'android':
                        UnityAds.setBackend(new Backend(Platform.ANDROID));
                        UnityAds.getBackend().Api.Request.setPassthrough(true);
                        setClientInfo();
                        setAndroidDeviceInfo();
                        UnityAds.getBackend().Api.Storage.set(StorageType.PUBLIC, 'test.forceLoadV5.value', forceLoadV5Element.checked);
                        UnityAds.initialize(Platform.ANDROID, gameIdElement.value, listener, testModeElement.checked, loadModeElement.checked);
                        break;

                    case 'ios':
                        UnityAds.setBackend(new Backend(Platform.IOS));
                        UnityAds.getBackend().Api.Request.setPassthrough(true);
                        setClientInfo();
                        setIosDeviceInfo();
                        UnityAds.getBackend().Api.Storage.set(StorageType.PUBLIC, 'test.forceLoadV5.value', forceLoadV5Element.checked);
                        UnityAds.initialize(Platform.IOS, gameIdElement.value, listener, testModeElement.checked, loadModeElement.checked);
                        break;

                    default:
                        throw new Error('Unity Ads webview init failure: no platform defined, unable to initialize native bridge');
                }
            };

            // tslint:disable-next-line
            if ((<any>window).parent[JS_FUNC_NAME_GET_HEADLESS]()) {
                testModeElement.checked = true;
                initialize();
            // tslint:disable-next-line
             } else if ((<any>window).parent[JS_FUNC_NAME_GET_HEADLESS_LOAD]()) {
                testModeElement.checked = true;
                loadModeElement.checked = true;
                //Mopub whitelisted load API gameID
                gameIdElement.value = '2788221';
                initialize();
                UnityAds.load('rewardedVideo');
            // tslint:disable-next-line
            } else if ((<any>window).parent[JS_FUNC_NAME_GET_HEADLESS_LOAD_ADAPTER]()) {
                testModeElement.checked = true;
                loadModeElement.checked = true;
                abGroupElement.value = '5'; // Temporary while under abtest
                initialize();
                UnityAds.load('rewardedVideo');
            } else {
                abGroupElement.value = window.localStorage.getItem('abGroup') === null ? abGroupElement.value : window.localStorage.getItem('abGroup')!;
                campaignIdElement.value = window.localStorage.getItem('campaignId') === null ? campaignIdElement.value : window.localStorage.getItem('campaignId')!;
                countryElement.value = window.localStorage.getItem('country') === null ? countryElement.value : window.localStorage.getItem('country')!;
                platformElement.value = window.localStorage.getItem('platform') === null ? platformElement.value : window.localStorage.getItem('platform')!;
                gameIdElement.value = window.localStorage.getItem('gameId') === null ? gameIdElement.value : window.localStorage.getItem('gameId')!;
                testModeElement.checked = window.localStorage.getItem('testMode') === null ? testModeElement.checked : window.localStorage.getItem('testMode') === 'true';
                loadModeElement.checked = window.localStorage.getItem('loadMode') === null ? loadModeElement.checked : window.localStorage.getItem('loadMode') === 'true';
                autoSkipElement.checked = window.localStorage.getItem('autoSkip') === null ? autoSkipElement.checked : window.localStorage.getItem('autoSkip') === 'true';
                useStagingElement.checked = window.localStorage.getItem('useStaging') === null ? useStagingElement.checked : window.localStorage.getItem('useStaging') === 'true';
                forceLoadV5Element.checked = window.localStorage.getItem('forceLoadV5') === null ? useStagingElement.checked : window.localStorage.getItem('forceLoadV5') === 'true';

                initializeButton.addEventListener('click', (event: Event) => {
                    event.preventDefault();
                    initialize();
                }, false);

                loadButtonDefault.addEventListener('click', (event: Event) => {
                    event.preventDefault();
                    UnityAds.load('defaultVideoAndPictureZone');
                }, false);

                loadButtonIncentivize.addEventListener('click', (event: Event) => {
                    event.preventDefault();
                    UnityAds.load('incentivizedZone');
                }, false);

                // tslint:disable-next-line
                (<any>window).parent.document.getElementById('initialize').disabled = false;
                loadButtonDefault.disabled = true;
                loadButtonIncentivize.disabled = true;
            }
        }*/
    });

}());
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQnJvd3NlckJ1bmRsZS5qcyIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL3RzL0NvcmUvVXRpbGl0aWVzL0RPTVV0aWxzLnRzIiwiLi4vLi4vLi4vc3JjL3RzL0NvcmUvVXRpbGl0aWVzL1BvbHlmaWxsZXIudHMiLCIuLi8uLi8uLi9zcmMvdHMvV29ya2Fyb3VuZHMudHMiLCIuLi8uLi8uLi9zcmMvdHMvQnJvd3Nlci50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJleHBvcnQgY2xhc3MgRE9NVXRpbHMge1xuXG4gICAgLy8gVGhpcyBpbXBsZW1lbnRhdGlvbiBpcyB0YWtlbiBmcm9tIGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuL2RvY3MvV2ViL0FQSS9ET01QYXJzZXJcblxuICAgIHB1YmxpYyBzdGF0aWMgcGFyc2VGcm9tU3RyaW5nKG1hcmt1cDogc3RyaW5nLCB0eXBlOiBTdXBwb3J0ZWRUeXBlKTogRG9jdW1lbnQge1xuICAgICAgICBpZiAoL15cXHMqdGV4dFxcL2h0bWxcXHMqKD86O3wkKS9pLnRlc3QodHlwZSkpIHtcbiAgICAgICAgICAgIGNvbnN0IGRvYyA9IGRvY3VtZW50LmltcGxlbWVudGF0aW9uLmNyZWF0ZUhUTUxEb2N1bWVudCgnJyk7XG4gICAgICAgICAgICBpZiAobWFya3VwLnRvTG93ZXJDYXNlKCkuaW5kZXhPZignPCFkb2N0eXBlJykgPiAtMSkge1xuICAgICAgICAgICAgICAgIGRvYy5kb2N1bWVudEVsZW1lbnQuaW5uZXJIVE1MID0gbWFya3VwO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBkb2MuYm9keS5pbm5lckhUTUwgPSBtYXJrdXA7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gZG9jO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIERPTVV0aWxzLm5hdGl2ZVBhcnNlLmFwcGx5KG5ldyBET01QYXJzZXIoKSwgW21hcmt1cCwgdHlwZV0pO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBzdGF0aWMgbmF0aXZlUGFyc2UgPSBET01QYXJzZXIucHJvdG90eXBlLnBhcnNlRnJvbVN0cmluZztcbn1cbiIsImV4cG9ydCBjbGFzcyBQb2x5ZmlsbGVyIHtcbiAgICBwdWJsaWMgc3RhdGljIGdldE9iamVjdFZhbHVlc0Z1bmN0aW9uKCk6IChvYmplY3Q6IHt9KSA9PiB1bmtub3duW10ge1xuICAgICAgICByZXR1cm4gKG9iamVjdDoge30pID0+IHtcbiAgICAgICAgICAgIHJldHVybiBPYmplY3Qua2V5cyhvYmplY3QpLm1hcCgodmFsdWVzKSA9PiBvYmplY3RbPGtleW9mIHR5cGVvZiBvYmplY3Q+dmFsdWVzXSk7XG4gICAgICAgIH07XG4gICAgfVxufVxuIiwiaW1wb3J0IHsgRE9NVXRpbHMgfSBmcm9tICdDb3JlL1V0aWxpdGllcy9ET01VdGlscyc7XG5pbXBvcnQgeyBQb2x5ZmlsbGVyIH0gZnJvbSAnQ29yZS9VdGlsaXRpZXMvUG9seWZpbGxlcic7XG5cbi8vIEluIGNlcnRhaW4gdmVyc2lvbnMgb2YgQW5kcm9pZCwgd2UgZm91bmQgdGhhdCBET01QYXJzZXIgbWlnaHQgbm90IHN1cHBvcnRcbi8vIHBhcnNpbmcgdGV4dC9odG1sIG1pbWUgdHlwZXMuXG5cbi8vIHRzbGludDpkaXNhYmxlOm5vLWVtcHR5XG5cbigoKERPTVBhcnNlcikgPT4ge1xuXG4gICAgLy8gRmlyZWZveC9PcGVyYS9JRSB0aHJvdyBlcnJvcnMgb24gdW5zdXBwb3J0ZWQgdHlwZXNcbiAgICB0cnkge1xuICAgICAgICAvLyBXZWJLaXQgcmV0dXJucyBudWxsIG9uIHVuc3VwcG9ydGVkIHR5cGVzXG4gICAgICAgIGlmICgobmV3IERPTVBhcnNlcigpKS5wYXJzZUZyb21TdHJpbmcoJycsICd0ZXh0L2h0bWwnKSkge1xuICAgICAgICAgICAgLy8gdGV4dC9odG1sIHBhcnNpbmcgaXMgbmF0aXZlbHkgc3VwcG9ydGVkXG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICB9IGNhdGNoIChleCkge1xuICAgIH1cblxuICAgIERPTVBhcnNlci5wcm90b3R5cGUucGFyc2VGcm9tU3RyaW5nID0gRE9NVXRpbHMucGFyc2VGcm9tU3RyaW5nO1xuXG59KShET01QYXJzZXIpKTtcblxuLy8gdHNsaW50OmVuYWJsZTpuby1lbXB0eVxuXG4vKlxuICogIE9iamVjdC52YWx1ZXMoKSBoYXMgaXNzdWVzIHdpdGggb2xkZXIgQW5kcm9pZCBEZXZpY2VzLlxuICovXG5pZiAoIU9iamVjdC52YWx1ZXMpIHtcbiAgICBPYmplY3QudmFsdWVzID0gUG9seWZpbGxlci5nZXRPYmplY3RWYWx1ZXNGdW5jdGlvbigpO1xufVxuXG5kZWNsYXJlIGdsb2JhbCB7XG5cbiAgICAvLyB0c2xpbnQ6ZGlzYWJsZVxuICAgIGludGVyZmFjZSBBcnJheTxUPiB7ICAgIC8vIGVzbGludC1kaXNhYmxlLWxpbmVcbiAgICAgICAgdW5pcXVlKCk6IEFycmF5PFQ+OyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lXG4gICAgfVxuICAgIC8vIHRzbGludDplbmFibGVcbn1cblxuQXJyYXkucHJvdG90eXBlLnVuaXF1ZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAvLyB0c2xpbnQ6ZGlzYWJsZS1uZXh0LWxpbmVcbiAgICByZXR1cm4gdGhpcy5maWx0ZXIoKHZhbCwgaW5kZXgpID0+IHRoaXMuaW5kZXhPZih2YWwpID09PSBpbmRleCk7XG59O1xuIiwiaW1wb3J0ICdXb3JrYXJvdW5kcyc7XG5pbXBvcnQgeyBDYW1wYWlnbk1hbmFnZXIgfSBmcm9tICdBZHMvTWFuYWdlcnMvQ2FtcGFpZ25NYW5hZ2VyJztcbmltcG9ydCB7IElVbml0eUFkc0xpc3RlbmVyIH0gZnJvbSAnQmFja2VuZC9JVW5pdHlBZHNMaXN0ZW5lcic7XG5pbXBvcnQgeyBVbml0eUFkcyB9IGZyb20gJ0JhY2tlbmQvVW5pdHlBZHMnO1xuaW1wb3J0IHsgUGxhdGZvcm0gfSBmcm9tICdDb3JlL0NvbnN0YW50cy9QbGF0Zm9ybSc7XG5pbXBvcnQgeyBCYWNrZW5kIH0gZnJvbSAnQmFja2VuZC9CYWNrZW5kJztcbmltcG9ydCB7IFZpZGVvT3ZlcmxheSB9IGZyb20gJ0Fkcy9WaWV3cy9WaWRlb092ZXJsYXknO1xuaW1wb3J0IHsgQ29uZmlnTWFuYWdlciB9IGZyb20gJ0NvcmUvTWFuYWdlcnMvQ29uZmlnTWFuYWdlcic7XG5pbXBvcnQgeyB0b0FiR3JvdXAgfSBmcm9tICdDb3JlL01vZGVscy9BQkdyb3VwJztcbmltcG9ydCB7IEFSVXRpbCB9IGZyb20gJ0FSL1V0aWxpdGllcy9BUlV0aWwnO1xuaW1wb3J0IHsgQ3VycmVudFBlcm1pc3Npb24sIFBlcm1pc3Npb25zVXRpbCwgUGVybWlzc2lvblR5cGVzIH0gZnJvbSAnQ29yZS9VdGlsaXRpZXMvUGVybWlzc2lvbnMnO1xuaW1wb3J0IHsgSUNvcmVBcGkgfSBmcm9tICdDb3JlL0lDb3JlJztcbmltcG9ydCB7IEFkc0NvbmZpZ3VyYXRpb25QYXJzZXIgfSBmcm9tICdBZHMvUGFyc2Vycy9BZHNDb25maWd1cmF0aW9uUGFyc2VyJztcbmltcG9ydCB7IFByb2dyYW1tYXRpY09wZXJhdGl2ZUV2ZW50TWFuYWdlciB9IGZyb20gJ0Fkcy9NYW5hZ2Vycy9Qcm9ncmFtbWF0aWNPcGVyYXRpdmVFdmVudE1hbmFnZXInO1xuaW1wb3J0IHsgQXVjdGlvblJlcXVlc3QgfSBmcm9tICdBZHMvTmV0d29ya2luZy9BdWN0aW9uUmVxdWVzdCc7XG5pbXBvcnQgeyBNZXRyaWNJbnN0YW5jZSB9IGZyb20gJ0Fkcy9OZXR3b3JraW5nL01ldHJpY0luc3RhbmNlJztcbmltcG9ydCB7IEh0dHBLYWZrYSB9IGZyb20gJ0NvcmUvVXRpbGl0aWVzL0h0dHBLYWZrYSc7XG5pbXBvcnQgeyBTdG9yYWdlVHlwZSB9IGZyb20gJ0NvcmUvTmF0aXZlL1N0b3JhZ2UnO1xuaW1wb3J0IHsgQ29tZXRDYW1wYWlnblBhcnNlciB9IGZyb20gJ1BlcmZvcm1hbmNlL1BhcnNlcnMvQ29tZXRDYW1wYWlnblBhcnNlcic7XG5cbmRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ0RPTUNvbnRlbnRMb2FkZWQnLCAoKSA9PiB7XG5cbiAgICAvL2NvbnN0IG1yYWlkID0gJzwhRE9DVFlQRSBodG1sPiA8aHRtbD4gPGhlYWQ+IDxtZXRhIGNoYXJzZXQ9XCJ1dGYtOFwiPiA8bWV0YSBuYW1lPVwidmlld3BvcnRcIiBjb250ZW50PVwid2lkdGg9ZGV2aWNlLXdpZHRoLCBpbml0aWFsLXNjYWxlPTEuMCwgbWF4aW11bS1zY2FsZT0xLjAsIHVzZXItc2NhbGFibGU9bm9cIiA+IDx0aXRsZT5BZDwvdGl0bGU+IDwvaGVhZD4gPGJvZHk+IDxzY3JpcHQgc3JjPVwibXJhaWQuanNcIj48L3NjcmlwdD4gPHNjcmlwdD52YXIgQUtfQ0xJQ0tfVVJMPVwiaHR0cHM6Ly9jbGljay11cy5hZGlrdGVldi5jb20vdjEvY2xpY2s/Y3JlYXRpdmVHcm91cElkPTEyNDU1NyZjcmVhdGl2ZUdyb3VwTmFtZT0yMDIwMDlfTVJBSURfTGF1bmNoJmNyZWF0aXZlSWQ9MjI2MDE4JmNyZWF0aXZlTmFtZT1NUkFJRF8zMDB4MjUwX0tpbmdzR3JvdXBfR09HX0xhdW5jaF9TZXAyMCZjcmVhdGl2ZVR5cGU9Y3JlYXRpdmVfbXJhaWRfYmFubmVyJnJldGluYT0wJmNhbXBhaWduPTMxNDk2JnN1cHBsaWVyPTM0MiZzdXBwbGllcl9uYW1lPXVuaXR5JmFkU2Vzc2lvbj1UT2JnWURvOEVldWVjcmttWmFrNFNBJmJpZHJlcXVlc3RfaWQ9NzIxZDdmZWUtNDU2My00OWJmLWI2N2YtY2MxMGY1MzA2M2FlJnVzZXJfaWQ9Jnc9MzAwJmg9MjUwJmRldmljZUlkPTUwMmRmYTVmNzM1M2I1ZWQ4MmZkYWYyYzkxNmM0OTNlNGJkMWFkNWUmYWxnb3JpdGhtPUV4dGVybmFsQ3RyRXN0aW1hdGlvbiZjckFsZ29yaXRobT1FeHRlcm5hbENyRXN0aW1hdGlvbiZjb3VudHJ5PVVTQSZjb3VudHJ5X2EyPVVTJmNpdHk9JmlkZmE9NTAyZGZhNWY3MzUzYjVlZDgyZmRhZjJjOTE2YzQ5M2U0YmQxYWQ1ZSZpZGZhX3BsYWluPTM3OTQ1NjY0LTdERjMtNDc4MC1CRkU3LTc0Qjc5MzIwNkE4NSZwdWJsaXNoZXJBcHBJZD0zNzI4MzY0OTYmcHVibGlzaGVyQW5vbnltb3VzSWQ9NDEzNWYzZTUyMGE3MjU5YmI3MjhmOTBmNGU5NjljNjgmcHVibGlzaGVyX25hbWU9Q29pbiUyMERvemVyJlwiOzwvc2NyaXB0PiA8c2NyaXB0IHNyYz1cImh0dHBzOi8vY2RuLXd3LmFkaWt0ZWV2LmNvbS9jcmVhdGl2ZXMvYmYzMGRlYTYtMzg0My0zMDI5LTNkMWMtZDE0NmNjNGJhMTdjLmpzXCI+PC9zY3JpcHQ+IDxpbWcgc3JjPVwiaHR0cHM6Ly9pbXByZXNzaW9uLXVzLmFkaWt0ZWV2LmNvbS8zLjAvP2NyZWF0aXZlR3JvdXBJZD0xMjQ1NTcmY3JlYXRpdmVHcm91cE5hbWU9MjAyMDA5X01SQUlEX0xhdW5jaCZjcmVhdGl2ZUlkPTIyNjAxOCZjcmVhdGl2ZU5hbWU9TVJBSURfMzAweDI1MF9LaW5nc0dyb3VwX0dPR19MYXVuY2hfU2VwMjAmY3JlYXRpdmVUeXBlPWNyZWF0aXZlX21yYWlkX2Jhbm5lciZyZXRpbmE9MCZjYW1wYWlnbj0zMTQ5NiZzdXBwbGllcj0zNDImc3VwcGxpZXJfbmFtZT11bml0eSZhZFNlc3Npb249VE9iZ1lEbzhFZXVlY3JrbVphazRTQSZiaWRyZXF1ZXN0X2lkPTcyMWQ3ZmVlLTQ1NjMtNDliZi1iNjdmLWNjMTBmNTMwNjNhZSZ1c2VyX2lkPSZ3PTMwMCZoPTI1MCZkZXZpY2VJZD01MDJkZmE1ZjczNTNiNWVkODJmZGFmMmM5MTZjNDkzZTRiZDFhZDVlJmFsZ29yaXRobT1FeHRlcm5hbEN0ckVzdGltYXRpb24mY3JBbGdvcml0aG09RXh0ZXJuYWxDckVzdGltYXRpb24mY291bnRyeT1VU0EmY291bnRyeV9hMj1VUyZjaXR5PSZpZGZhPTUwMmRmYTVmNzM1M2I1ZWQ4MmZkYWYyYzkxNmM0OTNlNGJkMWFkNWUmaWRmYV9wbGFpbj0zNzk0NTY2NC03REYzLTQ3ODAtQkZFNy03NEI3OTMyMDZBODUmcHVibGlzaGVyQXBwSWQ9MzcyODM2NDk2JnB1Ymxpc2hlckFub255bW91c0lkPTQxMzVmM2U1MjBhNzI1OWJiNzI4ZjkwZjRlOTY5YzY4JnB1Ymxpc2hlcl9uYW1lPUNvaW4lMjBEb3plciZkZXZpY2VGYW1pbHk9aXBob25lJmRldmljZV9uYW1lPUFwcGxlJTIwaVBob25lMTAlMkM1JmNvbm5lY3Rpb25fdHlwZT1jZWxsdWxhclwiIHN0eWxlPVwiZGlzcGxheTpub25lO1wiLz4gPC9ib2R5PiA8L2h0bWw+XFxuJ1xuICAgIC8vY29uc3QgYmFubmVyX2h0bWwgPSAnPHNjcmlwdCB0eXBlPVwidGV4dC9qYXZhc2NyaXB0XCI+cnViaWNvbl9jYiA9IE1hdGgucmFuZG9tKCk7IHJ1Ymljb25fcnVybCA9IGRvY3VtZW50LnJlZmVycmVyOyBpZih0b3AubG9jYXRpb249PWRvY3VtZW50LmxvY2F0aW9uKXtydWJpY29uX3J1cmwgPSBkb2N1bWVudC5sb2NhdGlvbjt9IHJ1Ymljb25fcnVybCA9IGVzY2FwZShydWJpY29uX3J1cmwpO1xcXFxuICAgICAgd2luZG93LnJ1Ymljb25fYWQgPSBcIjMzOTUwNTNcIiArIFwiLlwiICsgXCJqc1wiO3dpbmRvdy5ydWJpY29uX2NyZWF0aXZlID0gXCIzNDg2NzUzXCIgKyBcIi5cIiArIFwianNcIjs8L3NjcmlwdD48ZGl2IGRhdGEtcnAtdHlwZT1cInRycC1kaXNwbGF5LWNyZWF0aXZlXCIgZGF0YS1ycC1pbXByZXNzaW9uLWlkPVwiYzdlYmYwMDMtZWQ4Zi00NTQ3LWE2YzgtZTVkZDA1MzI3ZDk1XCIgZGF0YS1ycC1hcWlkPVwiMjMwNzpyZHl5ZjNpNVwiIGRhdGEtcnAtYWNjdC1pZD1cIjIwMDE0XCI+PGltZyBzcmM9XCJodHRwczovL2NhNC1iaWQuYWRzcnZyLm9yZy9iaWQvZmVlZGJhY2svcnViaWNvbj9paWQ9MGVlYzM4OGEtYTEyOC00MDA4LWFhNTQtNmFjNmRkYWJjMTQxJmNyaWQ9cmR5eWYzaTUmd3A9ODE0QTMwQzMxMTk3RURGMyZhaWQ9MSZ3cGM9VVNEJnNmZT0xMjA4N2M2NCZwdWlkPSZ0ZGlkPSZwaWQ9ZmVib2ZycyZhZz1iYWxxOGh0JmFkdj1oZ29xYTNkJnNpZz0xYWp6T2RPOGgwY1g0Z2wwRGdRMTYtb09FakNqUG1KNTRUVXUwZ2xOamZldy4mYnA9My45MDM3MTc1JmNmPTE4OTMwMDUmZnE9MCZ0ZF9zPTE0NTY3MzI1NjgmcmNhdHM9Jm1jYXQ9Jm1zdGU9Jm1mbGQ9NCZtc3NpPU5vbmUmbWZzaT05Y3VvdXViOHo3JnVob3c9ODMmYWdzYT0mcmdjbz1Vbml0ZWQlMjBTdGF0ZXMmcmdyZT1EZWxhd2FyZSZyZ21lPTUwNCZyZ2NpPU5ld2FyayZyZ3o9MTk3MDImc3ZidHRkPTEmZHQ9TW9iaWxlJm9zZj1pT1Mmb3M9aU9TMTQyJmJyPVdlYlZpZXcmcmxhbmdzPWVuJm1sYW5nPSZzdnBpZD0yMDAxNCZkaWQ9JnJjeHQ9SW5BcHAmbGF0PTM5LjYzMjcwMiZsb249LTc1LjY5OTc5OSZ0bXBjPSZkYWlkPTJkMTRjNDRmLTFhZTEtNDBhZS1iNThlLWFiOGE5ZTdmYzU3OCZ2cD0wJm9zaT0mb3N2PSZzZnQ9MSZieD02MCZiZmZpPTQxJm1rPUFwcGxlJm1kbD1pUGhvbmUmYz1PQUpRQVEuLiZkdXI9Q2hvS0IzSnJhSGMwZVc0UTNkQUZJZ3NJbHNpdmZSSUVibTl1WlFvMkNoMWphR0Z5WjJVdFlXeHNTVzUwWldkeVlXeENjbUZ1WkZOaFptVjBlU0lWQ1BuX19fX19fX19fX3dFU0NHbHVkR1ZuY21Gc0NqWUtIV05vWVhKblpTMWhiR3hKYm5SbFozSmhiRlpwWlhkaFltbHNhWFI1SWhVSS1QX19fX19fX19fX0FSSUlhVzUwWldkeVlXd0tQUW9rWTJoaGNtZGxMV0ZzYkVsdWRHVm5jbUZzVTNWemNHbGphVzkxYzBGamRHbDJhWFI1SWhVSTlmX19fX19fX19fX0FSSUlhVzUwWldkeVlXd1EzZEFGJmR1cnM9cjhmRkd3JmNycmVscj0maXBsPTE0ODQ2MjAmZnBhPTg3MCZwY209MyZ2Yz0zJnNhaWQ9YzNmMzY3NWVmMjNkZGVjYWZlOGI4ODU2NzRiMGEyMGI1YjQ2OTAyMSZpY3Q9VW5rbm93biZhdWN0PTEmaW09MVwiIHdpZHRoPVwiMVwiIGhlaWdodD1cIjFcIiBzdHlsZT1cImRpc3BsYXk6IG5vbmU7XCIvPjxpbnMgY2xhc3M9XFwnZGNtYWRzXFwnIHN0eWxlPVxcJ2Rpc3BsYXk6aW5saW5lLWJsb2NrO3dpZHRoOjMyMHB4O2hlaWdodDo1MHB4XFwnZGF0YS1kY20tcGxhY2VtZW50PVxcJ042NjQzLjI4NDU2NlRIRVRSQURFREVTSy9CMjQ4MDA4MzIuMjg0MTc3NDMzXFwnZGF0YS1kY20tcmVuZGVyaW5nLW1vZGU9XFwnc2NyaXB0XFwnICAgIGRhdGEtZGNtLWh0dHBzLW9ubHkgICAgZGF0YS1kY20tZ2Rwci1hcHBsaWVzPVxcJ2dkcHI9MFxcJyAgICBkYXRhLWRjbS1nZHByLWNvbnNlbnQ9XFwnZ2Rwcl9jb25zZW50PVxcJyAgICBkYXRhLWRjbS1hZGR0bC1jb25zZW50PVxcJ2FkZHRsX2NvbnNlbnQ9JHtBRERUTF9DT05TRU5UfVxcJyAgICBkYXRhLWRjbS1yZXNldHRhYmxlLWRldmljZS1pZD1cXCdcXCcgICAgZGF0YS1kY20tYXBwLWlkPVxcJ1xcJyAgICBkYXRhLWRjbS1jbGljay10cmFja2VyPVxcJ2h0dHA6Ly9pbnNpZ2h0LmFkc3J2ci5vcmcvdHJhY2svY2xrP2ltcD0wZWVjMzg4YS1hMTI4LTQwMDgtYWE1NC02YWM2ZGRhYmMxNDEmYWc9YmFscThodCZzZmU9MTIwODdjNjQmc2lnPUtEaDI1eUxFanFDSFlnS0tmWlYybDg0azJwdm51RHJJREloTTVOc1p0OHcuJmNyaWQ9cmR5eWYzaTUmY2Y9MTg5MzAwNSZmcT0wJnRkX3M9MTQ1NjczMjU2OCZyY2F0cz0mbWNhdD0mbXN0ZT0mbWZsZD00Jm1zc2k9Tm9uZSZtZnNpPTljdW91dWI4ejcmc3Y9cnViaWNvbiZ1aG93PTgzJmFnc2E9JndwPTgxNEEzMEMzMTE5N0VERjMmcmdjbz1Vbml0ZWQlMjBTdGF0ZXMmcmdyZT1EZWxhd2FyZSZyZ21lPTUwNCZyZ2NpPU5ld2FyayZyZ3o9MTk3MDImZHQ9TW9iaWxlJm9zZj1pT1Mmb3M9aU9TMTQyJmJyPVdlYlZpZXcmc3ZwaWQ9MjAwMTQmcmxhbmdzPWVuJm1sYW5nPSZkaWQ9JnJjeHQ9SW5BcHAmdG1wYz0mdnJ0ZD0mb3NpPSZvc3Y9JmRhaWQ9MmQxNGM0NGYtMWFlMS00MGFlLWI1OGUtYWI4YTllN2ZjNTc4JmRucj0wJnZwYj0mYz1PQUpRQVEuLiZkdXI9Q2hvS0IzSnJhSGMwZVc0UTNkQUZJZ3NJbHNpdmZSSUVibTl1WlFvMkNoMWphR0Z5WjJVdFlXeHNTVzUwWldkeVlXeENjbUZ1WkZOaFptVjBlU0lWQ1BuX19fX19fX19fX3dFU0NHbHVkR1ZuY21Gc0NqWUtIV05vWVhKblpTMWhiR3hKYm5SbFozSmhiRlpwWlhkaFltbHNhWFI1SWhVSS1QX19fX19fX19fX0FSSUlhVzUwWldkeVlXd0tQUW9rWTJoaGNtZGxMV0ZzYkVsdWRHVm5jbUZzVTNWemNHbGphVzkxYzBGamRHbDJhWFI1SWhVSTlmX19fX19fX19fX0FSSUlhVzUwWldkeVlXd1EzZEFGJmR1cnM9cjhmRkd3JmNycmVscj0mbnB0PSZzdnNjaWQ9MTQ1NjczMjU2OCZtaz1BcHBsZSZtZGw9aVBob25lJmlwbD0xNDg0NjIwJmZwYT04NzAmcGNtPTMmaWN0PVVua25vd24mc2FpZD1jM2YzNjc1ZWYyM2RkZWNhZmU4Yjg4NTY3NGIwYTIwYjViNDY5MDIxJmF1Y3Q9MSZyPVxcJz4gIDxzY3JpcHQgc3JjPVxcJ2h0dHBzOi8vd3d3Lmdvb2dsZXRhZ3NlcnZpY2VzLmNvbS9kY20vZGNtYWRzLmpzXFwnPjwvc2NyaXB0PjwvaW5zPjxTQ1JJUFQgVFlQRT1cImFwcGxpY2F0aW9uL2phdmFzY3JpcHRcIiBTUkM9XCJodHRwczovL3BpeGVsLmFkc2FmZXByb3RlY3RlZC5jb20vcmpzcy9zdC81MTE1NjYvNDkzMjU0ODMvc2tlbGV0b24uanNcIj48L1NDUklQVD4gPE5PU0NSSVBUPjxJTUcgU1JDPVwiaHR0cHM6Ly9waXhlbC5hZHNhZmVwcm90ZWN0ZWQuY29tL3Jmdy9zdC81MTE1NjYvNDkzMjU0ODIvc2tlbGV0b24uZ2lmP2dkcHI9MCZnZHByX2NvbnNlbnQ9JmdkcHJfcGQ9MFwiIEJPUkRFUj0wIFdJRFRIPTEgSEVJR0hUPTEgQUxUPVwiXFxcXFwiPjwvTk9TQ1JJUFQ+PHNwYW4gaWQ9XCJ0ZS1jbGVhcmFkcy1qcy10cmFkZWRlc2swMWNvbnQxXCI+PHNjcmlwdCB0eXBlPVwidGV4dC9qYXZhc2NyaXB0XCIgc3JjPVwiaHR0cHM6Ly9jaG9pY2VzLnRydXN0ZS5jb20vY2E/cGlkPXRyYWRlZGVzazAxJmFpZD10cmFkZWRlc2swMSZjaWQ9dXN5NzU2Zl9iYWxxOGh0X3JkeXlmM2k1JmM9dHJhZGVkZXNrMDFjb250MSZqcz1wbXcwJnc9MzIwJmg9NTAmc2lkPWV2OS1GTTYwcHpXZWZrTUFpTTc3dWdFLWFOeTJ1M2t6QVlSWXJPVkg2Q0FLWkZkOXpDVGwwQ3hKYmtUVXV4Q0pxQUtmS0NmemwxRV9DR004c0s0ajFwSEQ5bl9PazR6cHRBWjcxZzA2VWJ4Tl9zY3lROUpITXpoWDcyLW5TTzRYXCI+PC9zY3JpcHQ+PC9zcGFuPjwvZGl2Pic7XG4gICAgY29uc3QgdGV4dCA9ICc8aW1nIHNyYz1cImh0dHBzOi8vdGsweDEuY29tL3NqL3RyP2V0PUlOQk9YX09QRU4maWQ9NWZkMGZjNjQyYTFjYjBlNGI0NmFkNWU4Jm1ldGE9TWpBME56SXpNRG80TVRjME9UQTZNbUUxTUdKaU1EQXROR1poTVMwMFptVTVMV0prTlRndE5tTXhaR1JpTW1VNFpUWmomY3R4PUNpUXlZVFV3WW1Jd01DMDBabUV4TFRSbVpUa3RZbVExT0MwMll6RmtaR0l5WlRobE5tTVNBazFZR05MeU1TRC0tWHdxQ0FnQkVKaWpBaGdLT0RaQUFnayZuYW1lPWRzcF9odG1sX2xvYWRlZFwiIHdpZHRoPTEgaGVpZ2h0PTEgc3R5bGU9XCJkaXNwbGF5Om5vbmVcIi8+PGltZyBzcmM9XCJodHRwczovL3RrMHgxLmNvbS9zai90cj9ldD1PTl9MT0FEJmlkPTVmZDBmYzY0MmExY2IwZTRiNDZhZDVlOCZtZXRhPU1qQTBOekl6TURvNE1UYzBPVEE2TW1FMU1HSmlNREF0TkdaaE1TMDBabVU1TFdKa05UZ3RObU14WkdSaU1tVTRaVFpqJmN0eD1DaVF5WVRVd1ltSXdNQzAwWm1FeExUUm1aVGt0WW1RMU9DMDJZekZrWkdJeVpUaGxObU1TQWsxWUdOTHlNU0QtLVh3cUNBZ0JFSmlqQWhnS09EWkFBZ2tcIiB3aWR0aD0xIGhlaWdodD0xIHN0eWxlPVwiZGlzcGxheTpub25lXCIvPiAgICA8c2NyaXB0IHR5cGU9XCJ0ZXh0L2phdmFzY3JpcHRcIj4gcnViaWNvbl9jYiA9IE1hdGgucmFuZG9tKCk7IHJ1Ymljb25fcnVybCA9IGRvY3VtZW50LnJlZmVycmVyOyBpZih0b3AubG9jYXRpb249PWRvY3VtZW50LmxvY2F0aW9uKXtydWJpY29uX3J1cmwgPSBkb2N1bWVudC5sb2NhdGlvbjt9IHJ1Ymljb25fcnVybCA9IGVzY2FwZShydWJpY29uX3J1cmwpO3dpbmRvdy5ydWJpY29uX2FkID1cIjM0NTAxNzJcIiArIFwiLlwiICsgXCJqc1wiO3dpbmRvdy5ydWJpY29uX2NyZWF0aXZlID0gXCIzNTYzNzc0XCIgKyBcIi5cIiArIFwianNcIjs8L3NjcmlwdD48ZGl2IGRhdGEtcnAtdHlwZT1cInRycC1kaXNwbGF5LWNyZWF0aXZlXCIgZGF0YS1ycC1pbXByZXNzaW9uLWlkPVwiM2FlODliZjctMTkyNi00ZmViLWFiMmYtZDQzNWUwZDkzNjhlXCIgZGF0YS1ycC1hcWlkPVwiMjk3NDoyOTI5NDM3XCIgZGF0YS1ycC1hY2N0LWlkPVwiMjA3NDRcIj48ZGl2IHN0eWxlPVwid2lkdGg6IDA7IGhlaWdodDogMDsgb3ZlcmZsb3c6IGhpZGRlbjtcIj48aW1nIGJvcmRlcj1cIjBcIiB3aWR0aD1cIjFcIiBoZWlnaHQ9XCIxXCIgc3JjPVwiaHR0cHM6Ly9wci55YnAueWFob28uY29tL2J3L3J1Ymljb24vaW1wL3poWWlxSTZkanI2QjRyeW40VDNGN0N1U1p4Q0pRTHZJd2NpamduaGRlSVgxOHNad1U4aWlDcldUcjgwLWwyZHV1NnR3TG4wcUhMNVhhSjJBREIzWlZWSnc3R01fLThyTmRkelJxY0ZsSTVDWVNKbnljaWR3ZWtXSGtmcy1FdldmNUNnZHdTd1NZUWx6YmhVNHdnVnNZREhOR2daeThKNDNaR0pHVjFUWEhXZ2cxUGozTngyaVdrMVhfQTJVbXk1VHdoS2t5QXJVSW1SeWU4LU9ITWVqMVJWWXdFYUFzdmUxRWwxdEI4VmFVbThHNmRibkxFb2J6dkdzRDNSbnVkcTYzdTdjUnBXZjk1SzZwVExFNWNoU2RoeWJMdHRsNDIzckgteXo4eEFRUVlQbTJLbmRYOVNUWEh5dlRVMkM3WXVqajlvSmp5ZWdERmZhdWFoR2FRUGtwNlRZWHFjbTBiVmtQTGkza3ZRWWZGdVdvX0lFMm5STDVmalYwU3dBNnFaVTBTUU5USU9CYm1XeTh4dVh5blNLYW5hOW1fczh6aFZ5QWVIbUU2d3BrTGg1SHNieHZCQnNyZm1LN2FWam4yWW9KSGNBNURzS3E5bElRV3VPYTlqUDV3aDRBOVJEV1lUSnc4d2pSY0VQUGh6cklPLWlrVmcyY2MyRmFmNzh2cFhlRnllN2k3WUdaaUtsWjN3WXZrWG9zN3lUcWxHcXBSdjdnVUxkcmplR1M1S1UwTENKbkl2azloa1gzSTRtNXpObHNmZ3g1LVVFZ3FnOWd4b3Vvb0M3b0gwT0NZcUhRaWwwZlNkNjYwNk1NLTZjX1lZZHJ5bUw1Zm56aGZqMV90NFJqVk5lMnRXVUhsYm5TXzBIR1N4UEV5Z2RVOHNVTnc4aGpiUnBGR2pOd0lPOTJCVUVwWXhXMzdmeTFDVFp2TE5FV05pd3BtbHJtcjREalFZMDFYOXRlSV9hX2pUX1FpNWRDUVpNeTRtWVJUNk16ZXR1VlNGSXZtQkRfZ0tuaktYXzc4QWtObEk3Si0xbXFPMjZNUWk3eXY2M2JVdWFpdXoxak9DVnQ0SHNJTUVPejRRVXhOcUY3a3ZkQjBuRWYwaXF5QjlfSFgtUmhEYk5Md2JVb2ZhQWg2OFBVbWY5VktIcHAtQ2xaMlhIYjhuYUVRX1ZqRFZNdWRzTHJjTVFWaWY0VHFnUUZlLUxva1NqbnY1MkFEazVOQnd2SGJPa3h1VDZ3NjJJWS1KdGtZcWFJemJGc05FdUpjTmZ0VUJzZkRIQ3VZenpLYXNHZm9VaHBhNFEtVG9EMm9BcVVfeEc1V2tFazlvV1JmOVhJcndaUm5iRUYxSktjc2pxVVZrS2ZVdVZsZi0tcjFFOC1lejg1czduekVtcDQxaG1HWWtuSmItSkd1SDk0WEI1V3pMMl8tZ0JUbUg1N0NyMWdmak9WazdxQWI5VzNvVHMtejRjM1lzSTJuV0VUQU5QbUtOM1lKVXJyRl9OMTFsYmhlVnh6b3ZuTTI2MUN6cXBOWFVkSTU1NjlzV0x0QXloWG8zTVBmOS03cXpCeDh1aXl3Sld3dkZ3N3ZCTGFjN0xCSjlkMEYwRjRWRXNTN2xYVFl6Z3I3SWk2bll0d1lySG01X2VhWmN0T3lxUy1zYlZRdms5T1R5OVV2SGtUY1dBcmpPWWpPRE5TNUd1b0tSd29JUm85ZDdvTWNYaU9Cd255QUdsLWtUZHJ5WmpoUGg0bkpvLUw5ZTRBaVZLSnBRX1hTZk1PYmpUUXl6aF9NemMtRDY0X2VTRWJzM01Gd2cwRFJlTHJJclZTcWpGOHNCZEl0V00tTC1rSjQ4Z3haQndySVEvYWkvY2ExYzU5NjQ1YzNiNmE0OWUzMzg2YzUzYmYzYjA3MTk2NzA5ZmZlYl8xNS93cC82MjFFMTMyMEZGRkQ1OUU5XCIgYWx0PVwiXCIgLz48aW1nIGJvcmRlcj1cIjBcIiB3aWR0aD1cIjFcIiBoZWlnaHQ9XCIxXCIgc3JjPVwiaHR0cHM6Ly9iZWFjb24tZXUtYW1zMy5ydWJpY29ucHJvamVjdC5jb20vYmVhY29uL2QvM2FlODliZjctMTkyNi00ZmViLWFiMmYtZDQzNWUwZDkzNjhlP29vPTAmYWNjb3VudElkPTIwNzQ0JnNpdGVJZD0yNzQyMzgmem9uZUlkPTE1MDA5NTAmc2l6ZUlkPTE1JmU9NkExRTQwRTM4NERBNTYzQjJEOEI2N0E4NzhFQTFFNTEwQTYyRUZENUQxQkEzNDc5QzZFN0FDOUU5OTFFMEY1MkE5QzU2RUFCMDIwNzA2QzhBQTJBOThDODVDOERCRjlENDNEQjgzRTQ0NUFEQUM2OEQ3MzEwQjM4RTJCNEFGQjJGRTM0NjkyRjFENEQ1RTZEQTYxRjA0ODg5MEQxMUQyRURCQ0Q2OUQ4NDhEMDNBNUI5MDhCMDNBMTlFOTIxODlDRjA5QzYxMDNDMURGMkFBMkMyRDdDQ0FDRjJBODQ0NkM3NUEwNTBDODY5N0MwNjhBMTI4MjY2OTUwMTNDQUYwNUJDNjdFRTBBODlGMzU4QzRDRERGODAxMUVCOTY4OTU2NDlFRkUyN0RERUEzNkNGMTI0RjUyMDdBMjQ1OEFENzdCRDNBMjVDRjY4NDYwOTIzM0JDQUM3OEQyNDI5QkEwRjBGNzYwQ0M0NDRERjREMDlDMjkzQUIzODlFMzIwNTE2Q0ZGRjRFMDBCODE3NkI0QzI1NzUxQTZGNTFERkM3OUVcIiBhbHQ9XCJcIiAvPjwvZGl2PjxzY3JpcHQgdHlwZT1cInRleHQvamF2YXNjcmlwdFwiIHNyYz1cImh0dHBzOi8vcHIueWJwLnlhaG9vLmNvbS9hYi9zZWN1cmUvdHJ1ZS9pbXAvV3VjOXNpY3F1aDFOMlJKTWk3T0VjTW1LX1dsQnRVWUVLV1RyQXlJeUIzNHJReDE1QXVtRnlvdTlsVzAwSF91bElQTFZuR3J2SnZOWkhpbzdFZEgteUJnSVJSN013dWNsbkN0RHR2cTNmR3Ffd0VOVWR0ZU0tVTJCYk1YbmJZcm55QlJUaEZVQThkdDdaMk0tTFpUYzVGRml4RlNHM1lLektSaWVTc1lLQkpnQmhmeC0wOW9jcUtjZE5TVjQ2R3R6VGtiUXQ5UUFLSjVmQWZPUzQxUUVqN0JyczhRemNLNkVTaDZQbXhYNVF0bjFucmpfaVU4T3JYNWZmdVhmWGpVTmNEMV9YVmFVZU9CMEdaY3RsUTVnc3V1RkFqN3NvZ0M0akpBN3hMazNGV0t3aFc2Y0R0cmplckZhOXhRQVA2RUhfS05tX1M4R0pVZVlyMkJIUXo3Vm1SVFRNYTBmSWdKY2I5ZWdhM1ZZYzVMeDBNVVJtQTBwNnQ0THRac3k1aWRwSDdPYVE2VUZFRlJIc2txX29UQnNKbzA1LXNpX0d1SloyXzZ3eEV3WEdhOG42bEFBQTZ4NXdGUUxjal9saGFYaXlWX0VxN2RXU2xpMTRrZlMtaVBWZXVobW5xX3piQ1p1T0JndDdSYnlSbnFKTVRyRUVfTno0QU4wUVpUb0FLdkNtLUQxMExudEFudTMwMTFwS09ac3lpeHVUTUpYd21oRnpWNnRuckw3MVhmNG5UNWl1MTBNcVUwbnJhMVBKaVFTVTZlam9WTTZvWVRkTzB4QUZkSUZPUzlZN3J5SFYzdUhzVXYwNW5aM2JENTJ1QkRvVm50TjFrcjZzd2s5MDNyaEd0MHQxM0ZWNG01T21hTWU1RUtuZnBxOXhwQy1HYTY1RVowU0lFZno2TUFTdTJvd0t3Rk91OGdXbkp0M0dmc21wbnFEcmgzVlJKd2p3eXNudnNCVGN4aE50VFRiMUV0WEYyUFhEendSZWtZNGZUb0xQWU1pcmVkT092aFdsa2s1LUFQSExKVVZvemJnQ0xGdjI0TGY5NWRwbkVxUzBKeGUwZGVOeXh0TGZsdnZycDBhM0FDaldOdVVBZG53ZzJhekFYMFVqaVJQaDlkYnphNDAxaDEyN2c3WUhhZkRGQU14UE5Wc0JnTHB0QUNQek9UcTZvY0ZscmgzcjVDeUFWUm1RUjVKTzFlX19jR3dEaUJYZEpZa2xfV3lhOXNwQVBBc0dHc2lxYk45VTF0THJxNDVfOThlbWJNWGYwZFJROUxaazRPOEJfM2xKZVNkSU1OZFZJcFpsT3VIYmlpYU1TOU5sMjQxeWNUc2hxS3pUTjBfN0ZzekVqVXRod2tkNDBYTWNtZl94N2QzTF9tUERxVVJTbExYRFVYdHFOSXNPQ2tiYlM1TGpsX05zQlhkUkVhX0NwZmk5LUphYmJOY2hqVmRJdjlCM3Zud1U0NFQ2azJ2TFg4ZmtMM2xGNEZidWZ5cDJCSTJ4eFBGbjM1OEt5Q28xRmJNMVBTY3VhSnUwWjlxLUVJU2ZZcmpfZy1IQWx2N0tNMDZUWUMtZllhN2hUd3NmYlplU1doNHV5elpIY2xrbDltcVRubWpkeXN2dTdOajhza2FQTWY4eU04YWZtR3FrQzVsWWl0SlVocDJqZkluNlJtR0RxSDdwM25fd21XVXB4eUxFZEU5SW9JUUV3eS1XUTB1VzBzcVZKc2hnRkR3cXRQYXZQM0hNZ193ZHkyZGxQbHVreGxmNWFtWXp4cDByY2EwUDE1cUhlMi1hRXNZUHF3dHkyVmJtZ2l6V1JwMXZlTEQ0dGs3akFLM205NWNreUt3UFlRYzg0MC93cC82MjFFMTMyMEZGRkQ1OUU5XCI+PC9zY3JpcHQ+PC9kaXY+JztcbiAgICB3aW5kb3cucGFyZW50LmRvY3VtZW50LndyaXRlKHRleHQpO1xuICAgIC8vd2luZG93LnBhcmVudC5kb2N1bWVudC5hcHBlbmRDaGlsZChkaXYpO1xuICAgIC8qY29uc3QgcmVzaXplSGFuZGxlciA9IChldmVudD86IEV2ZW50KSA9PiB7XG4gICAgICAgIGNvbnN0IGN1cnJlbnRPcmllbnRhdGlvbiA9IGRvY3VtZW50LmJvZHkuY2xhc3NMaXN0LmNvbnRhaW5zKCdsYW5kc2NhcGUnKSA/ICdsYW5kc2NhcGUnIDogZG9jdW1lbnQuYm9keS5jbGFzc0xpc3QuY29udGFpbnMoJ3BvcnRyYWl0JykgPyAncG9ydHJhaXQnIDogbnVsbDtcbiAgICAgICAgY29uc3QgbmV3T3JpZW50YXRpb246IHN0cmluZyA9IHdpbmRvdy5pbm5lcldpZHRoIC8gd2luZG93LmlubmVySGVpZ2h0ID49IDEgPyAnbGFuZHNjYXBlJyA6ICdwb3J0cmFpdCc7XG4gICAgICAgIGlmIChjdXJyZW50T3JpZW50YXRpb24pIHtcbiAgICAgICAgICAgIGlmIChjdXJyZW50T3JpZW50YXRpb24gIT09IG5ld09yaWVudGF0aW9uKSB7XG4gICAgICAgICAgICAgICAgZG9jdW1lbnQuYm9keS5jbGFzc0xpc3QucmVtb3ZlKGN1cnJlbnRPcmllbnRhdGlvbik7XG4gICAgICAgICAgICAgICAgZG9jdW1lbnQuYm9keS5jbGFzc0xpc3QuYWRkKG5ld09yaWVudGF0aW9uKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGRvY3VtZW50LmJvZHkuY2xhc3NMaXN0LmFkZChuZXdPcmllbnRhdGlvbik7XG4gICAgICAgIH1cbiAgICB9O1xuICAgIHJlc2l6ZUhhbmRsZXIoKTtcbiAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcigncmVzaXplJywgcmVzaXplSGFuZGxlciwgZmFsc2UpO1xuXG4gICAgY29uc3QgdG9JbnQgPSAoZWxlbWVudDogSFRNTElucHV0RWxlbWVudCk6IG51bWJlciA9PiBwYXJzZUludChlbGVtZW50LnZhbHVlLCAxMCk7XG4gICAgY29uc3QgdG9Cb29sZWFuID0gKGVsZW1lbnQ6IEhUTUxJbnB1dEVsZW1lbnQpOiBib29sZWFuID0+IGVsZW1lbnQuY2hlY2tlZDtcbiAgICBjb25zdCBKU19GVU5DX05BTUVfR0VUX0hFQURMRVNTID0gJ2dldEhlYWRsZXNzJztcbiAgICBjb25zdCBKU19GVU5DX05BTUVfR0VUX0hFQURMRVNTX0xPQUQgPSAnZ2V0SGVhZGxlc3NMb2FkJztcbiAgICBjb25zdCBKU19GVU5DX05BTUVfR0VUX0hFQURMRVNTX0xPQURfQURBUFRFUiA9ICdnZXRIZWFkbGVzc0xvYWRBZGFwdGVyJztcblxuICAgIGNvbnN0IHNldENsaWVudEluZm8gPSAoKSA9PiB7XG4gICAgICAgIGNvbnN0IGZpZWxkczogW3N0cmluZywgc3RyaW5nLCAoKGVsZW1lbnQ6IEhUTUxJbnB1dEVsZW1lbnQpID0+IHVua25vd24pIHwgdW5kZWZpbmVkXVtdID0gW1xuICAgICAgICAgICAgWydhcHBOYW1lJywgJ3NldEFwcE5hbWUnLCB1bmRlZmluZWRdLFxuICAgICAgICAgICAgWydhcHBWZXJzaW9uJywgJ3NldEFwcFZlcnNpb24nLCB1bmRlZmluZWRdLFxuICAgICAgICAgICAgWydzZGtWZXJzaW9uJywgJ3NldFNka1ZlcnNpb24nLCB0b0ludF0sXG4gICAgICAgICAgICBbJ3Nka1ZlcnNpb25OYW1lJywgJ3NldFNka1ZlcnNpb25OYW1lJywgdW5kZWZpbmVkXSxcbiAgICAgICAgICAgIFsnZGVidWdnYWJsZScsICdzZXREZWJ1Z2dhYmxlJywgdG9Cb29sZWFuXSxcbiAgICAgICAgICAgIFsnY29uZmlnVXJsJywgJ3NldENvbmZpZ1VybCcsIHVuZGVmaW5lZF0sXG4gICAgICAgICAgICBbJ3dlYlZpZXdVcmwnLCAnc2V0V2ViVmlld1VybCcsIHVuZGVmaW5lZF0sXG4gICAgICAgICAgICBbJ3dlYlZpZXdIYXNoJywgJ3NldFdlYlZpZXdIYXNoJywgdW5kZWZpbmVkXSxcbiAgICAgICAgICAgIFsnd2ViVmlld1ZlcnNpb24nLCAnc2V0V2ViVmlld1ZlcnNpb24nLCB1bmRlZmluZWRdLFxuICAgICAgICAgICAgWydpbml0VGltZVN0YW1wJywgJ3NldEluaXRUaW1lU3RhbXAnLCB0b0ludF0sXG4gICAgICAgICAgICBbJ3JlaW5pdGlhbGl6ZWQnLCAnc2V0UmVpbml0aWFsaXplZCcsIHRvQm9vbGVhbl1cbiAgICAgICAgXTtcbiAgICAgICAgZmllbGRzLmZvckVhY2goKFtmaWVsZCwgc2V0dGVyLCBwYXJzZXJdOiBbc3RyaW5nLCBzdHJpbmcsICgoZWxlbWVudDogSFRNTElucHV0RWxlbWVudCkgPT4gdW5rbm93bikgfCB1bmRlZmluZWRdKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBlbGVtZW50ID0gPEhUTUxJbnB1dEVsZW1lbnQ+d2luZG93LnBhcmVudC5kb2N1bWVudC5nZXRFbGVtZW50QnlJZChmaWVsZCk7XG4gICAgICAgICAgICAvLyB0c2xpbnQ6ZGlzYWJsZS1uZXh0LWxpbmVcbiAgICAgICAgICAgICg8YW55PlVuaXR5QWRzLmdldEJhY2tlbmQoKS5BcGkuU2RrKVtzZXR0ZXJdKHBhcnNlciA/IHBhcnNlcihlbGVtZW50KSA6IGVsZW1lbnQudmFsdWUpO1xuICAgICAgICB9KTtcbiAgICB9O1xuXG4gICAgY29uc3Qgc2V0QW5kcm9pZERldmljZUluZm8gPSAoKSA9PiB7XG4gICAgICAgIGNvbnN0IGZpZWxkczogW3N0cmluZywgKChlbGVtZW50OiBIVE1MSW5wdXRFbGVtZW50KSA9PiB1bmtub3duKSB8IHVuZGVmaW5lZF1bXSA9IFtcbiAgICAgICAgICAgIFsnQWR2ZXJ0aXNpbmdUcmFja2luZ0lkJywgdW5kZWZpbmVkXSxcbiAgICAgICAgICAgIFsnTGltaXRBZFRyYWNraW5nRmxhZycsIHRvQm9vbGVhbl0sXG4gICAgICAgICAgICBbJ0FuZHJvaWRJZCcsIHVuZGVmaW5lZF0sXG4gICAgICAgICAgICBbJ01hbnVmYWN0dXJlcicsIHVuZGVmaW5lZF0sXG4gICAgICAgICAgICBbJ01vZGVsJywgdW5kZWZpbmVkXSxcbiAgICAgICAgICAgIFsnT3NWZXJzaW9uJywgdW5kZWZpbmVkXSxcbiAgICAgICAgICAgIFsnQXBpTGV2ZWwnLCB0b0ludF0sXG4gICAgICAgICAgICBbJ1Jvb3RlZCcsIHRvQm9vbGVhbl0sXG4gICAgICAgICAgICBbJ1NjcmVlbldpZHRoJywgdG9JbnRdLFxuICAgICAgICAgICAgWydTY3JlZW5IZWlnaHQnLCB0b0ludF0sXG4gICAgICAgICAgICBbJ1NjcmVlbkRlbnNpdHknLCB0b0ludF0sXG4gICAgICAgICAgICBbJ1NjcmVlbkxheW91dCcsIHRvSW50XSxcbiAgICAgICAgICAgIFsnU2NyZWVuQnJpZ2h0bmVzcycsIHRvSW50XSxcbiAgICAgICAgICAgIFsnU3lzdGVtTGFuZ3VhZ2UnLCB1bmRlZmluZWRdLFxuICAgICAgICAgICAgWydUaW1lWm9uZScsIHVuZGVmaW5lZF0sXG4gICAgICAgICAgICBbJ1RvdGFsU3BhY2UnLCB0b0ludF0sXG4gICAgICAgICAgICBbJ0ZyZWVTcGFjZScsIHRvSW50XSxcbiAgICAgICAgICAgIFsnVG90YWxNZW1vcnknLCB0b0ludF0sXG4gICAgICAgICAgICBbJ0ZyZWVNZW1vcnknLCB0b0ludF0sXG4gICAgICAgICAgICBbJ0Nvbm5lY3Rpb25UeXBlJywgdW5kZWZpbmVkXSxcbiAgICAgICAgICAgIFsnTmV0d29ya1R5cGUnLCB0b0ludF0sXG4gICAgICAgICAgICBbJ05ldHdvcmtPcGVyYXRvcicsIHVuZGVmaW5lZF0sXG4gICAgICAgICAgICBbJ05ldHdvcmtPcGVyYXRvck5hbWUnLCB1bmRlZmluZWRdLFxuICAgICAgICAgICAgWydIZWFkc2V0JywgdG9Cb29sZWFuXSxcbiAgICAgICAgICAgIFsnRGV2aWNlVm9sdW1lJywgdG9JbnRdLFxuICAgICAgICAgICAgWydCYXR0ZXJ5TGV2ZWwnLCB0b0ludF0sXG4gICAgICAgICAgICBbJ0JhdHRlcnlTdGF0dXMnLCB0b0ludF0sXG4gICAgICAgICAgICBbJ1Jpbmdlck1vZGUnLCB0b0ludF1cbiAgICAgICAgXTtcbiAgICAgICAgZmllbGRzLmZvckVhY2goKFtmaWVsZCwgcGFyc2VyXTogW3N0cmluZywgKChlbGVtZW50OiBIVE1MSW5wdXRFbGVtZW50KSA9PiB1bmtub3duKSB8IHVuZGVmaW5lZF0pID0+IHtcbiAgICAgICAgICAgIGNvbnN0IGVsZW1lbnQgPSA8SFRNTElucHV0RWxlbWVudD53aW5kb3cucGFyZW50LmRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdhbmRyb2lkJyArIGZpZWxkKTtcbiAgICAgICAgICAgIC8vIHRzbGludDpkaXNhYmxlLW5leHQtbGluZVxuICAgICAgICAgICAgKDxhbnk+VW5pdHlBZHMuZ2V0QmFja2VuZCgpLkFwaS5EZXZpY2VJbmZvKVsnc2V0JyArIGZpZWxkXShwYXJzZXIgPyBwYXJzZXIoZWxlbWVudCkgOiBlbGVtZW50LnZhbHVlKTtcbiAgICAgICAgfSk7XG4gICAgfTtcblxuICAgIGNvbnN0IHNldElvc0RldmljZUluZm8gPSAoKSA9PiB7XG4gICAgICAgIGNvbnN0IGZpZWxkczogW3N0cmluZywgKChlbGVtZW50OiBIVE1MSW5wdXRFbGVtZW50KSA9PiB1bmtub3duKSB8IHVuZGVmaW5lZF1bXSA9IFtcbiAgICAgICAgICAgIFsnQWR2ZXJ0aXNpbmdUcmFja2luZ0lkJywgdW5kZWZpbmVkXSxcbiAgICAgICAgICAgIFsnTGltaXRBZFRyYWNraW5nRmxhZycsIHRvQm9vbGVhbl0sXG4gICAgICAgICAgICBbJ01hbnVmYWN0dXJlcicsIHVuZGVmaW5lZF0sXG4gICAgICAgICAgICBbJ01vZGVsJywgdW5kZWZpbmVkXSxcbiAgICAgICAgICAgIFsnT3NWZXJzaW9uJywgdW5kZWZpbmVkXSxcbiAgICAgICAgICAgIFsnUm9vdGVkJywgdG9Cb29sZWFuXSxcbiAgICAgICAgICAgIFsnU2NyZWVuV2lkdGgnLCB0b0ludF0sXG4gICAgICAgICAgICBbJ1NjcmVlbkhlaWdodCcsIHRvSW50XSxcbiAgICAgICAgICAgIFsnU2NyZWVuU2NhbGUnLCB0b0ludF0sXG4gICAgICAgICAgICBbJ1NjcmVlbkJyaWdodG5lc3MnLCB0b0ludF0sXG4gICAgICAgICAgICBbJ1N5c3RlbUxhbmd1YWdlJywgdW5kZWZpbmVkXSxcbiAgICAgICAgICAgIFsnVGltZVpvbmUnLCB1bmRlZmluZWRdLFxuICAgICAgICAgICAgWydUb3RhbFNwYWNlJywgdG9JbnRdLFxuICAgICAgICAgICAgWydGcmVlU3BhY2UnLCB0b0ludF0sXG4gICAgICAgICAgICBbJ1RvdGFsTWVtb3J5JywgdG9JbnRdLFxuICAgICAgICAgICAgWydGcmVlTWVtb3J5JywgdG9JbnRdLFxuICAgICAgICAgICAgWydDb25uZWN0aW9uVHlwZScsIHVuZGVmaW5lZF0sXG4gICAgICAgICAgICBbJ05ldHdvcmtUeXBlJywgdG9JbnRdLFxuICAgICAgICAgICAgWydOZXR3b3JrT3BlcmF0b3InLCB1bmRlZmluZWRdLFxuICAgICAgICAgICAgWydOZXR3b3JrT3BlcmF0b3JOYW1lJywgdW5kZWZpbmVkXSxcbiAgICAgICAgICAgIFsnSGVhZHNldCcsIHRvQm9vbGVhbl0sXG4gICAgICAgICAgICBbJ0RldmljZVZvbHVtZScsIHRvSW50XSxcbiAgICAgICAgICAgIFsnQmF0dGVyeUxldmVsJywgdG9JbnRdLFxuICAgICAgICAgICAgWydCYXR0ZXJ5U3RhdHVzJywgdG9JbnRdLFxuICAgICAgICAgICAgWydVc2VySW50ZXJmYWNlSWRpb20nLCB0b0ludF0sXG4gICAgICAgICAgICBbJ1NpbXVsYXRvcicsIHRvQm9vbGVhbl1cbiAgICAgICAgXTtcbiAgICAgICAgZmllbGRzLmZvckVhY2goKFtmaWVsZCwgcGFyc2VyXTogW3N0cmluZywgKChlbGVtZW50OiBIVE1MSW5wdXRFbGVtZW50KSA9PiB1bmtub3duKSB8IHVuZGVmaW5lZF0pID0+IHtcbiAgICAgICAgICAgIGNvbnN0IGVsZW1lbnQgPSA8SFRNTElucHV0RWxlbWVudD53aW5kb3cucGFyZW50LmRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdpb3MnICsgZmllbGQpO1xuICAgICAgICAgICAgLy8gdHNsaW50OmRpc2FibGUtbmV4dC1saW5lXG4gICAgICAgICAgICAoPGFueT5Vbml0eUFkcy5nZXRCYWNrZW5kKCkuQXBpLkRldmljZUluZm8pWydzZXQnICsgZmllbGRdKHBhcnNlciA/IHBhcnNlcihlbGVtZW50KSA6IGVsZW1lbnQudmFsdWUpO1xuICAgICAgICB9KTtcbiAgICB9O1xuXG4gICAgaWYgKHdpbmRvdy5wYXJlbnQgIT09IHdpbmRvdykge1xuICAgICAgICBjb25zdCBwID0gPEhUTUxJbnB1dEVsZW1lbnQ+d2luZG93LnBhcmVudC5kb2N1bWVudC5jcmVhdGVFbGVtZW50KCdwJyk7XG4gICAgICAgIHAudGV4dENvbnRlbnQgPSB3aW5kb3cucGFyZW50LmxvY2F0aW9uLnNlYXJjaC5zdWJzdHJpbmcoMSk7XG4gICAgICAgIGNvbnN0IGNvbnRhaW5lciA9IDxIVE1MSW5wdXRFbGVtZW50PndpbmRvdy5wYXJlbnQuZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2hlbGxvJyk7XG4gICAgICAgIGlmIChjb250YWluZXIpIHtcbiAgICAgICAgICAgIGNvbnRhaW5lci5hcHBlbmRDaGlsZChwKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IGFiR3JvdXBFbGVtZW50ID0gPEhUTUxJbnB1dEVsZW1lbnQ+d2luZG93LnBhcmVudC5kb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYWJHcm91cCcpO1xuICAgICAgICBjb25zdCBjYW1wYWlnbklkRWxlbWVudCA9IDxIVE1MSW5wdXRFbGVtZW50PndpbmRvdy5wYXJlbnQuZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2NhbXBhaWduSWQnKTtcbiAgICAgICAgY29uc3QgY291bnRyeUVsZW1lbnQgPSA8SFRNTElucHV0RWxlbWVudD53aW5kb3cucGFyZW50LmRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdjb3VudHJ5Jyk7XG4gICAgICAgIGNvbnN0IHBsYXRmb3JtRWxlbWVudCA9IDxIVE1MSW5wdXRFbGVtZW50PndpbmRvdy5wYXJlbnQuZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3BsYXRmb3JtJyk7XG4gICAgICAgIGNvbnN0IGdhbWVJZEVsZW1lbnQgPSA8SFRNTElucHV0RWxlbWVudD53aW5kb3cucGFyZW50LmRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdnYW1lSWQnKTtcbiAgICAgICAgY29uc3QgdGVzdE1vZGVFbGVtZW50ID0gPEhUTUxJbnB1dEVsZW1lbnQ+d2luZG93LnBhcmVudC5kb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndGVzdE1vZGUnKTtcbiAgICAgICAgY29uc3QgbG9hZE1vZGVFbGVtZW50ID0gPEhUTUxJbnB1dEVsZW1lbnQ+d2luZG93LnBhcmVudC5kb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbG9hZE1vZGUnKTtcbiAgICAgICAgY29uc3QgYXV0b1NraXBFbGVtZW50ID0gPEhUTUxJbnB1dEVsZW1lbnQ+d2luZG93LnBhcmVudC5kb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYXV0b1NraXAnKTtcbiAgICAgICAgY29uc3QgdXNlU3RhZ2luZ0VsZW1lbnQgPSA8SFRNTElucHV0RWxlbWVudD53aW5kb3cucGFyZW50LmRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd1c2VTdGFnaW5nJyk7XG4gICAgICAgIGNvbnN0IGluaXRpYWxpemVCdXR0b24gPSA8SFRNTEJ1dHRvbkVsZW1lbnQ+d2luZG93LnBhcmVudC5kb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnaW5pdGlhbGl6ZScpO1xuICAgICAgICBjb25zdCBsb2FkQnV0dG9uRGVmYXVsdCA9IDxIVE1MQnV0dG9uRWxlbWVudD53aW5kb3cucGFyZW50LmRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdsb2FkRGVmYXVsdCcpO1xuICAgICAgICBjb25zdCBsb2FkQnV0dG9uSW5jZW50aXZpemUgPSA8SFRNTEJ1dHRvbkVsZW1lbnQ+d2luZG93LnBhcmVudC5kb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbG9hZEluY2VudGl2aXplJyk7XG4gICAgICAgIGNvbnN0IGNhbXBhaWduUmVzcG9uc2VFbGVtZW50ID0gPEhUTUxJbnB1dEVsZW1lbnQ+d2luZG93LnBhcmVudC5kb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnY2FtcGFpZ25SZXNwb25zZScpO1xuICAgICAgICBjb25zdCBlbmRTY3JlZW5VcmxFbGVtZW50ID0gPEhUTUxJbnB1dEVsZW1lbnQ+d2luZG93LnBhcmVudC5kb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZW5kU2NyZWVuVXJsJyk7XG4gICAgICAgIGNvbnN0IGZvcmNlTG9hZFY1RWxlbWVudCA9IDxIVE1MSW5wdXRFbGVtZW50PndpbmRvdy5wYXJlbnQuZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2ZvcmNlTG9hZFY1Jyk7XG5cbiAgICAgICAgY29uc3QgaW5pdGlhbGl6ZSA9ICgpID0+IHtcbiAgICAgICAgICAgIHdpbmRvdy5sb2NhbFN0b3JhZ2Uuc2V0SXRlbSgnYWJHcm91cCcsIGFiR3JvdXBFbGVtZW50LnZhbHVlKTtcbiAgICAgICAgICAgIHdpbmRvdy5sb2NhbFN0b3JhZ2Uuc2V0SXRlbSgnY2FtcGFpZ25JZCcsIGNhbXBhaWduSWRFbGVtZW50LnZhbHVlKTtcbiAgICAgICAgICAgIHdpbmRvdy5sb2NhbFN0b3JhZ2Uuc2V0SXRlbSgnY291bnRyeScsIGNvdW50cnlFbGVtZW50LnZhbHVlKTtcbiAgICAgICAgICAgIHdpbmRvdy5sb2NhbFN0b3JhZ2Uuc2V0SXRlbSgncGxhdGZvcm0nLCBwbGF0Zm9ybUVsZW1lbnQudmFsdWUpO1xuICAgICAgICAgICAgd2luZG93LmxvY2FsU3RvcmFnZS5zZXRJdGVtKCdnYW1lSWQnLCBnYW1lSWRFbGVtZW50LnZhbHVlKTtcbiAgICAgICAgICAgIHdpbmRvdy5sb2NhbFN0b3JhZ2Uuc2V0SXRlbSgndGVzdE1vZGUnLCB0ZXN0TW9kZUVsZW1lbnQuY2hlY2tlZC50b1N0cmluZygpKTtcbiAgICAgICAgICAgIHdpbmRvdy5sb2NhbFN0b3JhZ2Uuc2V0SXRlbSgnbG9hZE1vZGUnLCBsb2FkTW9kZUVsZW1lbnQuY2hlY2tlZC50b1N0cmluZygpKTtcbiAgICAgICAgICAgIHdpbmRvdy5sb2NhbFN0b3JhZ2Uuc2V0SXRlbSgnYXV0b1NraXAnLCBhdXRvU2tpcEVsZW1lbnQuY2hlY2tlZC50b1N0cmluZygpKTtcbiAgICAgICAgICAgIHdpbmRvdy5sb2NhbFN0b3JhZ2Uuc2V0SXRlbSgndXNlU3RhZ2luZycsIHVzZVN0YWdpbmdFbGVtZW50LmNoZWNrZWQudG9TdHJpbmcoKSk7XG4gICAgICAgICAgICB3aW5kb3cubG9jYWxTdG9yYWdlLnNldEl0ZW0oJ2ZvcmNlTG9hZFY1JywgZm9yY2VMb2FkVjVFbGVtZW50LmNoZWNrZWQudG9TdHJpbmcoKSk7XG5cbiAgICAgICAgICAgIGFiR3JvdXBFbGVtZW50LmRpc2FibGVkID0gdHJ1ZTtcbiAgICAgICAgICAgIGNhbXBhaWduSWRFbGVtZW50LmRpc2FibGVkID0gdHJ1ZTtcbiAgICAgICAgICAgIGNvdW50cnlFbGVtZW50LmRpc2FibGVkID0gdHJ1ZTtcbiAgICAgICAgICAgIHBsYXRmb3JtRWxlbWVudC5kaXNhYmxlZCA9IHRydWU7XG4gICAgICAgICAgICBnYW1lSWRFbGVtZW50LmRpc2FibGVkID0gdHJ1ZTtcbiAgICAgICAgICAgIHRlc3RNb2RlRWxlbWVudC5kaXNhYmxlZCA9IHRydWU7XG4gICAgICAgICAgICB1c2VTdGFnaW5nRWxlbWVudC5kaXNhYmxlZCA9IHRydWU7XG4gICAgICAgICAgICBsb2FkQnV0dG9uRGVmYXVsdC5kaXNhYmxlZCA9ICFsb2FkTW9kZUVsZW1lbnQuY2hlY2tlZDtcbiAgICAgICAgICAgIGxvYWRCdXR0b25JbmNlbnRpdml6ZS5kaXNhYmxlZCA9ICFsb2FkTW9kZUVsZW1lbnQuY2hlY2tlZDtcbiAgICAgICAgICAgIGxvYWRNb2RlRWxlbWVudC5kaXNhYmxlZCA9IHRydWU7XG4gICAgICAgICAgICBhdXRvU2tpcEVsZW1lbnQuZGlzYWJsZWQgPSB0cnVlO1xuICAgICAgICAgICAgaW5pdGlhbGl6ZUJ1dHRvbi5kaXNhYmxlZCA9IHRydWU7XG5cbiAgICAgICAgICAgIEFkc0NvbmZpZ3VyYXRpb25QYXJzZXIuc2V0SXNCcm93c2VyQnVpbGQodHJ1ZSk7XG5cbiAgICAgICAgICAgIGlmIChhYkdyb3VwRWxlbWVudC52YWx1ZS5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICBDb25maWdNYW5hZ2VyLnNldEFiR3JvdXAodG9BYkdyb3VwKHBhcnNlSW50KGFiR3JvdXBFbGVtZW50LnZhbHVlLCAxMCkpKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKGNhbXBhaWduSWRFbGVtZW50LnZhbHVlLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgIENhbXBhaWduTWFuYWdlci5zZXRDYW1wYWlnbklkKGNhbXBhaWduSWRFbGVtZW50LnZhbHVlKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKGNvdW50cnlFbGVtZW50LnZhbHVlLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgIENhbXBhaWduTWFuYWdlci5zZXRDb3VudHJ5KGNvdW50cnlFbGVtZW50LnZhbHVlKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKGF1dG9Ta2lwRWxlbWVudC5jaGVja2VkKSB7XG4gICAgICAgICAgICAgICAgVmlkZW9PdmVybGF5LnNldEF1dG9Ta2lwKGF1dG9Ta2lwRWxlbWVudC5jaGVja2VkKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKGNhbXBhaWduUmVzcG9uc2VFbGVtZW50LnZhbHVlLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgIENhbXBhaWduTWFuYWdlci5zZXRDYW1wYWlnblJlc3BvbnNlKGNhbXBhaWduUmVzcG9uc2VFbGVtZW50LnZhbHVlKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKGVuZFNjcmVlblVybEVsZW1lbnQudmFsdWUubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgQ29tZXRDYW1wYWlnblBhcnNlci5zZXRGb3JjZUVuZFNjcmVlblVybChlbmRTY3JlZW5VcmxFbGVtZW50LnZhbHVlKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gdHNsaW50OmRpc2FibGU6bm8tY29uc29sZVxuICAgICAgICAgICAgY29uc3QgbGlzdGVuZXI6IElVbml0eUFkc0xpc3RlbmVyID0ge1xuICAgICAgICAgICAgICAgIG9uVW5pdHlBZHNSZWFkeTogKHBsYWNlbWVudDogc3RyaW5nKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdvblVuaXR5QWRzUmVhZHk6ICcgKyBwbGFjZW1lbnQpO1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBwbGFjZW1lbnRCdXR0b24gPSA8SFRNTEJ1dHRvbkVsZW1lbnQ+d2luZG93LnBhcmVudC5kb2N1bWVudC5nZXRFbGVtZW50QnlJZChwbGFjZW1lbnQpO1xuICAgICAgICAgICAgICAgICAgICBpZiAocGxhY2VtZW50QnV0dG9uKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBwbGFjZW1lbnRCdXR0b25saXN0ZW5lciA9IChwbGFjZW1lbnRCdXR0b25FdmVudDogRXZlbnQpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBwbGFjZW1lbnRCdXR0b25FdmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBsYWNlbWVudEJ1dHRvbi5kaXNhYmxlZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcGxhY2VtZW50QnV0dG9uLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgcGxhY2VtZW50QnV0dG9ubGlzdGVuZXIsIGZhbHNlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBVbml0eUFkcy5zaG93KHBsYWNlbWVudCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgICAgICAgICAgcGxhY2VtZW50QnV0dG9uLmRpc2FibGVkID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgICAgICBwbGFjZW1lbnRCdXR0b24uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBwbGFjZW1lbnRCdXR0b25saXN0ZW5lciwgZmFsc2UpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBvblVuaXR5QWRzU3RhcnQ6IChwbGFjZW1lbnQ6IHN0cmluZykgPT4ge1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnb25Vbml0eUFkc1N0YXJ0OiAnICsgcGxhY2VtZW50KTtcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIG9uVW5pdHlBZHNGaW5pc2g6IChwbGFjZW1lbnQ6IHN0cmluZywgc3RhdGU6IHN0cmluZykgPT4ge1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnb25Vbml0eUFkc0ZpbmlzaDogJyArIHBsYWNlbWVudCArICcgLSAnICsgc3RhdGUpO1xuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgb25Vbml0eUFkc0Vycm9yOiAoZXJyb3I6IHN0cmluZywgbWVzc2FnZTogc3RyaW5nKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdvblVuaXR5QWRzRXJyb3I6ICcgKyBlcnJvciArICcgLSAnICsgbWVzc2FnZSk7XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBvblVuaXR5QWRzQ2xpY2s6IChwbGFjZW1lbnQ6IHN0cmluZykgPT4ge1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnb25Vbml0eUFkc0NsaWNrOiAnICsgcGxhY2VtZW50KTtcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIG9uVW5pdHlBZHNQbGFjZW1lbnRTdGF0ZUNoYW5nZWQ6IChwbGFjZW1lbnQ6IHN0cmluZywgb2xkU3RhdGU6IHN0cmluZywgbmV3U3RhdGU6IHN0cmluZykgPT4ge1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnb25Vbml0eUFkc1BsYWNlbWVudFN0YXRlQ2hhbmdlZDogJyArIHBsYWNlbWVudCArICcgJyArIG9sZFN0YXRlICsgJyAtPiAnICsgbmV3U3RhdGUpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICAvLyB0c2xpbnQ6ZW5hYmxlOm5vLWNvbnNvbGVcblxuICAgICAgICAgICAgQVJVdGlsLmlzQVJTdXBwb3J0ZWQgPSAoKSA9PiBQcm9taXNlLnJlc29sdmUoZmFsc2UpO1xuICAgICAgICAgICAgUGVybWlzc2lvbnNVdGlsLmNoZWNrUGVybWlzc2lvbkluTWFuaWZlc3QgPSAoKSA9PiBQcm9taXNlLnJlc29sdmUoZmFsc2UpO1xuICAgICAgICAgICAgUGVybWlzc2lvbnNVdGlsLmNoZWNrUGVybWlzc2lvbnMgPSAocGxhdGZvcm06IFBsYXRmb3JtLCBjb3JlOiBJQ29yZUFwaSwgcGVybWlzc2lvbjogUGVybWlzc2lvblR5cGVzKSA9PiBQcm9taXNlLnJlc29sdmUoQ3VycmVudFBlcm1pc3Npb24uREVOSUVEKTtcblxuICAgICAgICAgICAgaWYgKHVzZVN0YWdpbmdFbGVtZW50LmNoZWNrZWQpIHtcbiAgICAgICAgICAgICAgICBQcm9ncmFtbWF0aWNPcGVyYXRpdmVFdmVudE1hbmFnZXIuc2V0VGVzdEJhc2VVcmwoJ2h0dHBzOi8vYXVjdGlvbi5zdGFnaW5nLnVuaXR5YWRzLnVuaXR5M2QuY29tJyk7XG4gICAgICAgICAgICAgICAgQ2FtcGFpZ25NYW5hZ2VyLnNldEJhc2VVcmwoJ2h0dHBzOi8vYXVjdGlvbi5zdGFnaW5nLnVuaXR5YWRzLnVuaXR5M2QuY29tJyk7XG4gICAgICAgICAgICAgICAgQXVjdGlvblJlcXVlc3Quc2V0QmFzZVVybCgnaHR0cHM6Ly9hdWN0aW9uLnN0YWdpbmcudW5pdHlhZHMudW5pdHkzZC5jb20nKTtcbiAgICAgICAgICAgICAgICBDb25maWdNYW5hZ2VyLnNldFRlc3RCYXNlVXJsKCdodHRwczovL2Fkcy1nYW1lLWNvbmZpZ3VyYXRpb24uc3RhZ2luZy51bml0eWFkcy51bml0eTNkLmNvbScpO1xuICAgICAgICAgICAgICAgIE1ldHJpY0luc3RhbmNlLnNldEJhc2VVcmwoJ2h0dHBzOi8vc2RrLWRpYWdub3N0aWNzLnN0Zy5tei5pbnRlcm5hbC51bml0eTNkLmNvbScpO1xuICAgICAgICAgICAgICAgIEh0dHBLYWZrYS5zZXRUZXN0QmFzZVVybCgnaHR0cHM6Ly9odHRwa2Fma2Euc3RhZ2luZy51bml0eWFkcy51bml0eTNkLmNvbS92MS9ldmVudHMnKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgc3dpdGNoIChwbGF0Zm9ybUVsZW1lbnQudmFsdWUpIHtcbiAgICAgICAgICAgICAgICBjYXNlICdhbmRyb2lkJzpcbiAgICAgICAgICAgICAgICAgICAgVW5pdHlBZHMuc2V0QmFja2VuZChuZXcgQmFja2VuZChQbGF0Zm9ybS5BTkRST0lEKSk7XG4gICAgICAgICAgICAgICAgICAgIFVuaXR5QWRzLmdldEJhY2tlbmQoKS5BcGkuUmVxdWVzdC5zZXRQYXNzdGhyb3VnaCh0cnVlKTtcbiAgICAgICAgICAgICAgICAgICAgc2V0Q2xpZW50SW5mbygpO1xuICAgICAgICAgICAgICAgICAgICBzZXRBbmRyb2lkRGV2aWNlSW5mbygpO1xuICAgICAgICAgICAgICAgICAgICBVbml0eUFkcy5nZXRCYWNrZW5kKCkuQXBpLlN0b3JhZ2Uuc2V0KFN0b3JhZ2VUeXBlLlBVQkxJQywgJ3Rlc3QuZm9yY2VMb2FkVjUudmFsdWUnLCBmb3JjZUxvYWRWNUVsZW1lbnQuY2hlY2tlZCk7XG4gICAgICAgICAgICAgICAgICAgIFVuaXR5QWRzLmluaXRpYWxpemUoUGxhdGZvcm0uQU5EUk9JRCwgZ2FtZUlkRWxlbWVudC52YWx1ZSwgbGlzdGVuZXIsIHRlc3RNb2RlRWxlbWVudC5jaGVja2VkLCBsb2FkTW9kZUVsZW1lbnQuY2hlY2tlZCk7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgICAgICAgICAgY2FzZSAnaW9zJzpcbiAgICAgICAgICAgICAgICAgICAgVW5pdHlBZHMuc2V0QmFja2VuZChuZXcgQmFja2VuZChQbGF0Zm9ybS5JT1MpKTtcbiAgICAgICAgICAgICAgICAgICAgVW5pdHlBZHMuZ2V0QmFja2VuZCgpLkFwaS5SZXF1ZXN0LnNldFBhc3N0aHJvdWdoKHRydWUpO1xuICAgICAgICAgICAgICAgICAgICBzZXRDbGllbnRJbmZvKCk7XG4gICAgICAgICAgICAgICAgICAgIHNldElvc0RldmljZUluZm8oKTtcbiAgICAgICAgICAgICAgICAgICAgVW5pdHlBZHMuZ2V0QmFja2VuZCgpLkFwaS5TdG9yYWdlLnNldChTdG9yYWdlVHlwZS5QVUJMSUMsICd0ZXN0LmZvcmNlTG9hZFY1LnZhbHVlJywgZm9yY2VMb2FkVjVFbGVtZW50LmNoZWNrZWQpO1xuICAgICAgICAgICAgICAgICAgICBVbml0eUFkcy5pbml0aWFsaXplKFBsYXRmb3JtLklPUywgZ2FtZUlkRWxlbWVudC52YWx1ZSwgbGlzdGVuZXIsIHRlc3RNb2RlRWxlbWVudC5jaGVja2VkLCBsb2FkTW9kZUVsZW1lbnQuY2hlY2tlZCk7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdVbml0eSBBZHMgd2VidmlldyBpbml0IGZhaWx1cmU6IG5vIHBsYXRmb3JtIGRlZmluZWQsIHVuYWJsZSB0byBpbml0aWFsaXplIG5hdGl2ZSBicmlkZ2UnKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcblxuICAgICAgICAvLyB0c2xpbnQ6ZGlzYWJsZS1uZXh0LWxpbmVcbiAgICAgICAgaWYgKCg8YW55PndpbmRvdykucGFyZW50W0pTX0ZVTkNfTkFNRV9HRVRfSEVBRExFU1NdKCkpIHtcbiAgICAgICAgICAgIHRlc3RNb2RlRWxlbWVudC5jaGVja2VkID0gdHJ1ZTtcbiAgICAgICAgICAgIGluaXRpYWxpemUoKTtcbiAgICAgICAgLy8gdHNsaW50OmRpc2FibGUtbmV4dC1saW5lXG4gICAgICAgICB9IGVsc2UgaWYgKCg8YW55PndpbmRvdykucGFyZW50W0pTX0ZVTkNfTkFNRV9HRVRfSEVBRExFU1NfTE9BRF0oKSkge1xuICAgICAgICAgICAgdGVzdE1vZGVFbGVtZW50LmNoZWNrZWQgPSB0cnVlO1xuICAgICAgICAgICAgbG9hZE1vZGVFbGVtZW50LmNoZWNrZWQgPSB0cnVlO1xuICAgICAgICAgICAgLy9Nb3B1YiB3aGl0ZWxpc3RlZCBsb2FkIEFQSSBnYW1lSURcbiAgICAgICAgICAgIGdhbWVJZEVsZW1lbnQudmFsdWUgPSAnMjc4ODIyMSc7XG4gICAgICAgICAgICBpbml0aWFsaXplKCk7XG4gICAgICAgICAgICBVbml0eUFkcy5sb2FkKCdyZXdhcmRlZFZpZGVvJyk7XG4gICAgICAgIC8vIHRzbGludDpkaXNhYmxlLW5leHQtbGluZVxuICAgICAgICB9IGVsc2UgaWYgKCg8YW55PndpbmRvdykucGFyZW50W0pTX0ZVTkNfTkFNRV9HRVRfSEVBRExFU1NfTE9BRF9BREFQVEVSXSgpKSB7XG4gICAgICAgICAgICB0ZXN0TW9kZUVsZW1lbnQuY2hlY2tlZCA9IHRydWU7XG4gICAgICAgICAgICBsb2FkTW9kZUVsZW1lbnQuY2hlY2tlZCA9IHRydWU7XG4gICAgICAgICAgICBhYkdyb3VwRWxlbWVudC52YWx1ZSA9ICc1JzsgLy8gVGVtcG9yYXJ5IHdoaWxlIHVuZGVyIGFidGVzdFxuICAgICAgICAgICAgaW5pdGlhbGl6ZSgpO1xuICAgICAgICAgICAgVW5pdHlBZHMubG9hZCgncmV3YXJkZWRWaWRlbycpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgYWJHcm91cEVsZW1lbnQudmFsdWUgPSB3aW5kb3cubG9jYWxTdG9yYWdlLmdldEl0ZW0oJ2FiR3JvdXAnKSA9PT0gbnVsbCA/IGFiR3JvdXBFbGVtZW50LnZhbHVlIDogd2luZG93LmxvY2FsU3RvcmFnZS5nZXRJdGVtKCdhYkdyb3VwJykhO1xuICAgICAgICAgICAgY2FtcGFpZ25JZEVsZW1lbnQudmFsdWUgPSB3aW5kb3cubG9jYWxTdG9yYWdlLmdldEl0ZW0oJ2NhbXBhaWduSWQnKSA9PT0gbnVsbCA/IGNhbXBhaWduSWRFbGVtZW50LnZhbHVlIDogd2luZG93LmxvY2FsU3RvcmFnZS5nZXRJdGVtKCdjYW1wYWlnbklkJykhO1xuICAgICAgICAgICAgY291bnRyeUVsZW1lbnQudmFsdWUgPSB3aW5kb3cubG9jYWxTdG9yYWdlLmdldEl0ZW0oJ2NvdW50cnknKSA9PT0gbnVsbCA/IGNvdW50cnlFbGVtZW50LnZhbHVlIDogd2luZG93LmxvY2FsU3RvcmFnZS5nZXRJdGVtKCdjb3VudHJ5JykhO1xuICAgICAgICAgICAgcGxhdGZvcm1FbGVtZW50LnZhbHVlID0gd2luZG93LmxvY2FsU3RvcmFnZS5nZXRJdGVtKCdwbGF0Zm9ybScpID09PSBudWxsID8gcGxhdGZvcm1FbGVtZW50LnZhbHVlIDogd2luZG93LmxvY2FsU3RvcmFnZS5nZXRJdGVtKCdwbGF0Zm9ybScpITtcbiAgICAgICAgICAgIGdhbWVJZEVsZW1lbnQudmFsdWUgPSB3aW5kb3cubG9jYWxTdG9yYWdlLmdldEl0ZW0oJ2dhbWVJZCcpID09PSBudWxsID8gZ2FtZUlkRWxlbWVudC52YWx1ZSA6IHdpbmRvdy5sb2NhbFN0b3JhZ2UuZ2V0SXRlbSgnZ2FtZUlkJykhO1xuICAgICAgICAgICAgdGVzdE1vZGVFbGVtZW50LmNoZWNrZWQgPSB3aW5kb3cubG9jYWxTdG9yYWdlLmdldEl0ZW0oJ3Rlc3RNb2RlJykgPT09IG51bGwgPyB0ZXN0TW9kZUVsZW1lbnQuY2hlY2tlZCA6IHdpbmRvdy5sb2NhbFN0b3JhZ2UuZ2V0SXRlbSgndGVzdE1vZGUnKSA9PT0gJ3RydWUnO1xuICAgICAgICAgICAgbG9hZE1vZGVFbGVtZW50LmNoZWNrZWQgPSB3aW5kb3cubG9jYWxTdG9yYWdlLmdldEl0ZW0oJ2xvYWRNb2RlJykgPT09IG51bGwgPyBsb2FkTW9kZUVsZW1lbnQuY2hlY2tlZCA6IHdpbmRvdy5sb2NhbFN0b3JhZ2UuZ2V0SXRlbSgnbG9hZE1vZGUnKSA9PT0gJ3RydWUnO1xuICAgICAgICAgICAgYXV0b1NraXBFbGVtZW50LmNoZWNrZWQgPSB3aW5kb3cubG9jYWxTdG9yYWdlLmdldEl0ZW0oJ2F1dG9Ta2lwJykgPT09IG51bGwgPyBhdXRvU2tpcEVsZW1lbnQuY2hlY2tlZCA6IHdpbmRvdy5sb2NhbFN0b3JhZ2UuZ2V0SXRlbSgnYXV0b1NraXAnKSA9PT0gJ3RydWUnO1xuICAgICAgICAgICAgdXNlU3RhZ2luZ0VsZW1lbnQuY2hlY2tlZCA9IHdpbmRvdy5sb2NhbFN0b3JhZ2UuZ2V0SXRlbSgndXNlU3RhZ2luZycpID09PSBudWxsID8gdXNlU3RhZ2luZ0VsZW1lbnQuY2hlY2tlZCA6IHdpbmRvdy5sb2NhbFN0b3JhZ2UuZ2V0SXRlbSgndXNlU3RhZ2luZycpID09PSAndHJ1ZSc7XG4gICAgICAgICAgICBmb3JjZUxvYWRWNUVsZW1lbnQuY2hlY2tlZCA9IHdpbmRvdy5sb2NhbFN0b3JhZ2UuZ2V0SXRlbSgnZm9yY2VMb2FkVjUnKSA9PT0gbnVsbCA/IHVzZVN0YWdpbmdFbGVtZW50LmNoZWNrZWQgOiB3aW5kb3cubG9jYWxTdG9yYWdlLmdldEl0ZW0oJ2ZvcmNlTG9hZFY1JykgPT09ICd0cnVlJztcblxuICAgICAgICAgICAgaW5pdGlhbGl6ZUJ1dHRvbi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIChldmVudDogRXZlbnQpID0+IHtcbiAgICAgICAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgICAgIGluaXRpYWxpemUoKTtcbiAgICAgICAgICAgIH0sIGZhbHNlKTtcblxuICAgICAgICAgICAgbG9hZEJ1dHRvbkRlZmF1bHQuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoZXZlbnQ6IEV2ZW50KSA9PiB7XG4gICAgICAgICAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgICAgICBVbml0eUFkcy5sb2FkKCdkZWZhdWx0VmlkZW9BbmRQaWN0dXJlWm9uZScpO1xuICAgICAgICAgICAgfSwgZmFsc2UpO1xuXG4gICAgICAgICAgICBsb2FkQnV0dG9uSW5jZW50aXZpemUuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoZXZlbnQ6IEV2ZW50KSA9PiB7XG4gICAgICAgICAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgICAgICBVbml0eUFkcy5sb2FkKCdpbmNlbnRpdml6ZWRab25lJyk7XG4gICAgICAgICAgICB9LCBmYWxzZSk7XG5cbiAgICAgICAgICAgIC8vIHRzbGludDpkaXNhYmxlLW5leHQtbGluZVxuICAgICAgICAgICAgKDxhbnk+d2luZG93KS5wYXJlbnQuZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2luaXRpYWxpemUnKS5kaXNhYmxlZCA9IGZhbHNlO1xuICAgICAgICAgICAgbG9hZEJ1dHRvbkRlZmF1bHQuZGlzYWJsZWQgPSB0cnVlO1xuICAgICAgICAgICAgbG9hZEJ1dHRvbkluY2VudGl2aXplLmRpc2FibGVkID0gdHJ1ZTtcbiAgICAgICAgfVxuICAgIH0qL1xufSk7XG4iXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O1VBQWEsUUFBUTs7UUFJVixPQUFPLGVBQWUsQ0FBQyxNQUFjLEVBQUUsSUFBbUI7WUFDN0QsSUFBSSwyQkFBMkIsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUU7Z0JBQ3hDLE1BQU0sR0FBRyxHQUFHLFFBQVEsQ0FBQyxjQUFjLENBQUMsa0JBQWtCLENBQUMsRUFBRSxDQUFDLENBQUM7Z0JBQzNELElBQUksTUFBTSxDQUFDLFdBQVcsRUFBRSxDQUFDLE9BQU8sQ0FBQyxXQUFXLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRTtvQkFDaEQsR0FBRyxDQUFDLGVBQWUsQ0FBQyxTQUFTLEdBQUcsTUFBTSxDQUFDO2lCQUMxQztxQkFBTTtvQkFDSCxHQUFHLENBQUMsSUFBSSxDQUFDLFNBQVMsR0FBRyxNQUFNLENBQUM7aUJBQy9CO2dCQUNELE9BQU8sR0FBRyxDQUFDO2FBQ2Q7aUJBQU07Z0JBQ0gsT0FBTyxRQUFRLENBQUMsV0FBVyxDQUFDLEtBQUssQ0FBQyxJQUFJLFNBQVMsRUFBRSxFQUFFLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUM7YUFDdEU7U0FDSjs7SUFFYyxvQkFBVyxHQUFHLFNBQVMsQ0FBQyxTQUFTLENBQUMsZUFBZSxDQUFDOztVQ2xCeEQsVUFBVTtRQUNaLE9BQU8sdUJBQXVCO1lBQ2pDLE9BQU8sQ0FBQyxNQUFVO2dCQUNkLE9BQU8sTUFBTSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxNQUFNLEtBQUssTUFBTSxDQUFzQixNQUFNLENBQUMsQ0FBQyxDQUFDO2FBQ25GLENBQUM7U0FDTDtLQUNKOztJQ0hEO0lBQ0E7SUFFQTtJQUVBLENBQUMsQ0FBQyxDQUFDLFNBQVM7O1FBR1IsSUFBSTs7WUFFQSxJQUFJLENBQUMsSUFBSSxTQUFTLEVBQUUsRUFBRSxlQUFlLENBQUMsRUFBRSxFQUFFLFdBQVcsQ0FBQyxFQUFFOztnQkFFcEQsT0FBTzthQUNWO1NBQ0o7UUFBQyxPQUFPLEVBQUUsRUFBRTtTQUNaO1FBRUQsU0FBUyxDQUFDLFNBQVMsQ0FBQyxlQUFlLEdBQUcsUUFBUSxDQUFDLGVBQWUsQ0FBQztJQUVuRSxDQUFDLEVBQUUsU0FBUyxDQUFDLEVBQUU7SUFFZjtJQUVBOzs7SUFHQSxJQUFJLENBQUMsTUFBTSxDQUFDLE1BQU0sRUFBRTtRQUNoQixNQUFNLENBQUMsTUFBTSxHQUFHLFVBQVUsQ0FBQyx1QkFBdUIsRUFBRSxDQUFDO0tBQ3hEO0lBV0QsS0FBSyxDQUFDLFNBQVMsQ0FBQyxNQUFNLEdBQUc7O1FBRXJCLE9BQU8sSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLEdBQUcsRUFBRSxLQUFLLEtBQUssSUFBSSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsS0FBSyxLQUFLLENBQUMsQ0FBQztJQUNwRSxDQUFDLENBQUM7O0lDekJGLFFBQVEsQ0FBQyxnQkFBZ0IsQ0FBQyxrQkFBa0IsRUFBRTs7O1FBSTFDLE1BQU0sSUFBSSxHQUFHLG1xSkFBbXFKLENBQUM7UUFDanJKLE1BQU0sQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztJQTRUdkMsQ0FBQyxDQUFDLENBQUM7Ozs7In0=
