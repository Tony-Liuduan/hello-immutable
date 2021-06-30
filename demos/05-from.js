const { fromJS } = require('immutable');
const { Map, List } = require('immutable');

const obj = { 1: "one", 2: { name: 'h' } };
const map = fromJS(obj);
console.log(map, map.get("1"), map.get(1)); // "one", undefined

console.log('================================================================');

const deep = Map({ a: 1, b: 2, c: List([3, 4, 5]) });
console.log(deep.toObject()); // 浅的转换 { a: 1, b: 2, c: List [ 3, 4, 5 ] }
console.log(deep.toArray()); // 浅的转换 [ 1, 2, List [ 3, 4, 5 ] ]
console.log(deep.toJS()); // 深的转换 { a: 1, b: 2, c: [ 3, 4, 5 ] }
console.log(JSON.stringify(deep)); // 浅的转换 '{"a":1,"b":2,"c":[3,4,5]}'