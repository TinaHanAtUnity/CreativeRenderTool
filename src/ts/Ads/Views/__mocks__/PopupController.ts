import { PopupController as Base } from 'Ads/Views/PopupController';

export type PopupControllerMock = Base & {
};

export const PopupController = jest.fn(() => {
    return <PopupControllerMock>{
    };
});
