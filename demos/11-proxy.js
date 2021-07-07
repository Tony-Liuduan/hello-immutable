// 1. proxy 可代理 map, 代理结果变为
// 2. proxy 不能递归代码
const m = new Map();
m.set('a', {b: 1})
const p = new Proxy(m, {
    get(target, prop) {
        console.log(prop, '====');
        return target.get(prop);
    }
});

console.log(m.a);
console.log(p.a.b);
console.log(p.get);
console.log(p instanceof Object);
console.log(p instanceof Map);