import { cloneDeep } from "lodash"
import { List } from 'immutable'
import React, { memo, useEffect, useMemo, useRef, useState } from "react"

interface Item {
    id: number;
    text: string;
    done: boolean;
    article?: {
        id: number;
        title: string;
    }
}

const uuid = (id => () => ++id)(0);

export function CounterListMoreImmer() {
    const [count, setCount] = useState(0)
    const [name, setName] = useState("")
    const [items, setItems] = React.useState<List<Item>>(List([]))

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
            const articleId = uuid();
            return items.push({
                text: name + id,
                done: false,
                id,
                article: {
                    id: articleId,
                    title: 'article-title' + name + articleId,
                }
            });
        })
    }

    const updateArticleTitle = () => {
        setItems(items => {
            return items.updateIn([0, 'article', 'title'], item => {
                return 'immutable';
            })
        });
    }

    return (
        <>
            <input
                value={name}
                onChange={handleChange}
            ></input>

            <div>counter: {count}</div>

            <button onClick={handleAdd}>+</button>
            <button onClick={updateArticleTitle}>update article title</button>

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
    return <div>name:{item.text}, title: {item.article.title}</div>
}