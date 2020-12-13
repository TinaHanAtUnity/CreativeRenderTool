import { PerformanceEndScreen, SQUARE_END_SCREEN } from 'Performance/Views/PerformanceEndScreen';
import ExperimentEndScreenTemplate from 'html/mabexperimentation/ExperimentEndScreenTemplate.html';
import ExperimentSquareEndScreenTemplate from 'html/mabexperimentation/ExperimentSquareEndScreenTemplate.html';
import { EndScreenExperimentDeclaration, EndScreenExperiment } from 'MabExperimentation/Models/AutomatedExperimentsList';
import { AUIMetric, SDKMetrics } from 'Ads/Utilities/SDKMetrics';
import { Color } from 'Core/Utilities/Color';
import { ColorTheme } from 'Core/Utilities/ColorTheme';
import { ColorUtils } from 'MabExperimentation/Utilities/ColorUtils';
import TiltedEndScreenTemplate from 'html/mabexperimentation/TiltedEndScreenTemplate.html';
import { Template } from 'Core/Utilities/Template';
export class ExperimentEndScreen extends PerformanceEndScreen {
    constructor(combination, parameters, campaign, automatedExperimentManager, country) {
        super(parameters, campaign, country);
        this._clickHeatMapData = [];
        this._clickHeatMapDataLimit = 10;
        this._language = parameters.language;
        this._isEnglish = this._language.indexOf('en') !== -1;
        combination = this.fixupExperimentChoices(combination);
        this.fixupScheme(combination);
        this.fixupCtaText(combination.cta_text);
        this._automatedExperimentManager = automatedExperimentManager;
        // combination.animation will be defined at this point
        this._animation = combination.animation;
        this._templateData = Object.assign({}, this._templateData, { hasShadow: this._animation === EndScreenExperimentDeclaration.animation.BOUNCING, ctaAlternativeText: this._formattedCtaAlternativeText, isEnglish: this._language.indexOf('en') !== -1 });
        this._bindings.push({
            event: 'click',
            listener: (event) => this.onClickCollection(event)
        });
        this.fixupTiltedLayout(campaign);
    }
    fixupScheme(actions) {
        if (actions) {
            switch (actions.scheme) {
                case EndScreenExperimentDeclaration.scheme.LIGHT:
                    if (actions.color) {
                        this._downloadButtonColor = Color.hexToCssRgba(actions.color);
                    }
                    else {
                        this._downloadButtonColor = Color.hexToCssRgba(EndScreenExperimentDeclaration.color.GREEN);
                    }
                    break;
                case EndScreenExperimentDeclaration.scheme.DARK:
                    if (actions.color) {
                        this._downloadButtonColor = Color.hexToCssRgba(actions.color);
                    }
                    else {
                        this._downloadButtonColor = Color.hexToCssRgba(EndScreenExperimentDeclaration.color.DARK_BLUE);
                    }
                    this._darkMode = true;
                    break;
                case EndScreenExperimentDeclaration.scheme.COLORMATCHING:
                    this._tintColor = true;
                    break;
                case EndScreenExperimentDeclaration.scheme.TILTED:
                    if (this._isEnglish) {
                        this._tiltedLayout = true;
                    }
                    break;
                default:
                    SDKMetrics.reportMetricEvent(AUIMetric.ColorMatchingNotSupported);
            }
        }
    }
    fixupCtaText(ctaText) {
        switch (ctaText) {
            case EndScreenExperimentDeclaration.cta_text.DOWNLOAD:
                this._formattedCtaAlternativeText = 'Download';
                break;
            case EndScreenExperimentDeclaration.cta_text.DOWNLOAD_FOR_FREE:
                this._formattedCtaAlternativeText = 'Download For Free';
                break;
            case EndScreenExperimentDeclaration.cta_text.DOWNLOAD_NOW:
                this._formattedCtaAlternativeText = 'Download Now!';
                break;
            case EndScreenExperimentDeclaration.cta_text.DOWNLOAD_NOW_FIRE:
                this._formattedCtaAlternativeText = '🔥 Download Now 🔥';
                break;
            case EndScreenExperimentDeclaration.cta_text.GET:
                this._formattedCtaAlternativeText = 'Get';
                break;
            case EndScreenExperimentDeclaration.cta_text.GET_STARTED:
                this._formattedCtaAlternativeText = 'Get Started!';
                break;
            case EndScreenExperimentDeclaration.cta_text.INSTALL_NOW:
                this._formattedCtaAlternativeText = 'Install Now';
                break;
            case EndScreenExperimentDeclaration.cta_text.LETS_TRY_IT:
                this._formattedCtaAlternativeText = `Let's try it!`;
                break;
            case EndScreenExperimentDeclaration.cta_text.OK:
                this._formattedCtaAlternativeText = 'OK!';
                break;
            default:
                SDKMetrics.reportMetricEvent(AUIMetric.InvalidCtaText);
                this._formattedCtaAlternativeText = 'Download For Free';
        }
    }
    fixupExperimentChoices(actions) {
        if (actions === undefined) {
            return EndScreenExperiment.getDefaultActions();
        }
        if (actions.color) {
            // light scheme can only use light colors
            if (actions.scheme === EndScreenExperimentDeclaration.scheme.LIGHT && ColorUtils.isDarkSchemeColor(actions.color)) {
                SDKMetrics.reportMetricEvent(AUIMetric.InvalidSchemeAndColorCoordination);
                return EndScreenExperiment.getDefaultActions();
            }
            // dark scheme can only use dark colors
            if (actions.scheme === EndScreenExperimentDeclaration.scheme.DARK && !ColorUtils.isDarkSchemeColor(actions.color)) {
                SDKMetrics.reportMetricEvent(AUIMetric.InvalidSchemeAndColorCoordination);
                return EndScreenExperiment.getDefaultActions();
            }
        }
        if (actions.scheme === EndScreenExperimentDeclaration.scheme.TILTED && !this._isEnglish) {
            SDKMetrics.reportMetricEvent(AUIMetric.TiltedLayoutNotSupported);
            return EndScreenExperiment.getDefaultActions();
        }
        if (!EndScreenExperiment.isValid(actions)) {
            SDKMetrics.reportMetricEvent(AUIMetric.InvalidEndscreenAnimation);
            return EndScreenExperiment.getDefaultActions();
        }
        return actions;
    }
    fixupTiltedLayout(campaign) {
        if (this._tiltedLayout) {
            this._template = new Template(this.getTemplate(), this._localization);
            this._simpleRating = campaign.getRating().toFixed(1);
            this._gameNameLength = campaign.getGameName().length;
            this._templateData = Object.assign({}, this._templateData, { simpleRating: this._simpleRating, gameName: this._gameNameLength >= 40 ? campaign.getGameName().substring(0, 40) : campaign.getGameName() });
            this._bindings.push({
                event: 'click',
                listener: (event) => this.onClickCollection(event)
            }, {
                event: 'click',
                listener: (event) => this.onDownloadEvent(event),
                selector: '.game-creative-image, .download-cta-button'
            });
        }
    }
    render() {
        super.render();
        this._container.classList.add(`${this._animation}-download-button-end-screen`);
        if (this.getEndscreenAlt() === SQUARE_END_SCREEN) {
            this._container.classList.add(`${this._animation}-download-button-end-screen-square`);
        }
        if (this._downloadButtonColor) {
            const ctaButton = this._container.querySelector('.download-container');
            if (ctaButton !== null) {
                ctaButton.style.backgroundColor = this._downloadButtonColor;
            }
        }
        if (this._tintColor) {
            ColorTheme.calculateColorThemeForEndCard(this._campaign, this._core)
                .then((theme) => {
                this.applyColorTheme(theme.base, theme.secondary);
            })
                .catch((error) => {
                SDKMetrics.reportMetricEvent(error.tag);
            });
        }
        if (this._tiltedLayout && this._gameNameLength >= 40) {
            const ellipsis = this._container.querySelector('.game-name-ellipsis');
            ellipsis.classList.add('show-ellipsis');
        }
    }
    applyDarkMode() {
        document.body.classList.add('dark-mode');
    }
    applyColorTheme(baseColorTheme, secondaryColorTheme) {
        if (!baseColorTheme.light || !baseColorTheme.medium || !baseColorTheme.dark ||
            !secondaryColorTheme.light || !secondaryColorTheme.medium || !secondaryColorTheme.dark) {
            SDKMetrics.reportMetricEvent(AUIMetric.InvalidEndscreenColorTintTheme);
            return;
        }
        const backgroundElement = this._container.querySelector('.end-screen-info-background');
        const downloadContainer = this._container.querySelector('.download-container');
        const gameNameContainer = this._container.querySelector('.name-container');
        const gameRatingContainer = this._container.querySelector('.game-rating-count');
        const privacyIconContainer = this._container.querySelector('.bottom-container .icon-gdpr');
        const unityIconContainer = this._container.querySelector('.bottom-container .icon-unity-ads-logo');
        const chinaAdvertisementElement = this._container.querySelector('.bottom-container .china-advertisement');
        if (backgroundElement && downloadContainer && gameNameContainer && gameRatingContainer && privacyIconContainer && unityIconContainer && chinaAdvertisementElement) {
            const secondary = Color.lerp(secondaryColorTheme.light, secondaryColorTheme.medium, 0.3);
            const baseDark = baseColorTheme.dark.toCssRgb();
            backgroundElement.style.background = `linear-gradient(${secondary.toCssRgb()},${baseColorTheme.light.toCssRgb()})`;
            downloadContainer.style.background = baseColorTheme.medium.toCssRgb();
            gameNameContainer.style.color = baseDark;
            gameRatingContainer.style.color = baseDark;
            privacyIconContainer.style.color = baseDark;
            unityIconContainer.style.color = baseDark;
            chinaAdvertisementElement.style.color = baseDark;
        }
        else {
            SDKMetrics.reportMetricEvent(AUIMetric.EndscreenColorTintThemingFailed);
        }
    }
    show() {
        if (this._tiltedLayout) {
            this.applyTiltedLayout();
        }
        super.show();
        window.addEventListener('resize', this.handleResize, false);
        if (this._darkMode) {
            this.applyDarkMode();
        }
    }
    hide() {
        super.hide();
        window.removeEventListener('resize', this.handleResize);
        if (this._darkMode) {
            document.body.classList.remove('dark-mode');
        }
        if (this._tiltedLayout) {
            document.body.classList.remove('tilted-layout');
        }
    }
    onDownloadEvent(event) {
        this.onClickCollection(event);
        this._automatedExperimentManager.setHeatMapData(this._clickHeatMapData);
        super.onDownloadEvent(event);
    }
    onCloseEvent(event) {
        this.onClickCollection(event);
        this._automatedExperimentManager.setHeatMapData(this._clickHeatMapData);
        super.onCloseEvent(event);
    }
    getTemplate() {
        if (this._tiltedLayout) {
            return TiltedEndScreenTemplate;
        }
        if (this.getEndscreenAlt() === SQUARE_END_SCREEN) {
            return ExperimentSquareEndScreenTemplate;
        }
        return ExperimentEndScreenTemplate;
    }
    handleResize() {
        const element = document.getElementById('end-screen');
        if (element == null) {
            return;
        }
        // By triggering a reflow, the button's animation is restarted when
        // the end-screen is resized (in the case of an orientation change,
        // for example).
        element.classList.remove('on-show');
        setTimeout(() => element.classList.add('on-show'), 0);
    }
    onClickCollection(event) {
        event.preventDefault();
        if (this._clickHeatMapData.length >= this._clickHeatMapDataLimit) {
            this._clickHeatMapData.shift();
        }
        this._clickHeatMapData.push({
            is_portrait: window.innerHeight > window.innerWidth,
            normalized_x: event.pageX / window.innerWidth,
            normalized_y: event.pageY / window.innerHeight,
            target: event.target.className
        });
    }
    applyTiltedLayout() {
        document.body.classList.add('tilted-layout');
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRXhwZXJpbWVudEVuZFNjcmVlbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy90cy9NYWJFeHBlcmltZW50YXRpb24vUGVyZm9ybWFuY2UvVmlld3MvRXhwZXJpbWVudEVuZFNjcmVlbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFFQSxPQUFPLEVBQUUsb0JBQW9CLEVBQUUsaUJBQWlCLEVBQUUsTUFBTSx3Q0FBd0MsQ0FBQztBQUNqRyxPQUFPLDJCQUEyQixNQUFNLDBEQUEwRCxDQUFDO0FBQ25HLE9BQU8saUNBQWlDLE1BQU0sZ0VBQWdFLENBQUM7QUFFL0csT0FBTyxFQUFFLDhCQUE4QixFQUFFLG1CQUFtQixFQUFFLE1BQU0sb0RBQW9ELENBQUM7QUFDekgsT0FBTyxFQUFFLFNBQVMsRUFBRSxVQUFVLEVBQUUsTUFBTSwwQkFBMEIsQ0FBQztBQUNqRSxPQUFPLEVBQUUsS0FBSyxFQUFFLE1BQU0sc0JBQXNCLENBQUM7QUFFN0MsT0FBTyxFQUFFLFVBQVUsRUFBRSxNQUFNLDJCQUEyQixDQUFDO0FBQ3ZELE9BQU8sRUFBRSxVQUFVLEVBQUUsTUFBTSx5Q0FBeUMsQ0FBQztBQUVyRSxPQUFPLHVCQUF1QixNQUFNLHNEQUFzRCxDQUFDO0FBQzNGLE9BQU8sRUFBRSxRQUFRLEVBQUUsTUFBTSx5QkFBeUIsQ0FBQztBQVNuRCxNQUFNLE9BQU8sbUJBQW9CLFNBQVEsb0JBQW9CO0lBZXpELFlBQVksV0FBZ0QsRUFBRSxVQUFnQyxFQUFFLFFBQTZCLEVBQUUsMEJBQXNELEVBQUUsT0FBZ0I7UUFDbk0sS0FBSyxDQUFDLFVBQVUsRUFBRSxRQUFRLEVBQUUsT0FBTyxDQUFDLENBQUM7UUFSakMsc0JBQWlCLEdBQXlCLEVBQUUsQ0FBQztRQUM3QywyQkFBc0IsR0FBVyxFQUFFLENBQUM7UUFTeEMsSUFBSSxDQUFDLFNBQVMsR0FBRyxVQUFVLENBQUMsUUFBUSxDQUFDO1FBQ3JDLElBQUksQ0FBQyxVQUFVLEdB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