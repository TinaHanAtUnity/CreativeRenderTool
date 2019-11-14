import { ProductsApi as Base } from 'Store/Native/iOS/Products';

export type ProductsApiMock = Base & {
};

export const ProductsApi = jest.fn(() => {
    return <ProductsApiMock>{
    };
});
