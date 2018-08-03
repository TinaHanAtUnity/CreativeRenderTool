System.register(["mocha", "sinon", "chai", "Managers/ForceQuitManager", "Native/Api/Storage", "Test/Unit/TestHelpers/TestFixtures"], function (exports_1, context_1) {
    "use strict";
    var sinon, chai_1, ForceQuitManager_1, Storage_1, TestFixtures_1;
    var __moduleName = context_1 && context_1.id;
    return {
        setters: [
            function (_1) {
            },
            function (sinon_1) {
                sinon = sinon_1;
            },
            function (chai_1_1) {
                chai_1 = chai_1_1;
            },
            function (ForceQuitManager_1_1) {
                ForceQuitManager_1 = ForceQuitManager_1_1;
            },
            function (Storage_1_1) {
                Storage_1 = Storage_1_1;
            },
            function (TestFixtures_1_1) {
                TestFixtures_1 = TestFixtures_1_1;
            }
        ],
        execute: function () {
            describe('ForceQuitManagerTest', function () {
                var ForceQuitKey = 'ForceQuitManager.ForceQuitKey';
                var nativeBridge;
                var forceQuitData;
                var forceQuitManager;
                var setStub;
                var writeStub;
                var getStub;
                var deleteStub;
                beforeEach(function () {
                    nativeBridge = TestFixtures_1.TestFixtures.getNativeBridge();
                    forceQuitManager = new ForceQuitManager_1.ForceQuitManager(nativeBridge);
                    setStub = sinon.stub(nativeBridge.Storage, 'set');
                    writeStub = sinon.stub(nativeBridge.Storage, 'write');
                    getStub = sinon.stub(nativeBridge.Storage, 'get');
                    deleteStub = sinon.stub(nativeBridge.Storage, 'delete');
                    forceQuitData = {
                        adSession: TestFixtures_1.TestFixtures.getSession()
                    };
                });
                describe('createForceQuitKey', function () {
                    it('should create and store the force quit key', function () {
                        setStub.resolves();
                        writeStub.resolves();
                        return forceQuitManager.createForceQuitKey(forceQuitData).then(function () {
                            sinon.assert.calledOnce(setStub);
                            sinon.assert.calledWith(setStub, Storage_1.StorageType.PRIVATE, ForceQuitKey, forceQuitData);
                            sinon.assert.calledOnce(writeStub);
                            sinon.assert.calledWith(writeStub, Storage_1.StorageType.PRIVATE);
                        });
                    });
                });
                describe('getForceQuitData', function () {
                    it('should get the force quit data', function () {
                        getStub.resolves(forceQuitData);
                        return forceQuitManager.getForceQuitData().then(function (data) {
                            sinon.assert.calledOnce(getStub);
                            sinon.assert.calledWith(getStub, Storage_1.StorageType.PRIVATE, ForceQuitKey);
                            chai_1.assert.deepEqual(forceQuitData, data, 'Returned data did not equal the force quit data');
                        });
                    });
                    it('should not contain force quit data', function () {
                        getStub.resolves(undefined);
                        return forceQuitManager.getForceQuitData().then(function (data) {
                            sinon.assert.calledOnce(getStub);
                            sinon.assert.calledWith(getStub, Storage_1.StorageType.PRIVATE, ForceQuitKey);
                            chai_1.assert.isUndefined(data, 'Returned data was not undefined');
                        });
                    });
                    it('should fail to get the force quit data', function () {
                        getStub.rejects(undefined);
                        return forceQuitManager.getForceQuitData().then(function (data) {
                            sinon.assert.calledOnce(getStub);
                            sinon.assert.calledWith(getStub, Storage_1.StorageType.PRIVATE, ForceQuitKey);
                            chai_1.assert.isUndefined(data, 'Returned force quit data was not undefined');
                        });
                    });
                });
                describe('destroyForceQuitKey', function () {
                    it('should delete the force quit key', function () {
                        deleteStub.resolves(true);
                        return forceQuitManager.destroyForceQuitKey().then(function (res) {
                            sinon.assert.calledOnce(deleteStub);
                            sinon.assert.calledWith(deleteStub, Storage_1.StorageType.PRIVATE, ForceQuitKey);
                            chai_1.assert.isTrue(res, 'Return value did not equal true');
                        });
                    });
                    it('should fail to delete the force quit key', function () {
                        deleteStub.rejects(undefined);
                        return forceQuitManager.destroyForceQuitKey().then(function (res) {
                            sinon.assert.calledOnce(deleteStub);
                            sinon.assert.calledWith(deleteStub, Storage_1.StorageType.PRIVATE, ForceQuitKey);
                            chai_1.assert.isFalse(res, 'Return value was not false');
                        });
                    });
                });
            });
        }
    };
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRm9yY2VRdWl0TWFuYWdlclRlc3QuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJGb3JjZVF1aXRNYW5hZ2VyVGVzdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O1lBU0EsUUFBUSxDQUFDLHNCQUFzQixFQUFFO2dCQUU3QixJQUFNLFlBQVksR0FBRywrQkFBK0IsQ0FBQztnQkFDckQsSUFBSSxZQUEwQixDQUFDO2dCQUMvQixJQUFJLGFBQTZCLENBQUM7Z0JBQ2xDLElBQUksZ0JBQWtDLENBQUM7Z0JBQ3ZDLElBQUksT0FBd0IsQ0FBQztnQkFDN0IsSUFBSSxTQUEwQixDQUFDO2dCQUMvQixJQUFJLE9BQXdCLENBQUM7Z0JBQzdCLElBQUksVUFBMkIsQ0FBQztnQkFFaEMsVUFBVSxDQUFDO29CQUNQLFlBQVksR0FBRywyQkFBWSxDQUFDLGVBQWUsRUFBRSxDQUFDO29CQUM5QyxnQkFBZ0IsR0FBRyxJQUFJLG1DQUFnQixDQUFDLFlBQVksQ0FBQyxDQUFDO29CQUN0RCxPQUFPLEdBQUcsS0FBSyxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsT0FBTyxFQUFFLEtBQUssQ0FBQyxDQUFDO29CQUNsRCxTQUFTLEdBQUcsS0FBSyxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsT0FBTyxFQUFFLE9BQU8sQ0FBQyxDQUFDO29CQUN0RCxPQUFPLEdBQUcsS0FBSyxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsT0FBTyxFQUFFLEtBQUssQ0FBQyxDQUFDO29CQUNsRCxVQUFVLEdBQUcsS0FBSyxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsT0FBTyxFQUFFLFFBQVEsQ0FBQyxDQUFDO29CQUN4RCxhQUFhLEdBQUc7d0JBQ1osU0FBUyxFQUFFLDJCQUFZLENBQUMsVUFBVSxFQUFFO3FCQUN2QyxDQUFDO2dCQUVOLENBQUMsQ0FBQyxDQUFDO2dCQUVILFFBQVEsQ0FBQyxvQkFBb0IsRUFBRTtvQkFDM0IsRUFBRSxDQUFD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