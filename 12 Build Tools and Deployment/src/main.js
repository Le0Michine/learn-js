require('./module1');
require('./module2');
const multiplier = require('./multiplier');
require('./styles/index.scss');

const c = console;
c.log('main js');
c.log(`3 * 5 = ${multiplier(3, 5)}`);