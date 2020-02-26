import { Vast as Base } from 'VAST/Models/Vast';

export type VastMock = Base & {
    isPublicaTag: jest.Mock;
    getAdVerifications: jest.Mock;
};

export const Vast = jest.fn(() => {
    return <VastMock> {
        isPublicaTag: jest.fn(),
        getAdVerifications: jest.fn()
    };
});