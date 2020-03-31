import { AbstractAdUnit as Base } from 'Ads/AdUnits/AbstractAdUnit';
import { ObservableMock, Observable } from 'Core/Utilities/__mocks__/Observable';

export type AbstractAdUnitMock = Base & {
    onStartProcessed: ObservableMock;
    onClose: ObservableMock;
    onFinish: ObservableMock;
    isCached: jest.Mock<boolean>;
};

export const AbstractAdUnit = jest.fn(() => {
    return <AbstractAdUnitMock>{
        onStartProcessed: Observable(),
        onClose: Observable(),
        onFinish: Observable(),
        isCached: jest.fn().mockReturnValue(true)
    };
});
