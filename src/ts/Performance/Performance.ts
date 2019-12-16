import { IAds } from 'Ads/IAds';
import { IOnCampaignListener, implementsIOnCampaignListener } from 'Ads/Managers/CampaignManager';
import { Campaign, ICampaign, ICampaignTrackingUrls } from 'Ads/Models/Campaign';
import { AbstractParserModule, IContentTypeHandler } from 'Ads/Modules/AbstractParserModule';
import { IARApi } from 'AR/AR';
import { IChina } from 'China/IChina';
import { ICore } from 'Core/ICore';
import { MabDecisionButtonTest } from 'Core/Models/ABGroup';
import { Observable3 } from 'Core/Utilities/Observable';
import { MRAIDAdUnitFactory } from 'MRAID/AdUnits/MRAIDAdUnitFactory';
import { MRAIDAdUnitParametersFactory } from 'MRAID/AdUnits/MRAIDAdUnitParametersFactory';
import { PerformanceAdUnitFactory } from 'Performance/AdUnits/PerformanceAdUnitFactory';
import { PerformanceAdUnitParametersFactory } from 'Performance/AdUnits/PerformanceAdUnitParametersFactory';
import { PerformanceAdUnitWithAutomatedExperimentFactory } from 'Performance/AdUnits/PerformanceAdUnitWithAutomatedExperimentFactory';
import { PerformanceAdUnitWithAutomatedExperimentParametersFactory } from 'Performance/AdUnits/PerformanceAdUnitWithAutomatedExperimentParametersFactory';
import { CometCampaignParser } from 'Performance/Parsers/CometCampaignParser';

export class Performance extends AbstractParserModule implements IOnCampaignListener {
    constructor(ar: IARApi, core: ICore, ads: IAds, china?: IChina) {
        const contentTypeHandlerMap: { [key: string]: IContentTypeHandler } = {};
        const parser = new CometCampaignParser(core);

        let performanceFactory: PerformanceAdUnitFactory;
        if (MabDecisionButtonTest.isValid(core.Config.getAbGroup())) {
            performanceFactory = new PerformanceAdUnitWithAutomatedExperimentFactory(
                new PerformanceAdUnitWithAutomatedExperimentParametersFactory(core, china));
        } else {
            performanceFactory = new PerformanceAdUnitFactory(new PerformanceAdUnitParametersFactory(core, ads, china));
        }

        contentTypeHandlerMap[CometCampaignParser.ContentType] = {
            parser,
            factory: performanceFactory
        };
        contentTypeHandlerMap[CometCampaignParser.ContentTypeMRAID] = {
            parser,
            factory: new MRAIDAdUnitFactory(new MRAIDAdUnitParametersFactory(ar, core, ads))
        };
        super(contentTypeHandlerMap);
    }

    public listenOnCampaigns(onCampaign: Observable3<string, Campaign, ICampaignTrackingUrls | undefined>): void {
        for (const key in this._contentTypeHandlerMap) {
            if (this._contentTypeHandlerMap.hasOwnProperty(key)) {
                if (implementsIOnCampaignListener(this._contentTypeHandlerMap[key].factory)) {
                    (<IOnCampaignListener><unknown> this._contentTypeHandlerMap[key].factory).listenOnCampaigns(onCampaign);
                }
            }
        }
    }

}
