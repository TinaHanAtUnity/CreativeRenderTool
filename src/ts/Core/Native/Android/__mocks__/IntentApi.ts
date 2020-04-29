import { IntentApi as Base } from 'Core/Native/Android/Intent';

export type IntentApiMock = Base & {
    launch: jest.Mock<Promise<void>>;
};

export const IntentApi = jest.fn(() => {
    return <IntentApiMock>{
        launch: jest.fn().mockReturnValue(Promise.resolve())
    };
});
