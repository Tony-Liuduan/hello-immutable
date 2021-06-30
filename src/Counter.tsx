import React, { memo, useEffect, useState } from "react"

export function Counter() {
    const [count, setCount] = useState(0);
    const [name, setName] = useState("");
    
    useEffect(() => {
        setInterval(() => {
            setCount(x => x + 1);
        }, 2000)
    }, [])

    const handleChange = (e: any) => {
        setName(e.target.value)
    }

    return (
        <>
            <input
                value={name}
                onChange={handleChange}
            />
            
            <div>counter:{count}</div>

            <Child name={name}></Child>

            {/* <ChildMemo name={name} /> */}
        </>
    )
}

const ChildMemo = memo(Child);

function Child(props: { name: string }) {
    console.log("child render", props.name)
    return <div>name:{props.name}</div>
}

