const { Map, Seq } = require('immutable');

const myObject = Map({ a: 1, b: 2, c: 3 });

// 计算延迟
const seq = Seq(myObject).map((val, key) => {
    console.log('我执行了', val, key);
    return val * val;
});


setTimeout(() => {
    console.log(seq.get('a'));
    console.log(seq.get('b'));
    console.log(seq.get('c'));
}, 4000);