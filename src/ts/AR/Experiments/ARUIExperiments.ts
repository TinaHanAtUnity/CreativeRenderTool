import { AUIMetric, ProgrammaticTrackingService } from 'Ads/Utilities/ProgrammaticTrackingService';
import { AutomatedExperimentManager } from 'Ads/Managers/AutomatedExperimentManager';
import { ARAvailableButtonColors } from 'AR/Experiments/ARAvailableButtonColors'
import { ARAvailableButtonColorsExperiment, ARAvailableButtonSkipExperiment } from 'Ads/Models/AutomatedExperimentsList'

export interface ARUIExperiments {
    arAvailableButtonColor?: string;
    arAvailableButtonSkipText?: string;
}

export function arAvailableButtonColorExperiment(automatedExperimentManager: AutomatedExperimentManager): ARAvailableButtonColors {
    let arAvailableButtonColor = ARAvailableButtonColors.BLACK;

    const mabDecision = automatedExperimentManager.getExperimentAction(ARAvailableButtonColorsExperiment);

    if (mabDecision) {
        if ((<string[]>Object.values(ARAvailableButtonColors)).includes(mabDecision)) {
            arAvailableButtonColor = <ARAvailableButtonColors>mabDecision;
        } else {
            ProgrammaticTrackingService.reportMetricEvent(AUIMetric.InvalidEndscreenAnimation);
        }
    }

    return arAvailableButtonColor;
}

export function arAvailableButtonSkipTextExperiment(automatedExperimentManager: AutomatedExperimentManager): string {
    let arAvailableButtonSkipText = 'false';

    const mabDecision = automatedExperimentManager.getExperimentAction(ARAvailableButtonSkipExperiment);

    if (mabDecision) {
        if (['true', 'false'].includes(mabDecision)) {
            arAvailableButtonSkipText = mabDecision;
        } else {
            ProgrammaticTrackingService.reportMetricEvent(AUIMetric.InvalidEndscreenAnimation);
        }
    }

    return arAvailableButtonSkipText;
}
