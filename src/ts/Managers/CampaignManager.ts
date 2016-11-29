import { Observable1 } from 'Utilities/Observable';
import { DeviceInfo } from 'Models/DeviceInfo';
import { Url } from 'Utilities/Url';
import { Campaign } from 'Models/Campaign';
import { VastCampaign } from 'Models/Vast/VastCampaign';
import { Request } from 'Utilities/Request';
import { ClientInfo } from 'Models/ClientInfo';
import { Platform } from 'Constants/Platform';
import { NativeBridge } from 'Native/NativeBridge';
import { VastParser } from 'Utilities/VastParser';
import { MetaDataManager } from 'Managers/MetaDataManager';
import { JsonParser } from 'Utilities/JsonParser';
import { DiagnosticError } from 'Errors/DiagnosticError';
import { StorageType } from 'Native/Api/Storage';
import { HtmlCampaign } from 'Models/HtmlCampaign';

export class CampaignManager {

    public static setTestBaseUrl(baseUrl: string): void {
        CampaignManager.CampaignBaseUrl = baseUrl + '/games';
    }

    public static setAbGroup(abGroup: number) {
        CampaignManager.AbGroup = abGroup;
    }

    private static CampaignBaseUrl: string = 'https://adserver.unityads.unity3d.com/games';
    private static AbGroup: number | undefined;

    public onCampaign: Observable1<Campaign> = new Observable1();
    public onVastCampaign: Observable1<Campaign> = new Observable1();
    public onThirdPartyCampaign: Observable1<HtmlCampaign> = new Observable1();
    public onNoFill: Observable1<number> = new Observable1();
    public onError: Observable1<Error> = new Observable1();

    private _nativeBridge: NativeBridge;
    private _request: Request;
    private _clientInfo: ClientInfo;
    private _deviceInfo: DeviceInfo;
    private _vastParser: VastParser;

    constructor(nativeBridge: NativeBridge, request: Request, clientInfo: ClientInfo, deviceInfo: DeviceInfo, vastParser: VastParser) {
        this._nativeBridge = nativeBridge;
        this._request = request;
        this._clientInfo = clientInfo;
        this._deviceInfo = deviceInfo;
        this._vastParser = vastParser;
    }

    public request(): Promise<void> {
        return Promise.all([this.createRequestUrl(), this.createRequestBody()]).then(([requestUrl, requestBody]) => {
            this._nativeBridge.Sdk.logInfo('Requesting ad plan from ' + requestUrl);
            return this._request.post(requestUrl, requestBody, [], {
                retries: 5,
                retryDelay: 5000,
                followRedirects: false,
                retryWithConnectionEvents: true
            }).then(response => {
                response.response = `{
  "abGroup": 13,
  "gamerId": "574e3c2bf253834201771f25",
  "vast": {
    "data": "%3CVAST%20version%3D%222.0%22%20xsi%3AnoNamespaceSchemaLocation%3D%22vast.xsd%22%20xmlns%3Axsi%3D%22http%3A%2F%2Fwww.w3.org%2F2001%2FXMLSchema-instance%22%3E%0A%20%20%20%20%3CAd%20id%3D%223203937%22%3E%0A%20%20%20%20%20%20%20%20%3CInLine%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%3CAdSystem%20version%3D%226.5.0%22%3EMediaMath%20T1%20VADS%20(VACS%206.8.0)%3C%2FAdSystem%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%3CAdTitle%3E%3C!%5BCDATA%5BUNITY%20TEST%20COMPANION%20BANNER%5D%5D%3E%3C%2FAdTitle%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%3CDescription%3E%3C!%5BCDATA%5BUNITY%20TEST%20COMPANION%20BANNER%5D%5D%3E%3C%2FDescription%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%3CError%3E%3C!%5BCDATA%5Bhttps%3A%2F%2Fpixel.mathtag.com%2Fvideo%2Fimg%3Fcb%3D8541700239826312192%26mt_aid%3D123%26event%3Derr%26mt_id%3D3203937%26error%3D%5BERRORCODE%5D%26mt_exid%3Dbrx%26mt_adid%3D152931%26mt_stid%3D111666111%5D%5D%3E%3C%2FError%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%3CImpression%3E%3C!%5BCDATA%5Bhttp%3A%2F%2Fvast.mathtag.com%2Findex.html%2Fnotify%2Fimg%3Fprice%3D12%26nocache%3Dtrue%26id%3Dasfasf%26cid%3D3203937%26exch%3Dbrx%26protocol_version%3D1%26sid%3D111666111%5D%5D%3E%3C%2FImpression%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%3CImpression%3E%3C!%5BCDATA%5Bhttps%3A%2F%2Fpixel.mathtag.com%2Fvideo%2Fimg%3Fcb%3D8541700239826312192%26mt_aid%3D123%26event%3Dimp%26mt_id%3D3203937%26mt_exid%3Dbrx%26mt_adid%3D152931%26mt_stid%3D111666111%5D%5D%3E%3C%2FImpression%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%3CCreatives%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%3CCreative%20id%3D%223203937%22%20sequence%3D%220%22%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%3CLinear%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%3CDuration%3E00%3A00%3A15%3C%2FDuration%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%3CTrackingEvents%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%3CTracking%20event%3D%22resume%22%3E%3C!%5BCDATA%5Bhttps%3A%2F%2Fpixel.mathtag.com%2Fvideo%2Fimg%3Fcb%3D8541700239826312192%26mt_aid%3D123%26event%3Dresume%26mt_id%3D3203937%26mt_exid%3Dbrx%26mt_adid%3D152931%26mt_stid%3D111666111%5D%5D%3E%3C%2FTracking%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%3CTracking%20event%3D%22acceptInvitation%22%3E%3C!%5BCDATA%5Bhttps%3A%2F%2Fpixel.mathtag.com%2Fvideo%2Fimg%3Fcb%3D8541700239826312192%26mt_aid%3D123%26event%3DacceptInvitation%26mt_id%3D3203937%26mt_exid%3Dbrx%26mt_adid%3D152931%26mt_stid%3D111666111%5D%5D%3E%3C%2FTracking%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%3CTracking%20event%3D%22collapse%22%3E%3C!%5BCDATA%5Bhttps%3A%2F%2Fpixel.mathtag.com%2Fvideo%2Fimg%3Fcb%3D8541700239826312192%26mt_aid%3D123%26event%3Dcollapse%26mt_id%3D3203937%26mt_exid%3Dbrx%26mt_adid%3D152931%26mt_stid%3D111666111%5D%5D%3E%3C%2FTracking%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%3CTracking%20event%3D%22thirdQuartile%22%3E%3C!%5BCDATA%5Bhttps%3A%2F%2Fpixel.mathtag.com%2Fvideo%2Fimg%3Fcb%3D8541700239826312192%26mt_aid%3D123%26event%3Dq3%26mt_id%3D3203937%26mt_exid%3Dbrx%26mt_adid%3D152931%26mt_stid%3D111666111%5D%5D%3E%3C%2FTracking%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%3CTracking%20event%3D%22close%22%3E%3C!%5BCDATA%5Bhttps%3A%2F%2Fpixel.mathtag.com%2Fvideo%2Fimg%3Fcb%3D8541700239826312192%26mt_aid%3D123%26event%3Dclose%26mt_id%3D3203937%26mt_exid%3Dbrx%26mt_adid%3D152931%26mt_stid%3D111666111%5D%5D%3E%3C%2FTracking%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%3CTracking%20event%3D%22creativeView%22%3E%3C!%5BCDATA%5Bhttps%3A%2F%2Fpixel.mathtag.com%2Fvideo%2Fimg%3Fcb%3D8541700239826312192%26mt_aid%3D123%26event%3Dvv%26mt_id%3D3203937%26mt_exid%3Dbrx%26mt_adid%3D152931%26mt_stid%3D111666111%5D%5D%3E%3C%2FTracking%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%3CTracking%20event%3D%22fullscreen%22%3E%3C!%5BCDATA%5Bhttps%3A%2F%2Fpixel.mathtag.com%2Fvideo%2Fimg%3Fcb%3D8541700239826312192%26mt_aid%3D123%26event%3Dfullscreen%26mt_id%3D3203937%26mt_exid%3Dbrx%26mt_adid%3D152931%26mt_stid%3D111666111%5D%5D%3E%3C%2FTracking%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%3CTracking%20event%3D%22complete%22%3E%3C!%5BCDATA%5Bhttps%3A%2F%2Fpixel.mathtag.com%2Fvideo%2Fimg%3Fcb%3D8541700239826312192%26mt_aid%3D123%26event%3Dq4%26mt_id%3D3203937%26mt_exid%3Dbrx%26mt_adid%3D152931%26mt_stid%3D111666111%5D%5D%3E%3C%2FTracking%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%3CTracking%20event%3D%22start%22%3E%3C!%5BCDATA%5Bhttps%3A%2F%2Fpixel.mathtag.com%2Fvideo%2Fimg%3Fcb%3D8541700239826312192%26mt_aid%3D123%26event%3Dvst%26mt_id%3D3203937%26mt_exid%3Dbrx%26mt_adid%3D152931%26mt_stid%3D111666111%5D%5D%3E%3C%2FTracking%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%3CTracking%20event%3D%22rewind%22%3E%3C!%5BCDATA%5Bhttps%3A%2F%2Fpixel.mathtag.com%2Fvideo%2Fimg%3Fcb%3D8541700239826312192%26mt_aid%3D123%26event%3Drewind%26mt_id%3D3203937%26mt_exid%3Dbrx%26mt_adid%3D152931%26mt_stid%3D111666111%5D%5D%3E%3C%2FTracking%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%3CTracking%20event%3D%22unmute%22%3E%3C!%5BCDATA%5Bhttps%3A%2F%2Fpixel.mathtag.com%2Fvideo%2Fimg%3Fcb%3D8541700239826312192%26mt_aid%3D123%26event%3Dunmute%26mt_id%3D3203937%26mt_exid%3Dbrx%26mt_adid%3D152931%26mt_stid%3D111666111%5D%5D%3E%3C%2FTracking%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%3CTracking%20event%3D%22expand%22%3E%3C!%5BCDATA%5Bhttps%3A%2F%2Fpixel.mathtag.com%2Fvideo%2Fimg%3Fcb%3D8541700239826312192%26mt_aid%3D123%26event%3Dexpand%26mt_id%3D3203937%26mt_exid%3Dbrx%26mt_adid%3D152931%26mt_stid%3D111666111%5D%5D%3E%3C%2FTracking%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%3CTracking%20event%3D%22mute%22%3E%3C!%5BCDATA%5Bhttps%3A%2F%2Fpixel.mathtag.com%2Fvideo%2Fimg%3Fcb%3D8541700239826312192%26mt_aid%3D123%26event%3Dmute%26mt_id%3D3203937%26mt_exid%3Dbrx%26mt_adid%3D152931%26mt_stid%3D111666111%5D%5D%3E%3C%2FTracking%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%3CTracking%20event%3D%22midpoint%22%3E%3C!%5BCDATA%5Bhttps%3A%2F%2Fpixel.mathtag.com%2Fvideo%2Fimg%3Fcb%3D8541700239826312192%26mt_aid%3D123%26event%3Dq2%26mt_id%3D3203937%26mt_exid%3Dbrx%26mt_adid%3D152931%26mt_stid%3D111666111%5D%5D%3E%3C%2FTracking%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%3CTracking%20event%3D%22pause%22%3E%3C!%5BCDATA%5Bhttps%3A%2F%2Fpixel.mathtag.com%2Fvideo%2Fimg%3Fcb%3D8541700239826312192%26mt_aid%3D123%26event%3Dpause%26mt_id%3D3203937%26mt_exid%3Dbrx%26mt_adid%3D152931%26mt_stid%3D111666111%5D%5D%3E%3C%2FTracking%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%3CTracking%20event%3D%22firstQuartile%22%3E%3C!%5BCDATA%5Bhttps%3A%2F%2Fpixel.mathtag.com%2Fvideo%2Fimg%3Fcb%3D8541700239826312192%26mt_aid%3D123%26event%3Dq1%26mt_id%3D3203937%26mt_exid%3Dbrx%26mt_adid%3D152931%26mt_stid%3D111666111%5D%5D%3E%3C%2FTracking%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%3C%2FTrackingEvents%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%3CVideoClicks%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%3CClickThrough%3E%3C!%5BCDATA%5Bhttps%3A%2F%2Fwww.mediamath.com%5D%5D%3E%3C%2FClickThrough%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%3CClickTracking%3E%3C!%5BCDATA%5Bhttps%3A%2F%2Fpixel.mathtag.com%2Fclick%2Fimg%3Fcb%3D8541700239826312192%26mt_aid%3D123%26event%3Dclick%26mt_id%3D3203937%26mt_exid%3Dbrx%26mt_adid%3D152931%26mt_stid%3D111666111%5D%5D%3E%3C%2FClickTracking%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%3C%2FVideoClicks%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%3CMediaFiles%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%3CMediaFile%20type%3D%22video%2Fmp4%22%20bitrate%3D%22652%22%20delivery%3D%22progressive%22%20width%3D%22320%22%20height%3D%22180%22%20scalable%3D%22true%22%20maintainAspectRatio%3D%22true%22%3E%3C!%5BCDATA%5Bhttps%3A%2F%2Fvideo-assets.mathtag.com%2Feeb831a1-f696-4973-b0dc-23fff5c54e51.mp4%5D%5D%3E%3C%2FMediaFile%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%3CMediaFile%20type%3D%22video%2Fmp4%22%20bitrate%3D%221031%22%20delivery%3D%22progressive%22%20width%3D%22640%22%20height%3D%22360%22%20scalable%3D%22true%22%20maintainAspectRatio%3D%22true%22%3E%3C!%5BCDATA%5Bhttps%3A%2F%2Fvideo-assets.mathtag.com%2F4307c046-72e4-495e-a713-750f0d2a54e6.mp4%5D%5D%3E%3C%2FMediaFile%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%3CMediaFile%20type%3D%22video%2Fx-flv%22%20bitrate%3D%221047%22%20delivery%3D%22progressive%22%20width%3D%22854%22%20height%3D%22480%22%20scalable%3D%22true%22%20maintainAspectRatio%3D%22true%22%3E%3C!%5BCDATA%5Bhttps%3A%2F%2Fvideo-assets.mathtag.com%2F73b3fe69-df73-4732-a512-6c1131c8fcc3.flv%5D%5D%3E%3C%2FMediaFile%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%3CMediaFile%20type%3D%22video%2Fx-flv%22%20bitrate%3D%22688%22%20delivery%3D%22progressive%22%20width%3D%22480%22%20height%3D%22268%22%20scalable%3D%22true%22%20maintainAspectRatio%3D%22true%22%3E%3C!%5BCDATA%5Bhttps%3A%2F%2Fvideo-assets.mathtag.com%2F9281c04f-590f-437a-8325-06c790f8a57b.flv%5D%5D%3E%3C%2FMediaFile%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%3CMediaFile%20type%3D%22video%2Fx-flv%22%20bitrate%3D%222521%22%20delivery%3D%22progressive%22%20width%3D%22960%22%20height%3D%22540%22%20scalable%3D%22true%22%20maintainAspectRatio%3D%22true%22%3E%3C!%5BCDATA%5Bhttps%3A%2F%2Fvideo-assets.mathtag.com%2Fb8328245-a4ac-43ff-b418-8f692116e158.flv%5D%5D%3E%3C%2FMediaFile%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%3CMediaFile%20type%3D%22video%2Fmp4%22%20bitrate%3D%22580%22%20delivery%3D%22progressive%22%20width%3D%22320%22%20height%3D%22180%22%20scalable%3D%22true%22%20maintainAspectRatio%3D%22true%22%3E%3C!%5BCDATA%5Bhttps%3A%2F%2Fvideo-assets.mathtag.com%2F27642a3a-54fc-4ece-9ded-97cb13a0702c.mp4%5D%5D%3E%3C%2FMediaFile%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%3CMediaFile%20type%3D%22video%2Fmp4%22%20bitrate%3D%22687%22%20delivery%3D%22progressive%22%20width%3D%22480%22%20height%3D%22270%22%20scalable%3D%22true%22%20maintainAspectRatio%3D%22true%22%3E%3C!%5BCDATA%5Bhttps%3A%2F%2Fvideo-assets.mathtag.com%2Fc3f0d3fd-e867-43b0-a5d9-d3ec1ea6479b.mp4%5D%5D%3E%3C%2FMediaFile%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%3CMediaFile%20type%3D%22video%2Fx-flv%22%20bitrate%3D%221034%22%20delivery%3D%22progressive%22%20width%3D%22640%22%20height%3D%22360%22%20scalable%3D%22true%22%20maintainAspectRatio%3D%22true%22%3E%3C!%5BCDATA%5Bhttps%3A%2F%2Fvideo-assets.mathtag.com%2F67d5a35e-520d-4fe6-a3c5-9cbe9f5714bd.flv%5D%5D%3E%3C%2FMediaFile%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%3CMediaFile%20type%3D%22video%2Fx-flv%22%20bitrate%3D%22653%22%20delivery%3D%22progressive%22%20width%3D%22320%22%20height%3D%22180%22%20scalable%3D%22true%22%20maintainAspectRatio%3D%22true%22%3E%3C!%5BCDATA%5Bhttps%3A%2F%2Fvideo-assets.mathtag.com%2F1b1a3871-92f0-43a1-9991-7a603f67d09d.flv%5D%5D%3E%3C%2FMediaFile%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%3CMediaFile%20type%3D%22video%2Fmp4%22%20bitrate%3D%22390%22%20delivery%3D%22progressive%22%20width%3D%22960%22%20height%3D%22540%22%20scalable%3D%22true%22%20maintainAspectRatio%3D%22true%22%3E%3C!%5BCDATA%5Bhttps%3A%2F%2Fvideo-assets.mathtag.com%2F17d6ba6d-f717-42b1-9112-262655f25acb.mp4%5D%5D%3E%3C%2FMediaFile%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%3CMediaFile%20type%3D%22video%2Fx-flv%22%20bitrate%3D%221012%22%20delivery%3D%22progressive%22%20width%3D%22480%22%20height%3D%22268%22%20scalable%3D%22true%22%20maintainAspectRatio%3D%22true%22%3E%3C!%5BCDATA%5Bhttps%3A%2F%2Fvideo-assets.mathtag.com%2Fc452419f-e431-438a-b563-0d6f01446cda.flv%5D%5D%3E%3C%2FMediaFile%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%3CMediaFile%20type%3D%22video%2Fx-flv%22%20bitrate%3D%223629%22%20delivery%3D%22progressive%22%20width%3D%22960%22%20height%3D%22540%22%20scalable%3D%22true%22%20maintainAspectRatio%3D%22true%22%3E%3C!%5BCDATA%5Bhttps%3A%2F%2Fvideo-assets.mathtag.com%2Fefc644bb-db73-4d06-bba1-93d2b27b8381.flv%5D%5D%3E%3C%2FMediaFile%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%3CMediaFile%20type%3D%22video%2Fmp4%22%20bitrate%3D%221043%22%20delivery%3D%22progressive%22%20width%3D%22854%22%20height%3D%22480%22%20scalable%3D%22true%22%20maintainAspectRatio%3D%22true%22%3E%3C!%5BCDATA%5Bhttps%3A%2F%2Fvideo-assets.mathtag.com%2Fe3a3cb24-2d45-430a-8c91-0746f9f931f7.mp4%5D%5D%3E%3C%2FMediaFile%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%3CMediaFile%20type%3D%22video%2Fmp4%22%20bitrate%3D%22998%22%20delivery%3D%22progressive%22%20width%3D%22480%22%20height%3D%22270%22%20scalable%3D%22true%22%20maintainAspectRatio%3D%22true%22%3E%3C!%5BCDATA%5Bhttps%3A%2F%2Fvideo-assets.mathtag.com%2F93224f61-eae8-42ce-a157-c6432fe0f039.mp4%5D%5D%3E%3C%2FMediaFile%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%3CMediaFile%20type%3D%22video%2Fx-flv%22%20bitrate%3D%22693%22%20delivery%3D%22progressive%22%20width%3D%22640%22%20height%3D%22360%22%20scalable%3D%22true%22%20maintainAspectRatio%3D%22true%22%3E%3C!%5BCDATA%5Bhttps%3A%2F%2Fvideo-assets.mathtag.com%2Fac3e97c3-9a81-4b90-81f8-1ef143225320.flv%5D%5D%3E%3C%2FMediaFile%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%3CMediaFile%20type%3D%22video%2Fmp4%22%20bitrate%3D%223791%22%20delivery%3D%22progressive%22%20width%3D%22854%22%20height%3D%22480%22%20scalable%3D%22true%22%20maintainAspectRatio%3D%22true%22%3E%3C!%5BCDATA%5Bhttps%3A%2F%2Fvideo-assets.mathtag.com%2Fd93f9c7d-7853-442b-992b-9a99577d46fd.mp4%5D%5D%3E%3C%2FMediaFile%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%3CMediaFile%20type%3D%22video%2Fmp4%22%20bitrate%3D%222518%22%20delivery%3D%22progressive%22%20width%3D%22960%22%20height%3D%22540%22%20scalable%3D%22true%22%20maintainAspectRatio%3D%22true%22%3E%3C!%5BCDATA%5Bhttps%3A%2F%2Fvideo-assets.mathtag.com%2F2285a84f-e9ed-4c6f-84e6-caa40c88d3de.mp4%5D%5D%3E%3C%2FMediaFile%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%3CMediaFile%20type%3D%22video%2Fx-flv%22%20bitrate%3D%22581%22%20delivery%3D%22progressive%22%20width%3D%22320%22%20height%3D%22180%22%20scalable%3D%22true%22%20maintainAspectRatio%3D%22true%22%3E%3C!%5BCDATA%5Bhttps%3A%2F%2Fvideo-assets.mathtag.com%2Fd7dd0fc5-4b6e-4b21-83f1-bb35c1dd0a43.flv%5D%5D%3E%3C%2FMediaFile%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%3CMediaFile%20type%3D%22video%2Fmp4%22%20bitrate%3D%222510%22%20delivery%3D%22progressive%22%20width%3D%22640%22%20height%3D%22360%22%20scalable%3D%22true%22%20maintainAspectRatio%3D%22true%22%3E%3C!%5BCDATA%5Bhttps%3A%2F%2Fvideo-assets.mathtag.com%2F31012e37-397e-4b7e-8f53-176e1e15f212.mp4%5D%5D%3E%3C%2FMediaFile%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%3CMediaFile%20type%3D%22video%2Fx-flv%22%20bitrate%3D%223794%22%20delivery%3D%22progressive%22%20width%3D%22854%22%20height%3D%22480%22%20scalable%3D%22true%22%20maintainAspectRatio%3D%22true%22%3E%3C!%5BCDATA%5Bhttps%3A%2F%2Fvideo-assets.mathtag.com%2F543aff98-d869-4b70-b130-3a12ad505409.flv%5D%5D%3E%3C%2FMediaFile%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%3CMediaFile%20type%3D%22video%2Fmp4%22%20bitrate%3D%223625%22%20delivery%3D%22progressive%22%20width%3D%22960%22%20height%3D%22540%22%20scalable%3D%22true%22%20maintainAspectRatio%3D%22true%22%3E%3C!%5BCDATA%5Bhttps%3A%2F%2Fvideo-assets.mathtag.com%2Fea9c53f0-a884-4d5e-b44c-07cf745c94f1.mp4%5D%5D%3E%3C%2FMediaFile%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%3CMediaFile%20type%3D%22video%2Fwebm%22%20bitrate%3D%22460%22%20delivery%3D%22progressive%22%20width%3D%22640%22%20height%3D%22360%22%20scalable%3D%22true%22%20maintainAspectRatio%3D%22true%22%3E%3C!%5BCDATA%5Bhttps%3A%2F%2Fvideo-assets.mathtag.com%2F3886d5ca-b4d2-462a-9aef-9d0a6dc4a4a9.webm%5D%5D%3E%3C%2FMediaFile%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%3CMediaFile%20type%3D%22video%2Fmp4%22%20bitrate%3D%22690%22%20delivery%3D%22progressive%22%20width%3D%22640%22%20height%3D%22360%22%20scalable%3D%22true%22%20maintainAspectRatio%3D%22true%22%3E%3C!%5BCDATA%5Bhttps%3A%2F%2Fvideo-assets.mathtag.com%2Fb15f1239-3152-4823-a475-3ac547987c09.mp4%5D%5D%3E%3C%2FMediaFile%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%3CMediaFile%20type%3D%22video%2Fwebm%22%20bitrate%3D%22642%22%20delivery%3D%22progressive%22%20width%3D%22960%22%20height%3D%22540%22%20scalable%3D%22true%22%20maintainAspectRatio%3D%22true%22%3E%3C!%5BCDATA%5Bhttps%3A%2F%2Fvideo-assets.mathtag.com%2F495011d1-1116-4d46-8eb8-b98f4f125d3f.webm%5D%5D%3E%3C%2FMediaFile%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%3CMediaFile%20type%3D%22video%2Fx-flv%22%20bitrate%3D%222513%22%20delivery%3D%22progressive%22%20width%3D%22640%22%20height%3D%22360%22%20scalable%3D%22true%22%20maintainAspectRatio%3D%22true%22%3E%3C!%5BCDATA%5Bhttps%3A%2F%2Fvideo-assets.mathtag.com%2Fa88c5c98-4c54-4f1a-ae43-3dd5045765f8.flv%5D%5D%3E%3C%2FMediaFile%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%3C%2FMediaFiles%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%3C%2FLinear%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%3C%2FCreative%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%3CCreative%20id%3D%223203937_companion%22%20sequence%3D%220%22%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%3CCompanionAds%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%3CCompanion%20id%3D%22unity_brand_endcard_portrait%22%20width%3D%22250%22%20height%3D%22350%22%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%3CStaticResource%20creativeType%3D%22image%2Fpng%22%3E%3C!%5BCDATA%5Bhttp%3A%2F%2Flocalhost%3A8000%2FPM_16441-RD-en_US-320x480%402X.jpg%5D%5D%3E%3C%2FStaticResource%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%3CTrackingEvents%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%3CTracking%20event%3D%22creativeView%22%3E%3C!%5BCDATA%5Bhttps%3A%2F%2Fpixel.mathtag.com%2Fvideo%2Fimg%3Fcb%3D8541700239826312192%26mt_uuid%3D83d5ca41-447b-4650-a4a1-745fa218e1e1%26mt_cmid%3D1%26mt_aid%3D123%26event%3DcompanionImpression%26mt_id%3D3203937%26mt_exid%3Dbrx%26mt_adid%3D152931%26mt_stid%3D111666111%5D%5D%3E%3C%2FTracking%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%3C%2FTrackingEvents%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%3CCompanionClickThrough%3E%3C!%5BCDATA%5Bhttps%3A%2F%2Fpixel.mathtag.com%2Fvideo%2Fimg%3Fcb%3D8541700239826312192%26mt_uuid%3D5f4b3c36-7d38-407f-9969-09436e434473%26mt_cmid%3D1%26redir%3Dhttps%253A%252F%252Fwww.mediamath.com%26mt_aid%3D123%26event%3DcompanionClick%26mt_id%3D3203937%26mt_exid%3Dbrx%26mt_adid%3D152931%26mt_stid%3D111666111%5D%5D%3E%3C%2FCompanionClickThrough%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%3C%2FCompanion%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%3CCompanion%20id%3D%22unity_brand_endcard_landscape%22%20width%3D%22350%22%20height%3D%22250%22%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%3CStaticResource%20creativeType%3D%22image%2Fpng%22%3E%3C!%5BCDATA%5Bhttp%3A%2F%2Flocalhost%3A8000%2FPM_16441-RD-en_US-480x320%402X.jpg%5D%5D%3E%3C%2FStaticResource%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%3CTrackingEvents%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%3CTracking%20event%3D%22creativeView%22%3E%3C!%5BCDATA%5Bhttps%3A%2F%2Fpixel.mathtag.com%2Fvideo%2Fimg%3Fcb%3D8541700239826312192%26mt_uuid%3D83d5ca41-447b-4650-a4a1-745fa218e1e1%26mt_cmid%3D1%26mt_aid%3D123%26event%3DcompanionImpression%26mt_id%3D3203937%26mt_exid%3Dbrx%26mt_adid%3D152931%26mt_stid%3D111666111%5D%5D%3E%3C%2FTracking%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%3C%2FTrackingEvents%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%3CCompanionClickThrough%3E%3C!%5BCDATA%5Bhttps%3A%2F%2Fpixel.mathtag.com%2Fvideo%2Fimg%3Fcb%3D8541700239826312192%26mt_uuid%3D5f4b3c36-7d38-407f-9969-09436e434473%26mt_cmid%3D1%26redir%3Dhttps%253A%252F%252Fwww.mediamath.com%26mt_aid%3D123%26event%3DcompanionClick%26mt_id%3D3203937%26mt_exid%3Dbrx%26mt_adid%3D152931%26mt_stid%3D111666111%5D%5D%3E%3C%2FCompanionClickThrough%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%3C%2FCompanion%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%3CCompanion%20id%3D%22companion_1%22%20width%3D%22350%22%20height%3D%22250%22%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%3CStaticResource%20creativeType%3D%22image%2Fpng%22%3E%3C!%5BCDATA%5Bhttps%3A%2F%2Fs3.amazonaws.com%2Fmm-video-assets-us-east-1%2Ff41954f3caf2466d47b558004fb520e7.png%5D%5D%3E%3C%2FStaticResource%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%3CTrackingEvents%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%3CTracking%20event%3D%22creativeView%22%3E%3C!%5BCDATA%5Bhttps%3A%2F%2Fpixel.mathtag.com%2Fvideo%2Fimg%3Fcb%3D8541700239826312192%26mt_uuid%3D83d5ca41-447b-4650-a4a1-745fa218e1e1%26mt_cmid%3D1%26mt_aid%3D123%26event%3DcompanionImpression%26mt_id%3D3203937%26mt_exid%3Dbrx%26mt_adid%3D152931%26mt_stid%3D111666111%5D%5D%3E%3C%2FTracking%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%3C%2FTrackingEvents%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%3CCompanionClickThrough%3E%3C!%5BCDATA%5Bhttps%3A%2F%2Fpixel.mathtag.com%2Fvideo%2Fimg%3Fcb%3D8541700239826312192%26mt_uuid%3D5f4b3c36-7d38-407f-9969-09436e434473%26mt_cmid%3D1%26redir%3Dhttps%253A%252F%252Fwww.mediamath.com%26mt_aid%3D123%26event%3DcompanionClick%26mt_id%3D3203937%26mt_exid%3Dbrx%26mt_adid%3D152931%26mt_stid%3D111666111%5D%5D%3E%3C%2FCompanionClickThrough%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%3C%2FCompanion%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%3C%2FCompanionAds%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%3C%2FCreative%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%3C%2FCreatives%3E%0A%20%20%20%20%20%20%20%20%3C%2FInLine%3E%0A%20%20%20%20%3C%2FAd%3E%0A%3C%2FVAST%3E",
    "tracking": {
      "start": null,
      "firstQuartile": null,
      "midpoint": null,
      "thirdQuartile": null,
      "complete": null,
      "click": null
    }
  }
}`;

                const campaignJson: any = JsonParser.parse(response.response);
                if(campaignJson.gamerId) {
                    this.storeGamerId(campaignJson.gamerId);
                }
                if (campaignJson.campaign) {
                    this._nativeBridge.Sdk.logInfo('Unity Ads server returned game advertisement for AB Group ' + campaignJson.abGroup);
                    const campaign = new Campaign(campaignJson.campaign, campaignJson.gamerId, campaignJson.abGroup);
                    let resource: string | undefined;
                    switch(campaign.getGameId()) {
                        case 11326: // Game of War iOS
                            resource = 'https://static.applifier.com/playables/SG_ios/index_ios.html';
                            break;

                        case 13480: // Game of War Android
                            resource = 'https://static.applifier.com/playables/SG_android/index_android.html';
                            break;

                        case 53872: // Mobile Strike iOS
                            resource = 'https://static.applifier.com/playables/SMA_ios/index_ios.html';
                            break;

                        case 52447: // Mobile Strike Android
                            resource = 'https://static.applifier.com/playables/SMA_android/index_android.html';
                            break;

                        default:
                            break;
                    }

                    const abGroup = campaign.getAbGroup();
                    if(resource && (abGroup === 10 || abGroup === 11 || abGroup === 12 || abGroup === 13)) {
                        const htmlCampaign = new HtmlCampaign(campaignJson.campaign, campaignJson.gamerId, campaignJson.abGroup, resource);
                        this.onThirdPartyCampaign.trigger(htmlCampaign);
                    } else {
                        this.onCampaign.trigger(campaign);
                    }
                } else if('vast' in campaignJson) {
                    if (campaignJson.vast === null) {
                        this._nativeBridge.Sdk.logInfo('Unity Ads server returned no fill');
                        this.onNoFill.trigger(3600);
                        return;
                    }
                    this._nativeBridge.Sdk.logInfo('Unity Ads server returned VAST advertisement for AB Group ' + campaignJson.abGroup);
                    const decodedVast = decodeURIComponent(campaignJson.vast.data).trim();
                    return this._vastParser.retrieveVast(decodedVast, this._nativeBridge, this._request).then(vast => {
                        let campaignId: string;
                        if(this._nativeBridge.getPlatform() === Platform.IOS) {
                            campaignId = '00005472656d6f7220694f53';
                        } else if(this._nativeBridge.getPlatform() === Platform.ANDROID) {
                            campaignId = '005472656d6f7220416e6472';
                        } else {
                            campaignId = 'UNKNOWN';
                        }
                        const campaign = new VastCampaign(vast, campaignId, campaignJson.gamerId, CampaignManager.AbGroup ? CampaignManager.AbGroup : campaignJson.abGroup, campaignJson.cacheTTL, campaignJson.vast.tracking);
                        if (campaign.getVast().getImpressionUrls().length === 0) {
                            this.onError.trigger(new Error('Campaign does not have an impression url'));
                            return;
                        }
                        // todo throw an Error if required events are missing. (what are the required events?)
                        if (campaign.getVast().getErrorURLTemplates().length === 0) {
                            this._nativeBridge.Sdk.logWarning(`Campaign does not have an error url for game id ${this._clientInfo.getGameId()}`);
                        }
                        if (!campaign.getVideoUrl()) {
                            const videoUrlError = new DiagnosticError(
                                new Error('Campaign does not have a video url'),
                                { rootWrapperVast: campaignJson.vast }
                            );
                            this.onError.trigger(videoUrlError);
                            return;
                        }
                        this.onVastCampaign.trigger(campaign);
                    }).catch((error) => {
                        this.onError.trigger(error);
                    });
                } else {
                    this._nativeBridge.Sdk.logInfo('Unity Ads server returned no fill');
                    this.onNoFill.trigger(3600); // default to retry in one hour, this value should be set by server
                }
                return;
            });
        }).catch((error) => {
            this.onError.trigger(error);
        });
    }

    private createRequestUrl(): Promise<string> {
        let url: string = [
            CampaignManager.CampaignBaseUrl,
            this._clientInfo.getGameId(),
            'fill'
        ].join('/');

        if(this._deviceInfo.getAdvertisingIdentifier()) {
            url = Url.addParameters(url, {
                advertisingTrackingId: this._deviceInfo.getAdvertisingIdentifier(),
                limitAdTracking: this._deviceInfo.getLimitAdTracking()
            });
        } else if(this._clientInfo.getPlatform() === Platform.ANDROID) {
            url = Url.addParameters(url, {
                androidId: this._deviceInfo.getAndroidId()
            });
        }

        url = Url.addParameters(url, {
            deviceMake: this._deviceInfo.getManufacturer(),
            deviceModel: this._deviceInfo.getModel(),
            platform: Platform[this._clientInfo.getPlatform()].toLowerCase(),
            screenDensity: this._deviceInfo.getScreenDensity(),
            screenWidth: this._deviceInfo.getScreenWidth(),
            screenHeight: this._deviceInfo.getScreenHeight(),
            sdkVersion: this._clientInfo.getSdkVersion(),
            screenSize: this._deviceInfo.getScreenLayout()
        });

        if(this._clientInfo.getPlatform() === Platform.IOS) {
            url = Url.addParameters(url, {
                osVersion: this._deviceInfo.getOsVersion()
            });
        } else {
            url = Url.addParameters(url, {
                apiLevel: this._deviceInfo.getApiLevel()
            });
        }

        if(this._clientInfo.getTestMode()) {
            url = Url.addParameters(url, {test: true});
        }

        const promises: Promise<any>[] = [];
        promises.push(this._deviceInfo.getConnectionType());
        promises.push(this._deviceInfo.getNetworkType());
        promises.push(this.fetchGamerId());

        return Promise.all(promises).then(([connectionType, networkType, gamerId]) => {
            url = Url.addParameters(url, {
                connectionType: connectionType,
                networkType: networkType,
                gamerId: gamerId
            });

            return url;
        });
    }

    private createRequestBody(): Promise<string> {
        const promises: Promise<any>[] = [];
        promises.push(this._deviceInfo.getFreeSpace());
        promises.push(this._deviceInfo.getNetworkOperator());
        promises.push(this._deviceInfo.getNetworkOperatorName());

        const body: any = {
            bundleVersion: this._clientInfo.getApplicationVersion(),
            bundleId: this._clientInfo.getApplicationName(),
            language: this._deviceInfo.getLanguage(),
            timeZone: this._deviceInfo.getTimeZone(),
        };

        if(typeof navigator !== 'undefined' && navigator.userAgent) {
            body.webviewUa = navigator.userAgent;
        }

        return Promise.all(promises).then(([freeSpace, networkOperator, networkOperatorName]) => {
            body.deviceFreeSpace = freeSpace;
            body.networkOperator = networkOperator;
            body.networkOperatorName = networkOperatorName;

            return MetaDataManager.fetchMediationMetaData(this._nativeBridge).then(mediation => {
                if(mediation) {
                    body.mediationName = mediation.getName();
                    body.mediationVersion = mediation.getVersion();
                    if(mediation.getOrdinal()) {
                        body.mediationOrdinal = mediation.getOrdinal();
                    }
                }

                return JSON.stringify(body);
            });
        });
    }

    private fetchGamerId(): Promise<string> {
        return this._nativeBridge.Storage.get<string>(StorageType.PRIVATE, 'gamerId').then(gamerId => {
            return gamerId;
        }).catch(error => {
            return undefined;
        });
    }

    private storeGamerId(gamerId: string): Promise<void[]> {
        return Promise.all([
            this._nativeBridge.Storage.set(StorageType.PRIVATE, 'gamerId', gamerId),
            this._nativeBridge.Storage.write(StorageType.PRIVATE)
        ]);
    }

}
