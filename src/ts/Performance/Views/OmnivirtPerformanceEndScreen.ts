import { IEndScreenParameters } from 'Ads/Views/EndScreen';
import { PerformanceCampaign } from 'Performance/Models/PerformanceCampaign';
import OmnivirtEndScreenTemplate from 'html/EndScreenOmnivirt.html';
import { PerformanceEndScreen } from 'Performance/Views/PerformanceEndScreen';
import { HttpKafka, KafkaCommonObjectType } from 'Core/Utilities/HttpKafka';

export class OmnivirtPerformanceEndScreen extends PerformanceEndScreen {

    private _omnivirtAid: string;

    constructor(parameters: IEndScreenParameters, campaign: PerformanceCampaign, omnivirtAid: string, country?: string) {
        super(parameters, campaign, country);

        this._omnivirtAid = omnivirtAid;

        this._templateData.backgroundUrl = 'https://cdn.omnivirt.com/3dbimg/' + this._omnivirtAid;

        this._bindings.push({
            event: 'click',
            listener: (event: Event) => this.onDownloadEvent(event),
            selector: '.omnivirt-placeholder'
        });
    }

    protected getTemplate() {
        return OmnivirtEndScreenTemplate;
    }

    public show() {
        super.show();
        this.showOmnivirt();

        const kafkaObject: { [key: string]: unknown } = {};
        kafkaObject.type = 'omnivirt_endscreen_loaded';
        kafkaObject.auctionId = this._campaign.getSession().getId();
        kafkaObject.gameId = this._campaign.getGameId();
        kafkaObject.omnivirtAid = this._omnivirtAid;

        HttpKafka.sendEvent('aui.experiments.omnivirt', KafkaCommonObjectType.ANONYMOUS, kafkaObject);
    }

    private showOmnivirt() {
        this.createIframe();
        this.injectOmnivirtCode();
    }

    private createIframe() {
        const omnivirtFrame = document.createElement('iframe');
        omnivirtFrame.id = 'omnivirt-RMg-' + this._omnivirtAid;
        omnivirtFrame.frameBorder = '0';

        const container = document.getElementById('omnivirt-container');
        if (container) {
            container.appendChild(omnivirtFrame);
        }
    }

    private injectOmnivirtCode() {
        const firstScriptTag = document.getElementsByTagName('script')[0];
        const omnivirtScript = document.createElement('script');
        omnivirtScript.type = 'text/javascript';
        omnivirtScript.async = true;
        omnivirtScript.onload = () => {
            // @ts-ignore
            OmniVirt3D.setup(`#omnivirt-RMg-${this._omnivirtAid}`, { aid: this._omnivirtAid, insideIframe: true });
        };
        omnivirtScript.src = `https://cdn.omnivirt.com/3d-photo/script/${this._omnivirtAid}.js`;
        firstScriptTag.parentNode!.insertBefore(omnivirtScript, firstScriptTag);
    }
}
