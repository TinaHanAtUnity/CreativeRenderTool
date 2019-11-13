import { IEndScreenParameters } from 'Ads/Views/EndScreen';
import { PerformanceCampaign } from 'Performance/Models/PerformanceCampaign';
import OmnivirtEndScreenTemplate from 'html/EndScreenOmnivirt.html';
import { PerformanceEndScreen } from 'Performance/Views/PerformanceEndScreen';

const SQUARE_END_SCREEN = 'square-end-screen';

export class OmnivirtPerformanceEndScreen extends PerformanceEndScreen {

    private _omnivirtAid: string;
    private _omnivirtContainer: HTMLElement | null;

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

    protected getEndscreenAlt(): string | undefined {
        return SQUARE_END_SCREEN;
    }

    public show() {
        super.show();
        this._omnivirtContainer!.style.visibility = 'visible';
    }

    public render() {
        super.render();

        if (!this._omnivirtContainer) {
            this.createIframe();
            this.injectOmnivirtCode();
        }
    }

    private createIframe() {
        const omnivirtFrame = document.createElement('iframe');
        omnivirtFrame.id = 'omnivirt-RMg-' + this._omnivirtAid;
        omnivirtFrame.frameBorder = '0';

        this._omnivirtContainer = this._container.querySelector('.omnivirt-container');
        this._omnivirtContainer!.style.visibility = 'hidden';
        this._omnivirtContainer!.appendChild(omnivirtFrame);
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
