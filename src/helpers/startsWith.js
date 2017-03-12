/**
 * Tests whether a string begins with the given prefix.
 * https://github.com/helpers/handlebars-helpers#startsWith
 * 
 * ```handlebars
 * {{#startsWith "Goodbye" "Hello, world!"}}
 *   Whoops
 * {{else}}
 *   Bro, do you even hello world?
 * {{/startsWith}}
 * ```
 * @param  {String} `prefix`
 * @param  {String} `testString`
 * @param  {String} `options`
 * @contributor Dan Fox <http://github.com/iamdanfox>
 * @return {String}
 * @block
 * @api public
 */
module.exports = function(prefix, str, options) {
  var args = [].slice.call(arguments);
  options = args.pop();
  if (str && typeof str === 'string') {
    if (str.indexOf(prefix) === 0) {
      return options.fn(this);
    }
  }
  if (typeof options.inverse === 'function') {
    return options.inverse(this);
  }
  return '';
};
