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

    let vastRaw = {
        data: '%3C%3Fxml%20version%3D%221.0%22%20encoding%3D%22UTF-8%22%20standalone%3D%22no%22%3F%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%3CVAST%20version%3D%222.0%22%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%3CAd%20id%3D%22preroll-7286756-1%22%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%3CInLine%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%3CAdSystem%3EVideoHub%3C%2FAdSystem%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%3CAdTitle%3E7286756%3C%2FAdTitle%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%3CImpression%3E%3C!%5BCDATA%5Bhttp%3A%2F%2Fdt.videohub2.tv%2Fssframework%2Ftvuid%3Fa%3Dset%26UI%3Def20e47b94a670839943ad4d9f933016%26ss_rand%3D1848887672%5D%5D%3E%3C%2FImpression%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%3CImpression%20id%3D%22VideoHub%22%3E%3C!%5BCDATA%5Bhttp%3A%2F%2Fl0.videohub.tv%2Fssframework%2Flog%2Flog.png%3Fa%3Dlogitemaction%26ssPD%3Dapp.com%26AFC%3DPR_VIDEO%26EC%3D3%26RC%3D3%26AmN%3D1%26VI%3Dcf0a3a96deaa32ab3baae57ae79aaadb%26admode%3Dpreroll%26PRI%3D4finj1hf9j13no1mt2ako8l%26dspPrice%3D3.0%26PBI%3D2704636%26rtb%3D2%26UI%3Def20e47b94a670839943ad4d9f933016%26AVI%3D419254%26Uctry%3DN%252FA%26Ust%3DN%252FA%26AC%3D4%26NI%3D1031%26ADI%3D7286756%26CbC%3D1%26CbF%3Dtrue%26SmC%3D2%26CbM%3Db4%252F1%26Uzip%3DN%252FA%26RvN%3D1%26ssBI%3D4%26RprC%3D0%26sspId%3DTREMORVIDEO%26VcaI%3D12300%26RrC%3D0%26VgI%3Dcf0a3a96deaa32ab3baae57ae79aaadb%26SfF%3Dtrue%26CI%3D2704646%26PI%3D442224%26CC%3D7%26Udma%3DN%252FA%26VmC%3D0%26PcI%3D247281%26VscaI%3D12300%26VclF%3Dtrue%26PC%3D1%26ssRnd%3D1479160881%5D%5D%3E%3C%2FImpression%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%3CImpression%20id%3D%22external%22%3E%3C!%5BCDATA%5Bhttp%3A%2F%2Fdt.videohub.tv%2Fv1%2Fusync%2Fbrx%3FuserId%3Def20e47b94a670839943ad4d9f933016%5D%5D%3E%3C%2FImpression%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%3CImpression%20id%3D%22external%22%3E%3C!%5BCDATA%5Bhttp%3A%2F%2Fdt.videohub.tv%2Fv1%2Fusync%2Ftr%3FuserId%3Def20e47b94a670839943ad4d9f933016%5D%5D%3E%3C%2FImpression%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%3CImpression%20id%3D%22external%22%3E%3C!%5BCDATA%5Bhttp%3A%2F%2Fdt.videohub.tv%2Fv1%2Fusync%2Fbs%3FuserId%3Def20e47b94a670839943ad4d9f933016%5D%5D%3E%3C%2FImpression%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%3CCreatives%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%3CCreative%20id%3D%227286756%22%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%3CLinear%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%3CDuration%3E00%3A00%3A15%3C%2FDuration%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%3CTrackingEvents%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%3CTracking%20event%3D%22start%22%3E%3C!%5BCDATA%5Bhttp%3A%2F%2Fl0.videohub.tv%2Fssframework%2Flog%2Flog.png%3Fa%3Dlogitemaction%26ssPD%3Dapp.com%26AFC%3DPR_VIDEO%26vastrequest%3Dtrue%26EC%3D7%26RC%3D3%26VI%3Dcf0a3a96deaa32ab3baae57ae79aaadb%26admode%3Dpreroll%26PRI%3D4finj1hf9j13no1mt2ako8l%26dspPrice%3D3.0%26PBI%3D2704636%26rtb%3D2%26UI%3Def20e47b94a670839943ad4d9f933016%26AVI%3D419254%26Uctry%3DN%252FA%26Ust%3DN%252FA%26AC%3D4%26NI%3D1031%26ADI%3D7286756%26EiN%3D1%26CbC%3D1%26CbF%3Dtrue%26SmC%3D2%26CbM%3Db4%252F1%26Uzip%3DN%252FA%26ssBI%3D4%26RprC%3D0%26sspId%3DTREMORVIDEO%26Eipct%3D0%26VcaI%3D12300%26RrC%3D0%26VgI%3Dcf0a3a96deaa32ab3baae57ae79aaadb%26CI%3D2704646%26PI%3D442224%26CC%3D7%26Udma%3DN%252FA%26VmC%3D0%26PcI%3D247281%26VscaI%3D12300%26VclF%3Dtrue%26PC%3D1%26ssRnd%3D1413711906%5D%5D%3E%3C%2FTracking%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%3CTracking%20event%3D%22firstQuartile%22%3E%3C!%5BCDATA%5Bhttp%3A%2F%2Fl0.videohub.tv%2Fssframework%2Flog%2Flog.png%3Fa%3Dlogitemaction%26ssPD%3Dapp.com%26AFC%3DPR_VIDEO%26vastrequest%3Dtrue%26EC%3D7%26RC%3D3%26VI%3Dcf0a3a96deaa32ab3baae57ae79aaadb%26admode%3Dpreroll%26PRI%3D4finj1hf9j13no1mt2ako8l%26dspPrice%3D3.0%26PBI%3D2704636%26rtb%3D2%26UI%3Def20e47b94a670839943ad4d9f933016%26AVI%3D419254%26Uctry%3DN%252FA%26Ust%3DN%252FA%26AC%3D4%26NI%3D1031%26ADI%3D7286756%26EiN%3D1%26CbC%3D1%26CbF%3Dtrue%26SmC%3D2%26CbM%3Db4%252F1%26Uzip%3DN%252FA%26ssBI%3D4%26RprC%3D0%26sspId%3DTREMORVIDEO%26Eipct%3D25%26VcaI%3D12300%26RrC%3D0%26VgI%3Dcf0a3a96deaa32ab3baae57ae79aaadb%26CI%3D2704646%26PI%3D442224%26CC%3D7%26Udma%3DN%252FA%26VmC%3D0%26PcI%3D247281%26VscaI%3D12300%26VclF%3Dtrue%26PC%3D1%26ssRnd%3D830833129%5D%5D%3E%3C%2FTracking%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%3CTracking%20event%3D%22midpoint%22%3E%3C!%5BCDATA%5Bhttp%3A%2F%2Fl0.videohub.tv%2Fssframework%2Flog%2Flog.png%3Fa%3Dlogitemaction%26ssPD%3Dapp.com%26AFC%3DPR_VIDEO%26vastrequest%3Dtrue%26EC%3D7%26RC%3D3%26VI%3Dcf0a3a96deaa32ab3baae57ae79aaadb%26admode%3Dpreroll%26PRI%3D4finj1hf9j13no1mt2ako8l%26dspPrice%3D3.0%26PBI%3D2704636%26rtb%3D2%26UI%3Def20e47b94a670839943ad4d9f933016%26AVI%3D419254%26Uctry%3DN%252FA%26Ust%3DN%252FA%26AC%3D4%26NI%3D1031%26ADI%3D7286756%26EiN%3D1%26CbC%3D1%26CbF%3Dtrue%26SmC%3D2%26CbM%3Db4%252F1%26Uzip%3DN%252FA%26ssBI%3D4%26RprC%3D0%26sspId%3DTREMORVIDEO%26Eipct%3D50%26VcaI%3D12300%26RrC%3D0%26VgI%3Dcf0a3a96deaa32ab3baae57ae79aaadb%26CI%3D2704646%26PI%3D442224%26CC%3D7%26Udma%3DN%252FA%26VmC%3D0%26PcI%3D247281%26VscaI%3D12300%26VclF%3Dtrue%26PC%3D1%26ssRnd%3D2023345290%5D%5D%3E%3C%2FTracking%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%3CTracking%20event%3D%22thirdQuartile%22%3E%3C!%5BCDATA%5Bhttp%3A%2F%2Fl0.videohub.tv%2Fssframework%2Flog%2Flog.png%3Fa%3Dlogitemaction%26ssPD%3Dapp.com%26AFC%3DPR_VIDEO%26vastrequest%3Dtrue%26EC%3D7%26RC%3D3%26VI%3Dcf0a3a96deaa32ab3baae57ae79aaadb%26admode%3Dpreroll%26PRI%3D4finj1hf9j13no1mt2ako8l%26dspPrice%3D3.0%26PBI%3D2704636%26rtb%3D2%26UI%3Def20e47b94a670839943ad4d9f933016%26AVI%3D419254%26Uctry%3DN%252FA%26Ust%3DN%252FA%26AC%3D4%26NI%3D1031%26ADI%3D7286756%26EiN%3D1%26CbC%3D1%26CbF%3Dtrue%26SmC%3D2%26CbM%3Db4%252F1%26Uzip%3DN%252FA%26ssBI%3D4%26RprC%3D0%26sspId%3DTREMORVIDEO%26Eipct%3D75%26VcaI%3D12300%26RrC%3D0%26VgI%3Dcf0a3a96deaa32ab3baae57ae79aaadb%26CI%3D2704646%26PI%3D442224%26CC%3D7%26Udma%3DN%252FA%26VmC%3D0%26PcI%3D247281%26VscaI%3D12300%26VclF%3Dtrue%26PC%3D1%26ssRnd%3D1253990772%5D%5D%3E%3C%2FTracking%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%3CTracking%20event%3D%22complete%22%3E%3C!%5BCDATA%5Bhttp%3A%2F%2Fl0.videohub.tv%2Fssframework%2Flog%2Flog.png%3Fa%3Dlogitemaction%26ssPD%3Dapp.com%26AFC%3DPR_VIDEO%26vastrequest%3Dtrue%26EC%3D7%26RC%3D3%26VI%3Dcf0a3a96deaa32ab3baae57ae79aaadb%26admode%3Dpreroll%26PRI%3D4finj1hf9j13no1mt2ako8l%26dspPrice%3D3.0%26PBI%3D2704636%26rtb%3D2%26UI%3Def20e47b94a670839943ad4d9f933016%26AVI%3D419254%26Uctry%3DN%252FA%26Ust%3DN%252FA%26AC%3D4%26NI%3D1031%26ADI%3D7286756%26EiN%3D1%26CbC%3D1%26CbF%3Dtrue%26SmC%3D2%26CbM%3Db4%252F1%26RcpF%3D1%26Uzip%3DN%252FA%26ssBI%3D4%26RprC%3D0%26sspId%3DTREMORVIDEO%26Eipct%3D100%26VcaI%3D12300%26RrC%3D0%26VgI%3Dcf0a3a96deaa32ab3baae57ae79aaadb%26CI%3D2704646%26PI%3D442224%26CC%3D7%26Udma%3DN%252FA%26VmC%3D0%26PcI%3D247281%26VscaI%3D12300%26VclF%3Dtrue%26PC%3D1%26ssRnd%3D671283626%5D%5D%3E%3C%2FTracking%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%3CTracking%20event%3D%22pause%22%3E%3C!%5BCDATA%5Bhttp%3A%2F%2Fl0.videohub.tv%2Fssframework%2Flog%2Flog.png%3Fa%3Dlogitemaction%26ssPD%3Dapp.com%26AFC%3DPR_VIDEO%26EC%3D4%26RC%3D3%26VI%3Dcf0a3a96deaa32ab3baae57ae79aaadb%26admode%3Dpreroll%26PRI%3D4finj1hf9j13no1mt2ako8l%26dspPrice%3D3.0%26PBI%3D2704636%26rtb%3D2%26UI%3Def20e47b94a670839943ad4d9f933016%26AVI%3D419254%26Uctry%3DN%252FA%26Ust%3DN%252FA%26AC%3D4%26NI%3D1031%26ADI%3D7286756%26CbC%3D1%26CbF%3Dtrue%26SmC%3D2%26CbM%3Db4%252F1%26Uzip%3DN%252FA%26ssBI%3D4%26RprC%3D0%26sspId%3DTREMORVIDEO%26VcaI%3D12300%26RrC%3D0%26VgI%3Dcf0a3a96deaa32ab3baae57ae79aaadb%26CI%3D2704646%26PI%3D442224%26CC%3D7%26Udma%3DN%252FA%26VmC%3D0%26PcI%3D247281%26VscaI%3D12300%26VclF%3Dtrue%26PC%3D1%26ssRnd%3D1719449710%5D%5D%3E%3C%2FTracking%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%3CTracking%20event%3D%22start%22%3E%3C!%5BCDATA%5Bhttp%3A%2F%2Fevents.tremorhub.com%2Fevt%3Frid%3D5beaaaa404184c0eb68c2bf3b3e6cfaf%26pbid%3D1358%26seatid%3D60632%26aid%3D10973%26asid%3D4187%26lid%3D33%26evt%3Dstart%26vastcrtype%3Dlinear%26crid%3D7286756%5D%5D%3E%3C%2FTracking%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%3CTracking%20event%3D%22firstQuartile%22%3E%3C!%5BCDATA%5Bhttp%3A%2F%2Fevents.tremorhub.com%2Fevt%3Frid%3D5beaaaa404184c0eb68c2bf3b3e6cfaf%26pbid%3D1358%26seatid%3D60632%26aid%3D10973%26asid%3D4187%26lid%3D33%26evt%3DfirstQuartile%26vastcrtype%3Dlinear%26crid%3D7286756%5D%5D%3E%3C%2FTracking%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%3CTracking%20event%3D%22midpoint%22%3E%3C!%5BCDATA%5Bhttp%3A%2F%2Fevents.tremorhub.com%2Fevt%3Frid%3D5beaaaa404184c0eb68c2bf3b3e6cfaf%26pbid%3D1358%26seatid%3D60632%26aid%3D10973%26asid%3D4187%26lid%3D33%26evt%3Dmidpoint%26vastcrtype%3Dlinear%26crid%3D7286756%5D%5D%3E%3C%2FTracking%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%3CTracking%20event%3D%22thirdQuartile%22%3E%3C!%5BCDATA%5Bhttp%3A%2F%2Fevents.tremorhub.com%2Fevt%3Frid%3D5beaaaa404184c0eb68c2bf3b3e6cfaf%26pbid%3D1358%26seatid%3D60632%26aid%3D10973%26asid%3D4187%26lid%3D33%26evt%3DthirdQuartile%26vastcrtype%3Dlinear%26crid%3D7286756%5D%5D%3E%3C%2FTracking%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%3CTracking%20event%3D%22complete%22%3E%3C!%5BCDATA%5Bhttp%3A%2F%2Fevents.tremorhub.com%2Fevt%3Frid%3D5beaaaa404184c0eb68c2bf3b3e6cfaf%26pbid%3D1358%26seatid%3D60632%26aid%3D10973%26asid%3D4187%26lid%3D33%26evt%3Dcomplete%26vastcrtype%3Dlinear%26crid%3D7286756%5D%5D%3E%3C%2FTracking%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%3CTracking%20event%3D%22mute%22%3E%3C!%5BCDATA%5Bhttp%3A%2F%2Fevents.tremorhub.com%2Fevt%3Frid%3D5beaaaa404184c0eb68c2bf3b3e6cfaf%26pbid%3D1358%26seatid%3D60632%26aid%3D10973%26asid%3D4187%26lid%3D33%26evt%3Dmute%26vastcrtype%3Dlinear%26crid%3D7286756%5D%5D%3E%3C%2FTracking%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%3CTracking%20event%3D%22unmute%22%3E%3C!%5BCDATA%5Bhttp%3A%2F%2Fevents.tremorhub.com%2Fevt%3Frid%3D5beaaaa404184c0eb68c2bf3b3e6cfaf%26pbid%3D1358%26seatid%3D60632%26aid%3D10973%26asid%3D4187%26lid%3D33%26evt%3Dunmute%26vastcrtype%3Dlinear%26crid%3D7286756%5D%5D%3E%3C%2FTracking%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%3CTracking%20event%3D%22pause%22%3E%3C!%5BCDATA%5Bhttp%3A%2F%2Fevents.tremorhub.com%2Fevt%3Frid%3D5beaaaa404184c0eb68c2bf3b3e6cfaf%26pbid%3D1358%26seatid%3D60632%26aid%3D10973%26asid%3D4187%26lid%3D33%26evt%3Dpause%26vastcrtype%3Dlinear%26crid%3D7286756%5D%5D%3E%3C%2FTracking%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%3CTracking%20event%3D%22resume%22%3E%3C!%5BCDATA%5Bhttp%3A%2F%2Fevents.tremorhub.com%2Fevt%3Frid%3D5beaaaa404184c0eb68c2bf3b3e6cfaf%26pbid%3D1358%26seatid%3D60632%26aid%3D10973%26asid%3D4187%26lid%3D33%26evt%3Dresume%26vastcrtype%3Dlinear%26crid%3D7286756%5D%5D%3E%3C%2FTracking%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%3C%2FTrackingEvents%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%3CVideoClicks%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%3CClickThrough%20id%3D%22VideoHub%22%3E%3C!%5BCDATA%5Bwww.tremorvideo.com%5D%5D%3E%3C%2FClickThrough%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%3CClickTracking%20id%3D%22VideoHub%22%3E%3C!%5BCDATA%5Bhttp%3A%2F%2Fl0.videohub.tv%2Fssframework%2Flog%2Flog.png%3Fa%3Dlogitemaction%26ssPD%3Dapp.com%26AFC%3DPR_VIDEO%26EC%3D2%26RC%3D3%26VI%3Dcf0a3a96deaa32ab3baae57ae79aaadb%26admode%3Dpreroll%26PRI%3D4finj1hf9j13no1mt2ako8l%26dspPrice%3D3.0%26PBI%3D2704636%26rtb%3D2%26UI%3Def20e47b94a670839943ad4d9f933016%26AVI%3D419254%26Uctry%3DN%252FA%26Ust%3DN%252FA%26AC%3D4%26NI%3D1031%26ADI%3D7286756%26CbC%3D1%26CbF%3Dtrue%26SmC%3D2%26CbM%3Db4%252F1%26Uzip%3DN%252FA%26ssBI%3D4%26RprC%3D0%26sspId%3DTREMORVIDEO%26VcaI%3D12300%26RrC%3D0%26VgI%3Dcf0a3a96deaa32ab3baae57ae79aaadb%26CI%3D2704646%26PI%3D442224%26CC%3D7%26Udma%3DN%252FA%26VmC%3D0%26PcI%3D247281%26VscaI%3D12300%26VclF%3Dtrue%26PC%3D1%26ssRnd%3D624905135%5D%5D%3E%3C%2FClickTracking%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%3CClickTracking%20id%3D%22TV%22%3E%3C!%5BCDATA%5Bhttp%3A%2F%2Fevents.tremorhub.com%2Fevt%3Frid%3D5beaaaa404184c0eb68c2bf3b3e6cfaf%26pbid%3D1358%26seatid%3D60632%26aid%3D10973%26asid%3D4187%26lid%3D33%26evt%3Dclick%26vastcrtype%3Dlinear%26crid%3D7286756%5D%5D%3E%3C%2FClickTracking%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%3C%2FVideoClicks%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%3CMediaFiles%3E%0A%3CMediaFile%20delivery%3D%22progressive%22%20height%3D%22480%22%20type%3D%22video%2Fx-flv%22%20width%3D%22320%22%3E%3C!%5BCDATA%5Bhttp%3A%2F%2Fstatic.scanscout.com%2Ffilemanager%2Fvhs%2Fpartner364124_f00a7d93-0858-4b28-bf8e-e9af7a879f74.flv%5D%5D%3E%3C%2FMediaFile%3E%0A%3CMediaFile%20delivery%3D%22progressive%22%20height%3D%22480%22%20type%3D%22video%2F3gpp%22%20width%3D%22320%22%3E%3C!%5BCDATA%5Bhttp%3A%2F%2Fstatic.scanscout.com%2Ffilemanager%2Fvhs%2Fpartner364124_f00a7d93-0858-4b28-bf8e-e9af7a879f74.3gpp%5D%5D%3E%3C%2FMediaFile%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%3CMediaFile%20delivery%3D%22progressive%22%20height%3D%22480%22%20type%3D%22video%2Fmp4%22%20width%3D%22320%22%3E%3C!%5BCDATA%5Bhttp%3A%2F%2Fstatic.scanscout.com%2Ffilemanager%2Fvhs%2Fpartner364124_f00a7d93-0858-4b28-bf8e-e9af7a879f74.mp4%5D%5D%3E%3C%2FMediaFile%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%3C%2FMediaFiles%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%3C%2FLinear%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%3C%2FCreative%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%3C%2FCreatives%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%3CExtensions%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%3CExtension%20xmlns%3Axsi%3D%22http%3A%2F%2Fwww.w3.org%2F2001%2FXMLSchema-instance%22%20type%3D%22CustomTrackingEvents%22%20xsi%3Atype%3D%22CustomTrackingEvents_extension_type%22%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%3CTrackingEvents%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%3CTracking%20event%3D%22viewableimpression%22%3E%3C!%5BCDATA%5Bhttp%3A%2F%2Fl0.videohub.tv%2Fssframework%2Flog%2Flog.png%3Fa%3Dlogitemaction%26RI%3D1%26ssPD%3Dapp.com%26AFC%3DPR_VIDEO%26EC%3D40%26RC%3D3%26VI%3Dcf0a3a96deaa32ab3baae57ae79aaadb%26admode%3Dpreroll%26PRI%3D4finj1hf9j13no1mt2ako8l%26pctVw%3D%5Bpctvw%5D%26dspPrice%3D3.0%26EvaF%3D%5BviewabilityAvail%5D%26PBI%3D2704636%26rtb%3D2%26UI%3Def20e47b94a670839943ad4d9f933016%26AVI%3D419254%26Ust%3DN%252FA%26Uctry%3DN%252FA%26AC%3D4%26NI%3D1031%26EmV%3D%5Bad.ecpctData.muteRate%5D%26ADI%3D7286756%26EfV%3D%5Bad.ecpctData.focusRate%5D%26CbC%3D1%26CbF%3Dtrue%26SmC%3D2%26CbM%3Db4%252F1%26Uzip%3DN%252FA%26ssBI%3D4%26RprC%3D0%26sspId%3DTREMORVIDEO%26VcaI%3D12300%26RrC%3D0%26VgI%3Dcf0a3a96deaa32ab3baae57ae79aaadb%26CI%3D2704646%26PI%3D442224%26CC%3D7%26Udma%3DN%252FA%26VmC%3D0%26PcI%3D247281%26VscaI%3D12300%26VclF%3Dtrue%26PC%3D1%26ssRnd%3D431552369%5D%5D%3E%3C%2FTracking%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%3CTracking%20event%3D%22viewablecompletion%22%3E%3C!%5BCDATA%5Bhttp%3A%2F%2Fl0.videohub.tv%2Fssframework%2Flog%2Flog.png%3Fa%3Dlogitemaction%26RI%3D1%26ssPD%3Dapp.com%26AFC%3DPR_VIDEO%26EC%3D38%26RC%3D3%26VI%3Dcf0a3a96deaa32ab3baae57ae79aaadb%26admode%3Dpreroll%26PRI%3D4finj1hf9j13no1mt2ako8l%26pctVw%3D%5Bpctvw%5D%26dspPrice%3D3.0%26EvaF%3D%5BviewabilityAvail%5D%26PBI%3D2704636%26rtb%3D2%26UI%3Def20e47b94a670839943ad4d9f933016%26AVI%3D419254%26Ust%3DN%252FA%26Uctry%3DN%252FA%26AC%3D4%26NI%3D1031%26EmV%3D%5Bad.ecpctData.muteRate%5D%26ADI%3D7286756%26EfV%3D%5Bad.ecpctData.focusRate%5D%26CbC%3D1%26CbF%3Dtrue%26SmC%3D2%26CbM%3Db4%252F1%26Uzip%3DN%252FA%26ssBI%3D4%26RprC%3D0%26sspId%3DTREMORVIDEO%26VcaI%3D12300%26RrC%3D0%26VgI%3Dcf0a3a96deaa32ab3baae57ae79aaadb%26CI%3D2704646%26PI%3D442224%26CC%3D7%26Udma%3DN%252FA%26VmC%3D0%26PcI%3D247281%26VscaI%3D12300%26VclF%3Dtrue%26PC%3D1%26ssRnd%3D2095545688%5D%5D%3E%3C%2FTracking%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%3C%2FTrackingEvents%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%3C%2FExtension%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%3C%2FExtensions%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%3CError%3E%3C!%5BCDATA%5Bhttp%3A%2F%2Fevents.tremorhub.com%2Fdiag%3Frid%3D5beaaaa404184c0eb68c2bf3b3e6cfaf%26pbid%3D1358%26seatid%3D60632%26aid%3D10973%26asid%3D4187%26lid%3D33%26rid%3D5beaaaa404184c0eb68c2bf3b3e6cfaf%26rtype%3DVAST_ERR%26vastError%3D%5BERRORCODE%5D%26sec%3Dfalse%26adcode%3D80zxm-1018032%26seatId%3D60632%26pbid%3D1358%26brid%3D3056%26sid%3D7997%26sdom%3Ddemo.app.com%26asid%3D4187%26nid%3D15%26lid%3D33%26adom%3Dtremorvideo.com%26crid%3D7286756%26aid%3D10973%26rseat%3D1031%5D%5D%3E%3C%2FError%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%3CImpression%20id%3D%22TV%22%3E%3C!%5BCDATA%5Bhttp%3A%2F%2Fevents.tremorhub.com%2Fevt%3Frid%3D5beaaaa404184c0eb68c2bf3b3e6cfaf%26pbid%3D1358%26seatid%3D60632%26aid%3D10973%26asid%3D4187%26lid%3D33%26evt%3DIMP%5D%5D%3E%3C%2FImpression%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%3CImpression%20id%3D%22comscore%22%3E%3C!%5BCDATA%5Bhttp%3A%2F%2Fb.scorecardresearch.com%2Fb%3FC1%3D1%26C2%3D6000001%26C3%3D%26C4%3D%26C5%3D010000%26rnd%3D-607430630152917772%5D%5D%3E%3C%2FImpression%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%3C%2FInLine%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%3C%2FAd%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%3C%2FVAST%3E',
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
    };

    it('should throw when given null', () => {
        assert.throws(() => {
            TestFixtures.getVastParser().parseVast(null);
        });
    });

    it('should throw when given an object with no data', () => {
        assert.throws(() => {
            TestFixtures.getVastParser().parseVast({});
        });
    });

    it('should throw when given a vast string with invalid document element', () => {
        assert.throws(() => {
            assert.isNull(TestFixtures.getVastParser().parseVast({
                data: `<?xml version="1.0" encoding="UTF-8" standalone="no"?>
                       <foo>
                       </foo>`
            }));
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
        let vastNoAdRaw = {
            data: '%3C%3Fxml%20version%3D%221.0%22%20encoding%3D%22UTF-8%22%20standalone%3D%22no%22%3F%3E%0A%3CVAST%20version%3D%222.0%22%3E%3C%2FVAST%3E%0A%0A',
            tracking: {
                click: null,
                complete: null,
                firstQuartile: null,
                midpoint: null,
                start: [],
                thirdQuartile: null
            }
        };

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

        let rootVast = {
            data: '%3C%3Fxml%20version%3D%221.0%22%20encoding%3D%22UTF-8%22%3F%3E%0A%3CVAST%20version%3D%222.0%22%3E%0A%20%20%3CAd%20id%3D%22602833%22%3E%0A%20%20%3CWrapper%3E%0A%20%20%20%20%3CAdSystem%3EAcudeo%20Compatible%3C%2FAdSystem%3E%0A%20%20%20%20%3CVASTAdTagURI%3Ehttp%3A%2F%2Fdemo.tremormedia.com%2Fproddev%2Fvast%2Fvast_wrapper_linear_1.xml%3C%2FVASTAdTagURI%3E%0A%20%20%20%20%3CError%3Ehttp%3A%2F%2FmyErrorURL%2Fwrapper%2Ferror%3C%2FError%3E%0A%20%20%20%20%3CImpression%3Ehttp%3A%2F%2FmyTrackingURL%2Fwrapper%2Fimpression%3C%2FImpression%3E%0A%09%3CCreatives%3E%0A%09%09%3CCreative%20AdID%3D%22602833%22%3E%0A%09%09%09%3CLinear%3E%0A%09%09%09%09%3CTrackingEvents%3E%0A%09%09%09%09%09%3CTracking%20event%3D%22creativeView%22%3Ehttp%3A%2F%2FmyTrackingURL%2Fwrapper%2FcreativeView%3C%2FTracking%3E%0A%09%09%09%09%09%3CTracking%20event%3D%22start%22%3Ehttp%3A%2F%2FmyTrackingURL%2Fwrapper%2Fstart%3C%2FTracking%3E%0A%09%09%09%09%09%3CTracking%20event%3D%22midpoint%22%3Ehttp%3A%2F%2FmyTrackingURL%2Fwrapper%2Fmidpoint%3C%2FTracking%3E%0A%09%09%09%09%09%3CTracking%20event%3D%22firstQuartile%22%3Ehttp%3A%2F%2FmyTrackingURL%2Fwrapper%2FfirstQuartile%3C%2FTracking%3E%0A%09%09%09%09%09%3CTracking%20event%3D%22thirdQuartile%22%3Ehttp%3A%2F%2FmyTrackingURL%2Fwrapper%2FthirdQuartile%3C%2FTracking%3E%0A%09%09%09%09%09%3CTracking%20event%3D%22complete%22%3Ehttp%3A%2F%2FmyTrackingURL%2Fwrapper%2Fcomplete%3C%2FTracking%3E%0A%09%09%09%09%09%3CTracking%20event%3D%22mute%22%3Ehttp%3A%2F%2FmyTrackingURL%2Fwrapper%2Fmute%3C%2FTracking%3E%0A%09%09%09%09%09%3CTracking%20event%3D%22unmute%22%3Ehttp%3A%2F%2FmyTrackingURL%2Fwrapper%2Funmute%3C%2FTracking%3E%0A%09%09%09%09%09%3CTracking%20event%3D%22pause%22%3Ehttp%3A%2F%2FmyTrackingURL%2Fwrapper%2Fpause%3C%2FTracking%3E%0A%09%09%09%09%09%3CTracking%20event%3D%22resume%22%3Ehttp%3A%2F%2FmyTrackingURL%2Fwrapper%2Fresume%3C%2FTracking%3E%0A%09%09%09%09%09%3CTracking%20event%3D%22fullscreen%22%3Ehttp%3A%2F%2FmyTrackingURL%2Fwrapper%2Ffullscreen%3C%2FTracking%3E%09%0A%09%09%09%09%3C%2FTrackingEvents%3E%0A%09%09%09%3C%2FLinear%3E%0A%09%09%3C%2FCreative%3E%0A%09%09%3CCreative%3E%0A%09%09%09%3CLinear%3E%0A%09%09%09%09%3CVideoClicks%3E%0A%09%09%09%09%09%3CClickTracking%3Ehttp%3A%2F%2FmyTrackingURL%2Fwrapper%2Fclick%3C%2FClickTracking%3E%0A%09%09%09%09%3C%2FVideoClicks%3E%0A%09%09%09%3C%2FLinear%3E%0A%09%09%3C%2FCreative%3E%0A%09%09%3CCreative%20AdID%3D%22602833-NonLinearTracking%22%3E%0A%09%09%09%3CNonLinearAds%3E%0A%09%09%09%09%3CTrackingEvents%3E%0A%09%09%09%09%3C%2FTrackingEvents%3E%0A%09%09%09%3C%2FNonLinearAds%3E%0A%09%09%3C%2FCreative%3E%0A%09%3C%2FCreatives%3E%0A%20%20%3C%2FWrapper%3E%0A%20%20%3C%2FAd%3E%0A%3C%2FVAST%3E%0A'
        };

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
            assert.deepEqual(e.diagnostic['vast'], { data: 'invalid vast', tracking: {} });
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