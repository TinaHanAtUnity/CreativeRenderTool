import { HttpKafka, KafkaCommonObjectType } from 'Core/Utilities/HttpKafka';
export class Analytics {
    static trigger(type, data) {
        // ElasticSearch schema generation can result in dropping errors if root values are not the same type across errors
        if (!data || typeof data !== 'object' || Array.isArray(data)) {
            data = {
                value: data
            };
        }
        return HttpKafka.sendEvent('ads.sdk2.analytics', KafkaCommonObjectType.ANONYMOUS, data);
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQW5hbHl0aWNzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vc3JjL3RzL0Fkcy9VdGlsaXRpZXMvQW5hbHl0aWNzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUNBLE9BQU8sRUFBRSxTQUFTLEVBQUUscUJBQXFCLEVBQUUsTUFBTSwwQkFBMEIsQ0FBQztBQUU1RSxNQUFNLE9BQU8sU0FBUztJQUNYLE1BQU0sQ0FBQyxPQUFPLENBQUMsSUFBWSxFQUFFLElBQVE7UUFDeEMsbUhBQW1IO1FBQ25ILElBQUksQ0FBQyxJQUFJLElBQUksT0FBTyxJQUFJLEtBQUssUUFBUSxJQUFJLEtBQUssQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLEVBQUU7WUFDMUQsSUFBSSxHQUFHO2dCQUNILEtBQUssRUFBRSxJQUFJO2FBQ2QsQ0FBQztTQUNMO1FBQ0QsT0FBTyxTQUFTLENBQUMsU0FBUyxDQUFDLG9CQUFvQixFQUFFLHFCQUFxQixDQUFDLFNBQVMsRUFBRSxJQUFJLENBQUMsQ0FBQztJQUM1RixDQUFDO0NBQ0oifQ==