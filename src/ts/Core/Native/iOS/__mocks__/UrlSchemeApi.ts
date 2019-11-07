import { UrlSchemeApi as Base } from 'Core/Native/iOS/UrlScheme';

export type UrlSchemeApiMock = Base & {
};

export const UrlSchemeApi = jest.fn(() => {
    return <UrlSchemeApiMock>{
    };
});
