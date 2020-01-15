import { ABGroup as Base } from 'Core/Models/ABGroup';

export type ABGroupMock = Base & {
};

export const ABGroup = jest.fn(() => {
  return <ABGroupMock>{};
});
