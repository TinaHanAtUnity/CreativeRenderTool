import { AutomatedExperiment, IExperimentDeclaration } from 'MabExperimentation/Models/AutomatedExperiment';

export enum AutomatedExperimentsCategories {
    PERFORMANCE_ENDCARD = 'webview-perf-ad-endcard',
    MRAID_AR = 'webview-ar-mraid'
}

export const EndScreenExperimentDeclaration: IExperimentDeclaration = {
    scheme: {
        DARK: 'dark',
        LIGHT: 'light',
        COLORMATCHING: 'color_matching',
        COLORBLUR: 'color_blur',
        TILTED: 'tilted'
    },
    animation: {
        STATIC: 'static',
        HEARTBEATING: 'heartbeating',
        BOUNCING: 'bouncing',
        SHINING: 'shining',
        UNDEFINED: undefined
    },
    color: {
        BLUE: '167dfb',
        CYAN: '00cccc',
        GREEN: '33cc00',
        LIME: '99cc00',
        NAVY: '003366',
        ORANGE: 'ff9900',
        PINK: 'cc0099',
        PURPLE: '6600cc',
        RED: 'c31e25',
        YELLOW: 'ffcc33',
        DARK_BLUE: '0052c7',
        DARK_CYAN: '009a9b',
        DARK_GREEN: '009a00',
        DARK_NAVY: '003365',
        DARK_LIME: '659b00',
        DARK_ORANGE: 'c66a00',
        DARK_PINK: '96006b',
        DARK_PURPLE: '6600cb',
        DARK_RED: '8b0000',
        DARK_YELLOW: 'c89b00',
        UNDEFINED: undefined
    },
    cta_text: {
        DOWNLOAD: 'download',
        DOWNLOAD_FOR_FREE: 'download_for_free',
        DOWNLOAD_NOW: 'download_now',
        DOWNLOAD_NOW_FIRE: 'download_now_fire',
        GET: 'get',
        GET_STARTED: 'get_started',
        INSTALL_NOW: 'install_now',
        LETS_TRY_IT: 'lets_try_it',
        OK: 'ok',
        UNDEFINED: undefined
    }
};

export const EndScreenExperiment = new AutomatedExperiment({
    actions: EndScreenExperimentDeclaration,
    defaultActions: {
        scheme: EndScreenExperimentDeclaration.scheme.LIGHT,
        animation: EndScreenExperimentDeclaration.animation.BOUNCING,
        color: EndScreenExperimentDeclaration.color.GREEN,
        cta_text: EndScreenExperimentDeclaration.cta_text.DOWNLOAD_FOR_FREE
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
    actions: ArAvailableButtonExperimentDeclaration,
    defaultActions: {
        color: ArAvailableButtonExperimentDeclaration.color.BLACK,
        skip: ArAvailableButtonExperimentDeclaration.skip.NO
    },
    cacheDisabled: true
});
