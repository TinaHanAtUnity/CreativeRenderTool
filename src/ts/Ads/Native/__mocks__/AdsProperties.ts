import { AdsPropertiesApi as Base } from 'Ads/Native/AdsProperties';

export type AdsPropertiesMock = Base & {
    setShowTimeout: jest.Mock;
};

export const AdsPropertiesApi = jest.fn(() => {
    return <AdsPropertiesMock><unknown>{
        setShowTimeout: jest.fn()
    };
});
