import { AutomatedExperiment, IExperimentDeclaration, IExperimentActionChoice } from 'MabExperimentation/Models/AutomatedExperiment';

export enum AutomatedExperimentsCategories {
    PERFORMANCE_ENDCARD = 'webview-perf-ad-endcard',
    MRAID_AR = 'webview-ar-mraid'
}

export const ButtonExperimentDeclaration: IExperimentDeclaration = {
  scheme: {
      DARK: 'dark',
      LIGHT: 'light',
      COLORMATCHING: 'color_matching'
  },
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
      RED: 'c31e25',
      UNDEFINED: undefined
  }
};

export const ButtonAnimationsExperiment = new AutomatedExperiment({
    actions: ButtonExperimentDeclaration,
    defaultActions: {
        scheme: ButtonExperimentDeclaration.scheme.LIGHT,
        animation: ButtonExperimentDeclaration.animation.BOUNCING,
        color: ButtonExperimentDeclaration.color.BLUE
    },
    cacheDisabled: true
});

// AR Ads

export const ArAvailableButtonExperimentDeclaration: IExperimentDeclaration = {
    skip: {
        YES: 'true',
        NO: 'false'
    },
    color: {
        BLUE: '00002feb',
        GREEN: '003700eb',
        RED: '2f0000eb',
        BLACK: '0c292feb'
    }
};

export const ArAvailableButtonExperiment = new AutomatedExperiment({
    actions: ArAvailableButtonExperimentDeclaration,
    defaultActions: {
        color: ArAvailableButtonExperimentDeclaration.color.BLACK,
        skip: ArAvailableButtonExperimentDeclaration.skip.NO
    },
    cacheDisabled: true
});
