import { isEqual } from "lodash"
import React, { memo, useEffect, useMemo, useRef, useState } from "react"

interface Item {
    text: string
    done: boolean
}

export function CounterBig() {
    const [count, setCount] = useState(0)
    const [name, setName] = useState("")

    useEffect(() => {
        setInterval(() => {
            setCount(x => x + 1)
        }, 2000)
    }, [])

    const handleChange = (e: any) => {
        setName(e.target.value)
    }

    const item = {
        text: name,
        done: false
    };

    // fix-1
    // const item = useRef({
    //     text: name,
    //     done: false,
    // }).current;

    // fix-2
    // const item: Item = useMemo(() => {
    //     return {
    //         text: name,
    //         done: false
    //     };
    // }, [name]); 

    return (
        <>
            <input
                value={name}
                onChange={handleChange}
            ></input>

            <div>counter:{count}</div>

            <ChildMemo item={item} />
        </>
    )
}

const ChildMemo = memo(Child,
    // fix-0
    // (prev, next) => {
    //     // 使用深比较比较对象相等
    //     // 虽然这样能达到效果，但是深比较处理比较复杂的对象时仍然存在较大的性能开销甚至挂掉的风险
    //     return isEqual(prev, next);
    // }
);

function Child(props: { item: Item }) {
    console.log("render child")
    const { item } = props;
    return <div>name:{item.text}</div>
}