import 'mocha';
import * as sinon from 'sinon';
import { assert } from 'chai';

import { TestFixtures } from '../TestHelpers/TestFixtures';
import { Request } from '../../src/ts/Utilities/Request';
import { NativeBridge } from '../../src/ts/Native/NativeBridge';
import { WakeUpManager } from '../../src/ts/Managers/WakeUpManager';
import { Observable2 } from '../../src/ts/Utilities/Observable';
import { Observable4 } from '../../src/ts/Utilities/Observable';
import { Platform } from '../../src/ts/Constants/Platform';

describe('VastParser', () => {
    let request: Request;
    let nativeBridge: NativeBridge;

    let vastRaw =
        `<?xml version="1.0" encoding="UTF-8" standalone="no"?>
                        <VAST version="2.0">
                    <Ad id="preroll-7286756-1">
                        <InLine>
                            <AdSystem>VideoHub</AdSystem>
                        <AdTitle>7286756</AdTitle>
                        <Impression><![CDATA[http://dt.videohub2.tv/ssframework/tvuid?a=set&UI=ef20e47b94a670839943ad4d9f933016&ss_rand=1848887672]]></Impression>
                    <Impression id="VideoHub"><![CDATA[http://l0.videohub.tv/ssframework/log/log.png?a=logitemaction&ssPD=app.com&AFC=PR_VIDEO&EC=3&RC=3&AmN=1&VI=cf0a3a96deaa32ab3baae57ae79aaadb&admode=preroll&PRI=4finj1hf9j13no1mt2ako8l&dspPrice=3.0&PBI=2704636&rtb=2&UI=ef20e47b94a670839943ad4d9f933016&AVI=419254&Uctry=N%2FA&Ust=N%2FA&AC=4&NI=1031&ADI=7286756&CbC=1&CbF=true&SmC=2&CbM=b4%2F1&Uzip=N%2FA&RvN=1&ssBI=4&RprC=0&sspId=TREMORVIDEO&VcaI=12300&RrC=0&VgI=cf0a3a96deaa32ab3baae57ae79aaadb&SfF=true&CI=2704646&PI=442224&CC=7&Udma=N%2FA&VmC=0&PcI=247281&VscaI=12300&VclF=true&PC=1&ssRnd=1479160881]]></Impression>
                    <Impression id="external"><![CDATA[http://dt.videohub.tv/v1/usync/brx?userId=ef20e47b94a670839943ad4d9f933016]]></Impression>
                    <Impression id="external"><![CDATA[http://dt.videohub.tv/v1/usync/tr?userId=ef20e47b94a670839943ad4d9f933016]]></Impression>
                    <Impression id="external"><![CDATA[http://dt.videohub.tv/v1/usync/bs?userId=ef20e47b94a670839943ad4d9f933016]]></Impression>
                    <Creatives>
                        <Creative id="7286756">
                        <Linear>
                            <Duration>00:00:15</Duration>
                    <TrackingEvents>
                        <Tracking event="start"><![CDATA[http://l0.videohub.tv/ssframework/log/log.png?a=logitemaction&ssPD=app.com&AFC=PR_VIDEO&vastrequest=true&EC=7&RC=3&VI=cf0a3a96deaa32ab3baae57ae79aaadb&admode=preroll&PRI=4finj1hf9j13no1mt2ako8l&dspPrice=3.0&PBI=2704636&rtb=2&UI=ef20e47b94a670839943ad4d9f933016&AVI=419254&Uctry=N%2FA&Ust=N%2FA&AC=4&NI=1031&ADI=7286756&EiN=1&CbC=1&CbF=true&SmC=2&CbM=b4%2F1&Uzip=N%2FA&ssBI=4&RprC=0&sspId=TREMORVIDEO&Eipct=0&VcaI=12300&RrC=0&VgI=cf0a3a96deaa32ab3baae57ae79aaadb&CI=2704646&PI=442224&CC=7&Udma=N%2FA&VmC=0&PcI=247281&VscaI=12300&VclF=true&PC=1&ssRnd=1413711906]]></Tracking>
                    <Tracking event="firstQuartile"><![CDATA[http://l0.videohub.tv/ssframework/log/log.png?a=logitemaction&ssPD=app.com&AFC=PR_VIDEO&vastrequest=true&EC=7&RC=3&VI=cf0a3a96deaa32ab3baae57ae79aaadb&admode=preroll&PRI=4finj1hf9j13no1mt2ako8l&dspPrice=3.0&PBI=2704636&rtb=2&UI=ef20e47b94a670839943ad4d9f933016&AVI=419254&Uctry=N%2FA&Ust=N%2FA&AC=4&NI=1031&ADI=7286756&EiN=1&CbC=1&CbF=true&SmC=2&CbM=b4%2F1&Uzip=N%2FA&ssBI=4&RprC=0&sspId=TREMORVIDEO&Eipct=25&VcaI=12300&RrC=0&VgI=cf0a3a96deaa32ab3baae57ae79aaadb&CI=2704646&PI=442224&CC=7&Udma=N%2FA&VmC=0&PcI=247281&VscaI=12300&VclF=true&PC=1&ssRnd=830833129]]></Tracking>
                    <Tracking event="midpoint"><![CDATA[http://l0.videohub.tv/ssframework/log/log.png?a=logitemaction&ssPD=app.com&AFC=PR_VIDEO&vastrequest=true&EC=7&RC=3&VI=cf0a3a96deaa32ab3baae57ae79aaadb&admode=preroll&PRI=4finj1hf9j13no1mt2ako8l&dspPrice=3.0&PBI=2704636&rtb=2&UI=ef20e47b94a670839943ad4d9f933016&AVI=419254&Uctry=N%2FA&Ust=N%2FA&AC=4&NI=1031&ADI=7286756&EiN=1&CbC=1&CbF=true&SmC=2&CbM=b4%2F1&Uzip=N%2FA&ssBI=4&RprC=0&sspId=TREMORVIDEO&Eipct=50&VcaI=12300&RrC=0&VgI=cf0a3a96deaa32ab3baae57ae79aaadb&CI=2704646&PI=442224&CC=7&Udma=N%2FA&VmC=0&PcI=247281&VscaI=12300&VclF=true&PC=1&ssRnd=2023345290]]></Tracking>
                    <Tracking event="thirdQuartile"><![CDATA[http://l0.videohub.tv/ssframework/log/log.png?a=logitemaction&ssPD=app.com&AFC=PR_VIDEO&vastrequest=true&EC=7&RC=3&VI=cf0a3a96deaa32ab3baae57ae79aaadb&admode=preroll&PRI=4finj1hf9j13no1mt2ako8l&dspPrice=3.0&PBI=2704636&rtb=2&UI=ef20e47b94a670839943ad4d9f933016&AVI=419254&Uctry=N%2FA&Ust=N%2FA&AC=4&NI=1031&ADI=7286756&EiN=1&CbC=1&CbF=true&SmC=2&CbM=b4%2F1&Uzip=N%2FA&ssBI=4&RprC=0&sspId=TREMORVIDEO&Eipct=75&VcaI=12300&RrC=0&VgI=cf0a3a96deaa32ab3baae57ae79aaadb&CI=2704646&PI=442224&CC=7&Udma=N%2FA&VmC=0&PcI=247281&VscaI=12300&VclF=true&PC=1&ssRnd=1253990772]]></Tracking>
                    <Tracking event="complete"><![CDATA[http://l0.videohub.tv/ssframework/log/log.png?a=logitemaction&ssPD=app.com&AFC=PR_VIDEO&vastrequest=true&EC=7&RC=3&VI=cf0a3a96deaa32ab3baae57ae79aaadb&admode=preroll&PRI=4finj1hf9j13no1mt2ako8l&dspPrice=3.0&PBI=2704636&rtb=2&UI=ef20e47b94a670839943ad4d9f933016&AVI=419254&Uctry=N%2FA&Ust=N%2FA&AC=4&NI=1031&ADI=7286756&EiN=1&CbC=1&CbF=true&SmC=2&CbM=b4%2F1&RcpF=1&Uzip=N%2FA&ssBI=4&RprC=0&sspId=TREMORVIDEO&Eipct=100&VcaI=12300&RrC=0&VgI=cf0a3a96deaa32ab3baae57ae79aaadb&CI=2704646&PI=442224&CC=7&Udma=N%2FA&VmC=0&PcI=247281&VscaI=12300&VclF=true&PC=1&ssRnd=671283626]]></Tracking>
                    <Tracking event="pause"><![CDATA[http://l0.videohub.tv/ssframework/log/log.png?a=logitemaction&ssPD=app.com&AFC=PR_VIDEO&EC=4&RC=3&VI=cf0a3a96deaa32ab3baae57ae79aaadb&admode=preroll&PRI=4finj1hf9j13no1mt2ako8l&dspPrice=3.0&PBI=2704636&rtb=2&UI=ef20e47b94a670839943ad4d9f933016&AVI=419254&Uctry=N%2FA&Ust=N%2FA&AC=4&NI=1031&ADI=7286756&CbC=1&CbF=true&SmC=2&CbM=b4%2F1&Uzip=N%2FA&ssBI=4&RprC=0&sspId=TREMORVIDEO&VcaI=12300&RrC=0&VgI=cf0a3a96deaa32ab3baae57ae79aaadb&CI=2704646&PI=442224&CC=7&Udma=N%2FA&VmC=0&PcI=247281&VscaI=12300&VclF=true&PC=1&ssRnd=1719449710]]></Tracking>
                    <Tracking event="start"><![CDATA[http://events.tremorhub.com/evt?rid=5beaaaa404184c0eb68c2bf3b3e6cfaf&pbid=1358&seatid=60632&aid=10973&asid=4187&lid=33&evt=start&vastcrtype=linear&crid=7286756]]></Tracking>
                    <Tracking event="firstQuartile"><![CDATA[http://events.tremorhub.com/evt?rid=5beaaaa404184c0eb68c2bf3b3e6cfaf&pbid=1358&seatid=60632&aid=10973&asid=4187&lid=33&evt=firstQuartile&vastcrtype=linear&crid=7286756]]></Tracking>
                    <Tracking event="midpoint"><![CDATA[http://events.tremorhub.com/evt?rid=5beaaaa404184c0eb68c2bf3b3e6cfaf&pbid=1358&seatid=60632&aid=10973&asid=4187&lid=33&evt=midpoint&vastcrtype=linear&crid=7286756]]></Tracking>
                    <Tracking event="thirdQuartile"><![CDATA[http://events.tremorhub.com/evt?rid=5beaaaa404184c0eb68c2bf3b3e6cfaf&pbid=1358&seatid=60632&aid=10973&asid=4187&lid=33&evt=thirdQuartile&vastcrtype=linear&crid=7286756]]></Tracking>
                    <Tracking event="complete"><![CDATA[http://events.tremorhub.com/evt?rid=5beaaaa404184c0eb68c2bf3b3e6cfaf&pbid=1358&seatid=60632&aid=10973&asid=4187&lid=33&evt=complete&vastcrtype=linear&crid=7286756]]></Tracking>
                    <Tracking event="mute"><![CDATA[http://events.tremorhub.com/evt?rid=5beaaaa404184c0eb68c2bf3b3e6cfaf&pbid=1358&seatid=60632&aid=10973&asid=4187&lid=33&evt=mute&vastcrtype=linear&crid=7286756]]></Tracking>
                    <Tracking event="unmute"><![CDATA[http://events.tremorhub.com/evt?rid=5beaaaa404184c0eb68c2bf3b3e6cfaf&pbid=1358&seatid=60632&aid=10973&asid=4187&lid=33&evt=unmute&vastcrtype=linear&crid=7286756]]></Tracking>
                    <Tracking event="pause"><![CDATA[http://events.tremorhub.com/evt?rid=5beaaaa404184c0eb68c2bf3b3e6cfaf&pbid=1358&seatid=60632&aid=10973&asid=4187&lid=33&evt=pause&vastcrtype=linear&crid=7286756]]></Tracking>
                    <Tracking event="resume"><![CDATA[http://events.tremorhub.com/evt?rid=5beaaaa404184c0eb68c2bf3b3e6cfaf&pbid=1358&seatid=60632&aid=10973&asid=4187&lid=33&evt=resume&vastcrtype=linear&crid=7286756]]></Tracking>
                    </TrackingEvents>
                    <VideoClicks>
                        <ClickThrough id="VideoHub"><![CDATA[www.tremorvideo.com]]></ClickThrough>
                    <ClickTracking id="VideoHub"><![CDATA[http://l0.videohub.tv/ssframework/log/log.png?a=logitemaction&ssPD=app.com&AFC=PR_VIDEO&EC=2&RC=3&VI=cf0a3a96deaa32ab3baae57ae79aaadb&admode=preroll&PRI=4finj1hf9j13no1mt2ako8l&dspPrice=3.0&PBI=2704636&rtb=2&UI=ef20e47b94a670839943ad4d9f933016&AVI=419254&Uctry=N%2FA&Ust=N%2FA&AC=4&NI=1031&ADI=7286756&CbC=1&CbF=true&SmC=2&CbM=b4%2F1&Uzip=N%2FA&ssBI=4&RprC=0&sspId=TREMORVIDEO&VcaI=12300&RrC=0&VgI=cf0a3a96deaa32ab3baae57ae79aaadb&CI=2704646&PI=442224&CC=7&Udma=N%2FA&VmC=0&PcI=247281&VscaI=12300&VclF=true&PC=1&ssRnd=624905135]]></ClickTracking>
                    <ClickTracking id="TV"><![CDATA[http://events.tremorhub.com/evt?rid=5beaaaa404184c0eb68c2bf3b3e6cfaf&pbid=1358&seatid=60632&aid=10973&asid=4187&lid=33&evt=click&vastcrtype=linear&crid=7286756]]></ClickTracking>
                    </VideoClicks>
                    <MediaFiles>
<MediaFile delivery="progressive" height="480" type="video/x-flv" width="320"><![CDATA[http://static.scanscout.com/filemanager/vhs/partner364124_f00a7d93-0858-4b28-bf8e-e9af7a879f74.flv]]></MediaFile>
<MediaFile delivery="progressive" height="480" type="video/3gpp" width="320"><![CDATA[http://static.scanscout.com/filemanager/vhs/partner364124_f00a7d93-0858-4b28-bf8e-e9af7a879f74.3gpp]]></MediaFile>
                        <MediaFile delivery="progressive" height="480" type="video/mp4" width="320"><![CDATA[http://static.scanscout.com/filemanager/vhs/partner364124_f00a7d93-0858-4b28-bf8e-e9af7a879f74.mp4]]></MediaFile>
                    </MediaFiles>
                    </Linear>
                    </Creative>
                    </Creatives>
                    <Extensions>
                        <Extension xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" type="CustomTrackingEvents" xsi:type="CustomTrackingEvents_extension_type">
                    <TrackingEvents>
                        <Tracking event="viewableimpression"><![CDATA[http://l0.videohub.tv/ssframework/log/log.png?a=logitemaction&RI=1&ssPD=app.com&AFC=PR_VIDEO&EC=40&RC=3&VI=cf0a3a96deaa32ab3baae57ae79aaadb&admode=preroll&PRI=4finj1hf9j13no1mt2ako8l&pctVw=[pctvw]&dspPrice=3.0&EvaF=[viewabilityAvail]&PBI=2704636&rtb=2&UI=ef20e47b94a670839943ad4d9f933016&AVI=419254&Ust=N%2FA&Uctry=N%2FA&AC=4&NI=1031&EmV=[ad.ecpctData.muteRate]&ADI=7286756&EfV=[ad.ecpctData.focusRate]&CbC=1&CbF=true&SmC=2&CbM=b4%2F1&Uzip=N%2FA&ssBI=4&RprC=0&sspId=TREMORVIDEO&VcaI=12300&RrC=0&VgI=cf0a3a96deaa32ab3baae57ae79aaadb&CI=2704646&PI=442224&CC=7&Udma=N%2FA&VmC=0&PcI=247281&VscaI=12300&VclF=true&PC=1&ssRnd=431552369]]></Tracking>
                    <Tracking event="viewablecompletion"><![CDATA[http://l0.videohub.tv/ssframework/log/log.png?a=logitemaction&RI=1&ssPD=app.com&AFC=PR_VIDEO&EC=38&RC=3&VI=cf0a3a96deaa32ab3baae57ae79aaadb&admode=preroll&PRI=4finj1hf9j13no1mt2ako8l&pctVw=[pctvw]&dspPrice=3.0&EvaF=[viewabilityAvail]&PBI=2704636&rtb=2&UI=ef20e47b94a670839943ad4d9f933016&AVI=419254&Ust=N%2FA&Uctry=N%2FA&AC=4&NI=1031&EmV=[ad.ecpctData.muteRate]&ADI=7286756&EfV=[ad.ecpctData.focusRate]&CbC=1&CbF=true&SmC=2&CbM=b4%2F1&Uzip=N%2FA&ssBI=4&RprC=0&sspId=TREMORVIDEO&VcaI=12300&RrC=0&VgI=cf0a3a96deaa32ab3baae57ae79aaadb&CI=2704646&PI=442224&CC=7&Udma=N%2FA&VmC=0&PcI=247281&VscaI=12300&VclF=true&PC=1&ssRnd=2095545688]]></Tracking>
                    </TrackingEvents>
                    </Extension>
                    </Extensions>
                    <Error><![CDATA[http://events.tremorhub.com/diag?rid=5beaaaa404184c0eb68c2bf3b3e6cfaf&pbid=1358&seatid=60632&aid=10973&asid=4187&lid=33&rid=5beaaaa404184c0eb68c2bf3b3e6cfaf&rtype=VAST_ERR&vastError=[ERRORCODE]&sec=false&adcode=80zxm-1018032&seatId=60632&pbid=1358&brid=3056&sid=7997&sdom=demo.app.com&asid=4187&nid=15&lid=33&adom=tremorvideo.com&crid=7286756&aid=10973&rseat=1031]]></Error>
                    <Impression id="TV"><![CDATA[http://events.tremorhub.com/evt?rid=5beaaaa404184c0eb68c2bf3b3e6cfaf&pbid=1358&seatid=60632&aid=10973&asid=4187&lid=33&evt=IMP]]></Impression>
                    <Impression id="comscore"><![CDATA[http://b.scorecardresearch.com/b?C1=1&C2=6000001&C3=&C4=&C5=010000&rnd=-607430630152917772]]></Impression>
                    </InLine>
                    </Ad>
                    </VAST>`;

    it('should throw when given null', () => {
        assert.throws(() => {
            TestFixtures.getVastParser().parseVast(null);
        });
    });

    it('should throw when given an object with no data', () => {
        assert.throws(() => {
            TestFixtures.getVastParser().parseVast('');
        });
    });

    it('should throw when given a vast string with invalid document element', () => {
        assert.throws(() => {
            assert.isNull(TestFixtures.getVastParser().parseVast(
                `<?xml version="1.0" encoding="UTF-8" standalone="no"?>
                       <foo>
                       </foo>`
            ));
        });
    });

    it('should have correct data given url encoded data string and additional tracking events', () => {
        let vast = TestFixtures.getVastParser().parseVast(vastRaw);
        assert.equal(1, vast.getAds().length);
        assert.deepEqual(vast.getImpressionUrls(), [
            'http://dt.videohub2.tv/ssframework/tvuid?a=set&UI=ef20e47b94a670839943ad4d9f933016&ss_rand=1848887672',
            'http://l0.videohub.tv/ssframework/log/log.png?a=logitemaction&ssPD=app.com&AFC=PR_VIDEO&EC=3&RC=3&AmN=1&VI=cf0a3a96deaa32ab3baae57ae79aaadb&admode=preroll&PRI=4finj1hf9j13no1mt2ako8l&dspPrice=3.0&PBI=2704636&rtb=2&UI=ef20e47b94a670839943ad4d9f933016&AVI=419254&Uctry=N%2FA&Ust=N%2FA&AC=4&NI=1031&ADI=7286756&CbC=1&CbF=true&SmC=2&CbM=b4%2F1&Uzip=N%2FA&RvN=1&ssBI=4&RprC=0&sspId=TREMORVIDEO&VcaI=12300&RrC=0&VgI=cf0a3a96deaa32ab3baae57ae79aaadb&SfF=true&CI=2704646&PI=442224&CC=7&Udma=N%2FA&VmC=0&PcI=247281&VscaI=12300&VclF=true&PC=1&ssRnd=1479160881',
            'http://dt.videohub.tv/v1/usync/brx?userId=ef20e47b94a670839943ad4d9f933016',
            'http://dt.videohub.tv/v1/usync/tr?userId=ef20e47b94a670839943ad4d9f933016',
            'http://dt.videohub.tv/v1/usync/bs?userId=ef20e47b94a670839943ad4d9f933016',
            'http://events.tremorhub.com/evt?rid=5beaaaa404184c0eb68c2bf3b3e6cfaf&pbid=1358&seatid=60632&aid=10973&asid=4187&lid=33&evt=IMP',
            'http://b.scorecardresearch.com/b?C1=1&C2=6000001&C3=&C4=&C5=010000&rnd=-607430630152917772'
        ]);
        assert.deepEqual(vast.getTrackingEventUrls('start'), [
            'http://l0.videohub.tv/ssframework/log/log.png?a=logitemaction&ssPD=app.com&AFC=PR_VIDEO&vastrequest=true&EC=7&RC=3&VI=cf0a3a96deaa32ab3baae57ae79aaadb&admode=preroll&PRI=4finj1hf9j13no1mt2ako8l&dspPrice=3.0&PBI=2704636&rtb=2&UI=ef20e47b94a670839943ad4d9f933016&AVI=419254&Uctry=N%2FA&Ust=N%2FA&AC=4&NI=1031&ADI=7286756&EiN=1&CbC=1&CbF=true&SmC=2&CbM=b4%2F1&Uzip=N%2FA&ssBI=4&RprC=0&sspId=TREMORVIDEO&Eipct=0&VcaI=12300&RrC=0&VgI=cf0a3a96deaa32ab3baae57ae79aaadb&CI=2704646&PI=442224&CC=7&Udma=N%2FA&VmC=0&PcI=247281&VscaI=12300&VclF=true&PC=1&ssRnd=1413711906',
            'http://events.tremorhub.com/evt?rid=5beaaaa404184c0eb68c2bf3b3e6cfaf&pbid=1358&seatid=60632&aid=10973&asid=4187&lid=33&evt=start&vastcrtype=linear&crid=7286756'
        ]);
        assert.deepEqual(vast.getTrackingEventUrls('firstQuartile'), [
            'http://l0.videohub.tv/ssframework/log/log.png?a=logitemaction&ssPD=app.com&AFC=PR_VIDEO&vastrequest=true&EC=7&RC=3&VI=cf0a3a96deaa32ab3baae57ae79aaadb&admode=preroll&PRI=4finj1hf9j13no1mt2ako8l&dspPrice=3.0&PBI=2704636&rtb=2&UI=ef20e47b94a670839943ad4d9f933016&AVI=419254&Uctry=N%2FA&Ust=N%2FA&AC=4&NI=1031&ADI=7286756&EiN=1&CbC=1&CbF=true&SmC=2&CbM=b4%2F1&Uzip=N%2FA&ssBI=4&RprC=0&sspId=TREMORVIDEO&Eipct=25&VcaI=12300&RrC=0&VgI=cf0a3a96deaa32ab3baae57ae79aaadb&CI=2704646&PI=442224&CC=7&Udma=N%2FA&VmC=0&PcI=247281&VscaI=12300&VclF=true&PC=1&ssRnd=830833129',
            'http://events.tremorhub.com/evt?rid=5beaaaa404184c0eb68c2bf3b3e6cfaf&pbid=1358&seatid=60632&aid=10973&asid=4187&lid=33&evt=firstQuartile&vastcrtype=linear&crid=7286756'
        ]);
        assert.deepEqual(vast.getTrackingEventUrls('midpoint'), [
            'http://l0.videohub.tv/ssframework/log/log.png?a=logitemaction&ssPD=app.com&AFC=PR_VIDEO&vastrequest=true&EC=7&RC=3&VI=cf0a3a96deaa32ab3baae57ae79aaadb&admode=preroll&PRI=4finj1hf9j13no1mt2ako8l&dspPrice=3.0&PBI=2704636&rtb=2&UI=ef20e47b94a670839943ad4d9f933016&AVI=419254&Uctry=N%2FA&Ust=N%2FA&AC=4&NI=1031&ADI=7286756&EiN=1&CbC=1&CbF=true&SmC=2&CbM=b4%2F1&Uzip=N%2FA&ssBI=4&RprC=0&sspId=TREMORVIDEO&Eipct=50&VcaI=12300&RrC=0&VgI=cf0a3a96deaa32ab3baae57ae79aaadb&CI=2704646&PI=442224&CC=7&Udma=N%2FA&VmC=0&PcI=247281&VscaI=12300&VclF=true&PC=1&ssRnd=2023345290',
            'http://events.tremorhub.com/evt?rid=5beaaaa404184c0eb68c2bf3b3e6cfaf&pbid=1358&seatid=60632&aid=10973&asid=4187&lid=33&evt=midpoint&vastcrtype=linear&crid=7286756'
        ]);
        assert.deepEqual(vast.getTrackingEventUrls('thirdQuartile'), [
            'http://l0.videohub.tv/ssframework/log/log.png?a=logitemaction&ssPD=app.com&AFC=PR_VIDEO&vastrequest=true&EC=7&RC=3&VI=cf0a3a96deaa32ab3baae57ae79aaadb&admode=preroll&PRI=4finj1hf9j13no1mt2ako8l&dspPrice=3.0&PBI=2704636&rtb=2&UI=ef20e47b94a670839943ad4d9f933016&AVI=419254&Uctry=N%2FA&Ust=N%2FA&AC=4&NI=1031&ADI=7286756&EiN=1&CbC=1&CbF=true&SmC=2&CbM=b4%2F1&Uzip=N%2FA&ssBI=4&RprC=0&sspId=TREMORVIDEO&Eipct=75&VcaI=12300&RrC=0&VgI=cf0a3a96deaa32ab3baae57ae79aaadb&CI=2704646&PI=442224&CC=7&Udma=N%2FA&VmC=0&PcI=247281&VscaI=12300&VclF=true&PC=1&ssRnd=1253990772',
            'http://events.tremorhub.com/evt?rid=5beaaaa404184c0eb68c2bf3b3e6cfaf&pbid=1358&seatid=60632&aid=10973&asid=4187&lid=33&evt=thirdQuartile&vastcrtype=linear&crid=7286756'
        ]);
        assert.deepEqual(vast.getTrackingEventUrls('complete'), [
            'http://l0.videohub.tv/ssframework/log/log.png?a=logitemaction&ssPD=app.com&AFC=PR_VIDEO&vastrequest=true&EC=7&RC=3&VI=cf0a3a96deaa32ab3baae57ae79aaadb&admode=preroll&PRI=4finj1hf9j13no1mt2ako8l&dspPrice=3.0&PBI=2704636&rtb=2&UI=ef20e47b94a670839943ad4d9f933016&AVI=419254&Uctry=N%2FA&Ust=N%2FA&AC=4&NI=1031&ADI=7286756&EiN=1&CbC=1&CbF=true&SmC=2&CbM=b4%2F1&RcpF=1&Uzip=N%2FA&ssBI=4&RprC=0&sspId=TREMORVIDEO&Eipct=100&VcaI=12300&RrC=0&VgI=cf0a3a96deaa32ab3baae57ae79aaadb&CI=2704646&PI=442224&CC=7&Udma=N%2FA&VmC=0&PcI=247281&VscaI=12300&VclF=true&PC=1&ssRnd=671283626',
            'http://events.tremorhub.com/evt?rid=5beaaaa404184c0eb68c2bf3b3e6cfaf&pbid=1358&seatid=60632&aid=10973&asid=4187&lid=33&evt=complete&vastcrtype=linear&crid=7286756'
        ]);
        assert.deepEqual(vast.getTrackingEventUrls('mute'), [
            'http://events.tremorhub.com/evt?rid=5beaaaa404184c0eb68c2bf3b3e6cfaf&pbid=1358&seatid=60632&aid=10973&asid=4187&lid=33&evt=mute&vastcrtype=linear&crid=7286756'
        ]);
        assert.deepEqual(vast.getTrackingEventUrls('unmute'), [
            'http://events.tremorhub.com/evt?rid=5beaaaa404184c0eb68c2bf3b3e6cfaf&pbid=1358&seatid=60632&aid=10973&asid=4187&lid=33&evt=unmute&vastcrtype=linear&crid=7286756'
        ]);
        assert.equal(vast.getVideoUrl(), 'http://static.scanscout.com/filemanager/vhs/partner364124_f00a7d93-0858-4b28-bf8e-e9af7a879f74.mp4');
        assert.equal(vast.getDuration(), 15);
        assert.deepEqual(vast.getErrorURLTemplates(), [
            'http://events.tremorhub.com/diag?rid=5beaaaa404184c0eb68c2bf3b3e6cfaf&pbid=1358&seatid=60632&aid=10973&asid=4187&lid=33&rid=5beaaaa404184c0eb68c2bf3b3e6cfaf&rtype=VAST_ERR&vastError=[ERRORCODE]&sec=false&adcode=80zxm-1018032&seatId=60632&pbid=1358&brid=3056&sid=7997&sdom=demo.app.com&asid=4187&nid=15&lid=33&adom=tremorvideo.com&crid=7286756&aid=10973&rseat=1031'
        ]);
    });

    it('should have correct click trough url', () => {
        let vast = TestFixtures.getVastParser().parseVast(vastRaw);
        assert.equal(vast.getVideoClickThroughURL(), 'www.tremorvideo.com');
    });

    it('should have correct video click trough tracking url', () => {
        let vast = TestFixtures.getVastParser().parseVast(vastRaw);
        assert.deepEqual(vast.getVideoClickTrackingURLs(), ['http://l0.videohub.tv/ssframework/log/log.png?a=logitemaction&ssPD=app.com&AFC=PR_VIDEO&EC=2&RC=3&VI=cf0a3a96deaa32ab3baae57ae79aaadb&admode=preroll&PRI=4finj1hf9j13no1mt2ako8l&dspPrice=3.0&PBI=2704636&rtb=2&UI=ef20e47b94a670839943ad4d9f933016&AVI=419254&Uctry=N%2FA&Ust=N%2FA&AC=4&NI=1031&ADI=7286756&CbC=1&CbF=true&SmC=2&CbM=b4%2F1&Uzip=N%2FA&ssBI=4&RprC=0&sspId=TREMORVIDEO&VcaI=12300&RrC=0&VgI=cf0a3a96deaa32ab3baae57ae79aaadb&CI=2704646&PI=442224&CC=7&Udma=N%2FA&VmC=0&PcI=247281&VscaI=12300&VclF=true&PC=1&ssRnd=624905135', 'http://events.tremorhub.com/evt?rid=5beaaaa404184c0eb68c2bf3b3e6cfaf&pbid=1358&seatid=60632&aid=10973&asid=4187&lid=33&evt=click&vastcrtype=linear&crid=7286756']);
    });

    it('should throw when given vast has no Ad element', () => {
        let vastNoAdRaw = `
            <?xml version="1.0" encoding="UTF-8" standalone="no"?>
            <VAST version="2.0"></VAST>`;

        try {
            let vastPromise = TestFixtures.getVastParser().retrieveVast(vastNoAdRaw, nativeBridge, request);
            vastPromise.then(() => {
                assert.fail('Should fail when parsing invalid VAST');
            });
        } catch (e) {
            /* tslint:disable:no-string-literal */
            assert.deepEqual(e.diagnostic['vast'], vastNoAdRaw);
            assert.equal(e.diagnostic['wrapperDepth'], 0);
            /* tslint:enable */
        }
    });

    it('should throw an error with appropriate information when there is a problem with parsing a wrapped VAST', () => {
        let mockRequest = sinon.mock(request);

        let rootVast = `<?xml version="1.0" encoding="UTF-8"?>
            <VAST version="2.0">
              <Ad id="602833">
              <Wrapper>
                <AdSystem>Acudeo Compatible</AdSystem>
                <VASTAdTagURI>http://demo.tremormedia.com/proddev/vast/vast_wrapper_linear_1.xml</VASTAdTagURI>
                <Error>http://myErrorURL/wrapper/error</Error>
                <Impression>http://myTrackingURL/wrapper/impression</Impression>
                <Creatives>
                    <Creative AdID="602833">
                        <Linear>
                            <TrackingEvents>
                                <Tracking event="creativeView">http://myTrackingURL/wrapper/creativeView</Tracking>
                                <Tracking event="start">http://myTrackingURL/wrapper/start</Tracking>
                                <Tracking event="midpoint">http://myTrackingURL/wrapper/midpoint</Tracking>
                                <Tracking event="firstQuartile">http://myTrackingURL/wrapper/firstQuartile</Tracking>
                                <Tracking event="thirdQuartile">http://myTrackingURL/wrapper/thirdQuartile</Tracking>
                                <Tracking event="complete">http://myTrackingURL/wrapper/complete</Tracking>
                                <Tracking event="mute">http://myTrackingURL/wrapper/mute</Tracking>
                                <Tracking event="unmute">http://myTrackingURL/wrapper/unmute</Tracking>
                                <Tracking event="pause">http://myTrackingURL/wrapper/pause</Tracking>
                                <Tracking event="resume">http://myTrackingURL/wrapper/resume</Tracking>
                                <Tracking event="fullscreen">http://myTrackingURL/wrapper/fullscreen</Tracking>	
                            </TrackingEvents>
                        </Linear>
                    </Creative>
                    <Creative>
                        <Linear>
                            <VideoClicks>
                                <ClickTracking>http://myTrackingURL/wrapper/click</ClickTracking>
                            </VideoClicks>
                        </Linear>
                    </Creative>
                    <Creative AdID="602833-NonLinearTracking">
                        <NonLinearAds>
                            <TrackingEvents>
                            </TrackingEvents>
                        </NonLinearAds>
                    </Creative>
                </Creatives>
              </Wrapper>
              </Ad>
            </VAST>`;

        let wrappedVAST = `<?xml version="1.0" encoding="UTF-8"?>
            <VAST version="2.0">
            <Ad id="602833">
            <Wrapper>
            <AdSystem>Acudeo Compatible</AdSystem>
            <VASTAdTagURI>http://demo.tremormedia.com/proddev/vast/vast_wrapper_linear_2.xml</VASTAdTagURI>
            <Error>http://myErrorURL/wrapper/error</Error>
            <Impression>http://myTrackingURL/wrapper/impression</Impression>
            <Creatives>
                <Creative AdID="602833">
                    <Linear>
                        <TrackingEvents>
                            <Tracking event="creativeView">http://myTrackingURL/wrapper/creativeView</Tracking>
                            <Tracking event="start">http://myTrackingURL/wrapper/start</Tracking>
                            <Tracking event="midpoint">http://myTrackingURL/wrapper/midpoint</Tracking>
                            <Tracking event="firstQuartile">http://myTrackingURL/wrapper/firstQuartile</Tracking>
                            <Tracking event="thirdQuartile">http://myTrackingURL/wrapper/thirdQuartile</Tracking>
                            <Tracking event="complete">http://myTrackingURL/wrapper/complete</Tracking>
                            <Tracking event="mute">http://myTrackingURL/wrapper/mute</Tracking>
                            <Tracking event="unmute">http://myTrackingURL/wrapper/unmute</Tracking>
                            <Tracking event="pause">http://myTrackingURL/wrapper/pause</Tracking>
                            <Tracking event="resume">http://myTrackingURL/wrapper/resume</Tracking>
                            <Tracking event="fullscreen">http://myTrackingURL/wrapper/fullscreen</Tracking>
                        </TrackingEvents>
                    </Linear>
                </Creative>
                <Creative>
                    <Linear>
                        <VideoClicks>
                            <ClickTracking>http://myTrackingURL/wrapper/click</ClickTracking>
                        </VideoClicks>
                    </Linear>
                </Creative>
                <Creative AdID="602833-NonLinearTracking">
                    <NonLinearAds>
                        <TrackingEvents>
                        </TrackingEvents>
                    </NonLinearAds>
                </Creative>
            </Creatives>
            </Wrapper>
            </Ad>
            </VAST>`;

        for (let i = 0; i < 6; i++) {
            mockRequest.expects('get').returns(Promise.resolve({
                response: wrappedVAST
            }));
        }

        mockRequest.expects('get').returns(Promise.resolve({
            response: 'invalid vast'
        }));

        let vastPromise = TestFixtures.getVastParser().retrieveVast(rootVast, nativeBridge, request);

        vastPromise.then(() => {
            assert.fail('Should fail when parsing invalid VAST');
        }).catch((e) => {
            /* tslint:disable:no-string-literal */
            assert.deepEqual(e.diagnostic['vast'], 'invalid vast');
            assert.equal(e.diagnostic['rootWrapperVast'], rootVast);
            assert.equal(e.diagnostic['wrapperDepth'], 7);
            /* tslint:enable */
        });
    });

    beforeEach(() => {
        nativeBridge = <NativeBridge><any>{
            Request: {
                onComplete: {
                    subscribe: sinon.spy()
                },
                onFailed: {
                    subscribe: sinon.spy()
                }
            },
            Sdk: {
                logInfo: sinon.spy()
            },
            Connectivity: {
                onConnected: new Observable2()
            },
            Broadcast: {
                onBroadcastAction: new Observable4()
            },
            Notification: {
                onNotification: new Observable2()
            },
            getPlatform: () => {
                return Platform.TEST;
            }
        };
        let wakeUpManager = new WakeUpManager(nativeBridge);
        request = new Request(nativeBridge, wakeUpManager);
    });
});