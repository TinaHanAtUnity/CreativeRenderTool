import { AutomatedExperiment, IExperimentActionChoice } from 'MabExperimentation/Models/AutomatedExperiment';

export enum AutomatedExperimentsCategories {
    PERFORMANCE_ENDCARD = 'webview-perf-ad-endcard',
    MRAID_AR = 'webview-ar-mraid',
    VIDEO_OVERLAY = 'webview-video-overlay'
}

export const EndScreenExperimentDeclaration = {
    scheme: {
        DARK: 'dark',
        LIGHT: 'light',
        COLORMATCHING: 'color_matching',
        COLORBLUR: 'color_blur'
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
    },
    ctaText: {
        DOWNLOAD: 'Download',
        DOWNLOAD_FOR_FREE: 'Download For Free',
        DOWNLOAD_NOW: 'Download Now!',
        DOWNLOAD_NOW_FIRE: '🔥 Download Now 🔥',
        GET: 'Get',
        GET_STARTED: 'Get Started!',
        INSTALL_NOW: 'Install Now',
        LETS_TRY_IT: `Let's try it!`,
        OK: 'OK!'
    }
};

export const EndScreenExperiment = new AutomatedExperiment({
    actions: EndScreenExperimentDeclaration,
    defaultActions: {
        scheme: EndScreenExperimentDeclaration.scheme.LIGHT,
        animation: EndScreenExperimentDeclaration.animation.BOUNCING,
        color: EndScreenExperimentDeclaration.color.BLUE,
        ctaText: EndScreenExperimentDeclaration.ctaText.DOWNLOAD_FOR_FREE
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

// Video Overlay Download

export const VideoOverlayDownloadExperimentDeclaration = {
    mode: {
        SWIPEUP: 'swipeup',
        CLICK: 'click'
    }
};

export const VideoOverlayDownloadExperiment = new AutomatedExperiment({
    actions: VideoOverlayDownloadExperimentDeclaration,
    defaultActions: {
        mode: VideoOverlayDownloadExperimentDeclaration.mode.CLICK
    },
    cacheDisabled: true
});
