/**
 * @fileoverview 
 * 批处理突变
 */
 const { List } = require('immutable');
 const list1 = List([ 1, 2, 3 ]);

 // 构建list2导致创建 1 个，而不是 3 个新的不可变列表
 // Immutable.js 使您能够创建集合的临时可变（瞬态）副本，并使用 .js 以高性能方式应用一批更改withMutations
 const list2 = list1.withMutations(function (list) {
   list.push(4).push(5).push(6);
 });
console.log(list1.size, 3);
console.log(list2.size, 6);