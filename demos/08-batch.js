/**
 * @fileoverview 
 * 批处理突变 提升性能
 */
const { List } = require('immutable')
const list1 = List([1, 2, 3]);

console.time("origin");
for (let i = 0; i < 10000; i++) {
  list1.push(4).push(5).push(6);
  // list1.push(4, 5, 6);
}
console.timeEnd("origin"); // 23ms


console.time("withMutations");
for (let j = 0; j < 10000; j++) {
  list1.withMutations(function (list) {
    list.push(4).push(5).push(6);
    // list1.push(4, 5, 6);
  });
}
console.timeEnd("withMutations"); // 13
