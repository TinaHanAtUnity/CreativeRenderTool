import { ClassDetectionApi as Base } from 'Core/Native/ClassDetection';

export type ClassDetectionApiMock = Base & {
};

export const ClassDetectionApi = jest.fn(() => {
    return <ClassDetectionApiMock>{
    };
});
