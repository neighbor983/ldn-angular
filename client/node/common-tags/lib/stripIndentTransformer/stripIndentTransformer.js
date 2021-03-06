'use strict';

/**
 * strips indentation from a template literal
 * @param  {String} type = 'initial' - whether to remove all indentation or just leading indentation. can be 'all' or 'initial'
 * @return {Object}                  - a TemplateTag transformer
 */

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _toConsumableArray2 = require('babel-runtime/helpers/toConsumableArray');

var _toConsumableArray3 = _interopRequireDefault(_toConsumableArray2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var stripIndentTransformer = function stripIndentTransformer() {
  var type = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'initial';
  return {
    onEndResult: function onEndResult(endResult) {
      if (type === 'initial') {
        // remove the shortest leading indentation from each line
        var match = endResult.match(/^[ \t]*(?=\S)/gm);
        // return early if there's nothing to strip
        if (match === null) {
          return endResult;
        }
        var indent = Math.min.apply(Math, (0, _toConsumableArray3.default)(match.map(function (el) {
          return el.length;
        })));
        var regexp = new RegExp('^[ \\t]{' + indent + '}', 'gm');
        endResult = indent > 0 ? endResult.replace(regexp, '') : endResult;
      } else if (type === 'all') {
        // remove all indentation from each line
        endResult = endResult.replace(/(?:\n[^\S\n]*)/g, '\n');
      } else {
        throw new Error('Unknown type: ' + type);
      }
      return endResult;
    }
  };
};

exports.default = stripIndentTransformer;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9zdHJpcEluZGVudFRyYW5zZm9ybWVyL3N0cmlwSW5kZW50VHJhbnNmb3JtZXIuanMiXSwibmFtZXMiOlsic3RyaXBJbmRlbnRUcmFuc2Zvcm1lciIsInR5cGUiLCJvbkVuZFJlc3VsdCIsImVuZFJlc3VsdCIsIm1hdGNoIiwiaW5kZW50IiwiTWF0aCIsIm1pbiIsIm1hcCIsImVsIiwibGVuZ3RoIiwicmVnZXhwIiwiUmVnRXhwIiwicmVwbGFjZSIsIkVycm9yIl0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTs7Ozs7Ozs7Ozs7Ozs7OztBQUtBLElBQU1BLHlCQUF5QixTQUF6QkEsc0JBQXlCO0FBQUEsTUFBQ0MsSUFBRCx1RUFBUSxTQUFSO0FBQUEsU0FBdUI7QUFDcERDLGVBRG9ELHVCQUN2Q0MsU0FEdUMsRUFDNUI7QUFDdEIsVUFBSUYsU0FBUyxTQUFiLEVBQXdCO0FBQ3RCO0FBQ0EsWUFBTUcsUUFBUUQsVUFBVUMsS0FBVixDQUFnQixpQkFBaEIsQ0FBZDtBQUNBO0FBQ0EsWUFBSUEsVUFBVSxJQUFkLEVBQW9CO0FBQ2xCLGlCQUFPRCxTQUFQO0FBQ0Q7QUFDRCxZQUFNRSxTQUFTQyxLQUFLQyxHQUFMLDhDQUFZSCxNQUFNSSxHQUFOLENBQVU7QUFBQSxpQkFBTUMsR0FBR0MsTUFBVDtBQUFBLFNBQVYsQ0FBWixFQUFmO0FBQ0EsWUFBTUMsU0FBUyxJQUFJQyxNQUFKLENBQVcsYUFBYVAsTUFBYixHQUFzQixHQUFqQyxFQUFzQyxJQUF0QyxDQUFmO0FBQ0FGLG9CQUFZRSxTQUFTLENBQVQsR0FBYUYsVUFBVVUsT0FBVixDQUFrQkYsTUFBbEIsRUFBMEIsRUFBMUIsQ0FBYixHQUE2Q1IsU0FBekQ7QUFDRCxPQVZELE1BVU8sSUFBSUYsU0FBUyxLQUFiLEVBQW9CO0FBQ3pCO0FBQ0FFLG9CQUFZQSxVQUFVVSxPQUFWLENBQWtCLGlCQUFsQixFQUFxQyxJQUFyQyxDQUFaO0FBQ0QsT0FITSxNQUdBO0FBQ0wsY0FBTSxJQUFJQyxLQUFKLG9CQUEyQmIsSUFBM0IsQ0FBTjtBQUNEO0FBQ0QsYUFBT0UsU0FBUDtBQUNEO0FBbkJtRCxHQUF2QjtBQUFBLENBQS9COztrQkFzQmVILHNCIiwiZmlsZSI6InN0cmlwSW5kZW50VHJhbnNmb3JtZXIuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIHN0cmljdCdcblxuLyoqXG4gKiBzdHJpcHMgaW5kZW50YXRpb24gZnJvbSBhIHRlbXBsYXRlIGxpdGVyYWxcbiAqIEBwYXJhbSAge1N0cmluZ30gdHlwZSA9ICdpbml0aWFsJyAtIHdoZXRoZXIgdG8gcmVtb3ZlIGFsbCBpbmRlbnRhdGlvbiBvciBqdXN0IGxlYWRpbmcgaW5kZW50YXRpb24uIGNhbiBiZSAnYWxsJyBvciAnaW5pdGlhbCdcbiAqIEByZXR1cm4ge09iamVjdH0gICAgICAgICAgICAgICAgICAtIGEgVGVtcGxhdGVUYWcgdHJhbnNmb3JtZXJcbiAqL1xuY29uc3Qgc3RyaXBJbmRlbnRUcmFuc2Zvcm1lciA9ICh0eXBlID0gJ2luaXRpYWwnKSA9PiAoe1xuICBvbkVuZFJlc3VsdCAoZW5kUmVzdWx0KSB7XG4gICAgaWYgKHR5cGUgPT09ICdpbml0aWFsJykge1xuICAgICAgLy8gcmVtb3ZlIHRoZSBzaG9ydGVzdCBsZWFkaW5nIGluZGVudGF0aW9uIGZyb20gZWFjaCBsaW5lXG4gICAgICBjb25zdCBtYXRjaCA9IGVuZFJlc3VsdC5tYXRjaCgvXlsgXFx0XSooPz1cXFMpL2dtKVxuICAgICAgLy8gcmV0dXJuIGVhcmx5IGlmIHRoZXJlJ3Mgbm90aGluZyB0byBzdHJpcFxuICAgICAgaWYgKG1hdGNoID09PSBudWxsKSB7XG4gICAgICAgIHJldHVybiBlbmRSZXN1bHRcbiAgICAgIH1cbiAgICAgIGNvbnN0IGluZGVudCA9IE1hdGgubWluKC4uLm1hdGNoLm1hcChlbCA9PiBlbC5sZW5ndGgpKVxuICAgICAgY29uc3QgcmVnZXhwID0gbmV3IFJlZ0V4cCgnXlsgXFxcXHRdeycgKyBpbmRlbnQgKyAnfScsICdnbScpXG4gICAgICBlbmRSZXN1bHQgPSBpbmRlbnQgPiAwID8gZW5kUmVzdWx0LnJlcGxhY2UocmVnZXhwLCAnJykgOiBlbmRSZXN1bHRcbiAgICB9IGVsc2UgaWYgKHR5cGUgPT09ICdhbGwnKSB7XG4gICAgICAvLyByZW1vdmUgYWxsIGluZGVudGF0aW9uIGZyb20gZWFjaCBsaW5lXG4gICAgICBlbmRSZXN1bHQgPSBlbmRSZXN1bHQucmVwbGFjZSgvKD86XFxuW15cXFNcXG5dKikvZywgJ1xcbicpXG4gICAgfSBlbHNlIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihgVW5rbm93biB0eXBlOiAke3R5cGV9YClcbiAgICB9XG4gICAgcmV0dXJuIGVuZFJlc3VsdFxuICB9XG59KVxuXG5leHBvcnQgZGVmYXVsdCBzdHJpcEluZGVudFRyYW5zZm9ybWVyXG4iXX0=