import { AutomatedExperiment, IExperimentDeclaration, IExperimentActionChoice } from 'Ads/Models/AutomatedExperiment';
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

export const ButtonExperimentDeclaration: IExperimentDeclaration = {
  animation: {
      STATIC: 'static',
      HEARTBEATING: 'heartbeating',
      BOUNCING: 'bouncing',
      SHINING: 'shining'
  },
  color: {
      BLUE: '167dfb',
      GREEN: '33cc00',
      PINK: 'cc0099',
      RED: 'c31e25'
  }
};

export const ButtonExperimentDefaultActions: IExperimentActionChoice = {
  color: ButtonExperimentDeclaration.color.BLUE,
  animation: ButtonExperimentDeclaration.animation.STATIC
};

export const ButtonAnimationsExperiment = new AutomatedExperiment({
    name: 'wbvw-endcard-v1',
    actions: ButtonExperimentDeclaration,
    defaultActions: ButtonExperimentDefaultActions,
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
