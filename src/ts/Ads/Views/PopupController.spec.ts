import { PopupController } from 'Ads/Views/PopupController';
import { AbstractPrivacy } from 'Ads/Views/__mocks__/AbstractPrivacy';
import { VideoAdUnitPopupEventHandler } from 'Ads/EventHandlers/__mocks__/VideoAdUnitPopupEventHandler';

describe('PopupController', () => {
    let popupController: PopupController;
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

        it('Should have called event handlers onShowPopup', () => {
            expect(eventHandler.onShowPopup).toHaveBeenCalledTimes(1);
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
