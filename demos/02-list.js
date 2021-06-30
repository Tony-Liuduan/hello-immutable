const { List } = require('immutable');

// 类似 Array
const list1 = List([ 1, 2 ]);
const list2 = list1.push(3, 4, 5); // 会返回新的数组，而非数组长度，不会改变原数组结构
const list3 = list2.unshift(0);
const list4 = list1.concat(list2, list3);

console.log(list1.equals(list2));
console.log(list1.size, 2);
console.log(list2.size, 5);
console.log(list3.size, 6);
console.log(list4.size, 13);
console.log(list4.get(0), 1);