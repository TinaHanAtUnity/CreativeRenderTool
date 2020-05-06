import { Tap as Base } from 'Core/Utilities/Tap';

export type TapMock = Base & {
    getTouchStartPosition: jest.Mock<{}>;
    getScreenSize: jest.Mock<{}>;
};

export const Tap = jest.fn(() => {
    return <TapMock>{
        getTouchStartPosition: jest.fn().mockReturnValue({ startX: 10, startY: 20 })
    };
});
