import { AdMobSignalFactory as Base } from 'AdMob/Utilities/AdMobSignalFactory';

export type AdMobSignalFactoryMock = Base & {
    getAdRequestSignal: jest.Mock;
    getOptionalSignal: jest.Mock;
};

export const AdMobSignalFactory = jest.fn(() => {
    return <AdMobSignalFactoryMock>{
        getAdRequestSignal: jest.fn().mockImplementation(() => Promise.resolve({
            getBase64ProtoBufNonEncoded: jest.fn().mockImplementation(() => Promise.resolve(''))
        })),
        getOptionalSignal: jest.fn().mockImplementation(() => Promise.resolve({
            getDTO: jest.fn().mockImplementation(() => ({}))
        }))
    };
});
