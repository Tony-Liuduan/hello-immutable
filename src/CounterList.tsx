import { isEqual } from "lodash"
import React, { memo, useEffect, useMemo, useRef, useState } from "react"

interface Item {
    id: number;
    text: string;
    done: boolean;
}

const uuid = (id => () => ++id)(0);

export function CounterList() {
    const [count, setCount] = useState(0)
    const [name, setName] = useState("")
    const [items, setItems] = React.useState([] as Item[])

    useEffect(() => {
        setInterval(() => {
            setCount(x => x + 1)
        }, 2000)
    }, [])

    const handleChange = (e: any) => {
        setName(e.target.value)
    }

    const handleAdd = () => {
        setItems(items => {
            const id = uuid();
            items.push({
                text: name + id,
                done: false,
                id,
            })
            // return items; // 这样不会更新子组件，items 地址没变
            // class 的 setState: 不管你传入的是什么state，都会强制刷新当前组件，应为内部使用了 Object.assign() 做了 merge，在 shouldComponentUpdate 对比时永远返回 true
            // hooks 的 setState: 如果前后两次的 state 引用相等，并不会刷新组件
            return [...items]; // 保证每次都生成新的items，这样才能保证组件的刷新
        })
    }

    return (
        <>
            <input
                value={name}
                onChange={handleChange}
            ></input>

            <div>counter: {count}</div>

            <button onClick={handleAdd}>+</button>

            {
                items.map((x: Item) => (
                    <ChildMemo key={x.id} item={x} />
                ))
            }
        </>
    )
}

const ChildMemo = memo(Child);

function Child(props: { item: Item }) {
    console.log("render child", props.item.id)
    const { item } = props;
    return <div>name:{item.text}</div>
}