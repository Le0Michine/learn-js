const assert = require('assert');
const parser = require('./parser');

describe('parser', () => {
  describe('happy day', () => {
    const testData = [
      { input: "5", result: "5"},
      { input: "5 4 *", result: "20"},
      { input: "52 14 *", result: "728"},
      { input: "5 4 +", result: "9"},
      { input: "-5 4 +", result: "-1"},
      { input: "5 4 /", result: "1.25"},
      { input: "5 1 2 + 4 * + 3 -", result: "14"}
    ];

    testData.forEach((testCase) => {
      it (`should return ${testCase.result} for input "${testCase.input}"`, () => {
        // arrange
        // act
        const result = parser(testCase.input);

        // assert
        assert.equal(result, testCase.result);
      })
    });
  });

  describe('negative', () => {
    const testData = [
      { input: "-" },
      { input: "5 -" },
      { input: "5 6 - +" },
      { input: "" },
      { input: " " },
      { input: "abc 5" },
      { input: undefined }
    ];

    testData.forEach((testCase) => {
      it('should throw an error for input "' + testCase.input + '"', () => {
        // arrange
        // act
        // assert
        assert.throws(() => parser(testCase.input));
      });
    });
  });

  describe('extra operators', () => {
    const extraOperators = [
      { operator: '%', method: (a, b) => a % b },
      { operator: 'avg', method: (a, b) => (a + b) / 2 }
    ];

    it('should accept extra operator %', () => {
      // arrange
      // act
      // assert
      assert.doesNotThrow(() => parser("1 2 3 % +", extraOperators));
    });

    it('should return 3 for input "1 2 3 % +"', () => {
      // arrange
      // act
      const result = parser("1 2 3 % +", extraOperators);

      // assert
      assert.equal(result, '3');
    });

    it('should return 3 for input "2 7 avg"', () => {
      // arrange
      // act
      const result = parser("2 7 avg", extraOperators);

      // assert
      assert.equal(result, '4.5');
    });
  });
});