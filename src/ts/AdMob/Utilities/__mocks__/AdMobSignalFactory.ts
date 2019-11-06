import { AdMobSignalFactory as Base } from 'AdMob/Utilities/AdMobSignalFactory';

export type AdMobSignalFactoryMock = Base & {
};

export const AdMobSignalFactory = jest.fn(() => {
    return <AdMobSignalFactoryMock><unknown>{};
});
