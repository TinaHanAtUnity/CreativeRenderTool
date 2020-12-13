import { PerformanceEndScreen } from 'Performance/Views/PerformanceEndScreen';
import EndScreenColorBlur from 'html/mabexperimentation/EndScreenColorBlur.html';
import { AUIMetric, SDKMetrics } from 'Ads/Utilities/SDKMetrics';
import { ColorTheme } from 'Core/Utilities/ColorTheme';
import { EndScreenExperiment, EndScreenExperimentDeclaration } from 'MabExperimentation/Models/AutomatedExperimentsList';
export class ColorBlurEndScreen extends PerformanceEndScreen {
    constructor(combination, parameters, campaign, country) {
        super(parameters, campaign, country);
        const simpleRating = campaign.getRating().toFixed(1);
        combination = this.fixupExperimentChoices(combination);
        switch (combination.cta_text) {
            case EndScreenExperimentDeclaration.cta_text.DOWNLOAD_FOR_FREE:
                this._formattedCtaAlternativeText = 'Download For Free';
                break;
            case EndScreenExperimentDeclaration.cta_text.INSTALL_NOW:
                this._formattedCtaAlternativeText = 'Install Now';
                break;
            default:
                SDKMetrics.reportMetricEvent(AUIMetric.InvalidCtaText);
                this._formattedCtaAlternativeText = 'Install Now';
        }
        // combination.cta_text will be defined at this point, due to a check in `this.fixupExperimentChoices`
        this._ctaText = combination.cta_text;
        this._language = parameters.language;
        this._templateData = Object.assign({}, this._templateData, { simpleRating: simpleRating, ctaAlternativeText: this._formattedCtaAlternativeText, isEnglish: this._language.indexOf('en') !== -1 });
        this._bindings.splice(0, 1, {
            event: 'click',
            listener: (event) => this.onDownloadEvent(event),
            selector: '.end-screen-image, .install-container, .game-info-container'
        });
    }
    fixupExperimentChoices(actions) {
        if (actions === undefined) {
            return EndScreenExperiment.getDefaultActions();
        }
        // the color blur scheme always needs a defined CTA text
        if (actions.cta_text === undefined) {
            SDKMetrics.reportMetricEvent(AUIMetric.InvalidCtaText);
            return EndScreenExperiment.getDefaultActions();
        }
        return actions;
    }
    render() {
        super.render();
        ColorTheme.calculateColorThemeForEndCard(this._campaign, this._core)
            .then((theme) => {
            this.applyColorTheme(theme.base);
        })
            .catch((error) => {
            SDKMetrics.reportMetricEvent(error.tag);
        });
        if (this._ctaText === EndScreenExperimentDeclaration.cta_text.DOWNLOAD_FOR_FREE) {
            const installContainer = this._container.querySelector('.install-container');
            if (installContainer) {
                installContainer.classList.add('cta-alt-text');
            }
        }
    }
    applyColorTheme(baseColorTheme) {
        if (!baseColorTheme.light || !baseColorTheme.medium || !baseColorTheme.dark) {
            SDKMetrics.reportMetricEvent(AUIMetric.InvalidEndscreenColorTintTheme);
            return;
        }
        const gameInfoContainer = this._container.querySelector('.game-info-container');
        const installContainer = this._container.querySelector('.install-container');
        if (gameInfoContainer && installContainer) {
            gameInfoContainer.style.background = baseColorTheme.medium.toCssRgb();
            installContainer.style.color = baseColorTheme.medium.toCssRgb();
        }
        else {
            SDKMetrics.reportMetricEvent(AUIMetric.EndscreenColorTintThemingFailed);
        }
    }
    show() {
        super.show();
        document.body.classList.add('color-blur');
    }
    hide() {
        super.hide();
        document.body.classList.remove('color-blur');
    }
    getTemplate() {
        return EndScreenColorBlur;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ29sb3JCbHVyRW5kU2NyZWVuLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vc3JjL3RzL01hYkV4cGVyaW1lbnRhdGlvbi9QZXJmb3JtYW5jZS9WaWV3cy9Db2xvckJsdXJFbmRTY3JlZW4udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBRUEsT0FBTyxFQUFFLG9CQUFvQixFQUFFLE1BQU0sd0NBQXdDLENBQUM7QUFDOUUsT0FBTyxrQkFBa0IsTUFBTSxpREFBaUQsQ0FBQztBQUNqRixPQUFPLEVBQUUsU0FBUyxFQUFFLFVBQVUsRUFBRSxNQUFNLDBCQUEwQixDQUFDO0FBQ2pFLE9BQU8sRUFBRSxVQUFVLEVBQUUsTUFBTSwyQkFBMkIsQ0FBQztBQUd2RCxPQUFPLEVBQUUsbUJBQW1CLEVBQUUsOEJBQThCLEVBQUUsTUFBTSxvREFBb0QsQ0FBQztBQUV6SCxNQUFNLE9BQU8sa0JBQW1CLFNBQVEsb0JBQW9CO0lBS3hELFlBQVksV0FBZ0QsRUFBRSxVQUFnQyxFQUFFLFFBQTZCLEVBQUUsT0FBZ0I7UUFDM0ksS0FBSyxDQUFDLFVBQVUsRUFBRSxRQUFRLEVBQUUsT0FBTyxDQUFDLENBQUM7UUFFckMsTUFBTSxZQUFZLEdBQUcsUUFBUSxDQUFDLFNBQVMsRUFBRSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUVyRCxXQUFXLEdBQUcsSUFBSSxDQUFDLHNCQUFzQixDQUFDLFdBQVcsQ0FBQyxDQUFDO1FBRXZELFFBQVEsV0FBVyxDQUFDLFFBQVEsRUFBRTtZQUMxQixLQUFLLDhCQUE4QixDQUFDLFFBQVEsQ0FBQyxpQkFBaUI7Z0JBQzFELElBQUksQ0FBQyw0QkFBNEIsR0FBRyxtQkFBbUIsQ0FBQztnQkFDeEQsTUFBTTtZQUNWLEtBQUssOEJBQThCLENBQUMsUUFBUSxDQUFDLFdBQVc7Z0JBQ3BELElBQUksQ0FBQyw0QkFBNEIsR0FBRyxhQUFhLENBQUM7Z0JBQ2xELE1BQU07WUFDVjtnQkFDSSxVQUFV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QyxNQUFNLENBQUMsUUFBUSxFQUFFLENBQUM7WUFDdEUsZ0JBQWdCLENBQUMsS0FBSyxDQUFDLEtBQUssR0FBRyxjQUFjLENBQUMsTUFBTSxDQUFDLFFBQVEsRUFBRSxDQUFDO1NBQ25FO2FBQU07WUFDSCxVQUFVLENBQUMsaUJBQWlCLENBQUMsU0FBUyxDQUFDLCtCQUErQixDQUFDLENBQUM7U0FDM0U7SUFDTCxDQUFDO0lBRU0sSUFBSTtRQUNQLEtBQUssQ0FBQyxJQUFJLEVBQUUsQ0FBQztRQUNiLFFBQVEsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxZQUFZLENBQUMsQ0FBQztJQUM5QyxDQUFDO0lBRU0sSUFBSTtRQUNQLEtBQUssQ0FBQyxJQUFJLEVBQUUsQ0FBQztRQUNiLFFBQVEsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxZQUFZLENBQUMsQ0FBQztJQUNqRCxDQUFDO0lBRVMsV0FBVztRQUNqQixPQUFPLGtCQUFrQixDQUFDO0lBQzlCLENBQUM7Q0FDSiJ9