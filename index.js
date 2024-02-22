'use strict';
const getRandomNumber = (() => {
    const RANDOM_INTEGER = Math.random().toFixed(3) * 1000;
    console.log(RANDOM_INTEGER);
    return RANDOM_INTEGER;
})();

module.exports = getRandomNumber;