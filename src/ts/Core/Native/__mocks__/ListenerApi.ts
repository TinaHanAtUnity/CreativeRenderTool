import { ListenerApi as Base } from 'Core/Native/Listener';

export type ListenerApiMock = Base & {
};

export const ListenerApi = jest.fn(() => {
    return <ListenerApiMock>{
    };
});
