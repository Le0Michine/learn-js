// var operators = ["*", "/", "+", "-"];
var operators = [
  { operator: '*', method: (a, b) => a * b, escaped: '\\*' },
  { operator: '/', method: (a, b) => a / b, escaped: '\\/' },
  { operator: '+', method: (a, b) => a + b, escaped: '\\+' },
  { operator: '-', method: (a, b) => a - b, escaped: '\\-' }
];

const parser = function(input, extraOperators) {
  if (extraOperators) {
    operators = extraOperators.concat(operators);
  }
  var operatorSigns = operators.map(x => x.operator);
  var operatorsRegex = '(' + operators.map(x => x.escaped || x.operator).join(')|(') + ')';
  var operatorsAndNumbers = new RegExp('^([\\d ]|' + operatorsRegex + ')*$');
  if (!input || !input.trim()) {
    throw new Error('input string is empty or undefined');
  }
  if (!operatorsAndNumbers.test(input)) {
    throw new Error('input has incorrect format');
  }
  var matches = input.match(new RegExp('(-?\\d+)|' + operatorsRegex, 'g'));
  var stack = [];
  for (var match of matches) {
    var i = operatorSigns.indexOf(match);
    if (i > -1) {
      if (stack.length < 2) {
        throw Error('input has incorrect format');
      } else {
        var op2 = stack.pop();
        var op1 = stack.pop();
        stack.push(operators[i].method(op1, op2));
      }
    } else if (!isNaN(match)) {
      stack.push(+match);
    } else {
      throw new Error('input has incorrect format');
    }
  }
  return stack.pop();
};

module.exports = parser;