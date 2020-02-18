import { AutomatedExperiment } from 'Ads/Models/AutomatedExperiment';
import { EndScreenAnimation } from 'Performance/Views/AnimatedDownloadButtonEndScreen';
import { ARAvailableButtonColors } from 'AR/Experiments/ARAvailableButtonColors'

// List experiments to run here and add them to the list
// Examples:
// export const FooExperiment = new AutomatedExperiment({
//     name: 'FooExperiment',
//     actions: ['FooAction1', 'FooAction2'],
//     defaultAction: 'FooAction1'
// });
// export const BarExperiment = new AutomatedExperiment({
//     name: 'BarExperiment',
//     actions: ['BarAction1', 'BarAction2'],
//     defaultAction: 'BarAction2',
//     cacheDisabled: true
// });

export const ButtonAnimationsExperiment = new AutomatedExperiment({
    name: 'ButtonAnimationsExperiment',
    actions: Object.values(EndScreenAnimation),
    defaultAction: EndScreenAnimation.STATIC,
    cacheDisabled: true
});

export const AutomatedExperimentsList: AutomatedExperiment[] = [ButtonAnimationsExperiment];

// AR Ads

export const ARAvailableButtonColorsExperiment = new AutomatedExperiment({
    name: 'wbvw-ar-v1',
    actions: Object.values(ARAvailableButtonColors),
    defaultAction: ARAvailableButtonColors.BLACK,
    cacheDisabled: true
});

export const ARAvailableButtonSkipExperiment = new AutomatedExperiment({
    name: 'wbvw-ar-v1',
    actions: ['true', 'false'],
    defaultAction: 'false',
    cacheDisabled: true
});

export const ArAutomatedExperimentsList: AutomatedExperiment[] = [ARAvailableButtonColorsExperiment, ARAvailableButtonSkipExperiment];
