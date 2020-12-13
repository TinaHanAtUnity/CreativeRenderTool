export class Observables {
    static once(observable, observer) {
        const wrapped = observable.subscribe(() => {
            observable.unsubscribe(wrapped);
            observer();
        });
        return wrapped;
    }
    static once1(observable, observer) {
        const wrapped = observable.subscribe((p1) => {
            observable.unsubscribe(wrapped);
            observer(p1);
        });
        return wrapped;
    }
    static once2(observable, observer) {
        const wrapped = observable.subscribe((p1, p2) => {
            observable.unsubscribe(wrapped);
            observer(p1, p2);
        });
        return wrapped;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiT2JzZXJ2YWJsZXMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9zcmMvdHMvQ29yZS9VdGlsaXRpZXMvT2JzZXJ2YWJsZXMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBR0EsTUFBTSxPQUFPLFdBQVc7SUFDYixNQUFNLENBQUMsSUFBSSxDQUFDLFVBQXVCLEVBQUUsUUFBb0I7UUFDNUQsTUFBTSxPQUFPLEdBQUcsVUFBVSxDQUFDLFNBQVMsQ0FBQyxHQUFHLEVBQUU7WUFDdEMsVUFBVSxDQUFDLFdBQVcsQ0FBQyxPQUFPLENBQUMsQ0FBQztZQUNoQyxRQUFRLEVBQUUsQ0FBQztRQUNmLENBQUMsQ0FBQyxDQUFDO1FBQ0gsT0FBTyxPQUFPLENBQUM7SUFDbkIsQ0FBQztJQUNNLE1BQU0sQ0FBQyxLQUFLLENBQUssVUFBMkIsRUFBRSxRQUF3QjtRQUN6RSxNQUFNLE9BQU8sR0FBRyxVQUFVLENBQUMsU0FBUyxDQUFDLENBQUMsRUFBRSxFQUFFLEVBQUU7WUFDeEMsVUFBVSxDQUFDLFdBQVcsQ0FBQyxPQUFPLENBQUMsQ0FBQztZQUNoQyxRQUFRLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDakIsQ0FBQyxDQUFDLENBQUM7UUFDSCxPQUFPLE9BQU8sQ0FBQztJQUNuQixDQUFDO0lBQ00sTUFBTSxDQUFDLEtBQUssQ0FBUyxVQUErQixFQUFFLFFBQTRCO1FBQ3JGLE1BQU0sT0FBTyxHQUFHLFVBQVUsQ0FBQyxTQUFTLENBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUU7WUFDNUMsVUFBVSxDQUFDLFdBQVcsQ0FBQyxPQUFPLENBQUMsQ0FBQztZQUNoQyxRQUFRLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFDO1FBQ3JCLENBQUMsQ0FBQyxDQUFDO1FBQ0gsT0FBTyxPQUFPLENBQUM7SUFDbkIsQ0FBQztDQUNKIn0=