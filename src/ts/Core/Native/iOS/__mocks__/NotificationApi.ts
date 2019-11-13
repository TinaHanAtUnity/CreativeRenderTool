import { NotificationApi as Base } from 'Core/Native/iOS/Notification';

export type NotificationApiMock = Base & {
};

export const NotificationApi = jest.fn(() => {
    return <NotificationApiMock>{
    };
});
