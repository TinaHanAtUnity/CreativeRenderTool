import { AutomatedExperiment, IExperimentDeclaration, IExperimentActionChoice } from 'Ads/Models/AutomatedExperiment';

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
