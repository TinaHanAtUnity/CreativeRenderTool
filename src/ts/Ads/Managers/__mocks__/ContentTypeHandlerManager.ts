import { ContentTypeHandlerManager as Base } from 'Ads/Managers/ContentTypeHandlerManager';

export type ContentTypeHandlerManagerMock = Base & {
    addHandler: jest.Mock;
    getParser: jest.Mock;
    getFactory: jest.Mock;
};

export const ContentTypeHandlerManager = jest.fn(() => {
    return <ContentTypeHandlerManagerMock>{
        addHandler: jest.fn(),
        getParser: jest.fn(),
        getFactory: jest.fn()
    };
});
