import { AdMobView as Base } from 'AdMob/Views/AdMobView';

export type AdMobViewMock = Base & {
    show: jest.Mock;
    hide: jest.Mock;
    container: jest.Mock;
};

export const AdMobView = jest.fn(() => {
    const el = document.createElement('div');
    return <AdMobViewMock>{
        show: jest.fn(),
        hide: jest.fn(),
        container: jest.fn().mockImplementation(() => el)
    };
});
