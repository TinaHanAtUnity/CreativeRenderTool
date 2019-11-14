import { IntentApi as Base } from 'Core/Native/Android/Intent';

export type IntentApiMock = Base & {
};

export const IntentApi = jest.fn(() => {
    return <IntentApiMock>{
    };
});
