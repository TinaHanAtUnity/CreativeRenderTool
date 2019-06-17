import { AbstractAdUnitParametersFactory } from 'Ads/AdUnits/AdUnitParametersFactory';
import { IVastAdUnitParameters } from 'VAST/AdUnits/VastAdUnit';
import { VastCampaign } from 'VAST/Models/VastCampaign';
import { IAdUnitParameters } from 'Ads/AdUnits/AbstractAdUnit';
import { VastVideoOverlay } from 'Ads/Views/VastVideoOverlay';
import { VastEndScreen, IVastEndscreenParameters } from 'VAST/Views/VastEndScreen';
import { OpenMeasurement } from 'Ads/Views/OpenMeasurement';
import { OpenMeasurementTest } from 'Core/Models/ABGroup';

export class VastAdUnitParametersFactory extends AbstractAdUnitParametersFactory<VastCampaign, IVastAdUnitParameters> {
    protected createParameters(baseParams: IAdUnitParameters<VastCampaign>) {
        const overlay = new VastVideoOverlay(baseParams, baseParams.privacy, this.showGDPRBanner(baseParams));
        let vastEndScreen: VastEndScreen | undefined;

        const vastAdUnitParameters: IVastAdUnitParameters = {
            ... baseParams,
            video: baseParams.campaign.getVideo(),
            overlay: overlay
        };

        if(baseParams.campaign.hasEndscreen()) {
            const vastEndscreenParameters: IVastEndscreenParameters = {
                campaign: baseParams.campaign,
                clientInfo: baseParams.clientInfo,
                country: baseParams.coreConfig.getCountry()
            };

            vastEndScreen = new VastEndScreen(baseParams.platform, vastEndscreenParameters, baseParams.privacy);
            vastAdUnitParameters.endScreen = vastEndScreen;
        }

        const vastAd = baseParams.campaign.getVast().getAd();
        if(vastAd && vastAd.getAdVerification()) {
            const om = new OpenMeasurement(baseParams.platform, baseParams.core, baseParams.clientInfo, baseParams.campaign, baseParams.placement, baseParams.deviceInfo, baseParams.request, vastAd.getAdVerifications());
            om.addToViewHierarchy();
            om.injectAdVerifications();
            vastAdUnitParameters.om = om;
        }

        return vastAdUnitParameters;
    }
}
