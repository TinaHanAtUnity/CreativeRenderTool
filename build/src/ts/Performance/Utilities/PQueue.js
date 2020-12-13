//
// NOTE! for the color tinting experiment only
//
export class PQueue {
    constructor(comparator) {
        this._arr = [];
        this._comparator = comparator;
    }
    push(elem) {
        this._arr.push(elem);
        this._arr.sort(this._comparator);
    }
    pop() {
        return this._arr.shift();
    }
    size() {
        return this._arr.length;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUFF1ZXVlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vc3JjL3RzL1BlcmZvcm1hbmNlL1V0aWxpdGllcy9QUXVldWUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsRUFBRTtBQUNGLDhDQUE4QztBQUM5QyxFQUFFO0FBRUYsTUFBTSxPQUFPLE1BQU07SUFJZixZQUFZLFVBQWtDO1FBQzFDLElBQUksQ0FBQyxJQUFJLEdBQUcsRUFBRSxDQUFDO1FBQ2YsSUFBSSxDQUFDLFdBQVcsR0FBRyxVQUFVLENBQUM7SUFDbEMsQ0FBQztJQUVNLElBQUksQ0FBQyxJQUFPO1FBQ2YsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDckIsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDO0lBQ3JDLENBQUM7SUFFTSxHQUFHO1FBQ04sT0FBTyxJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssRUFBRSxDQUFDO0lBQzdCLENBQUM7SUFFTSxJQUFJO1FBQ1AsT0FBTyxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQztJQUM1QixDQUFDO0NBQ0oifQ==