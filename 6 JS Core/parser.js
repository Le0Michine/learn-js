// let operators = ["*", "/", "+", "-"];
const defaultOperators = [
  { operator: '*', method: (a, b) => a * b, escaped: '\\*' },
  { operator: '/', method: (a, b) => a / b, escaped: '\\/' },
  { operator: '+', method: (a, b) => a + b, escaped: '\\+' },
  { operator: '-', method: (a, b) => a - b, escaped: '\\-' }
];

const parser = function(input, extraOperators) {
  const operators = extraOperators ? extraOperators.concat(defaultOperators) : defaultOperators;
  const operatorSigns = operators.map(x => x.operator);
  const operatorsRegex = '(' + operators.map(x => x.escaped || x.operator).join(')|(') + ')';
  const operatorsAndNumbers = new RegExp('^([\\d ]|' + operatorsRegex + ')*$');
  if (!input || !input.trim()) {
    throw new Error('input string is empty or undefined');
  }
  if (!operatorsAndNumbers.test(input)) {
    throw new Error('input has incorrect format');
  }
  const matches = input.match(new RegExp('(-?\\d+)|' + operatorsRegex, 'g'));
  const stack = [];
  for (let match of matches) {
    const i = operatorSigns.indexOf(match);
    if (i > -1) {
      if (stack.length < 2) {
        throw Error('input has incorrect format');
      } else {
        const op2 = stack.pop();
        const op1 = stack.pop();
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