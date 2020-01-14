import { ABGroup as Base } from 'Core/Models/ABGroup';

export type ABGroup = Base & {
};

export const ABGroup = jest.fn(() => {
  return <ABGroup>{};
});