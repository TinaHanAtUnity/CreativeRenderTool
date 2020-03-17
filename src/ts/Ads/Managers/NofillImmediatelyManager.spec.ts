import { LoadApi, LoadApiMock } from 'Core/Native/__mocks__/LoadApi';
import { ListenerApi, ListenerMock } from 'Ads/Native/__mocks__/Listener';
import { PlacementApi, PlacementApiMock } from 'Ads/Native/__mocks__/PlacementApi';

import { NofillImmediatelyManager } from 'Ads/Managers/NofillImmediatelyManager';
import { PlacementState } from 'Ads/Models/Placement';

describe('NofillImmediatelyManager', () => {
    let nfManager: NofillImmediatelyManager;
    let loadApi: LoadApiMock;
    let listenerApi: ListenerMock;
    let placementApi: PlacementApiMock;
    const placementIds = ['p1', 'p2', 'p3'];

    beforeEach(() => {
        loadApi = LoadApi();
        listenerApi = ListenerApi();
        placementApi = PlacementApi();
        nfManager = new NofillImmediatelyManager(loadApi, listenerApi, placementApi, placementIds);
    });

    describe('when loads are received before the timeout', () => {
        describe('for a single placement', () => {
            describe('included in the placement id list', () => {
                beforeEach(() => {
                    loadApi.onLoad.subscribe.mock.calls[0][0]({ 'p1': 1 });
                });

                it('should call setPlacementState', () => {
                    expect(placementApi.setPlacementState).toBeCalledTimes(1);
                    expect(placementApi.setPlacementState).toBeCalledWith('p1', PlacementState.NO_FILL);
                });

                it('should call setPlacementStateChangedEvent', () => {
                    expect(listenerApi.sendPlacementStateChangedEvent).toBeCalledTimes(1);
                    expect(listenerApi.sendPlacementStateChangedEvent).toBeCalledWith('p1', 'NOT_AVAILABLE', 'NO_FILL');
                });
            });

            describe('not included the placement id list', () => {
                beforeEach(() => {
                    loadApi.onLoad.subscribe.mock.calls[0][0]({ 'p0': 1 });
                });

                it('should not call setPlacementState', () => {
                    expect(placementApi.setPlacementState).toBeCalledTimes(0);
                });

                it('should not call setPlacementStateChangedEvent', () => {
                    expect(listenerApi.sendPlacementStateChangedEvent).toBeCalledTimes(0);
                });
            });
        });

        describe('for multiple placements', () => {
            describe('included in the placement id list', () => {
                beforeEach(() => {
                    loadApi.onLoad.subscribe.mock.calls[0][0]({ 'p1': 1, 'p2': 2 });
                });

                it('should call setPlacementState', () => {
                    expect(placementApi.setPlacementState).toBeCalledTimes(2);
                });

                it('should call setPlacementStateChangedEvent', () => {
                    expect(listenerApi.sendPlacementStateChangedEvent).toBeCalledTimes(2);
                });
            });

            describe('some included the placement id list', () => {
                beforeEach(() => {
                    loadApi.onLoad.subscribe.mock.calls[0][0]({ 'p0': 1, 'p2': 2 });
                });

                it('should not call setPlacementState', () => {
                    expect(placementApi.setPlacementState).toBeCalledTimes(1);
                });

                it('should not call setPlacementStateChangedEvent', () => {
                    expect(listenerApi.sendPlacementStateChangedEvent).toBeCalledTimes(1);
                });
            });
        });
    });

    describe('when loads are received after the timeout', () => {
        describe('for a single placement', () => {
            describe('included in the placement id list', () => {
                let windowSpy: jest.SpyInstance;

                beforeEach(() => {
                    windowSpy = jest.spyOn(performance, 'now');
                    windowSpy.mockReturnValue(0.01);
                    nfManager.setInitComplete();
                    windowSpy.mockReturnValue(251);
                    loadApi.onLoad.subscribe.mock.calls[0][0]({ 'p1': 1 });
                });

                it('should not call setPlacementState', () => {
                    expect(placementApi.setPlacementState).toBeCalledTimes(0);
                });

                it('should not call setPlacementStateChangedEvent', () => {
                    expect(listenerApi.sendPlacementStateChangedEvent).toBeCalledTimes(0);
                });

                it('should unsubscribe from onLoad', () => {
                    expect(loadApi.onLoad.unsubscribe).toBeCalledTimes(1);
                });
            });
        });
    });

});
