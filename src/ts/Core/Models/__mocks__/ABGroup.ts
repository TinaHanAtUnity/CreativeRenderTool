import { ABGroup } from 'Core/Models/ABGroup'

export type ABGroup = Base & {
};

export const ABGroup = jest.fn(() => {
  return <ABGroup>{};
});