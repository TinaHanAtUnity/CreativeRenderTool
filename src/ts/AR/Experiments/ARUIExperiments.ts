import { AUIMetric, ProgrammaticTrackingService } from 'Ads/Utilities/ProgrammaticTrackingService';
import { AutomatedExperimentManager } from 'Ads/Managers/AutomatedExperimentManager';
import { ARAvailableButtonColors } from 'AR/Experiments/ARAvailableButtonColors'
import { ARAvailableButtonColorsExperiment } from 'Ads/Models/AutomatedExperimentsList'

export interface ARUIExperiments {
    arAvailableButtonColor?: string;
}

export function arAvailableButtonExperiment(automatedExperimentManager: AutomatedExperimentManager): ARUIExperiments {
    let arAvailableButtonColor = ARAvailableButtonColors.BLACK;

    const mabDecision = automatedExperimentManager.getExperimentAction(ARAvailableButtonColorsExperiment);

    if (mabDecision) {
        if ((<string[]>Object.values(ARAvailableButtonColors)).includes(mabDecision)) {
            arAvailableButtonColor = <ARAvailableButtonColors>mabDecision;
        } else {
            ProgrammaticTrackingService.reportMetricEvent(AUIMetric.InvalidEndscreenAnimation);
        }
    }

    return {
        arAvailableButtonColor,
    }
}
