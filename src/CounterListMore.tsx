import { cloneDeep } from "lodash"
import React, { memo, useMemo, useRef, useState } from "react"

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

export function CounterListMore() {
    const [name, setName] = useState("")
    const [items, setItems] = React.useState([] as Item[])

    const handleChange = (e: any) => {
        setName(e.target.value)
    }

    const handleAdd = () => {
        setItems(items => {
            const id = uuid();
            const articleId = uuid();
            items.push({
                text: name + id,
                done: false,
                id,
                article: {
                    id: articleId,
                    title: 'article-title' + name + articleId,
                }
            })
            return [...items];
        })
    }

    const updateArticleTitle = () => {
        // Object.assign 实现：
        setItems(items => {
            if (!items[0]) {
                return items;
            }
            items[0].article.title = 'new article'
            return [
                { ...items[0] },
                ...items.slice(1),
            ];
        });

        // 深拷贝实现：
        // 缺陷：
        // 1. 对引用破坏，导致 memo 失效，所有 child 组件全部更新一遍
        // 2. 性能不好
        // setItems(items => {
        //     const newItems = cloneDeep(items);
        //     newItems[0].article.title = "new article";
        //     return newItems;
        // });
    }

    return (
        <>
            <input
                value={name}
                onChange={handleChange}
            ></input>
            <br />

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