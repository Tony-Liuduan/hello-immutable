# 不可变数据结构

## 一.immutable 功能简介

## 二.immutable 常用数据结构

* List
* Set
* Map
* Record
* Seq

### 数据结构切换

* fromJS 深的
* toJS 深的
* JSON.stringify 深的
* toObject 浅的
* toArray 浅的
* Map 浅的

## 三.immutable 可解决的问题

### Object.assign

* 当对象属性庞大时效率较低
  * 比如拥有 100,000 个属性的对象，“结构共享” 操作需要遍历近10万个属性
* 深层次对象的赋值书写起来很麻烦（见 `CounterListMore` 组件 ）

### 3.1使用场景分析

## 四.immutable 原理浅析

## 五.immutable 不好用点
