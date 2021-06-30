# 持久化数据结构

> 每次修改后我们都会得到一个新的版本，且旧版本可以完好保留
> Structure Sharing 会尽量复用内存
> 时间旅行

对比：可变（Mutable）数据耦合了 Time 和 Value 的概念，造成了数据很难被回溯。

```js
function touchAndLog(touchFn) {
  let data = { key: 'value' };
  touchFn(data);
  console.log(data.key); // 猜猜会打印什么？
}
```

![img](https://camo.githubusercontent.com/0b8366dbd9e9298f8f2521d59b6602f65e857aa5256cd7114ea0de3cf169c4ca/687474703a2f2f696d672e616c6963646e2e636f6d2f7470732f69322f5442317a7a695f4b5858585858637458465858627262384f5658582d3631332d3537352e676966)

目标：在g下面插入一个节点h，如何在插入后让原有的树保持不变
![img](https://user-gold-cdn.xitu.io/2018/9/14/165d635e67c6de9f?imageView2/0/w/1280/h/960/format/webp/ignore-error/1)

方式1：
![img](https://user-gold-cdn.xitu.io/2018/9/14/165d635e5d7eedd0?imageView2/0/w/1280/h/960/format/webp/ignore-error/1)

<!-- （费时又费空间） -->

方式2：
![img](https://user-gold-cdn.xitu.io/2018/9/14/165d635e63391b4c?imageView2/0/w/1280/h/960/format/webp/ignore-error/1)

## Object.assign

* 一种持久化数据结构
* 把旧的值全都依次拷贝过去，对需要修改或添加的属性，则重新生成
* 相对 immutable 更耗时

## immiutable

核心思路是以空间换时间

因为采用了结构共享，在添加、修改、删除操作后，我们避免了将 map 中所有值拷贝一遍，所以特别是在数据量较大时，这些操作相比Object。assign有明显提升

查询速度减慢了，我们知道 map 里根据 key 查找的速度是O(1)，这里由于变成了一棵树，查询的时间复杂度变成了O(log N)，因为是 32 叉树，所以准确说是O(log32 N)

### 比较

两个 immutable 对象可以使用 === 来比较，这样是直接比较内存地址，性能最好。但即使两个对象的值是一样的，也会返回 false：

```js
let map1 = Immutable.Map({a:1, b:1, c:1});
let map2 = Immutable.Map({a:1, b:1, c:1});
map1 === map2;             // false
```

为了直接比较对象的值，immutable.js 提供了 Immutable.is 来做『值比较』，结果如下：

```js
Immutable.is(map1, map2);  // true
```

Immutable.is 比较的是两个对象的 hashCode，immutable 内部使用了 Trie 数据结构来存储，只要两个对象的 hashCode 相等，值就是一样的。这样的算法避免了深度遍历比较，性能非常好。

### 弊端

虽然 Immutable.js 尽量尝试把 API 设计的原生对象类似，有的时候还是很难区别到底是 Immutable 对象还是原生对象，容易混淆操作。

Immutable 中的 Map 和 List 虽对应原生 Object 和 Array，但操作非常不同，比如你要用 map.get('key') 而不是 map.key，array.get(0) 而不是 array[0]。另外 Immutable 每次修改都会返回新对象，也很容易忘记赋值。

当使用外部库的时候，一般需要使用原生对象，也很容易忘记转换。

下面给出一些办法来避免类似问题发生：

* 使用 TypeScript 这类有静态类型检查的工具
* 约定变量命名规则：如所有 Immutable 类型对象以 $$ 开头。
* 使用 Immutable.fromJS 而不是 Immutable.Map 或 Immutable.List 来创建对象，这样可以避免 Immutable 和原生对象间的混用

### Vector Trie 矢量查找树

举例：

```json
{
    0: ‘banana’,
    1: ‘grape’, 
    2: ‘lemon’, 
    3: ‘orange’, 
    4: ‘apple’
}
```

key 转换为二进制的形式：

```json
{
    000: ‘banana’,
    001: ‘grape’, 
    010: ‘lemon’, 
    011: ‘orange’, 
    100: ‘apple’
}
```

![img](https://user-gold-cdn.xitu.io/2018/9/14/165d635e6d01c49d?imageView2/0/w/1280/h/960/format/webp/ignore-error/1)

添加一个key(5)
![img](https://user-gold-cdn.xitu.io/2018/9/14/165d635ebb85e04d?imageView2/0/w/1280/h/960/format/webp/ignore-error/1)

#### Vector Trie 特点

* Vector Trie 的每个节点是一个数组
* 数组里有0和1两个数，表示一个二进制数
* 所有值都存在叶子节点上

### immutable-hash

> <https://github.com/immutable-js/immutable-js/blob/e65e5af806ea23a32ccf8f56c6fabf39605bac80/src/Hash.js#L10:17>

上述讨论基于key是数字，现实中key未必是数字，Immutable.js 实现了一个hash函数，可以把一个值转换成相应数字，来解决 key 不是数字问题

若每个树节点是一个长度为2的数组，会导致数据量很大时，树会变得很深，查询会相对变慢，所以 Immutable.js 选择了扩大节点数组长度到 32 （数组长度必须是2的整数次幂 ？？）

### 数字分区

9128 转7进制 35420
<https://tool.oschina.net/hexconvert/>

![img](https://user-gold-cdn.xitu.io/2018/9/14/165d635eca568dee?imageView2/0/w/1280/h/960/format/webp/ignore-error/1)

### 位区分

32 = 2^5 ：32 路的前缀树：就是按 5 位二进制数分区

```js
666666
            10100 01011 00001 01010
`>>> 10`    00000 00000 10100 01011
`&`         00000 00000 00000 11111
`=`
            00000 00000 00000 01010 
```

* `&`： 与运算同时为1时，才等于1
* `|`： 或运算任意一个为1时，就等于1
* `^`： 异或运算有且仅有一个为1时，才等于1
* `<<`： 左移运算符，num << 1,相当于num乘以2
* `>>`： 右移运算符，num >> 1,相当于num除以2
* `>>>`: 无符号右移，忽略符号位，空位都以0补齐

举例：

4路前缀树，4 = 2^2，所以用两位二进制数分区

626 --> 10 01 11 00 10

626 --> 2  1  3  0  2

![img](https://user-gold-cdn.xitu.io/2018/9/14/165d635eed8fa23f?imageView2/0/w/1280/h/960/format/webp/ignore-error/1)

![img](https://pic2.zhimg.com/80/v2-7af8491551655e02c289d63a73e55e3d_1440w.png)

通过极端的方式，大大降低拷贝数量

* 一个拥有 100万 条属性的对象，浅拷贝需要赋值 100万次
* 在 tire 树中，根据其访问的深度，只有一个层级只需要拷贝 31 次，这个数字不随着对象属性的增加而增大。而随着层级的深入，会线性增加拷贝数量，但由于对象访问深度不会特别高，10 层已经几乎见不到了，因此最多拷贝300次，速度还是非常快的。

## 搭配 react

immutable 解决：

由于不可变数据永远不会改变，订阅整个模型的变化是一个死胡同，新数据只能从上面传递。
这种数据流模型与React的架构 非常吻合

1. 性能问题
2. UI一致性问题
    * 当ViewModel发生变化时，View也能跟着一起刷新
    * 当ViewModel不变的时候，View也保持不变

React的关于渲染的最重要的一个特性（也是最为人诟病的特性)就是：

**当父组件重渲染的时候，其会默认递归的重渲染所有子组件**

### 避免重复 render

react的每次触发页面更新实际上分为两个阶段

* render: vdom diff (可优化点)
* commit: 真实 dom 更新操作

#### 优化手段

* shouldComponentUpdate
  * PureComponent / memo
    * 适用于：props 只包含 primitive 类型(string、number)等
  * deepCompare
    * 适用于：props 里包含了对象

### 更新场景 bug

* 引用一致，值不同，用了 memo，导致无法更新子组件
  * fix-1: Object.assign 更新引用
  * fix-2: cloneDeep 更新引用
* 引用不一致，值相同，用了 memo，组件产生了不必要的更新 render，性能不好
  * fix-1: memo 做 isEqual 深对比，性能同样不好
  * fix-2: 使用 immutable.is 判断

### 库

* immutablejs
* immer
* seamless-immutable

### 最佳实践

* toJS()函数绝对不要在connect()修饰函数中调用

https://zhuanlan.zhihu.com/p/163590288
TODO immutable record & tuple
