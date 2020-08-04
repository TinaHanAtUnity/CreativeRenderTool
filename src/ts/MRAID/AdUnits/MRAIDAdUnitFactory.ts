import { AbstractAdUnitFactory } from 'Ads/AdUnits/AbstractAdUnitFactory';
import { ARMRAID } from 'AR/Views/ARMRAID';
import { IMRAIDAdUnitParameters, MRAIDAdUnit } from 'MRAID/AdUnits/MRAIDAdUnit';
import { MRAIDCampaign } from 'MRAID/Models/MRAIDCampaign';
import { IMRAIDViewHandler } from 'MRAID/Views/MRAIDView';
import { PerformanceMRAIDCampaign } from 'Performance/Models/PerformanceMRAIDCampaign';
import { PerformanceMRAIDEventHandler } from 'MRAID/EventHandlers/PerformanceMRAIDEventHandler';
import { ProgrammaticMRAIDEventHandler } from 'MRAID/EventHandlers/ProgrammaticMRAIDEventHandler';
import { WebPlayerMRAIDAdUnit } from 'MRAID/AdUnits/WebPlayerMRAIDAdUnit';
import { CustomFeatures } from 'Ads/Utilities/CustomFeatures';
import { MraidWebplayer } from 'Core/Models/ABGroup';

export class MRAIDAdUnitFactory extends AbstractAdUnitFactory<MRAIDCampaign, IMRAIDAdUnitParameters> {
    public createAdUnit(parameters: IMRAIDAdUnitParameters): MRAIDAdUnit {

        const mraidAdUnit = this.getMRAIDAdUnit(parameters);
        const mraidEventHandler: IMRAIDViewHandler = this.getMRAIDEventHandler(mraidAdUnit, parameters);
        parameters.mraid.addEventHandler(mraidEventHandler);

        return mraidAdUnit;
    }

    private getMRAIDEventHandler(mraidAdUnit: MRAIDAdUnit, parameters: IMRAIDAdUnitParameters): IMRAIDViewHandler {

        const isPerformanceMRAID = parameters.campaign instanceof PerformanceMRAIDCampaign;
        const isARMRAID = parameters.mraid instanceof ARMRAID;
        const isProgrammaticWebPlayerTest = MraidWebplayer.isValid(parameters.coreConfig.getAbGroup()) && !isPerformanceMRAID && !isARMRAID;
        console.log('boolean 2: ' + isProgrammaticWebPlayerTest);

        if (isProgrammaticWebPlayerTest) {
            return new ProgrammaticMRAIDEventHandler(mraidAdUnit, parameters);
        } else {
            if (isPerformanceMRAID) {
                return new PerformanceMRAIDEventHandler(mraidAdUnit, parameters);
            } else {
                return new ProgrammaticMRAIDEventHandler(mraidAdUnit, parameters);
            }
        }
    }

    private getMRAIDAdUnit(parameters: IMRAIDAdUnitParameters): MRAIDAdUnit {
        let mraidAdUnit: MRAIDAdUnit;

        const isPerformanceMRAID = parameters.campaign instanceof PerformanceMRAIDCampaign;
        const isARMRAID = parameters.mraid instanceof ARMRAID;
        const isProgrammaticWebPlayerTest = MraidWebplayer.isValid(parameters.coreConfig.getAbGroup()) && !isPerformanceMRAID && !isARMRAID;
        console.log('boolean 3: ' + isProgrammaticWebPlayerTest);

        if (isProgrammaticWebPlayerTest) {
            mraidAdUnit = new WebPlayerMRAIDAdUnit(parameters);
        } else {
            mraidAdUnit = new MRAIDAdUnit(parameters);
        }

        return mraidAdUnit;
    }
}
