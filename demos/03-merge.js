const { Map, List } = require('immutable');
const map1 = Map({ a: { name: 'jason', age: 13 }, b: 2, c: 3, d: 4 });
const map2 = Map({ c: 10, a: { name: 'hoho', lastName: 'song' }, t: 30 });
const obj = { d: 100, o: 200, g: 300 };

const map3 = map1.merge(map2, obj);
const map4 = map1.mergeDeep(map2, obj);

console.log(map3.toJS());
console.log(map4.toJS());


const list1 = List([1, 2, 3]);
const list2 = List([4, 5, 6]);
const array = [7, 8, 9, 1, 2, 3];
const list3 = list1.concat(list2, array);

console.log(list3.toJS());