var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
/** ======== 实现虚拟 DOM API ======== */
var React = {
    createElement: function (type, props) {
        var children = [];
        for (var _i = 2; _i < arguments.length; _i++) {
            children[_i - 2] = arguments[_i];
        }
        var dom = {
            type: type,
            props: __assign(__assign({}, props), { children: children.map(function (child) {
                    if (typeof child === 'object')
                        return child;
                    return React.createTextElement(child);
                }) }),
        };
        return dom;
    },
    createTextElement: function (text) {
        var dom = {
            type: 'TEXT_ELEMENT',
            props: {
                nodeValue: text,
                children: [],
            },
        };
        return dom;
    },
};
/** ======== 实现真实 DOM API ======== */
function createReaalDom(fiber) {
    var dom = fiber.type === 'TEXT_ELEMENT'
        ? document.createTextNode('')
        : document.createElement(fiber.type);
    return dom;
}
function updateReaalDom(realDom, prevProps, nextProps) {
    // 删除旧属性
    Object.keys(prevProps)
        .filter(function (key) { return key !== 'children'; })
        .map(function (key) { return (realDom[key] = ''); });
    // 更新新属性
    Object.keys(nextProps)
        .filter(function (key) { return key !== 'children'; })
        .map(function (key) {
        realDom[key] = nextProps[key];
    });
}
/** ======== React 核心逻辑：工作单元 ======== */
var nextUnitOfWork = null; // 下一个工作单元
var wipRoot = null; // 正在工作的根节点(新 Fiber 树)
var currentRoot = null; // 当前渲染完成的根节点(旧 Fiber 树)
var deletions = []; // Diff 算法后待删除的节点
// 在空闲时间执行切片任务(工作单元)
function workloop(deadline) {
    var shouldYield = false; // 控制权锁
    while (nextUnitOfWork && !shouldYield) {
        nextUnitOfWork = performUnitOfWork(nextUnitOfWork);
        shouldYield = deadline.timeRemaining() < 1;
    }
    if (!nextUnitOfWork && wipRoot)
        commitRoot();
    requestIdleCallback(workloop);
}
requestIdleCallback(workloop);
// 执行工作单元
function performUnitOfWork(fiber) {
    var _a;
    // 生成 Fiber 树对应的真实 DOM 节点
    if (!fiber.dom)
        fiber.dom = createReaalDom(fiber);
    // 将 Fiber 子集转换为 Fiber 树，并通过 Diff 算法生成 effectTag
    var elements = (_a = fiber.props.children) !== null && _a !== void 0 ? _a : [];
    reconcileChildren(fiber, elements);
    if (fiber.child)
        return fiber.child;
    var nextFiber = fiber;
    while (nextFiber) {
        // 找到下一个工作单元
        if (nextFiber.sibling)
            return nextFiber.sibling;
        // 若当亲 Fiber 子集已遍历完毕，则回退到父级 Fiber
        nextFiber = nextFiber.parent;
    }
    // 若所有 Fiber 子集已遍历完毕，则表示当前 Fiber 树已遍历完毕
    return null;
}
// 创建 Fiber 树
function createFiber(element, parent) {
    var fiber = {
        parent: parent,
        type: element.type,
        props: element.props,
        dom: null,
        child: null,
        sibling: null,
        alternate: null,
        effectTag: null,
    };
    return fiber;
}
// 转换子集为 Fiber 树，并通过 Diff 算法生成 effectTag
function reconcileChildren(wipFiber, elements) {
    var index = 0;
    var prevSibling = null;
    // 获取 旧 Fiber 树
    var oldFiber = wipFiber.alternate && wipFiber.alternate.child;
    while (index < elements.length || oldFiber) {
        var element = elements[index];
        var sameType = oldFiber && element.type === oldFiber.type;
        var newFiber = null;
        if (sameType) {
            // 若新旧 Fiber 类型相同，则复用旧 Fiber
            console.log('复用 DOM', element);
            newFiber = {
                type: oldFiber.type,
                props: element.props,
                alternate: oldFiber,
                dom: null,
                child: null,
                sibling: null,
                parent: wipFiber,
                effectTag: 'UPDATE',
            };
            // 属性可能发生变化，因此取值 elment.props
            newFiber.props = element.props;
            newFiber.effectTag = 'UPDATE';
        }
        else if (!sameType && element) {
            // 若新旧 Fiber 类型不同，存在新子集 element，则创建新 Fiber
            console.log('新增 DOM', element);
            newFiber = createFiber(element, wipFiber);
            newFiber.effectTag = 'PLACEMENT';
        }
        else if (!sameType && oldFiber) {
            // 若新旧 Fiber 类型不同，存在旧子集 oldFiber，则标记旧 Fiber 为删除
            console.log('删除 DOM', oldFiber);
            oldFiber.effectTag = 'DELETION';
            deletions.push(oldFiber);
        }
        // 循环遍历，检测是否存在可复用的兄弟节点
        if (oldFiber)
            oldFiber = oldFiber.sibling;
        if (index === 0) {
            wipFiber.child = newFiber;
        }
        else if (element) {
            prevSibling.sibling = newFiber;
        }
        prevSibling = newFiber; // 保存上一个兄弟节点
        index++;
    }
}
/** ======== 执行渲染更新操作 API ======== */
function commitRoot() {
    deletions.forEach(commitWork);
    commitWork(wipRoot.child);
    currentRoot = wipRoot;
    wipRoot = null;
}
function commitWork(fiber) {
    if (!fiber)
        return;
    // 获取 Fiber 对象的父级 DOM 节点
    var parentDom = fiber.parent.dom;
    console.log(fiber.type === 'TEXT_ELEMENT', fiber.dom);
    if (fiber.effectTag === 'PLACEMENT' && fiber.dom != null) {
        parentDom.appendChild(fiber.dom);
    }
    else if (fiber.effectTag === 'UPDATE' && fiber.dom != null) {
        updateReaalDom(fiber.dom, fiber.alternate.props, fiber.props);
    }
    else if (fiber.effectTag === 'DELETION') {
        parentDom.removeChild(fiber.dom);
    }
    commitWork(fiber.child);
    commitWork(fiber.sibling);
}
function render(element, container) {
    //当前执行的 Fiber 树
    wipRoot = {
        dom: container,
        props: {
            children: [element],
        },
        alternate: currentRoot,
        type: null,
        parent: null,
        child: null,
        sibling: null,
        effectTag: null,
    };
    nextUnitOfWork = wipRoot;
    deletions = [];
}
var container = document.getElementById('root');
var dom1 = React.createElement('section', { id: 'container', class: 'container' }, React.createElement('div', { id: 'content' }, 'hello world'), 'ok');
var dom2 = React.createElement('section', { id: 'container', class: 'container' }, React.createElement('h1', { id: 'title' }, 'xiaoyimi'));
render(dom1, container);
// setTimeout(() => {
//   console.log('数据发生变化');
//   render(
//     React.createElement(
//       'section',
//       { id: 'container' },
//       React.createElement('h1', { id: 'title' }, 'xiaoyimi'),
//     ),
//     container,
//   );
// }, 2500);
