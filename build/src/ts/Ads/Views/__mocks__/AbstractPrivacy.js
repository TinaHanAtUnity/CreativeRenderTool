export const AbstractPrivacy = jest.fn(() => {
    return {
        addEventHandler: jest.fn(),
        removeEventHandler: jest.fn(),
        hide: jest.fn(),
        container: jest.fn().mockImplementation(() => {
            const testElement = document.createElement('div');
            testElement.id = 'test-id';
            return testElement;
        }),
        render: jest.fn(),
        show: jest.fn()
    };
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQWJzdHJhY3RQcml2YWN5LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vc3JjL3RzL0Fkcy9WaWV3cy9fX21vY2tzX18vQWJzdHJhY3RQcml2YWN5LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQVdBLE1BQU0sQ0FBQyxNQUFNLGVBQWUsR0FBRyxJQUFJLENBQUMsRUFBRSxDQUFDLEdBQUcsRUFBRTtJQUN4QyxPQUE0QjtRQUN4QixlQUFlLEVBQUUsSUFBSSxDQUFDLEVBQUUsRUFBRTtRQUMxQixrQkFBa0IsRUFBRSxJQUFJLENBQUMsRUFBRSxFQUFFO1FBQzdCLElBQUksRUFBRSxJQUFJLENBQUMsRUFBRSxFQUFFO1FBQ2YsU0FBUyxFQUFFLElBQUksQ0FBQyxFQUFFLEVBQUUsQ0FBQyxrQkFBa0IsQ0FBQyxHQUFHLEVBQUU7WUFDekMsTUFBTSxXQUFXLEdBQUcsUUFBUSxDQUFDLGFBQWEsQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUNsRCxXQUFXLENBQUMsRUFBRSxHQUFHLFNBQVMsQ0FBQztZQUMzQixPQUFPLFdBQVcsQ0FBQztRQUN2QixDQUFDLENBQUM7UUFDRixNQUFNLEVBQUUsSUFBSSxDQUFDLEVBQUUsRUFBRTtRQUNqQixJQUFJLEVBQUUsSUFBSSxDQUFDLEVBQUUsRUFBRTtLQUNsQixDQUFDO0FBQ04sQ0FBQyxDQUFDLENBQUMifQ==