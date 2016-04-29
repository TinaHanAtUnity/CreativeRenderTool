import 'mocha';
import { assert } from 'chai';
import * as xmldom from 'xmldom';

import { VastParser } from '../../src/ts/Utilities/VastParser';

describe('VastParserTest', () => {

    let domParser;

    beforeEach(() => {
        domParser = new xmldom.DOMParser({errorHandler:{}});
    });

    it('should return null when given null', () => {
        assert.isNull(new VastParser(domParser).parseVast(null));
    });

    it('should return null when given an object with no data', () => {
        assert.isNull(new VastParser(domParser).parseVast({}));
    });

    it('should return null when given a vast string with invalid document element', () => {
        assert.isNull(new VastParser(domParser).parseVast({
            data: `<?xml version="1.0" encoding="UTF-8" standalone="no"?>
            <foo>
            </foo>`
        }));
    });

    it('should have correct data given url encoded data string and additional tracking events', () => {
        let vast = new VastParser(domParser).parseVast({
            data: '%3C%3Fxml%20version%3D%221.0%22%20encoding%3D%22UTF-8%22%20standalone%3D%22no%22%3F%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%3CVAST%20version%3D%222.0%22%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%3CAd%20id%3D%22preroll-7286756-1%22%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%3CInLine%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%3CAdSystem%3EVideoHub%3C%2FAdSystem%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%3CAdTitle%3E7286756%3C%2FAdTitle%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%3CImpression%3E%3C!%5BCDATA%5Bhttp%3A%2F%2Fdt.videohub2.tv%2Fssframework%2Ftvuid%3Fa%3Dset%26UI%3Def20e47b94a670839943ad4d9f933016%26ss_rand%3D1848887672%5D%5D%3E%3C%2FImpression%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%3CImpression%20id%3D%22VideoHub%22%3E%3C!%5BCDATA%5Bhttp%3A%2F%2Fl0.videohub.tv%2Fssframework%2Flog%2Flog.png%3Fa%3Dlogitemaction%26ssPD%3Dapp.com%26AFC%3DPR_VIDEO%26EC%3D3%26RC%3D3%26AmN%3D1%26VI%3Dcf0a3a96deaa32ab3baae57ae79aaadb%26admode%3Dpreroll%26PRI%3D4finj1hf9j13no1mt2ako8l%26dspPrice%3D3.0%26PBI%3D2704636%26rtb%3D2%26UI%3Def20e47b94a670839943ad4d9f933016%26AVI%3D419254%26Uctry%3DN%252FA%26Ust%3DN%252FA%26AC%3D4%26NI%3D1031%26ADI%3D7286756%26CbC%3D1%26CbF%3Dtrue%26SmC%3D2%26CbM%3Db4%252F1%26Uzip%3DN%252FA%26RvN%3D1%26ssBI%3D4%26RprC%3D0%26sspId%3DTREMORVIDEO%26VcaI%3D12300%26RrC%3D0%26VgI%3Dcf0a3a96deaa32ab3baae57ae79aaadb%26SfF%3Dtrue%26CI%3D2704646%26PI%3D442224%26CC%3D7%26Udma%3DN%252FA%26VmC%3D0%26PcI%3D247281%26VscaI%3D12300%26VclF%3Dtrue%26PC%3D1%26ssRnd%3D1479160881%5D%5D%3E%3C%2FImpression%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%3CImpression%20id%3D%22external%22%3E%3C!%5BCDATA%5Bhttp%3A%2F%2Fdt.videohub.tv%2Fv1%2Fusync%2Fbrx%3FuserId%3Def20e47b94a670839943ad4d9f933016%5D%5D%3E%3C%2FImpression%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%3CImpression%20id%3D%22external%22%3E%3C!%5BCDATA%5Bhttp%3A%2F%2Fdt.videohub.tv%2Fv1%2Fusync%2Ftr%3FuserId%3Def20e47b94a670839943ad4d9f933016%5D%5D%3E%3C%2FImpression%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%3CImpression%20id%3D%22external%22%3E%3C!%5BCDATA%5Bhttp%3A%2F%2Fdt.videohub.tv%2Fv1%2Fusync%2Fbs%3FuserId%3Def20e47b94a670839943ad4d9f933016%5D%5D%3E%3C%2FImpression%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%3CCreatives%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%3CCreative%20id%3D%227286756%22%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%3CLinear%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%3CDuration%3E00%3A00%3A15%3C%2FDuration%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%3CTrackingEvents%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%3CTracking%20event%3D%22start%22%3E%3C!%5BCDATA%5Bhttp%3A%2F%2Fl0.videohub.tv%2Fssframework%2Flog%2Flog.png%3Fa%3Dlogitemaction%26ssPD%3Dapp.com%26AFC%3DPR_VIDEO%26vastrequest%3Dtrue%26EC%3D7%26RC%3D3%26VI%3Dcf0a3a96deaa32ab3baae57ae79aaadb%26admode%3Dpreroll%26PRI%3D4finj1hf9j13no1mt2ako8l%26dspPrice%3D3.0%26PBI%3D2704636%26rtb%3D2%26UI%3Def20e47b94a670839943ad4d9f933016%26AVI%3D419254%26Uctry%3DN%252FA%26Ust%3DN%252FA%26AC%3D4%26NI%3D1031%26ADI%3D7286756%26EiN%3D1%26CbC%3D1%26CbF%3Dtrue%26SmC%3D2%26CbM%3Db4%252F1%26Uzip%3DN%252FA%26ssBI%3D4%26RprC%3D0%26sspId%3DTREMORVIDEO%26Eipct%3D0%26VcaI%3D12300%26RrC%3D0%26VgI%3Dcf0a3a96deaa32ab3baae57ae79aaadb%26CI%3D2704646%26PI%3D442224%26CC%3D7%26Udma%3DN%252FA%26VmC%3D0%26PcI%3D247281%26VscaI%3D12300%26VclF%3Dtrue%26PC%3D1%26ssRnd%3D1413711906%5D%5D%3E%3C%2FTracking%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%3CTracking%20event%3D%22firstQuartile%22%3E%3C!%5BCDATA%5Bhttp%3A%2F%2Fl0.videohub.tv%2Fssframework%2Flog%2Flog.png%3Fa%3Dlogitemaction%26ssPD%3Dapp.com%26AFC%3DPR_VIDEO%26vastrequest%3Dtrue%26EC%3D7%26RC%3D3%26VI%3Dcf0a3a96deaa32ab3baae57ae79aaadb%26admode%3Dpreroll%26PRI%3D4finj1hf9j13no1mt2ako8l%26dspPrice%3D3.0%26PBI%3D2704636%26rtb%3D2%26UI%3Def20e47b94a670839943ad4d9f933016%26AVI%3D419254%26Uctry%3DN%252FA%26Ust%3DN%252FA%26AC%3D4%26NI%3D1031%26ADI%3D7286756%26EiN%3D1%26CbC%3D1%26CbF%3Dtrue%26SmC%3D2%26CbM%3Db4%252F1%26Uzip%3DN%252FA%26ssBI%3D4%26RprC%3D0%26sspId%3DTREMORVIDEO%26Eipct%3D25%26VcaI%3D12300%26RrC%3D0%26VgI%3Dcf0a3a96deaa32ab3baae57ae79aaadb%26CI%3D2704646%26PI%3D442224%26CC%3D7%26Udma%3DN%252FA%26VmC%3D0%26PcI%3D247281%26VscaI%3D12300%26VclF%3Dtrue%26PC%3D1%26ssRnd%3D830833129%5D%5D%3E%3C%2FTracking%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%3CTracking%20event%3D%22midpoint%22%3E%3C!%5BCDATA%5Bhttp%3A%2F%2Fl0.videohub.tv%2Fssframework%2Flog%2Flog.png%3Fa%3Dlogitemaction%26ssPD%3Dapp.com%26AFC%3DPR_VIDEO%26vastrequest%3Dtrue%26EC%3D7%26RC%3D3%26VI%3Dcf0a3a96deaa32ab3baae57ae79aaadb%26admode%3Dpreroll%26PRI%3D4finj1hf9j13no1mt2ako8l%26dspPrice%3D3.0%26PBI%3D2704636%26rtb%3D2%26UI%3Def20e47b94a670839943ad4d9f933016%26AVI%3D419254%26Uctry%3DN%252FA%26Ust%3DN%252FA%26AC%3D4%26NI%3D1031%26ADI%3D7286756%26EiN%3D1%26CbC%3D1%26CbF%3Dtrue%26SmC%3D2%26CbM%3Db4%252F1%26Uzip%3DN%252FA%26ssBI%3D4%26RprC%3D0%26sspId%3DTREMORVIDEO%26Eipct%3D50%26VcaI%3D12300%26RrC%3D0%26VgI%3Dcf0a3a96deaa32ab3baae57ae79aaadb%26CI%3D2704646%26PI%3D442224%26CC%3D7%26Udma%3DN%252FA%26VmC%3D0%26PcI%3D247281%26VscaI%3D12300%26VclF%3Dtrue%26PC%3D1%26ssRnd%3D2023345290%5D%5D%3E%3C%2FTracking%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%3CTracking%20event%3D%22thirdQuartile%22%3E%3C!%5BCDATA%5Bhttp%3A%2F%2Fl0.videohub.tv%2Fssframework%2Flog%2Flog.png%3Fa%3Dlogitemaction%26ssPD%3Dapp.com%26AFC%3DPR_VIDEO%26vastrequest%3Dtrue%26EC%3D7%26RC%3D3%26VI%3Dcf0a3a96deaa32ab3baae57ae79aaadb%26admode%3Dpreroll%26PRI%3D4finj1hf9j13no1mt2ako8l%26dspPrice%3D3.0%26PBI%3D2704636%26rtb%3D2%26UI%3Def20e47b94a670839943ad4d9f933016%26AVI%3D419254%26Uctry%3DN%252FA%26Ust%3DN%252FA%26AC%3D4%26NI%3D1031%26ADI%3D7286756%26EiN%3D1%26CbC%3D1%26CbF%3Dtrue%26SmC%3D2%26CbM%3Db4%252F1%26Uzip%3DN%252FA%26ssBI%3D4%26RprC%3D0%26sspId%3DTREMORVIDEO%26Eipct%3D75%26VcaI%3D12300%26RrC%3D0%26VgI%3Dcf0a3a96deaa32ab3baae57ae79aaadb%26CI%3D2704646%26PI%3D442224%26CC%3D7%26Udma%3DN%252FA%26VmC%3D0%26PcI%3D247281%26VscaI%3D12300%26VclF%3Dtrue%26PC%3D1%26ssRnd%3D1253990772%5D%5D%3E%3C%2FTracking%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%3CTracking%20event%3D%22complete%22%3E%3C!%5BCDATA%5Bhttp%3A%2F%2Fl0.videohub.tv%2Fssframework%2Flog%2Flog.png%3Fa%3Dlogitemaction%26ssPD%3Dapp.com%26AFC%3DPR_VIDEO%26vastrequest%3Dtrue%26EC%3D7%26RC%3D3%26VI%3Dcf0a3a96deaa32ab3baae57ae79aaadb%26admode%3Dpreroll%26PRI%3D4finj1hf9j13no1mt2ako8l%26dspPrice%3D3.0%26PBI%3D2704636%26rtb%3D2%26UI%3Def20e47b94a670839943ad4d9f933016%26AVI%3D419254%26Uctry%3DN%252FA%26Ust%3DN%252FA%26AC%3D4%26NI%3D1031%26ADI%3D7286756%26EiN%3D1%26CbC%3D1%26CbF%3Dtrue%26SmC%3D2%26CbM%3Db4%252F1%26RcpF%3D1%26Uzip%3DN%252FA%26ssBI%3D4%26RprC%3D0%26sspId%3DTREMORVIDEO%26Eipct%3D100%26VcaI%3D12300%26RrC%3D0%26VgI%3Dcf0a3a96deaa32ab3baae57ae79aaadb%26CI%3D2704646%26PI%3D442224%26CC%3D7%26Udma%3DN%252FA%26VmC%3D0%26PcI%3D247281%26VscaI%3D12300%26VclF%3Dtrue%26PC%3D1%26ssRnd%3D671283626%5D%5D%3E%3C%2FTracking%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%3CTracking%20event%3D%22pause%22%3E%3C!%5BCDATA%5Bhttp%3A%2F%2Fl0.videohub.tv%2Fssframework%2Flog%2Flog.png%3Fa%3Dlogitemaction%26ssPD%3Dapp.com%26AFC%3DPR_VIDEO%26EC%3D4%26RC%3D3%26VI%3Dcf0a3a96deaa32ab3baae57ae79aaadb%26admode%3Dpreroll%26PRI%3D4finj1hf9j13no1mt2ako8l%26dspPrice%3D3.0%26PBI%3D2704636%26rtb%3D2%26UI%3Def20e47b94a670839943ad4d9f933016%26AVI%3D419254%26Uctry%3DN%252FA%26Ust%3DN%252FA%26AC%3D4%26NI%3D1031%26ADI%3D7286756%26CbC%3D1%26CbF%3Dtrue%26SmC%3D2%26CbM%3Db4%252F1%26Uzip%3DN%252FA%26ssBI%3D4%26RprC%3D0%26sspId%3DTREMORVIDEO%26VcaI%3D12300%26RrC%3D0%26VgI%3Dcf0a3a96deaa32ab3baae57ae79aaadb%26CI%3D2704646%26PI%3D442224%26CC%3D7%26Udma%3DN%252FA%26VmC%3D0%26PcI%3D247281%26VscaI%3D12300%26VclF%3Dtrue%26PC%3D1%26ssRnd%3D1719449710%5D%5D%3E%3C%2FTracking%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%3CTracking%20event%3D%22start%22%3E%3C!%5BCDATA%5Bhttp%3A%2F%2Fevents.tremorhub.com%2Fevt%3Frid%3D5beaaaa404184c0eb68c2bf3b3e6cfaf%26pbid%3D1358%26seatid%3D60632%26aid%3D10973%26asid%3D4187%26lid%3D33%26evt%3Dstart%26vastcrtype%3Dlinear%26crid%3D7286756%5D%5D%3E%3C%2FTracking%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%3CTracking%20event%3D%22firstQuartile%22%3E%3C!%5BCDATA%5Bhttp%3A%2F%2Fevents.tremorhub.com%2Fevt%3Frid%3D5beaaaa404184c0eb68c2bf3b3e6cfaf%26pbid%3D1358%26seatid%3D60632%26aid%3D10973%26asid%3D4187%26lid%3D33%26evt%3DfirstQuartile%26vastcrtype%3Dlinear%26crid%3D7286756%5D%5D%3E%3C%2FTracking%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%3CTracking%20event%3D%22midpoint%22%3E%3C!%5BCDATA%5Bhttp%3A%2F%2Fevents.tremorhub.com%2Fevt%3Frid%3D5beaaaa404184c0eb68c2bf3b3e6cfaf%26pbid%3D1358%26seatid%3D60632%26aid%3D10973%26asid%3D4187%26lid%3D33%26evt%3Dmidpoint%26vastcrtype%3Dlinear%26crid%3D7286756%5D%5D%3E%3C%2FTracking%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%3CTracking%20event%3D%22thirdQuartile%22%3E%3C!%5BCDATA%5Bhttp%3A%2F%2Fevents.tremorhub.com%2Fevt%3Frid%3D5beaaaa404184c0eb68c2bf3b3e6cfaf%26pbid%3D1358%26seatid%3D60632%26aid%3D10973%26asid%3D4187%26lid%3D33%26evt%3DthirdQuartile%26vastcrtype%3Dlinear%26crid%3D7286756%5D%5D%3E%3C%2FTracking%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%3CTracking%20event%3D%22complete%22%3E%3C!%5BCDATA%5Bhttp%3A%2F%2Fevents.tremorhub.com%2Fevt%3Frid%3D5beaaaa404184c0eb68c2bf3b3e6cfaf%26pbid%3D1358%26seatid%3D60632%26aid%3D10973%26asid%3D4187%26lid%3D33%26evt%3Dcomplete%26vastcrtype%3Dlinear%26crid%3D7286756%5D%5D%3E%3C%2FTracking%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%3CTracking%20event%3D%22mute%22%3E%3C!%5BCDATA%5Bhttp%3A%2F%2Fevents.tremorhub.com%2Fevt%3Frid%3D5beaaaa404184c0eb68c2bf3b3e6cfaf%26pbid%3D1358%26seatid%3D60632%26aid%3D10973%26asid%3D4187%26lid%3D33%26evt%3Dmute%26vastcrtype%3Dlinear%26crid%3D7286756%5D%5D%3E%3C%2FTracking%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%3CTracking%20event%3D%22unmute%22%3E%3C!%5BCDATA%5Bhttp%3A%2F%2Fevents.tremorhub.com%2Fevt%3Frid%3D5beaaaa404184c0eb68c2bf3b3e6cfaf%26pbid%3D1358%26seatid%3D60632%26aid%3D10973%26asid%3D4187%26lid%3D33%26evt%3Dunmute%26vastcrtype%3Dlinear%26crid%3D7286756%5D%5D%3E%3C%2FTracking%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%3CTracking%20event%3D%22pause%22%3E%3C!%5BCDATA%5Bhttp%3A%2F%2Fevents.tremorhub.com%2Fevt%3Frid%3D5beaaaa404184c0eb68c2bf3b3e6cfaf%26pbid%3D1358%26seatid%3D60632%26aid%3D10973%26asid%3D4187%26lid%3D33%26evt%3Dpause%26vastcrtype%3Dlinear%26crid%3D7286756%5D%5D%3E%3C%2FTracking%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%3CTracking%20event%3D%22resume%22%3E%3C!%5BCDATA%5Bhttp%3A%2F%2Fevents.tremorhub.com%2Fevt%3Frid%3D5beaaaa404184c0eb68c2bf3b3e6cfaf%26pbid%3D1358%26seatid%3D60632%26aid%3D10973%26asid%3D4187%26lid%3D33%26evt%3Dresume%26vastcrtype%3Dlinear%26crid%3D7286756%5D%5D%3E%3C%2FTracking%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%3C%2FTrackingEvents%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%3CVideoClicks%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%3CClickThrough%20id%3D%22VideoHub%22%3E%3C!%5BCDATA%5Bwww.tremorvideo.com%5D%5D%3E%3C%2FClickThrough%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%3CClickTracking%20id%3D%22VideoHub%22%3E%3C!%5BCDATA%5Bhttp%3A%2F%2Fl0.videohub.tv%2Fssframework%2Flog%2Flog.png%3Fa%3Dlogitemaction%26ssPD%3Dapp.com%26AFC%3DPR_VIDEO%26EC%3D2%26RC%3D3%26VI%3Dcf0a3a96deaa32ab3baae57ae79aaadb%26admode%3Dpreroll%26PRI%3D4finj1hf9j13no1mt2ako8l%26dspPrice%3D3.0%26PBI%3D2704636%26rtb%3D2%26UI%3Def20e47b94a670839943ad4d9f933016%26AVI%3D419254%26Uctry%3DN%252FA%26Ust%3DN%252FA%26AC%3D4%26NI%3D1031%26ADI%3D7286756%26CbC%3D1%26CbF%3Dtrue%26SmC%3D2%26CbM%3Db4%252F1%26Uzip%3DN%252FA%26ssBI%3D4%26RprC%3D0%26sspId%3DTREMORVIDEO%26VcaI%3D12300%26RrC%3D0%26VgI%3Dcf0a3a96deaa32ab3baae57ae79aaadb%26CI%3D2704646%26PI%3D442224%26CC%3D7%26Udma%3DN%252FA%26VmC%3D0%26PcI%3D247281%26VscaI%3D12300%26VclF%3Dtrue%26PC%3D1%26ssRnd%3D624905135%5D%5D%3E%3C%2FClickTracking%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%3CClickTracking%20id%3D%22TV%22%3E%3C!%5BCDATA%5Bhttp%3A%2F%2Fevents.tremorhub.com%2Fevt%3Frid%3D5beaaaa404184c0eb68c2bf3b3e6cfaf%26pbid%3D1358%26seatid%3D60632%26aid%3D10973%26asid%3D4187%26lid%3D33%26evt%3Dclick%26vastcrtype%3Dlinear%26crid%3D7286756%5D%5D%3E%3C%2FClickTracking%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%3C%2FVideoClicks%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%3CMediaFiles%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%3CMediaFile%20delivery%3D%22progressive%22%20height%3D%22480%22%20type%3D%22video%2Fmp4%22%20width%3D%22320%22%3E%3C!%5BCDATA%5Bhttp%3A%2F%2Fstatic.scanscout.com%2Ffilemanager%2Fvhs%2Fpartner364124_f00a7d93-0858-4b28-bf8e-e9af7a879f74.mp4%5D%5D%3E%3C%2FMediaFile%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%3C%2FMediaFiles%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%3C%2FLinear%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%3C%2FCreative%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%3C%2FCreatives%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%3CExtensions%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%3CExtension%20xmlns%3Axsi%3D%22http%3A%2F%2Fwww.w3.org%2F2001%2FXMLSchema-instance%22%20type%3D%22CustomTrackingEvents%22%20xsi%3Atype%3D%22CustomTrackingEvents_extension_type%22%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%3CTrackingEvents%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%3CTracking%20event%3D%22viewableimpression%22%3E%3C!%5BCDATA%5Bhttp%3A%2F%2Fl0.videohub.tv%2Fssframework%2Flog%2Flog.png%3Fa%3Dlogitemaction%26RI%3D1%26ssPD%3Dapp.com%26AFC%3DPR_VIDEO%26EC%3D40%26RC%3D3%26VI%3Dcf0a3a96deaa32ab3baae57ae79aaadb%26admode%3Dpreroll%26PRI%3D4finj1hf9j13no1mt2ako8l%26pctVw%3D%5Bpctvw%5D%26dspPrice%3D3.0%26EvaF%3D%5BviewabilityAvail%5D%26PBI%3D2704636%26rtb%3D2%26UI%3Def20e47b94a670839943ad4d9f933016%26AVI%3D419254%26Ust%3DN%252FA%26Uctry%3DN%252FA%26AC%3D4%26NI%3D1031%26EmV%3D%5Bad.ecpctData.muteRate%5D%26ADI%3D7286756%26EfV%3D%5Bad.ecpctData.focusRate%5D%26CbC%3D1%26CbF%3Dtrue%26SmC%3D2%26CbM%3Db4%252F1%26Uzip%3DN%252FA%26ssBI%3D4%26RprC%3D0%26sspId%3DTREMORVIDEO%26VcaI%3D12300%26RrC%3D0%26VgI%3Dcf0a3a96deaa32ab3baae57ae79aaadb%26CI%3D2704646%26PI%3D442224%26CC%3D7%26Udma%3DN%252FA%26VmC%3D0%26PcI%3D247281%26VscaI%3D12300%26VclF%3Dtrue%26PC%3D1%26ssRnd%3D431552369%5D%5D%3E%3C%2FTracking%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%3CTracking%20event%3D%22viewablecompletion%22%3E%3C!%5BCDATA%5Bhttp%3A%2F%2Fl0.videohub.tv%2Fssframework%2Flog%2Flog.png%3Fa%3Dlogitemaction%26RI%3D1%26ssPD%3Dapp.com%26AFC%3DPR_VIDEO%26EC%3D38%26RC%3D3%26VI%3Dcf0a3a96deaa32ab3baae57ae79aaadb%26admode%3Dpreroll%26PRI%3D4finj1hf9j13no1mt2ako8l%26pctVw%3D%5Bpctvw%5D%26dspPrice%3D3.0%26EvaF%3D%5BviewabilityAvail%5D%26PBI%3D2704636%26rtb%3D2%26UI%3Def20e47b94a670839943ad4d9f933016%26AVI%3D419254%26Ust%3DN%252FA%26Uctry%3DN%252FA%26AC%3D4%26NI%3D1031%26EmV%3D%5Bad.ecpctData.muteRate%5D%26ADI%3D7286756%26EfV%3D%5Bad.ecpctData.focusRate%5D%26CbC%3D1%26CbF%3Dtrue%26SmC%3D2%26CbM%3Db4%252F1%26Uzip%3DN%252FA%26ssBI%3D4%26RprC%3D0%26sspId%3DTREMORVIDEO%26VcaI%3D12300%26RrC%3D0%26VgI%3Dcf0a3a96deaa32ab3baae57ae79aaadb%26CI%3D2704646%26PI%3D442224%26CC%3D7%26Udma%3DN%252FA%26VmC%3D0%26PcI%3D247281%26VscaI%3D12300%26VclF%3Dtrue%26PC%3D1%26ssRnd%3D2095545688%5D%5D%3E%3C%2FTracking%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%3C%2FTrackingEvents%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%3C%2FExtension%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%3C%2FExtensions%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%3CError%3E%3C!%5BCDATA%5Bhttp%3A%2F%2Fevents.tremorhub.com%2Fdiag%3Frid%3D5beaaaa404184c0eb68c2bf3b3e6cfaf%26pbid%3D1358%26seatid%3D60632%26aid%3D10973%26asid%3D4187%26lid%3D33%26rid%3D5beaaaa404184c0eb68c2bf3b3e6cfaf%26rtype%3DVAST_ERR%26vastError%3D%5BERRORCODE%5D%26sec%3Dfalse%26adcode%3D80zxm-1018032%26seatId%3D60632%26pbid%3D1358%26brid%3D3056%26sid%3D7997%26sdom%3Ddemo.app.com%26asid%3D4187%26nid%3D15%26lid%3D33%26adom%3Dtremorvideo.com%26crid%3D7286756%26aid%3D10973%26rseat%3D1031%5D%5D%3E%3C%2FError%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%3CImpression%20id%3D%22TV%22%3E%3C!%5BCDATA%5Bhttp%3A%2F%2Fevents.tremorhub.com%2Fevt%3Frid%3D5beaaaa404184c0eb68c2bf3b3e6cfaf%26pbid%3D1358%26seatid%3D60632%26aid%3D10973%26asid%3D4187%26lid%3D33%26evt%3DIMP%5D%5D%3E%3C%2FImpression%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%3CImpression%20id%3D%22comscore%22%3E%3C!%5BCDATA%5Bhttp%3A%2F%2Fb.scorecardresearch.com%2Fb%3FC1%3D1%26C2%3D6000001%26C3%3D%26C4%3D%26C5%3D010000%26rnd%3D-607430630152917772%5D%5D%3E%3C%2FImpression%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%3C%2FInLine%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%3C%2FAd%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%3C%2FVAST%3E',
            tracking: {
                click: null,
                complete: null,
                firstQuartile: null,
                midpoint: null,
                start: [
                    'http://localhost:3500/brands/14851/start?advertisingTrackingId=123456&androidId=aae7974a89efbcfd&creativeId=CrEaTiVeId1&demandSource=tremor&gameId=14851&ip=192.168.69.69&token=9690f425-294c-51e1-7e92-c23eea942b47&ts=2016-04-21T20%3A46%3A36Z&value=13.1'
                ],
                thirdQuartile: null
            }
        });
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
            'http://events.tremorhub.com/evt?rid=5beaaaa404184c0eb68c2bf3b3e6cfaf&pbid=1358&seatid=60632&aid=10973&asid=4187&lid=33&evt=start&vastcrtype=linear&crid=7286756',
            'http://localhost:3500/brands/14851/start?advertisingTrackingId=123456&androidId=aae7974a89efbcfd&creativeId=CrEaTiVeId1&demandSource=tremor&gameId=14851&ip=192.168.69.69&token=9690f425-294c-51e1-7e92-c23eea942b47&ts=2016-04-21T20%3A46%3A36Z&value=13.1'
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
    });

});