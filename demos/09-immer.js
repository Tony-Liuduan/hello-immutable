// const { produce } = require('immer');

// const obj = {
// 	a: {
// 		b: {
// 			c: 1
// 		}
// 	},
// 	x: {
// 		name: 'hh'
// 	}
// };

// const obj1 = produce(obj, draft => {
// 	console.log(draft);
// 	draft.a.b.c = 2;
// });

// console.log(obj1.a);
// console.log(obj1.x === obj.x);

//////////////////////////////// 源码 //////////////////////////////////

let currentScope = undefined;

function getCurrentScope() {
	return currentScope;
}

function createScope(immer) {
	return currentScope = {
		drafts_: [],
		parent_: undefined,
		immer_: immer,
		// Whenever the modified draft contains a draft from another scope, we
		// need to prevent auto-freezing so the unowned draft can be finalized.
		canAutoFreeze_: true,
		unfinalizedDrafts_: 0
	};
}

class Immer {
	autoFreeze_ = true;
	produce(base, recipe) {
		const scope = createScope(this);
		const proxy = createProxy(this, base, undefined)
		const result = recipe(proxy)
		return processResult(result, scope);
	}
}

function createProxy(
	_immer,
	value,
	parent
) {
	const draft = createProxyProxy(value, parent);
	const scope = getCurrentScope();
	scope.drafts_.push(draft);
	return draft;
}

function createProxyProxy(base, parent) {
	const state = {
		// Track which produce call this is associated with.
		scope_: getCurrentScope(),
		// True for both shallow and deep changes.
		modified_: false,
		// Used during finalization.
		finalized_: false,
		// Track which properties have been assigned (true) or deleted (false).
		assigned_: {},
		// The parent draft state.
		parent_: parent,
		// The base state.
		base_: base,
		// The base copy with any updated values.
		copy_: null, // The base proxy.
		// The base proxy.
		draft_: null,
		revoke_: null,
		isManual_: false
	}
	let target = state;
	let traps = objectTraps;

	// Proxy.revocable() 方法可以用来创建一个可撤销的代理对象
	// Proxy.revocable()方法返回一个对象，该对象的proxy属性是Proxy实例，revoke属性是一个函数，可以取消Proxy实例，当执行revoke函数之后，再访问Proxy实例，就会抛出一个错误
	// 详见：https://www.bookstack.cn/read/es6-3rd/spilt.3.docs-proxy.md
	const { proxy, revoke } = Proxy.revocable(target, traps)
	state.draft_ = proxy;
	state.revoke_ = revoke;
	return proxy;
}

const DRAFT_STATE = 'immer-state';
function is(x, y) {
	// From: https://github.com/facebook/fbjs/blob/c69904a511b900266935168223063dd8772dfc40/packages/fbjs/src/core/shallowEqual.js
	if (x === y) {
		return x !== 0 || 1 / x === 1 / y
	} else {
		return x !== x && y !== y
	}
}

const objectTraps = {
	get(state, prop) {
		if (prop === DRAFT_STATE) return state

		const source = latest(state)
		if (!source.hasOwnProperty(prop)) {
			// non-existing or non-own property...
			return readPropFromProto(state, source, prop)
		}
		const value = source[prop]
		if (state.finalized_) {
			return value
		}
		// Check for existing draft in modified state.
		// Assigned values are never drafted. This catches any drafts we created, too.
		if (value === peek(state.base_, prop)) {
			prepareCopy(state)
			return (state.copy_[prop] = createProxy(
				state.scope_.immer_,
				value,
				state
			))
		}
		return value
	},
	has(state, prop) {
		return prop in latest(state)
	},
	set(
		state,
		prop,
		value
	) {
		const desc = getDescriptorFromProto(latest(state), prop)
		if (desc?.set) {
			// special case: if this write is captured by a setter, we have
			// to trigger it with the correct context
			desc.set.call(state.draft_, value)
			return true
		}
		if (!state.modified_) {
			// the last check is because we need to be able to distinguish setting a non-existing to undefined (which is a change)
			// from setting an existing property with value undefined to undefined (which is not a change)
			const current = peek(latest(state), prop)
			// special case, if we assigning the original value to a draft, we can ignore the assignment
			const currentState = current[DRAFT_STATE]
			if (currentState && currentState.base_ === value) {
				state.copy_[prop] = value
				state.assigned_[prop] = false
				return true
			}
			if (is(value, current) && (value !== undefined || state.base_.hasOwnProperty(prop)))
				return true
			prepareCopy(state)
			markChanged(state)
		}

		if (
			state.copy_[prop] === value &&
			// special case: NaN
			typeof value !== "number" &&
			// special case: handle new props with value 'undefined'
			(value !== undefined || prop in state.copy_)
		)
			return true

		// @ts-ignore
		state.copy_[prop] = value
		state.assigned_[prop] = true
		return true
	},
	deleteProperty(state, prop) {
		// The `undefined` check is a fast path for pre-existing keys.
		if (peek(state.base_, prop) !== undefined || prop in state.base_) {
			state.assigned_[prop] = false
			prepareCopy(state)
			markChanged(state)
		} else {
			// if an originally not assigned property was deleted
			delete state.assigned_[prop]
		}
		// @ts-ignore
		if (state.copy_) delete state.copy_[prop]
		return true
	},
}

function peek(draft, prop) {
	const state = draft[DRAFT_STATE]
	const source = state ? latest(state) : draft
	return source[prop]
}

function latest(state) {
	return state.copy_ || state.base_
}

function readPropFromProto(state, source, prop) {
	const desc = getDescriptorFromProto(source, prop)
	return desc
		? `value` in desc
			? desc.value
			: // This is a very special case, if the prop is a getter defined by the
			// prototype, we should invoke it with the draft as context!
			desc.get?.call(state.draft_)
		: undefined
}

function getDescriptorFromProto(source, prop) {
	if (!(prop in source)) return undefined
	let proto = Object.getPrototypeOf(source)
	while (proto) {
		const desc = Object.getOwnPropertyDescriptor(proto, prop)
		if (desc) return desc
		proto = Object.getPrototypeOf(proto)
	}
	return undefined
}

function markChanged(state) {
	if (!state.modified_) {
		state.modified_ = true
		if (state.parent_) {
			markChanged(state.parent_)
		}
	}
}

function prepareCopy(state) {
	if (!state.copy_) {
		state.copy_ = shallowCopy(state.base_)
	}
}

function shallowCopy(base) {
	if (Array.isArray(base)) return Array.prototype.slice.call(base);

	const descriptors = Object.getOwnPropertyDescriptors(base);

	delete descriptors[DRAFT_STATE];

	let keys = Reflect.ownKeys(descriptors);
	for (let i = 0; i < keys.length; i++) {
		const key = keys[i]
		const desc = descriptors[key]
		if (desc.writable === false) {
			desc.writable = true
			desc.configurable = true
		}
		// like object.assign, we will read any _own_, get/set accessors. This helps in dealing
		// with libraries that trap values, like mobx or vue
		// unlike object.assign, non-enumerables will be copied as well
		if (desc.get || desc.set)
			descriptors[key] = {
				configurable: true,
				writable: true, // could live with !!desc.set as well here...
				enumerable: desc.enumerable,
				value: base[key]
			}
	}
	return Object.create(Object.getPrototypeOf(base), descriptors)
}

function processResult(result, scope) {
	scope.unfinalizedDrafts_ = scope.drafts_.length;

	const baseDraft = scope.drafts_[0];

	result = finalize(scope, baseDraft, []);

	revokeScope(scope);

	return result;
}

function finalize(rootScope, value, path) {
	// Don't recurse in tho recursive data structures
	if (Object.isFrozen(value)) return value;

	const state = value[DRAFT_STATE];
	// A plain object, might need freezing, might contain drafts
	if (!state) {
		Object.keys(value).forEach(key, (key, childValue) =>
			finalizeProperty(rootScope, state, value, key, childValue, path)
		);
		return value
	}
	// Never finalize drafts owned by another scope.
	if (state.scope_ !== rootScope) return value
	// Unmodified draft, return the (frozen) original
	if (!state.modified_) {
		maybeFreeze(rootScope, state.base_, true)
		return state.base_
	}
	// Not finalized yet, let's do that now
	if (!state.finalized_) {
		state.finalized_ = true
		state.scope_.unfinalizedDrafts_--
		const result = state.type_ === state.copy_;
		// Finalize all children of the copy
		// For sets we clone before iterating, otherwise we can get in endless loop due to modifying during iteration, see #628
		// Although the original test case doesn't seem valid anyway, so if this in the way we can turn the next line
		// back to each(result, ....)
		Object.keys(result).forEach(
			(key, childValue) =>
				finalizeProperty(rootScope, state, result, key, childValue, path)
		)
		// everything inside is frozen, we can freeze here
		maybeFreeze(rootScope, result, false)
		// first time finalizing, let's create those patches
		if (path && rootScope.patches_) {
			getPlugin("Patches").generatePatches_(
				state,
				path,
				rootScope.patches_,
				rootScope.inversePatches_
			)
		}
	}
	return state.copy_
}

function finalizeProperty(
	rootScope,
	parentState,
	targetObject,
	prop,
	childValue,
	rootPath
) {
	if (isDraft(childValue)) {
		const path =
			rootPath &&
				parentState &&
				parentState.type_ !== ProxyType.Set && // Set objects are atomic since they have no keys.
				!parentState.assigned_.hasOwnProperty(prop) // Skip deep patches for assigned keys.
				? rootPath.concat(prop)
				: undefined

		// Drafts owned by `scope` are finalized here.
		const res = finalize(rootScope, childValue, path);

		targetObject[prop] = res;
		// Drafts from another scope must prevented to be frozen
		// if we got a draft back from finalize, we're in a nested produce and shouldn't freeze
		if (isDraft(res)) {
			rootScope.canAutoFreeze_ = false
		}

		return;
	}
	// Search new objects for unfinalized drafts. Frozen objects should never contain drafts.
	if (!Object.isFrozen(childValue)) {
		if (!rootScope.immer_.autoFreeze_ && rootScope.unfinalizedDrafts_ < 1) {
			// optimization: if an object is not a draft, and we don't have to
			// deepfreeze everything, and we are sure that no drafts are left in the remaining object
			// cause we saw and finalized all drafts already; we can stop visiting the rest of the tree.
			// This benefits especially adding large data tree's without further processing.
			// See add-data.js perf test
			return
		}
		finalize(rootScope, childValue)
		// immer deep freezes plain objects, so if there is no parent state, we freeze as well
		if (!parentState || !parentState.scope_.parent_)
			maybeFreeze(rootScope, childValue)
	}
}

function maybeFreeze(scope, value, deep = false) {
	if (scope.immer_.autoFreeze_ && scope.canAutoFreeze_) {
		freeze(value, deep)
	}
}
function freeze(obj, deep = false) {
	if (Object.isFrozen(obj) || isDraft(obj)) return obj
	Object.freeze(obj)
	if (deep) {
		Object.keys(obj).forEach(key, value => freeze(value, true));
	}
	return obj;
}
function isDraft(value) {
	return !!value && !!value[DRAFT_STATE]
}

function revokeScope(scope) {
	if (scope === currentScope) {
		currentScope = scope.parent_
	}
	scope.drafts_.forEach((draft) => {
		const state = draft[DRAFT_STATE]
		state.revoke_();
	})
	// @ts-ignore
	scope.drafts_ = null
}

// test
const myObj = {
	a: 1,
	x: {
		name: 'hh'
	}
};

const myObj1 = (new Immer()).produce(myObj, draft => {
	draft.a = 3;
});

console.log(myObj1.a);
console.log(myObj1 === myObj);
console.log(myObj1.x === myObj.x);
