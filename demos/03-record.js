const { Record } = require('immutable')

// 1.Record()函数生成新的 Record Factory，在调用时会创建 Record 实例
const ABRecord = Record({ a: 1, b: 2 });
const myRecord = ABRecord({ b: 3, cc: 3 });

console.log(myRecord.toJS()); // { a: 1, b: 3 }

// 2.remove从记录中输入一个键只是将其重置为该键的默认值
const myRecordWithoutB = myRecord.remove('b');

console.log(myRecordWithoutB.get('b')); // 2

// 3.可以.调用
console.log(myRecordWithoutB.b); // 2
// 可以 . get，但不能 . set， 会 error
// myRecordWithoutB.b = 5;


class MyRecord extends Record({ a: 1, b: 2 }) {
    get getAB() {
        return this.a + this.b;
    }
}

const record = new MyRecord({ b: 3 })
console.log(record.getAB); // 4

