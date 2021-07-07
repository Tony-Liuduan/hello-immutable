const { Map, is, fromJS } = require('immutable');

// 类似 es6 Map
const map1 = Map({ a: 1, b: 2, c: 3 });
// 赋值
const map2 = map1.set('b', 50);
const map3 = map1.set('b', 2); // 数据不变，即便 set 了，返回的还是原来的数据集合
const map4 = Map({ a: 1, b: 2, c: 3 });

// 不能 . 取值
console.log('map1.a', map1.a);
console.log('map1.get(a)', map1.get('a'));

// 取值
map1.get('b') + " vs. " + map2.get('b');


// 判等
console.log('---- === 判等 ----')
console.log('map1 === map2', map1 === map2);
console.log('map1 === map3', map1 === map3);
console.log('map1 === map4', map1 === map4);

console.log('---- is 判等 ----')
// 不可变集合应该被视为值而不是对象
// is 判断 2个 不可变集合的值是否相对，不同于 Object.is
console.log('is(map1, map2)', is(map1, map2));
console.log('is(map1, map3)', is(map1, map3));
console.log('is(map1, map4)', is(map1, map4));
// is 等于 map1.equals(map2)


const data = fromJS({ a: { b: { c: 1 } } });


const data1 = data.updateIn(['a', 'b', 'c'], x => {
    return x + 100;
});

console.log(data.getIn(['a', 'b', 'c']));
console.log(data1.getIn(['a', 'b', 'c']));
// 另：不需要非空判断
console.log(data1.getIn(['x', 'd', 'c']));


const o1 = { a: { b: { c: 1 } } };
const o2 = { a: { b: { c: 1 } } };

console.log(is(o1, o2), 'is(o1, o2)');
console.log(is(fromJS(o1), fromJS(o2)), 'is(o1, o2)');