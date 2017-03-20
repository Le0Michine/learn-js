/* eslint-disable */
const assert = require('assert');
const multiplier = require('./multiplier');

describe('multiplier', () => {
    const testData = [
      { input: [3, 3], result: 9},
      { input: [2, 90], result: 180},
      { input: [-1, 9], result: -9},
      { input: [45, 7], result: 315},
      { input: [3, 2], result: 6}
    ];

    testData.forEach((testCase) => {
        it (`should return ${testCase.result} for input "${testCase.input}"`, () => {
            const result = multiplier(...testCase.input);
            assert.equal(result, testCase.result);
        });
    });
});