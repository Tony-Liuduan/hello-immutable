const { List, Map } = require('immutable');
const aList = List([1, 2, 3]);
const anArray = [0, ...aList, 4, 5]; // [ 0, 1, 2, 3, 4, 5 ]

console.log(anArray);

// 所有 Immutable.js 集合都是Iterable，这允许它们在任何需要 Iterable 的地方使用
for (const item of aList) {
    console.log('for of list item:', item);
}

const map = Map({ name: 'li', age: 100 });

for (const item of map) {
    console.log('for of map item:', item);
}