"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
const webpack_sources_1 = require("webpack-sources");
// This matches a comment left by the build-optimizer that contains pure import paths
const importCommentRegex = /\/\*\* PURE_IMPORTS_START (\S+) PURE_IMPORTS_END \*\//mg;
function purifyReplacements(content) {
    const pureImportMatches = getMatches(content, importCommentRegex, 1).join('|');
    if (!pureImportMatches) {
        return [];
    }
    const inserts = [];
    /* Prefix safe imports with pure */
    const regex = new RegExp(`(_(${pureImportMatches})__(_default)? = )(__webpack_require__(\\.\\w)?\\(\\S+\\);)`, 'mg');
    let match;
    // tslint:disable-next-line:no-conditional-assignment
    while (match = regex.exec(content)) {
        inserts.push({
            pos: match.index + match[1].length,
            content: '/*@__PURE__*/',
        });
    }
    return inserts;
}
exports.purifyReplacements = purifyReplacements;
function purify(content) {
    const rawSource = new webpack_sources_1.RawSource(content);
    const replaceSource = new webpack_sources_1.ReplaceSource(rawSource, 'file.js');
    const inserts = purifyReplacements(content);
    inserts.forEach((insert) => {
        replaceSource.insert(insert.pos, insert.content);
    });
    return replaceSource.source();
}
exports.purify = purify;
function getMatches(str, regex, index) {
    let matches = [];
    let match;
    // tslint:disable-next-line:no-conditional-assignment
    while (match = regex.exec(str)) {
        matches = matches.concat(match[index].split(','));
    }
    return matches;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHVyaWZ5LmpzIiwic291cmNlUm9vdCI6Ii9Vc2Vycy9oYW5zbC9Tb3VyY2VzL2hhbnNsL2RldmtpdC8iLCJzb3VyY2VzIjpbInBhY2thZ2VzL2FuZ3VsYXJfZGV2a2l0L2J1aWxkX29wdGltaXplci9zcmMvcHVyaWZ5L3B1cmlmeS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBOzs7Ozs7R0FNRztBQUNILHFEQUEyRDtBQUczRCxxRkFBcUY7QUFDckYsTUFBTSxrQkFBa0IsR0FBRyx5REFBeUQsQ0FBQztBQVFyRiw0QkFBbUMsT0FBZTtJQUVoRCxNQUFNLGlCQUFpQixHQUFHLFVBQVUsQ0FBQyxPQUFPLEVBQUUsa0JBQWtCLEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO0lBQy9FLEVBQUUsQ0FBQyxDQUFDLENBQUMsaUJBQWlCLENBQUMsQ0FBQyxDQUFDO1FBQ3ZCLE1BQU0sQ0FBQyxFQUFFLENBQUM7SUFDWixDQUFDO0lBRUQsTUFBTSxPQUFPLEdBQWEsRUFBRSxDQUFDO0lBRTdCLG1DQUFtQztJQUNuQyxNQUFNLEtBQUssR0FBRyxJQUFJLE1BQU0sQ0FDdEIsTUFBTSxpQkFBaUIsNkRBQTZELEVBQ3BGLElBQUksQ0FDTCxDQUFDO0lBRUYsSUFBSSxLQUFLLENBQUM7SUFDVixxREFBcUQ7SUFDckQsT0FBTyxLQUFLLEdBQUcsS0FBSyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDO1FBQ25DLE9BQU8sQ0FBQyxJQUFJLENBQUM7WUFDWCxHQUFHLEVBQUUsS0FBSyxDQUFDLEtBQUssR0FBRyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTTtZQUNsQyxPQUFPLEVBQUUsZUFBZTtTQUN6QixDQUFDLENBQUM7SUFDTCxDQUFDO0lBRUQsTUFBTSxDQUFDLE9BQU8sQ0FBQztBQUNqQixDQUFDO0FBekJELGdEQXlCQztBQUVELGdCQUF1QixPQUFlO0lBQ3BDLE1BQU0sU0FBUyxHQUFHLElBQUksMkJBQVMsQ0FBQyxPQUFPLENBQUMsQ0FBQztJQUN6QyxNQUFNLGFBQWEsR0FBRyxJQUFJLCtCQUFhLENBQUMsU0FBUyxFQUFFLFNBQVMsQ0FBQyxDQUFDO0lBRTlELE1BQU0sT0FBTyxHQUFHLGtCQUFrQixDQUFDLE9BQU8sQ0FBQyxDQUFDO0lBQzVDLE9BQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQyxNQUFNO1FBQ3JCLGFBQWEsQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLEdBQUcsRUFBRSxNQUFNLENBQUMsT0FBTyxDQUFDLENBQUM7SUFDbkQsQ0FBQyxDQUFDLENBQUM7SUFFSCxNQUFNLENBQUMsYUFBYSxDQUFDLE1BQU0sRUFBRSxDQUFDO0FBQ2hDLENBQUM7QUFWRCx3QkFVQztBQUVELG9CQUFvQixHQUFXLEVBQUUsS0FBYSxFQUFFLEtBQWE7SUFDM0QsSUFBSSxPQUFPLEdBQWEsRUFBRSxDQUFDO0lBQzNCLElBQUksS0FBSyxDQUFDO0lBQ1YscURBQXFEO0lBQ3JELE9BQU8sS0FBSyxHQUFHLEtBQUssQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQztRQUMvQixPQUFPLEdBQUcsT0FBTyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7SUFDcEQsQ0FBQztJQUVELE1BQU0sQ0FBQyxPQUFPLENBQUM7QUFDakIsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgSW5jLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cbmltcG9ydCB7IFJhd1NvdXJjZSwgUmVwbGFjZVNvdXJjZSB9IGZyb20gJ3dlYnBhY2stc291cmNlcyc7XG5cblxuLy8gVGhpcyBtYXRjaGVzIGEgY29tbWVudCBsZWZ0IGJ5IHRoZSBidWlsZC1vcHRpbWl6ZXIgdGhhdCBjb250YWlucyBwdXJlIGltcG9ydCBwYXRoc1xuY29uc3QgaW1wb3J0Q29tbWVudFJlZ2V4ID0gL1xcL1xcKlxcKiBQVVJFX0lNUE9SVFNfU1RBUlQgKFxcUyspIFBVUkVfSU1QT1JUU19FTkQgXFwqXFwvL21nO1xuXG4vLyBJbnNlcnRpb24gYXJlIG1lYW50IHRvIGJlIHVzZWQgd2l0aCBXZWJwYWNrJ3MgUmVwbGFjZVNvdXJjZS5cbmV4cG9ydCBpbnRlcmZhY2UgSW5zZXJ0IHtcbiAgcG9zOiBudW1iZXI7XG4gIGNvbnRlbnQ6IHN0cmluZztcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHB1cmlmeVJlcGxhY2VtZW50cyhjb250ZW50OiBzdHJpbmcpIHtcblxuICBjb25zdCBwdXJlSW1wb3J0TWF0Y2hlcyA9IGdldE1hdGNoZXMoY29udGVudCwgaW1wb3J0Q29tbWVudFJlZ2V4LCAxKS5qb2luKCd8Jyk7XG4gIGlmICghcHVyZUltcG9ydE1hdGNoZXMpIHtcbiAgICByZXR1cm4gW107XG4gIH1cblxuICBjb25zdCBpbnNlcnRzOiBJbnNlcnRbXSA9IFtdO1xuXG4gIC8qIFByZWZpeCBzYWZlIGltcG9ydHMgd2l0aCBwdXJlICovXG4gIGNvbnN0IHJlZ2V4ID0gbmV3IFJlZ0V4cChcbiAgICBgKF8oJHtwdXJlSW1wb3J0TWF0Y2hlc30pX18oX2RlZmF1bHQpPyA9ICkoX193ZWJwYWNrX3JlcXVpcmVfXyhcXFxcLlxcXFx3KT9cXFxcKFxcXFxTK1xcXFwpOylgLFxuICAgICdtZycsXG4gICk7XG5cbiAgbGV0IG1hdGNoO1xuICAvLyB0c2xpbnQ6ZGlzYWJsZS1uZXh0LWxpbmU6bm8tY29uZGl0aW9uYWwtYXNzaWdubWVudFxuICB3aGlsZSAobWF0Y2ggPSByZWdleC5leGVjKGNvbnRlbnQpKSB7XG4gICAgaW5zZXJ0cy5wdXNoKHtcbiAgICAgIHBvczogbWF0Y2guaW5kZXggKyBtYXRjaFsxXS5sZW5ndGgsXG4gICAgICBjb250ZW50OiAnLypAX19QVVJFX18qLycsXG4gICAgfSk7XG4gIH1cblxuICByZXR1cm4gaW5zZXJ0cztcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHB1cmlmeShjb250ZW50OiBzdHJpbmcpIHtcbiAgY29uc3QgcmF3U291cmNlID0gbmV3IFJhd1NvdXJjZShjb250ZW50KTtcbiAgY29uc3QgcmVwbGFjZVNvdXJjZSA9IG5ldyBSZXBsYWNlU291cmNlKHJhd1NvdXJjZSwgJ2ZpbGUuanMnKTtcblxuICBjb25zdCBpbnNlcnRzID0gcHVyaWZ5UmVwbGFjZW1lbnRzKGNvbnRlbnQpO1xuICBpbnNlcnRzLmZvckVhY2goKGluc2VydCkgPT4ge1xuICAgIHJlcGxhY2VTb3VyY2UuaW5zZXJ0KGluc2VydC5wb3MsIGluc2VydC5jb250ZW50KTtcbiAgfSk7XG5cbiAgcmV0dXJuIHJlcGxhY2VTb3VyY2Uuc291cmNlKCk7XG59XG5cbmZ1bmN0aW9uIGdldE1hdGNoZXMoc3RyOiBzdHJpbmcsIHJlZ2V4OiBSZWdFeHAsIGluZGV4OiBudW1iZXIpIHtcbiAgbGV0IG1hdGNoZXM6IHN0cmluZ1tdID0gW107XG4gIGxldCBtYXRjaDtcbiAgLy8gdHNsaW50OmRpc2FibGUtbmV4dC1saW5lOm5vLWNvbmRpdGlvbmFsLWFzc2lnbm1lbnRcbiAgd2hpbGUgKG1hdGNoID0gcmVnZXguZXhlYyhzdHIpKSB7XG4gICAgbWF0Y2hlcyA9IG1hdGNoZXMuY29uY2F0KG1hdGNoW2luZGV4XS5zcGxpdCgnLCcpKTtcbiAgfVxuXG4gIHJldHVybiBtYXRjaGVzO1xufVxuIl19