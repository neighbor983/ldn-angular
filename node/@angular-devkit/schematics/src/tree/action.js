"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
const core_1 = require("@angular-devkit/core");
class UnknownActionException extends core_1.BaseException {
    constructor(action) { super(`Unknown action: "${action.kind}".`); }
}
exports.UnknownActionException = UnknownActionException;
let _id = 1;
class ActionList {
    constructor() {
        this._actions = [];
    }
    _action(action) {
        this._actions.push(Object.assign({
            id: _id++,
            parent: this._actions[this._actions.length - 1] || 0,
        }, action));
    }
    create(path, content) {
        this._action({ kind: 'c', path, content });
    }
    overwrite(path, content) {
        this._action({ kind: 'o', path, content });
    }
    rename(path, to) {
        this._action({ kind: 'r', path, to });
    }
    delete(path) {
        this._action({ kind: 'd', path });
    }
    optimize() {
        const actions = this._actions;
        const deleted = new Set();
        this._actions = [];
        // Handles files we create.
        for (let i = 0; i < actions.length; i++) {
            const iAction = actions[i];
            if (iAction.kind == 'c') {
                let path = iAction.path;
                let content = iAction.content;
                let toDelete = false;
                deleted.delete(path);
                for (let j = i + 1; j < actions.length; j++) {
                    const action = actions[j];
                    if (path == action.path) {
                        switch (action.kind) {
                            case 'c':
                                content = action.content;
                                actions.splice(j--, 1);
                                break;
                            case 'o':
                                content = action.content;
                                actions.splice(j--, 1);
                                break;
                            case 'r':
                                path = action.to;
                                actions.splice(j--, 1);
                                break;
                            case 'd':
                                toDelete = true;
                                actions.splice(j--, 1);
                                break;
                        }
                    }
                    if (toDelete) {
                        break;
                    }
                }
                if (!toDelete) {
                    this.create(path, content);
                }
                else {
                    deleted.add(path);
                }
            }
            else if (deleted.has(iAction.path)) {
                // DoNothing
            }
            else {
                switch (iAction.kind) {
                    case 'o':
                        this.overwrite(iAction.path, iAction.content);
                        break;
                    case 'r':
                        this.rename(iAction.path, iAction.to);
                        break;
                    case 'd':
                        this.delete(iAction.path);
                        break;
                }
            }
        }
    }
    push(action) { this._actions.push(action); }
    get(i) { return this._actions[i]; }
    has(action) {
        for (let i = 0; i < this._actions.length; i++) {
            const a = this._actions[i];
            if (a.id == action.id) {
                return true;
            }
            if (a.id > action.id) {
                return false;
            }
        }
        return false;
    }
    find(predicate) {
        return this._actions.find(predicate) || null;
    }
    forEach(fn, thisArg) {
        this._actions.forEach(fn, thisArg);
    }
    get length() { return this._actions.length; }
    [Symbol.iterator]() { return this._actions[Symbol.iterator](); }
}
exports.ActionList = ActionList;
function isContentAction(action) {
    return action.kind == 'c' || action.kind == 'o';
}
exports.isContentAction = isContentAction;
function isAction(action) {
    const kind = action && action.kind;
    return action !== null
        && typeof action.id == 'number'
        && typeof action.path == 'string'
        && (kind == 'c' || kind == 'o' || kind == 'r' || kind == 'd');
}
exports.isAction = isAction;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWN0aW9uLmpzIiwic291cmNlUm9vdCI6Ii9Vc2Vycy9oYW5zbC9Tb3VyY2VzL2hhbnNsL2RldmtpdC8iLCJzb3VyY2VzIjpbInBhY2thZ2VzL2FuZ3VsYXJfZGV2a2l0L3NjaGVtYXRpY3Mvc3JjL3RyZWUvYWN0aW9uLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUE7Ozs7OztHQU1HO0FBQ0gsK0NBQTJEO0FBRzNELDRCQUFvQyxTQUFRLG9CQUFhO0lBQ3ZELFlBQVksTUFBYyxJQUFJLEtBQUssQ0FBQyxvQkFBb0IsTUFBTSxDQUFDLElBQUksSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO0NBQzVFO0FBRkQsd0RBRUM7QUFnQkQsSUFBSSxHQUFHLEdBQUcsQ0FBQyxDQUFDO0FBRVo7SUFBQTtRQUNVLGFBQVEsR0FBYSxFQUFFLENBQUM7SUE0RmxDLENBQUM7SUExRlcsT0FBTyxDQUFDLE1BQXVCO1FBQ3ZDLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUM7WUFDL0IsRUFBRSxFQUFFLEdBQUcsRUFBRTtZQUNULE1BQU0sRUFBRSxJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUM7U0FDckQsRUFBRSxNQUFNLENBQVcsQ0FBQyxDQUFDO0lBQ3hCLENBQUM7SUFFRCxNQUFNLENBQUMsSUFBVSxFQUFFLE9BQWU7UUFDaEMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxFQUFFLElBQUksRUFBRSxHQUFHLEVBQUUsSUFBSSxFQUFFLE9BQU8sRUFBRSxDQUFDLENBQUM7SUFDN0MsQ0FBQztJQUNELFNBQVMsQ0FBQyxJQUFVLEVBQUUsT0FBZTtRQUNuQyxJQUFJLENBQUMsT0FBTyxDQUFDLEVBQUUsSUFBSSxFQUFFLEdBQUcsRUFBRSxJQUFJLEVBQUUsT0FBTyxFQUFFLENBQUMsQ0FBQztJQUM3QyxDQUFDO0lBQ0QsTUFBTSxDQUFDLElBQVUsRUFBRSxF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QUFJLElBQUksSUFBSSxHQUFHLElBQUksSUFBSSxJQUFJLEdBQUcsQ0FBQyxDQUFDO0FBQ3BFLENBQUM7QUFQRCw0QkFPQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgSW5jLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cbmltcG9ydCB7IEJhc2VFeGNlcHRpb24sIFBhdGggfSBmcm9tICdAYW5ndWxhci1kZXZraXQvY29yZSc7XG5cblxuZXhwb3J0IGNsYXNzIFVua25vd25BY3Rpb25FeGNlcHRpb24gZXh0ZW5kcyBCYXNlRXhjZXB0aW9uIHtcbiAgY29uc3RydWN0b3IoYWN0aW9uOiBBY3Rpb24pIHsgc3VwZXIoYFVua25vd24gYWN0aW9uOiBcIiR7YWN0aW9uLmtpbmR9XCIuYCk7IH1cbn1cblxuXG5leHBvcnQgdHlwZSBBY3Rpb24gPSBDcmVhdGVGaWxlQWN0aW9uXG4gICAgICAgICAgICAgICAgICAgfCBPdmVyd3JpdGVGaWxlQWN0aW9uXG4gICAgICAgICAgICAgICAgICAgfCBSZW5hbWVGaWxlQWN0aW9uXG4gICAgICAgICAgICAgICAgICAgfCBEZWxldGVGaWxlQWN0aW9uO1xuXG5cbmV4cG9ydCBpbnRlcmZhY2UgQWN0aW9uQmFzZSB7XG4gIHJlYWRvbmx5IGlkOiBudW1iZXI7XG4gIHJlYWRvbmx5IHBhcmVudDogbnVtYmVyO1xuICByZWFkb25seSBwYXRoOiBQYXRoO1xufVxuXG5cbmxldCBfaWQgPSAxO1xuXG5leHBvcnQgY2xhc3MgQWN0aW9uTGlzdCBpbXBsZW1lbnRzIEl0ZXJhYmxlPEFjdGlvbj4ge1xuICBwcml2YXRlIF9hY3Rpb25zOiBBY3Rpb25bXSA9IFtdO1xuXG4gIHByb3RlY3RlZCBfYWN0aW9uKGFjdGlvbjogUGFydGlhbDxBY3Rpb24+KSB7XG4gICAgdGhpcy5fYWN0aW9ucy5wdXNoKE9iamVjdC5hc3NpZ24oe1xuICAgICAgaWQ6IF9pZCsrLFxuICAgICAgcGFyZW50OiB0aGlzLl9hY3Rpb25zW3RoaXMuX2FjdGlvbnMubGVuZ3RoIC0gMV0gfHwgMCxcbiAgICB9LCBhY3Rpb24pIGFzIEFjdGlvbik7XG4gIH1cblxuICBjcmVhdGUocGF0aDogUGF0aCwgY29udGVudDogQnVmZmVyKSB7XG4gICAgdGhpcy5fYWN0aW9uKHsga2luZDogJ2MnLCBwYXRoLCBjb250ZW50IH0pO1xuICB9XG4gIG92ZXJ3cml0ZShwYXRoOiBQYXRoLCBjb250ZW50OiBCdWZmZXIpIHtcbiAgICB0aGlzLl9hY3Rpb24oeyBraW5kOiAnbycsIHBhdGgsIGNvbnRlbnQgfSk7XG4gIH1cbiAgcmVuYW1lKHBhdGg6IFBhdGgsIHRvOiBQYXRoKSB7XG4gICAgdGhpcy5fYWN0aW9uKHsga2luZDogJ3InLCBwYXRoLCB0byB9KTtcbiAgfVxuICBkZWxldGUocGF0aDogUGF0aCkge1xuICAgIHRoaXMuX2FjdGlvbih7IGtpbmQ6ICdkJywgcGF0aCB9KTtcbiAgfVxuXG5cbiAgb3B0aW1pemUoKSB7XG4gICAgY29uc3QgYWN0aW9ucyA9IHRoaXMuX2FjdGlvbnM7XG4gICAgY29uc3QgZGVsZXRlZCA9IG5ldyBTZXQ8c3RyaW5nPigpO1xuICAgIHRoaXMuX2FjdGlvbnMgPSBbXTtcblxuICAgIC8vIEhhbmRsZXMgZmlsZXMgd2UgY3JlYXRlLlxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgYWN0aW9ucy5sZW5ndGg7IGkrKykge1xuICAgICAgY29uc3QgaUFjdGlvbiA9IGFjdGlvbnNbaV07XG4gICAgICBpZiAoaUFjdGlvbi5raW5kID09ICdjJykge1xuICAgICAgICBsZXQgcGF0aCA9IGlBY3Rpb24ucGF0aDtcbiAgICAgICAgbGV0IGNvbnRlbnQgPSBpQWN0aW9uLmNvbnRlbnQ7XG4gICAgICAgIGxldCB0b0RlbGV0ZSA9IGZhbHNlO1xuICAgICAgICBkZWxldGVkLmRlbGV0ZShwYXRoKTtcblxuICAgICAgICBmb3IgKGxldCBqID0gaSArIDE7IGogPCBhY3Rpb25zLmxlbmd0aDsgaisrKSB7XG4gICAgICAgICAgY29uc3QgYWN0aW9uID0gYWN0aW9uc1tqXTtcbiAgICAgICAgICBpZiAocGF0aCA9PSBhY3Rpb24ucGF0aCkge1xuICAgICAgICAgICAgc3dpdGNoIChhY3Rpb24ua2luZCkge1xuICAgICAgICAgICAgICBjYXNlICdjJzogY29udGVudCA9IGFjdGlvbi5jb250ZW50OyBhY3Rpb25zLnNwbGljZShqLS0sIDEpOyBicmVhaztcbiAgICAgICAgICAgICAgY2FzZSAnbyc6IGNvbnRlbnQgPSBhY3Rpb24uY29udGVudDsgYWN0aW9ucy5zcGxpY2Uoai0tLCAxKTsgYnJlYWs7XG4gICAgICAgICAgICAgIGNhc2UgJ3InOiBwYXRoID0gYWN0aW9uLnRvOyBhY3Rpb25zLnNwbGljZShqLS0sIDEpOyBicmVhaztcbiAgICAgICAgICAgICAgY2FzZSAnZCc6IHRvRGVsZXRlID0gdHJ1ZTsgYWN0aW9ucy5zcGxpY2Uoai0tLCAxKTsgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICAgIGlmICh0b0RlbGV0ZSkge1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKCF0b0RlbGV0ZSkge1xuICAgICAgICAgIHRoaXMuY3JlYXRlKHBhdGgsIGNvbnRlbnQpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGRlbGV0ZWQuYWRkKHBhdGgpO1xuICAgICAgICB9XG4gICAgICB9IGVsc2UgaWYgKGRlbGV0ZWQuaGFzKGlBY3Rpb24ucGF0aCkpIHtcbiAgICAgICAgLy8gRG9Ob3RoaW5nXG4gICAgICB9IGVsc2Uge1xuICAgICAgICBzd2l0Y2ggKGlBY3Rpb24ua2luZCkge1xuICAgICAgICAgIGNhc2UgJ28nOiB0aGlzLm92ZXJ3cml0ZShpQWN0aW9uLnBhdGgsIGlBY3Rpb24uY29udGVudCk7IGJyZWFrO1xuICAgICAgICAgIGNhc2UgJ3InOiB0aGlzLnJlbmFtZShpQWN0aW9uLnBhdGgsIGlBY3Rpb24udG8pOyBicmVhaztcbiAgICAgICAgICBjYXNlICdkJzogdGhpcy5kZWxldGUoaUFjdGlvbi5wYXRoKTsgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBwdXNoKGFjdGlvbjogQWN0aW9uKSB7IHRoaXMuX2FjdGlvbnMucHVzaChhY3Rpb24pOyB9XG4gIGdldChpOiBudW1iZXIpIHsgcmV0dXJuIHRoaXMuX2FjdGlvbnNbaV07IH1cbiAgaGFzKGFjdGlvbjogQWN0aW9uKSB7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0aGlzLl9hY3Rpb25zLmxlbmd0aDsgaSsrKSB7XG4gICAgICBjb25zdCBhID0gdGhpcy5fYWN0aW9uc1tpXTtcbiAgICAgIGlmIChhLmlkID09IGFjdGlvbi5pZCkge1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgIH1cbiAgICAgIGlmIChhLmlkID4gYWN0aW9uLmlkKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbiAgZmluZChwcmVkaWNhdGU6ICh2YWx1ZTogQWN0aW9uKSA9PiBib29sZWFuKTogQWN0aW9uIHwgbnVsbCB7XG4gICAgcmV0dXJuIHRoaXMuX2FjdGlvbnMuZmluZChwcmVkaWNhdGUpIHx8IG51bGw7XG4gIH1cbiAgZm9yRWFjaChmbjogKHZhbHVlOiBBY3Rpb24sIGluZGV4OiBudW1iZXIsIGFycmF5OiBBY3Rpb25bXSkgPT4gdm9pZCwgdGhpc0FyZz86IHt9KSB7XG4gICAgdGhpcy5fYWN0aW9ucy5mb3JFYWNoKGZuLCB0aGlzQXJnKTtcbiAgfVxuICBnZXQgbGVuZ3RoKCkgeyByZXR1cm4gdGhpcy5fYWN0aW9ucy5sZW5ndGg7IH1cbiAgW1N5bWJvbC5pdGVyYXRvcl0oKSB7IHJldHVybiB0aGlzLl9hY3Rpb25zW1N5bWJvbC5pdGVyYXRvcl0oKTsgfVxufVxuXG5cbmV4cG9ydCBmdW5jdGlvbiBpc0NvbnRlbnRBY3Rpb24oYWN0aW9uOiBBY3Rpb24pOiBhY3Rpb24gaXMgQ3JlYXRlRmlsZUFjdGlvbiB8IE92ZXJ3cml0ZUZpbGVBY3Rpb24ge1xuICByZXR1cm4gYWN0aW9uLmtpbmQgPT0gJ2MnIHx8IGFjdGlvbi5raW5kID09ICdvJztcbn1cblxuXG5leHBvcnQgZnVuY3Rpb24gaXNBY3Rpb24oYWN0aW9uOiBhbnkpOiBhY3Rpb24gaXMgQWN0aW9uIHsgIC8vIHRzbGludDpkaXNhYmxlLWxpbmU6bm8tYW55XG4gIGNvbnN0IGtpbmQgPSBhY3Rpb24gJiYgYWN0aW9uLmtpbmQ7XG5cbiAgcmV0dXJuIGFjdGlvbiAhPT0gbnVsbFxuICAgICAgJiYgdHlwZW9mIGFjdGlvbi5pZCA9PSAnbnVtYmVyJ1xuICAgICAgJiYgdHlwZW9mIGFjdGlvbi5wYXRoID09ICdzdHJpbmcnXG4gICAgICAmJiAoa2luZCA9PSAnYycgfHwga2luZCA9PSAnbycgfHwga2luZCA9PSAncicgfHwga2luZCA9PSAnZCcpO1xufVxuXG5cbi8vIENyZWF0ZSBhIGZpbGUuIElmIHRoZSBmaWxlIGFscmVhZHkgZXhpc3RzIHRoZW4gdGhpcyBpcyBhbiBlcnJvci5cbmV4cG9ydCBpbnRlcmZhY2UgQ3JlYXRlRmlsZUFjdGlvbiBleHRlbmRzIEFjdGlvbkJhc2Uge1xuICByZWFkb25seSBraW5kOiAnYyc7XG4gIHJlYWRvbmx5IGNvbnRlbnQ6IEJ1ZmZlcjtcbn1cblxuLy8gT3ZlcndyaXRlIGEgZmlsZS4gSWYgdGhlIGZpbGUgZG9lcyBub3QgYWxyZWFkeSBleGlzdCwgdGhpcyBpcyBhbiBlcnJvci5cbmV4cG9ydCBpbnRlcmZhY2UgT3ZlcndyaXRlRmlsZUFjdGlvbiBleHRlbmRzIEFjdGlvbkJhc2Uge1xuICByZWFkb25seSBraW5kOiAnbyc7XG4gIHJlYWRvbmx5IGNvbnRlbnQ6IEJ1ZmZlcjtcbn1cblxuLy8gTW92ZSBhIGZpbGUgZnJvbSBvbmUgcGF0aCB0byBhbm90aGVyLiBJZiB0aGUgc291cmNlIGZpbGVzIGRvZXMgbm90IGV4aXN0LCB0aGlzIGlzIGFuIGVycm9yLlxuLy8gSWYgdGhlIHRhcmdldCBwYXRoIGFscmVhZHkgZXhpc3RzLCB0aGlzIGlzIGFuIGVycm9yLlxuZXhwb3J0IGludGVyZmFjZSBSZW5hbWVGaWxlQWN0aW9uIGV4dGVuZHMgQWN0aW9uQmFzZSB7XG4gIHJlYWRvbmx5IGtpbmQ6ICdyJztcbiAgcmVhZG9ubHkgdG86IFBhdGg7XG59XG5cbi8vIERlbGV0ZSBhIGZpbGUuIElmIHRoZSBmaWxlIGRvZXMgbm90IGV4aXN0LCB0aGlzIGlzIGFuIGVycm9yLlxuZXhwb3J0IGludGVyZmFjZSBEZWxldGVGaWxlQWN0aW9uIGV4dGVuZHMgQWN0aW9uQmFzZSB7XG4gIHJlYWRvbmx5IGtpbmQ6ICdkJztcbn1cbiJdfQ==