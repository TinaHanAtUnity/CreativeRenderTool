import { Tap } from 'Core/Utilities/__mocks__/Tap';
export const AbstractVideoOverlay = jest.fn(() => {
    return {
        tap: jest.fn().mockReturnValue(new Tap()),
        setCallButtonEnabled: jest.fn()
    };
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQWJzdHJhY3RWaWRlb092ZXJsYXkuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvdHMvQWRzL1ZpZXdzL19fbW9ja3NfXy9BYnN0cmFjdFZpZGVvT3ZlcmxheS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFDQSxPQUFPLEVBQUUsR0FBRyxFQUFFLE1BQU0sOEJBQThCLENBQUM7QUFPbkQsTUFBTSxDQUFDLE1BQU0sb0JBQW9CLEdBQUcsSUFBSSxDQUFDLEVBQUUsQ0FBQyxHQUFHLEVBQUU7SUFDN0MsT0FBaUM7UUFDN0IsR0FBRyxFQUFFLElBQUksQ0FBQyxFQUFFLEVBQUUsQ0FBQyxlQUFlLENBQUMsSUFBSSxHQUFHLEVBQUUsQ0FBQztRQUN6QyxvQkFBb0IsRUFBRSxJQUFJLENBQUMsRUFBRSxFQUFFO0tBQ2xDLENBQUM7QUFDTixDQUFDLENBQUMsQ0FBQyJ9