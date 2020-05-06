import { AutomatedExperiment, IExperimentActionChoice } from 'MabExperimentation/Models/AutomatedExperiment';

export enum AutomatedExperimentsCategories {
    PERFORMANCE_ENDCARD = 'webview-perf-ad-endcard',
    MRAID_AR = 'webview-ar-mraid'
}

export const ButtonExperimentDeclaration = {
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
      RED: 'c31e25'
  }
};

export const ButtonAnimationsExperiment = new AutomatedExperiment({
    name: 'wbvw-endcard-v2',
    actions: ButtonExperimentDeclaration,
    defaultActions: {
        scheme: ButtonExperimentDeclaration.scheme.LIGHT,
        animation: ButtonExperimentDeclaration.animation.BOUNCING,
        color: ButtonExperimentDeclaration.color.BLUE
    },
    cacheDisabled: true
});

// AR Ads

export const ArAvailableButtonExperimentDeclaration = {
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
    name: 'wbvw-ar-v1',
    actions: ArAvailableButtonExperimentDeclaration,
    defaultActions: {
        color: ArAvailableButtonExperimentDeclaration.color.BLACK,
        skip: ArAvailableButtonExperimentDeclaration.skip.NO
    },
    cacheDisabled: true
});
