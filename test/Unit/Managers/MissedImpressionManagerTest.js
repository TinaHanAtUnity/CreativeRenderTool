System.register(["mocha", "chai", "sinon", "Utilities/HttpKafka", "Managers/MissedImpressionManager", "../TestHelpers/TestFixtures", "Native/Api/Storage"], function (exports_1, context_1) {
    "use strict";
    var chai_1, sinon, HttpKafka_1, MissedImpressionManager_1, TestFixtures_1, Storage_1;
    var __moduleName = context_1 && context_1.id;
    return {
        setters: [
            function (_1) {
            },
            function (chai_1_1) {
                chai_1 = chai_1_1;
            },
            function (sinon_1) {
                sinon = sinon_1;
            },
            function (HttpKafka_1_1) {
                HttpKafka_1 = HttpKafka_1_1;
            },
            function (MissedImpressionManager_1_1) {
                MissedImpressionManager_1 = MissedImpressionManager_1_1;
            },
            function (TestFixtures_1_1) {
                TestFixtures_1 = TestFixtures_1_1;
            },
            function (Storage_1_1) {
                Storage_1 = Storage_1_1;
            }
        ],
        execute: function () {
            describe('MissedImpressionManagerTest', function () {
                var missedImpressionManager;
                var nativeBridge;
                var kafkaSpy;
                beforeEach(function () {
                    nativeBridge = TestFixtures_1.TestFixtures.getNativeBridge();
                    nativeBridge.Storage = new Storage_1.StorageApi(nativeBridge);
                    missedImpressionManager = new MissedImpressionManager_1.MissedImpressionManager(nativeBridge);
                    kafkaSpy = sinon.spy(HttpKafka_1.HttpKafka, 'sendEvent');
                });
                afterEach(function () {
                    kafkaSpy.restore();
                });
                it('should send events when developer sets metadata', function () {
                    nativeBridge.Storage.onSet.trigger(Storage_1.StorageType[Storage_1.StorageType.PUBLIC], { 'mediation': { 'missedImpressionOrdinal': { 'value': 1, 'ts': 123456789 } } });
                    chai_1.assert.isTrue(kafkaSpy.calledOnce, 'missed impression event was not sent to httpkafka');
                    chai_1.assert.isTrue(kafkaSpy.calledWith('ads.sdk2.events.missedimpression.json', HttpKafka_1.KafkaCommonObjectType.ANONYMOUS, { ordinal: 1 }), 'missed impression event arguments incorrect');
                });
                it('should not send events when other metadata is set', function () {
                    nativeBridge.Storage.onSet.trigger(Storage_1.StorageType[Storage_1.StorageType.PUBLIC], { 'player': { 'server_id': { 'value': 'test', 'ts': 123456789 } } });
                    chai_1.assert.isFalse(kafkaSpy.called, 'missed impression event was triggered for unrelated storage event');
                });
            });
        }
    };
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTWlzc2VkSW1wcmVzc2lvbk1hbmFnZXJUZXN0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiTWlzc2VkSW1wcmVzc2lvbk1hbmFnZXJUZXN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7WUFVQSxRQUFRLENBQUMsNkJBQTZCLEVBQUU7Z0JBQ3BDLElBQUksdUJBQWdELENBQUM7Z0JBQ3JELElBQUksWUFBMEIsQ0FBQztnQkFDL0IsSUFBSSxRQUFhLENBQUM7Z0JBRWxCLFVBQVUsQ0FBQztvQkFDUCxZQUFZLEdBQUcsMkJBQVksQ0FBQyxlQUFlLEVBQUUsQ0FBQztvQkFDOUMsWUFBWSxDQUFDLE9BQU8sR0FBRyxJQUFJLG9CQUFVLENBQUMsWUFBWSxDQUFDLENBQUM7b0JBQ3BELHVCQUF1QixHQUFHLElBQUksaURBQXVCLENBQUMsWUFBWSxDQUFDLENBQUM7b0JBQ3BFLFFBQVEsR0FBRyxLQUFLLENBQUMsR0FBRyxDQUFDLHFCQUFTLEVBQUUsV0FBVyxDQUFDLENBQUM7Z0JBQ2pELENBQUMsQ0FBQyxDQUFDO2dCQUVILFNBQVMsQ0FBQztvQkFDTixRQUFRLENBQUMsT0FBTyxFQUFFLENBQUM7Z0JBQ3ZCLENBQUMsQ0FBQyxDQUFDO2dCQUVILEVBQUUsQ0FBQyxpREFBaUQsRUFBRTtvQkFDbEQsWUFBWSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLHFCQUFXLENBQUMscUJBQVcsQ0FBQyxNQUFNLENBQUMsRUFBRSxFQUFDLFdBQVcsRUFBRSxFQUFFLHlCQUF5QixFQUFFLEVBQUMsT0FBTyxFQUFFLENBQUMsRUFBRSxJQUFJLEVBQUUsU0FBUyxFQUFFLEVBQUMsRUFBQyxDQUFDLENBQUM7b0JBRWpKLGFBQU0sQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLFVBQVUsRUFBRSxtREFBbUQsQ0FBQyxDQUFDO29CQUN4RixhQUFNLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxVQUFVLENBQUMsdUNBQXVDLEVBQUUsaUNBQXFCLENBQUMsU0FBUyxFQUFFLEVBQUUsT0FBTyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsNkNBQTZDLENBQUMsQ0FBQztnQkFDaEwsQ0FBQyxDQUFDLENBQUM7Z0JBRUgsRUFBRSxDQUFDLG1EQUFtRCxFQUFFO29CQUNwRCxZQUFZLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMscUJBQVcsQ0FBQyxxQkFBVyxDQUFDLE1BQU0sQ0FBQyxFQUFFLEVBQUMsUUFBUSxFQUFFLEVBQUMsV0FBVyxFQUFFLEVBQUUsT0FBTyxFQUFFLE1BQU0sRUFBRSxJQUFJLEVBQUUsU0FBUyxFQUFFLEVBQUMsRUFBQyxDQUFDLENBQUM7b0JBRXJJLGFBQU0sQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLE1BQU0sRUFBRSxtRUFBbUUsQ0FBQyxDQUFDO2dCQUN6RyxDQUFDLENBQUMsQ0FBQztZQUNQLENBQUMsQ0FBQyxDQUFDIn0=