"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const interface_1 = require("./interface");
class DelegateTree {
    constructor(_other) {
        this._other = _other;
    }
    branch() { return this._other.branch(); }
    merge(other, strategy) { this._other.merge(other, strategy); }
    get root() { return this._other.root; }
    // Readonly.
    read(path) { return this._other.read(path); }
    exists(path) { return this._other.exists(path); }
    get(path) { return this._other.get(path); }
    getDir(path) { return this._other.getDir(path); }
    visit(visitor) { return this._other.visit(visitor); }
    // Change content of host files.
    overwrite(path, content) {
        return this._other.overwrite(path, content);
    }
    beginUpdate(path) { return this._other.beginUpdate(path); }
    commitUpdate(record) { return this._other.commitUpdate(record); }
    // Structural methods.
    create(path, content) {
        return this._other.create(path, content);
    }
    delete(path) { return this._other.delete(path); }
    rename(from, to) { return this._other.rename(from, to); }
    apply(action, strategy) {
        return this._other.apply(action, strategy);
    }
    get actions() { return this._other.actions; }
    [interface_1.TreeSymbol]() {
        return this;
    }
}
exports.DelegateTree = DelegateTree;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGVsZWdhdGUuanMiLCJzb3VyY2VSb290IjoiL1VzZXJzL2hhbnNsL1NvdXJjZXMvaGFuc2wvZGV2a2l0LyIsInNvdXJjZXMiOlsicGFja2FnZXMvYW5ndWxhcl9kZXZraXQvc2NoZW1hdGljcy9zcmMvdHJlZS9kZWxlZ2F0ZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQVFBLDJDQVFxQjtBQUVyQjtJQUNFLFlBQXNCLE1BQVk7UUFBWixXQUFNLEdBQU4sTUFBTSxDQUFNO0lBQUcsQ0FBQztJQUV0QyxNQUFNLEtBQVcsTUFBTSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQyxDQUFDO0lBQy9DLEtBQUssQ0FBQyxLQUFXLEVBQUUsUUFBd0IsSUFBVSxJQUFJLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxLQUFLLEVBQUUsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBRTFGLElBQUksSUFBSSxLQUFlLE1BQU0sQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7SUFFakQsWUFBWTtJQUNaLElBQUksQ0FBQyxJQUFZLElBQW1CLE1BQU0sQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDcEUsTUFBTSxDQUFDLElBQVksSUFBYSxNQUFNLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQ2xFLEdBQUcsQ0FBQyxJQUFZLElBQXNCLE1BQU0sQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDckUsTUFBTSxDQUFDLElBQVksSUFBYyxNQUFNLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQ25FLEtBQUssQ0FBQyxPQUFvQixJQUFVLE1BQU0sQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFFeEUsZ0NBQWdDO0lBQ2hDLFNBQVMsQ0FBQyxJQUFZLEVBQUUsT0FBd0I7UUFDOUMsTUFBTSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDLElBQUksRUFBRSxPQUFPLENBQUMsQ0FBQztJQUM5QyxDQUFDO0lBQ0QsV0FBVyxDQUFDLElBQVksSUFBb0IsTUFBTSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUNuRixZQUFZLENBQUMsTUFBc0IsSUFBVSxNQUFNLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxZQUFZLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBRXZGLHNCQUFzQjtJQUN0QixNQUFNLENBQUMsSUFBWSxFQUFFLE9BQXdCO1FBQzNDLE1BQU0sQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxJQUFJLEVBQUUsT0FBTyxDQUFDLENBQUM7SUFDM0MsQ0FBQztJQUNELE1BQU0sQ0FBQyxJQUFZLElBQVUsTUFBTSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUMvRCxNQUFNLENBQUMsSUFBWSxFQUFFLEVBQVUsSUFBVSxNQUFNLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsSUFBSSxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUUvRSxLQUFLLENBQUMsTUFBYyxFQUFFLFFBQXdCO1FBQzVDLE1BQU0sQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxNQUFNLEVBQUUsUUFBUSxDQUFDLENBQUM7SUFDN0MsQ0FBQztJQUNELElBQUksT0FBTyxLQUFlLE1BQU0sQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUM7SUFFdkQsQ0FBQyxzQkFBVSxDQUFDO1FBQ1YsTUFBTSxDQUFDLElBQUksQ0FBQztJQUNkLENBQUM7Q0FDRjtBQXJDRCxvQ0FxQ0MiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIEluYy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5pbXBvcnQgeyBBY3Rpb24gfSBmcm9tICcuL2FjdGlvbic7XG5pbXBvcnQge1xuICBEaXJFbnRyeSxcbiAgRmlsZUVudHJ5LFxuICBGaWxlVmlzaXRvcixcbiAgTWVyZ2VTdHJhdGVneSxcbiAgVHJlZSxcbiAgVHJlZVN5bWJvbCxcbiAgVXBkYXRlUmVjb3JkZXIsXG59IGZyb20gJy4vaW50ZXJmYWNlJztcblxuZXhwb3J0IGNsYXNzIERlbGVnYXRlVHJlZSBpbXBsZW1lbnRzIFRyZWUge1xuICBjb25zdHJ1Y3Rvcihwcm90ZWN0ZWQgX290aGVyOiBUcmVlKSB7fVxuXG4gIGJyYW5jaCgpOiBUcmVlIHsgcmV0dXJuIHRoaXMuX290aGVyLmJyYW5jaCgpOyB9XG4gIG1lcmdlKG90aGVyOiBUcmVlLCBzdHJhdGVneT86IE1lcmdlU3RyYXRlZ3kpOiB2b2lkIHsgdGhpcy5fb3RoZXIubWVyZ2Uob3RoZXIsIHN0cmF0ZWd5KTsgfVxuXG4gIGdldCByb290KCk6IERpckVudHJ5IHsgcmV0dXJuIHRoaXMuX290aGVyLnJvb3Q7IH1cblxuICAvLyBSZWFkb25seS5cbiAgcmVhZChwYXRoOiBzdHJpbmcpOiBCdWZmZXIgfCBudWxsIHsgcmV0dXJuIHRoaXMuX290aGVyLnJlYWQocGF0aCk7IH1cbiAgZXhpc3RzKHBhdGg6IHN0cmluZyk6IGJvb2xlYW4geyByZXR1cm4gdGhpcy5fb3RoZXIuZXhpc3RzKHBhdGgpOyB9XG4gIGdldChwYXRoOiBzdHJpbmcpOiBGaWxlRW50cnkgfCBudWxsIHsgcmV0dXJuIHRoaXMuX290aGVyLmdldChwYXRoKTsgfVxuICBnZXREaXIocGF0aDogc3RyaW5nKTogRGlyRW50cnkgeyByZXR1cm4gdGhpcy5fb3RoZXIuZ2V0RGlyKHBhdGgpOyB9XG4gIHZpc2l0KHZpc2l0b3I6IEZpbGVWaXNpdG9yKTogdm9pZCB7IHJldHVybiB0aGlzLl9vdGhlci52aXNpdCh2aXNpdG9yKTsgfVxuXG4gIC8vIENoYW5nZSBjb250ZW50IG9mIGhvc3QgZmlsZXMuXG4gIG92ZXJ3cml0ZShwYXRoOiBzdHJpbmcsIGNvbnRlbnQ6IEJ1ZmZlciB8IHN0cmluZyk6IHZvaWQge1xuICAgIHJldHVybiB0aGlzLl9vdGhlci5vdmVyd3JpdGUocGF0aCwgY29udGVudCk7XG4gIH1cbiAgYmVnaW5VcGRhdGUocGF0aDogc3RyaW5nKTogVXBkYXRlUmVjb3JkZXIgeyByZXR1cm4gdGhpcy5fb3RoZXIuYmVnaW5VcGRhdGUocGF0aCk7IH1cbiAgY29tbWl0VXBkYXRlKHJlY29yZDogVXBkYXRlUmVjb3JkZXIpOiB2b2lkIHsgcmV0dXJuIHRoaXMuX290aGVyLmNvbW1pdFVwZGF0ZShyZWNvcmQpOyB9XG5cbiAgLy8gU3RydWN0dXJhbCBtZXRob2RzLlxuICBjcmVhdGUocGF0aDogc3RyaW5nLCBjb250ZW50OiBCdWZmZXIgfCBzdHJpbmcpOiB2b2lkIHtcbiAgICByZXR1cm4gdGhpcy5fb3RoZXIuY3JlYXRlKHBhdGgsIGNvbnRlbnQpO1xuICB9XG4gIGRlbGV0ZShwYXRoOiBzdHJpbmcpOiB2b2lkIHsgcmV0dXJuIHRoaXMuX290aGVyLmRlbGV0ZShwYXRoKTsgfVxuICByZW5hbWUoZnJvbTogc3RyaW5nLCB0bzogc3RyaW5nKTogdm9pZCB7IHJldHVybiB0aGlzLl9vdGhlci5yZW5hbWUoZnJvbSwgdG8pOyB9XG5cbiAgYXBwbHkoYWN0aW9uOiBBY3Rpb24sIHN0cmF0ZWd5PzogTWVyZ2VTdHJhdGVneSk6IHZvaWQge1xuICAgIHJldHVybiB0aGlzLl9vdGhlci5hcHBseShhY3Rpb24sIHN0cmF0ZWd5KTtcbiAgfVxuICBnZXQgYWN0aW9ucygpOiBBY3Rpb25bXSB7IHJldHVybiB0aGlzLl9vdGhlci5hY3Rpb25zOyB9XG5cbiAgW1RyZWVTeW1ib2xdKCkge1xuICAgIHJldHVybiB0aGlzO1xuICB9XG59XG4iXX0=