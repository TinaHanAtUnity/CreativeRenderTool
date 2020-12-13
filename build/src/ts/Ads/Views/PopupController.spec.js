import { PopupController } from 'Ads/Views/PopupController';
import { AbstractPrivacy } from 'Ads/Views/__mocks__/AbstractPrivacy';
import { VideoAdUnitPopupEventHandler } from 'Ads/EventHandlers/__mocks__/VideoAdUnitPopupEventHandler';
describe('PopupController', () => {
    let popupController;
    const privacyView = new AbstractPrivacy();
    const eventHandler = new VideoAdUnitPopupEventHandler();
    beforeEach(() => {
        popupController = new PopupController(privacyView);
        popupController.addEventHandler(eventHandler);
    });
    describe('when calling show', () => {
        beforeEach(() => {
            popupController.show();
        });
        it('Should have called Privacy.show', () => {
            expect(privacyView.show).toHaveBeenCalledTimes(1);
        });
        it('Should have added event handler for Privacy view', () => {
            expect(privacyView.addEventHandler).toHaveBeenCalledTimes(1);
        });
        it('Should have called event handlers onPopupShow', () => {
            expect(eventHandler.onPopupShow).toHaveBeenCalledTimes(1);
        });
        it('Should have called event handlers onPopupVisible', () => {
            expect(eventHandler.onPopupVisible).toHaveBeenCalledTimes(1);
        });
        it('Should return right showing status', () => {
            expect(popupController.isShowing()).toBe(true);
        });
    });
    describe('when calling hideAndRemovePopups after showing privacy view', () => {
        beforeEach(() => {
            popupController.show();
            popupController.hideAndRemovePopups();
        });
        it('Should return right showing status', () => {
            expect(popupController.isShowing()).toBe(false);
        });
        it('Should have hidden Privacy view', () => {
            expect(privacyView.hide).toHaveBeenCalled();
        });
        it('Should have removed privacy view event handler', () => {
            expect(privacyView.removeEventHandler).toHaveBeenCalledTimes(1);
        });
    });
    describe('when calling onPrivacyClose after showing privacy view', () => {
        beforeEach(() => {
            popupController.show();
            popupController.onPrivacyClose();
        });
        it('Should hide Privacy view', () => {
            expect(privacyView.hide).toHaveBeenCalled();
        });
        it('Should have called event handlers onPopupVisible', () => {
            expect(eventHandler.onPopupClosed).toHaveBeenCalledTimes(1);
        });
        it('Should return right showing status', () => {
            expect(popupController.isShowing()).toBe(false);
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUG9wdXBDb250cm9sbGVyLnNwZWMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9zcmMvdHMvQWRzL1ZpZXdzL1BvcHVwQ29udHJvbGxlci5zcGVjLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxlQUFlLEVBQUUsTUFBTSwyQkFBMkIsQ0FBQztBQUM1RCxPQUFPLEVBQUUsZUFBZSxFQUFFLE1BQU0scUNBQXFDLENBQUM7QUFDdEUsT0FBTyxFQUFFLDRCQUE0QixFQUFFLE1BQU0sMERBQTBELENBQUM7QUFFeEcsUUFBUSxDQUFDLGlCQUFpQixFQUFFLEdBQUcsRUFBRTtJQUM3QixJQUFJLGVBQWdDLENBQUM7SUFDckMsTUFBTSxXQUFXLEdBQUcsSUFBSSxlQUFlLEVBQUUsQ0FBQztJQUMxQyxNQUFNLFlBQVksR0FBRyxJQUFJLDRCQUE0QixFQUFFLENBQUM7SUFFeEQsVUFBVSxDQUFDLEdBQUcsRUFBRTtRQUNaLGVBQWUsR0FBRyxJQUFJLGVBQWUsQ0FBQyxXQUFXLENBQUMsQ0FBQztRQUNuRCxlQUFlLENBQUMsZUFBZSxDQUFDLFlBQVksQ0FBQyxDQUFDO0lBQ2xELENBQUMsQ0FBQyxDQUFDO0lBRUgsUUFBUSxDQUFDLG1CQUFtQixFQUFFLEdBQUcsRUFBRTtRQUMvQixVQUFVLENBQUMsR0FBRyxFQUFFO1lBQ1osZUFBZSxDQUFDLElBQUksRUFBRSxDQUFDO1FBQzNCLENBQUMsQ0FBQyxDQUFDO1FBRUgsRUFBRSxDQUFDLGlDQUFpQyxFQUFFLEdBQUcsRUFBRTtZQUN2QyxNQUFNLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxDQUFDLHFCQUFxQixDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ3RELENBQUMsQ0FBQyxDQUFDO1FBRUgsRUFBRSxDQUFDLGtEQUFrRCxFQUFFLEdBQUcsRUFBRTtZQUN4RCxNQUFNLENBQUMsV0FBVyxDQUFDLGVBQWUsQ0FBQyxDQUFDLHFCQUFxQixDQUFDLENBQUMsQ0FB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