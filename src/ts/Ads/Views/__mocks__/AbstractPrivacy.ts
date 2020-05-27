import { AbstractPrivacy as Base } from 'Ads/Views/AbstractPrivacy';

export type AbstractPrivacyMock = Base & {
    addEventHandler: jest.Mock;
    removeEventHandler: jest.Mock;
    hide: jest.Mock;
    container: jest.Mock;
    render: jest.Mock;
    show: jest.Mock;
};

export const AbstractPrivacy = jest.fn(() => {
    return <AbstractPrivacyMock>{
        addEventHandler: jest.fn(),
        removeEventHandler: jest.fn(),
        hide: jest.fn(),
        container: jest.fn().mockImplementation(() => {
            const testElement = document.createElement('div');
            testElement.id = 'test-id';
            return testElement;
        }),
        render: jest.fn(),
        show: jest.fn()
    };
});
