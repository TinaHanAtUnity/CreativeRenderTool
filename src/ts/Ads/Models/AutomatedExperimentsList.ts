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

export const AutomatedExperimentsList: AutomatedExperiment[] = [ButtonAnimationsExperiment];

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
    name: 'wbvw-ar-v1',
    actions: ArAvailableButtonExperimentDeclaration,
    defaultActions: {
        color: ArAvailableButtonExperimentDeclaration.color.BLACK,
        skip: ArAvailableButtonExperimentDeclaration.skip.NO
    },
    cacheDisabled: true
});

export const ArAutomatedExperimentsList: AutomatedExperiment[] = [ArAvailableButtonExperiment];

// Video Overlay Download

export const VideoOverlayDownloadExperimentDeclaration: IExperimentDeclaration = {
    method: {
        SWIPEUP: 'swipeup',
        CLICK: 'click'
    }
};

export const VideoOverlayDownloadExperiment = new AutomatedExperiment({
    name: 'wbvw-overlay-v1',
    actions: VideoOverlayDownloadExperimentDeclaration,
    defaultActions: {
        scheme: VideoOverlayDownloadExperimentDeclaration.method.CLICK
    },
    cacheDisabled: true
});

export const VideoOverlayDownloadExperimentsList: AutomatedExperiment[] = [VideoOverlayDownloadExperiment];

