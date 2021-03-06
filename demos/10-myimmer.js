const isPlainObject = value => {
    if (value === null || typeof value !== "object") {
        return false
    }
    const proto = Object.getPrototypeOf(value)
    return proto === Object.prototype || proto === null
}

function produce(baseState, thunk) {
    // Maps baseState objects to proxies
    const proxies = new WeakMap()
    // Maps baseState objects to their copies
    const copies = new WeakMap()

    const objectTraps = {
        get(target, prop) {
            // 若是对象继续代理
            return getOrCreateProxy(getCurrentSource(target)[prop])
        },
        set(target, prop, val) {
            const current = getOrCreateProxy(getCurrentSource(target)[prop])
            const newVal = getOrCreateProxy(val)
            if (current !== newVal) {
                const copy = getOrCreateCopy(target)
                copy[prop] = newVal;
            }
            return true
        },
        deleteProperty(target, prop) {
            const copy = getOrCreateCopy(target)
            delete copy[prop]
            return true
        }
    }

    const getOrCreateProxy = baseState => {
        if (isPlainObject(baseState) || Array.isArray(baseState)) {
            if (proxies.has(baseState)) {
                return proxies.get(baseState)
            }

            const proxy = new Proxy(baseState, objectTraps)
            proxies.set(baseState, proxy)
            return proxy
        } else {
            return baseState
        }
    }

    const getOrCreateCopy = baseState => {
        if (copies.has(baseState)) {
            return copies.get(baseState)
        }
        const copy = Array.isArray(baseState) ? baseState.slice() : { ...baseState }
        copies.set(baseState, copy)
        return copy
    }

    const getCurrentSource = baseState => {
        return copies.get(baseState) || baseState
    }

    const finalize = baseState => {
        if (isPlainObject(baseState) || Array.isArray(baseState)) {
            if (!hasChanges(baseState)) {
                return baseState
            }
            const copy = getOrCreateCopy(baseState)
            Object.keys(copy).forEach(prop => {
                copy[prop] = finalize(copy[prop])
            })
            return copy
        } else {
            return baseState
        }
    }

    const hasChanges = baseState => {
        if (!proxies.has(baseState)) {
            return false
        }
        if (copies.has(baseState)) {
            return true
        }
        return Object.values(baseState).some(value => {
            return isPlainObject(value)
                || Array.isArray(value)
                && hasChanges(value)
        })
    }

    // create proxy for root
    const rootProxy = getOrCreateProxy(baseState)
    // execute the thunk
    thunk(rootProxy)
    // and finalize the modified proxy
    const res = finalize(baseState);
    return res;
}





const state = {
    a: 1,
    b: 2,
    list: [10, 20, 50],
    person: {
        basicInfo: {
            name: 'wq',
            age: 18
        },
        detailInfo: {
            sex: 'female',
            chldren: [
                {
                    name: 'xiaosan'
                },
                {
                    name: 'lisi'
                }
            ]
        }
    }
}

// const nextState = {
//     b: 2,
//     list: [10, 20, 50],
//     person: {
//         basicInfo: {
//             name: 'wq',
//             age: 18
//         },
//         detailInfo: {
//             sex: 'female',
//             chldren: [
//                 {
//                     name: 'xiaosan'
//                 },
//                 {
//                     name: '李四'
//                 },
//                 {
//                     name: '王五'
//                 },
//                 {
//                     name: '李六'
//                 }
//             ]
//         }
//     }
// }


const target = produce(state, draftState => {
    delete draftState.a
    draftState.person.detailInfo.chldren[1].name = '李四'
    draftState.person.detailInfo.chldren.push({
        name: '王五'
    })
    draftState.person.detailInfo.chldren.push({
        name: '李六'
    })
});

console.log('myimmer test...');
console.log('===========');
console.log(target, '\n\n', state);
console.log('===========');
console.log(target.person.detailInfo.chldren, '\n\n', state.person.detailInfo.chldren);
console.log('===========');
console.log(target.person.basicInfo === state.person.basicInfo);
console.log('===========');
console.log(target.person.list === state.person.list);
console.log('===========');
console.log(target.person.detailInfo === state.person.detailInfo);
console.log('===========');
console.log(target.person === state.person);
console.log('=========== end');