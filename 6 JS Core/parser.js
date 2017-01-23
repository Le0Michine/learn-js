// let operators = ["*", "/", "+", "-"];
const defaultOperators = [
  { operator: '*', method: (a, b) => a * b, escaped: '\\*' },
  { operator: '/', method: (a, b) => a / b, escaped: '\\/' },
  { operator: '+', method: (a, b) => a + b, escaped: '\\+' },
  { operator: '-', method: (a, b) => a - b, escaped: '\\-' }
];

const parser = function(input, extraOperators) {
  const operators = defaultOperators.concat(extraOperators || []);
  const operatorSigns = operators.map(x => x.escaped || x.operator);
  // get string: (+)|(-)|(*)|(/)|(avg) ... for regexp
  const operatorRegexPart = `(${operatorSigns.join(')|(')})`;
  const operatorsAndOperands = new RegExp('^([\\d ]|' + operatorRegexPart + ')*$');
  if (!input || !input.trim()) {
    throw new Error('input string is empty or undefined');
  }
  if (!operatorsAndOperands.test(input)) {
    throw new Error('input has incorrect format');
  }
  const matches = input.match(new RegExp('(-?\\d+)|' + operatorRegexPart, 'g'));
  const stack = [];
  for (let match of matches) {
    const operator = operators.find(x => x.operator === match);
    if (operator) {
      if (stack.length < 2) {
        throw Error('input has incorrect format');
      } else {
        const op2 = stack.pop();
        const op1 = stack.pop();
        stack.push(operator.method(op1, op2));
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