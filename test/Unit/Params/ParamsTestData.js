System.register(["json/events/ConfigRequest.json", "json/events/AdRequest.json", "json/events/VideoEvents.json", "json/events/ClickEvent.json", "json/events/Parameters.json", "json/events/RealtimeAdRequest.json"], function (exports_1, context_1) {
    "use strict";
    var ConfigRequest_json_1, AdRequest_json_1, VideoEvents_json_1, ClickEvent_json_1, Parameters_json_1, RealtimeAdRequest_json_1, ParamsTestData;
    var __moduleName = context_1 && context_1.id;
    return {
        setters: [
            function (ConfigRequest_json_1_1) {
                ConfigRequest_json_1 = ConfigRequest_json_1_1;
            },
            function (AdRequest_json_1_1) {
                AdRequest_json_1 = AdRequest_json_1_1;
            },
            function (VideoEvents_json_1_1) {
                VideoEvents_json_1 = VideoEvents_json_1_1;
            },
            function (ClickEvent_json_1_1) {
                ClickEvent_json_1 = ClickEvent_json_1_1;
            },
            function (Parameters_json_1_1) {
                Parameters_json_1 = Parameters_json_1_1;
            },
            function (RealtimeAdRequest_json_1_1) {
                RealtimeAdRequest_json_1 = RealtimeAdRequest_json_1_1;
            }
        ],
        execute: function () {
            ParamsTestData = /** @class */ (function () {
                function ParamsTestData() {
                }
                ParamsTestData.getConfigRequestParams = function () {
                    return ParamsTestData.getEventSpec(ConfigRequest_json_1.default);
                };
                ParamsTestData.getAdRequestParams = function () {
                    return ParamsTestData.getEventSpec(AdRequest_json_1.default);
                };
                ParamsTestData.getVideoEventParams = function () {
                    return ParamsTestData.getEventSpec(VideoEvents_json_1.default);
                };
                ParamsTestData.getClickEventParams = function () {
                    return ParamsTestData.getEventSpec(ClickEvent_json_1.default);
                };
                ParamsTestData.getRealtimeAdRequestParams = function () {
                    return ParamsTestData.getEventSpec(RealtimeAdRequest_json_1.default);
                };
                ParamsTestData.getEventSpec = function (rawData) {
                    var spec = {};
                    var parsedSpec = JSON.parse(rawData);
                    var parsedParams = JSON.parse(Parameters_json_1.default);
                    var params = parsedSpec.parameters;
                    var types = {};
                    for (var _i = 0, parsedParams_1 = parsedParams; _i < parsedParams_1.length; _i++) {
                        var parsedParam = parsedParams_1[_i];
                        types[parsedParam.key] = parsedParam.type;
                    }
                    for (var _a = 0, params_1 = params; _a < params_1.length; _a++) {
                        var param = params_1[_a];
                        spec[param.parameter] = {
                            parameter: param.parameter,
                            required: param.required,
                            queryString: param.queryString,
                            body: param.body,
                            type: types[param.parameter]
                        };
                    }
                    return spec;
                };
                return ParamsTestData;
            }());
            exports_1("ParamsTestData", ParamsTestData);
        }
    };
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUGFyYW1zVGVzdERhdGEuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJQYXJhbXNUZXN0RGF0YS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztZQXNDQTtnQkFBQTtnQkE0Q0EsQ0FBQztnQkEzQ2lCLHFDQUFzQixHQUFwQztvQkFDSSxPQUFPLGNBQWMsQ0FBQyxZQUFZLENBQUMsNEJBQWlCLENBQUMsQ0FBQztnQkFDMUQsQ0FBQztnQkFFYSxpQ0FBa0IsR0FBaEM7b0JBQ0ksT0FBTyxjQUFjLENBQUMsWUFBWSxDQUFDLHdCQUFhLENBQUMsQ0FBQztnQkFDdEQsQ0FBQztnQkFFYSxrQ0FBbUIsR0FBakM7b0JBQ0ksT0FBTyxjQUFjLENBQUMsWUFBWSxDQUFDLDBCQUFjLENBQUMsQ0FBQztnQkFDdkQsQ0FBQztnQkFFYSxrQ0FBbUIsR0FBakM7b0JBQ0ksT0FBTyxjQUFjLENBQUMsWUFBWSxDQUFDLHlCQUFjLENBQUMsQ0FBQztnQkFDdkQsQ0FBQztnQkFFYSx5Q0FBMEIsR0FBeEM7b0JBQ0ksT0FBTyxjQUFjLENBQUMsWUFBWSxDQUFDLGdDQUFzQixDQUFDLENBQUM7Z0JBQy9ELENBQUM7Z0JBRWMsMkJBQVksR0FBM0IsVUFBNEIsT0FBWTtvQkFDcEMsSUFBTSxJQUFJLEdBQWUsRUFBRSxDQUFDO29CQUM1QixJQUFNLFVBQVUsR0FBa0IsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQztvQkFDdEQsSUFBTSxZQUFZLEdBQW9CLElBQUksQ0FBQyxLQUFLLENBQUMseUJBQWEsQ0FBQyxDQUFDO29CQUNoRSxJQUFNLE1BQU0sR0FBeUIsVUFBVSxDQUFDLFVBQVUsQ0FBQztvQkFDM0QsSUFBTSxLQUFLLEdBQTJCLEVBQUUsQ0FBQztvQkFFekMsS0FBeUIsVUFBWSxFQUFaLDZCQUFZLEVBQVosMEJBQVksRUFBWixJQUFZLEVBQUU7d0JBQW5DLElBQU0sV0FBVyxxQkFBQTt3QkFDakIsS0FBSyxDQUFDLFdBQVcsQ0FBQyxHQUFHLENBQUMsR0FBRyxXQUFXLENBQUMsSUFBSSxDQUFDO3FCQUM3QztvQkFFRCxLQUFtQixVQUFNLEVBQU4saUJBQU0sRUFBTixvQkFBTSxFQUFOLElBQU0sRUFBRTt3QkFBdkIsSUFBTSxLQUFLLGVBQUE7d0JBQ1gsSUFBSSxDQUFDLEtBQUssQ0FBQyxTQUFTLENBQUMsR0FBRzs0QkFDcEIsU0FBUyxFQUFFLEtBQUssQ0FBQyxTQUFTOzRCQUMxQixRQUFRLEVBQUUsS0FBSyxDQUFDLFFBQVE7NEJBQ3hCLFdBQVcsRUFBRSxLQUFLLENBQUMsV0FBVzs0QkFDOUIsSUFBSSxFQUFFLEtBQUssQ0FBQyxJQUFJOzRCQUNoQixJQUFJLEVBQUUsS0FBSyxDQUFDLEtBQUssQ0FBQyxTQUFTLENBQUM7eUJBQy9CLENBQUM7cUJBQ0w7b0JBRUQsT0FBTyxJQUFJLENBQUM7Z0JBQ2hCLENBQUM7Z0JBQ0wscUJBQUM7WUFBRCxDQUFDLEFBNUNELElBNENDIn0=