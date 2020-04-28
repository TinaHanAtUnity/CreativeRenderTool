import { UrlSchemeApi as Base } from 'Core/Native/iOS/UrlScheme';

export type UrlSchemeApiMock = Base & {
    open: jest.Mock<Promise<void>>;
};

export const UrlSchemeApi = jest.fn(() => {
    return <UrlSchemeApiMock>{
        open: jest.fn().mockImplementation(() => Promise.resolve())
    };
});
