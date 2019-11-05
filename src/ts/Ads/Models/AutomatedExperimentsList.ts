import { AutomatedExperiment } from 'Ads/Models/AutomatedExperiment';
import { EndScreenAnimation } from 'Performance/Views/AnimatedDownloadButtonEndScreen';

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
    actions: Object.keys(EndScreenAnimation).map(k => <EndScreenAnimation> k),
    defaultAction: EndScreenAnimation.static
});

export const AutomatedExperimentsList: AutomatedExperiment[] = [ButtonAnimationsExperiment];
