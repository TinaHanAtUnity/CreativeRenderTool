import { Purchasing as Base } from 'Purchasing/Purchasing';

export type PurchasingMock = Base & {
};

export const Purchasing = jest.fn(() => {
    return <PurchasingMock>{};
});
