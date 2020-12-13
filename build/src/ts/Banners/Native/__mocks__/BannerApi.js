import { Observable } from 'Core/Utilities/__mocks__/Observable';
export const BannerApi = jest.fn(() => {
    return {
        onBannerResized: Observable(),
        onBannerVisibilityChanged: Observable(),
        onBannerAttached: Observable(),
        onBannerDetached: Observable(),
        onBannerLoaded: Observable(),
        onBannerDestroyed: Observable(),
        onBannerLoadPlacement: Observable(),
        onBannerDestroyBanner: Observable(),
        setRefreshRate: jest.fn(),
        load: jest.fn(),
        handleEvent: jest.fn()
    };
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQmFubmVyQXBpLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vc3JjL3RzL0Jhbm5lcnMvTmF0aXZlL19fbW9ja3NfXy9CYW5uZXJBcGkudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQ0EsT0FBTyxFQUFrQixVQUFVLEVBQUUsTUFBTSxxQ0FBcUMsQ0FBQztBQWdCakYsTUFBTSxDQUFDLE1BQU0sU0FBUyxHQUFHLElBQUksQ0FBQyxFQUFFLENBQUMsR0FBRyxFQUFFO0lBQ2xDLE9BQXNCO1FBQ2xCLGVBQWUsRUFBRSxVQUFVLEVBQUU7UUFDN0IseUJBQXlCLEVBQUUsVUFBVSxFQUFFO1FBQ3ZDLGdCQUFnQixFQUFFLFVBQVUsRUFBRTtRQUM5QixnQkFBZ0IsRUFBRSxVQUFVLEVBQUU7UUFDOUIsY0FBYyxFQUFFLFVBQVUsRUFBRTtRQUM1QixpQkFBaUIsRUFBRSxVQUFVLEVBQUU7UUFDL0IscUJBQXFCLEVBQUUsVUFBVSxFQUFFO1FBQ25DLHFCQUFxQixFQUFFLFVBQVUsRUFBRTtRQUNuQyxjQUFjLEVBQUUsSUFBSSxDQUFDLEVBQUUsRUFBRTtRQUN6QixJQUFJLEVBQUUsSUFBSSxDQUFDLEVBQUUsRUFBRTtRQUNmLFdBQVcsRUFBRSxJQUFJLENBQUMsRUFBRSxFQUFFO0tBQ3pCLENBQUM7QUFDTixDQUFDLENBQUMsQ0FBQyJ9