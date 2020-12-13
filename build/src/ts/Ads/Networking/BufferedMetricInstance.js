export class BufferedMetricInstance {
    constructor() {
        this._metrics = [];
        this._timings = [];
    }
    forwardTo(metricInstance) {
        this._metrics.forEach(x => {
            metricInstance.reportMetricEventWithTags(x.event, x.tags);
        });
        this._timings.forEach(x => {
            metricInstance.reportTimingEventWithTags(x.event, x.value, x.tags);
        });
    }
    reportMetricEvent(event) {
        this._metrics.push({
            event: event,
            tags: {}
        });
    }
    reportMetricEventWithTags(event, tags) {
        this._metrics.push({
            event: event,
            tags: tags
        });
    }
    reportTimingEvent(event, value) {
        this._timings.push({
            event: event,
            value: value,
            tags: {}
        });
    }
    reportTimingEventWithTags(event, value, tags) {
        this._timings.push({
            event: event,
            value: value,
            tags: tags
        });
    }
    sendBatchedEvents() {
        return Promise.resolve([]);
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQnVmZmVyZWRNZXRyaWNJbnN0YW5jZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NyYy90cy9BZHMvTmV0d29ya2luZy9CdWZmZXJlZE1ldHJpY0luc3RhbmNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQWFBLE1BQU0sT0FBTyxzQkFBc0I7SUFJL0I7UUFDSSxJQUFJLENBQUMsUUFBUSxHQUFHLEVBQUUsQ0FBQztRQUNuQixJQUFJLENBQUMsUUFBUSxHQUFHLEVBQUUsQ0FBQztJQUN2QixDQUFDO0lBRU0sU0FBUyxDQUFDLGNBQStCO1FBQzVDLElBQUksQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxFQUFFO1lBQ3RCLGNBQWMsQ0FBQyx5QkFBeUIsQ0FBQyxDQUFDLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUM5RCxDQUFDLENBQUMsQ0FBQztRQUNILElBQUksQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxFQUFFO1lBQ3RCLGNBQWMsQ0FBQyx5QkFBeUIsQ0FBQyxDQUFDLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ3ZFLENBQUMsQ0FBQyxDQUFDO0lBQ1AsQ0FBQztJQUVNLGlCQUFpQixDQUFDLEtBQWU7UUFDcEMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUM7WUFDZixLQUFLLEVBQUUsS0FBSztZQUNaLElBQUksRUFBRSxFQUFFO1NBQ1gsQ0FBQyxDQUFDO0lBQ1AsQ0FBQztJQUVNLHlCQUF5QixDQUFDLEtBQWUsRUFBRSxJQUErQjtRQUM3RSxJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQztZQUNmLEtBQUssRUFBRSxLQUFLO1lBQ1osSUFBSSxFQUFFLElBQUk7U0FDYixDQUFDLENBQUM7SUFDUCxDQUFDO0lBRU0saUJBQWlCLENBQUMsS0FBa0IsRUFBRSxLQUFhO1FBQ3RELElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDO1lBQ2YsS0FBSyxFQUFFLEtBQUs7WUFDWixLQUFLLEVBQUUsS0FBSztZQUNaLElBQUksRUFBRSxFQUFFO1NBQ1gsQ0FBQyxDQUFDO0lBQ1AsQ0FBQztJQUVNLHlCQUF5QixDQUFDLEtBQWtCLEVBQUUsS0FBYSxFQUFFLElBQStCO1FBQy9GLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDO1lBQ2YsS0FBSyxFQUFFLEtBQUs7WUFDWixLQUFLLEVBQUUsS0FBSztZQUNaLElBQUksRUFBRSxJQUFJO1NBQ2IsQ0FBQyxDQUFDO0lBQ1AsQ0FBQztJQUVNLGlCQUFpQjtRQUNwQixPQUFPLE9BQU8sQ0FBQyxPQUFPLENBQVMsRUFBRSxDQUFDLENBQUM7SUFDdkMsQ0FBQztDQUNKIn0=