type HTML5Tag = string;
type ReactTextTag = 'TEXT_ELEMENT';

interface FiberProps {
  children?: (VirtualDOM | VirtualTextDOM)[];
  [key: string]: unknown;
}

type RealDom = HTMLElement | Text;

type EffectTag = 'PLACEMENT' | 'UPDATE' | 'DELETION';

interface Fiber {
  type: HTML5Tag | ReactTextTag | null;
  props: FiberProps;
  dom: RealDom | null;
  parent: Fiber | null;
  child: Fiber | null;
  sibling: Fiber | null;
  alternate: Fiber | null;
  effectTag: EffectTag | null;
}

type VirtualDOM = Pick<Fiber, 'props'> & { type: HTML5Tag };
type VirtualTextDOM = Pick<Fiber, 'props'> & {
  type: ReactTextTag;
};

interface DeadLine {
  timeRemaining: () => number;
  didTimeout: boolean;
}

/** ======== 实现虚拟 DOM API ======== */
const React = {
  createElement: (
    type: HTML5Tag,
    props: FiberProps,
    ...children: (string | VirtualDOM)[]
  ): VirtualDOM => {
    const dom: VirtualDOM = {
      type,
      props: {
        ...props,
        children: children.map(child => {
          if (typeof child === 'object') return child;
          return React.createTextElement(child);
        }),
      },
    };
    return dom;
  },

  createTextElement(text: string): VirtualTextDOM {
    const dom: VirtualTextDOM = {
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
function createReaalDom(fiber: Fiber): RealDom {
  const dom: RealDom =
    fiber.type === 'TEXT_ELEMENT'
      ? document.createTextNode('')
      : document.createElement(fiber.type!);

  return dom;
}

function updateReaalDom(
  realDom: RealDom,
  prevProps: FiberProps,
  nextProps: FiberProps,
) {
  // 删除旧属性
  Object.keys(prevProps)
    .filter(key => key !== 'children')
    .map(key => (realDom[key] = ''));

  // 更新新属性
  Object.keys(nextProps)
    .filter(key => key !== 'children')
    .map(key => {
      realDom[key] = nextProps[key];
    });
}

/** ======== React 核心逻辑：工作单元 ======== */
let nextUnitOfWork: Fiber | null = null; // 下一个工作单元
let wipRoot: Fiber | null = null; // 正在工作的根节点(新 Fiber 树)
let currentRoot: Fiber | null = null; // 当前渲染完成的根节点(旧 Fiber 树)
let deletions: Fiber[] = []; // Diff 算法后待删除的节点

// 在空闲时间执行切片任务(工作单元)
function workloop(deadline: DeadLine) {
  let shouldYield = false; // 控制权锁

  while (nextUnitOfWork && !shouldYield) {
    nextUnitOfWork = performUnitOfWork(nextUnitOfWork);

    shouldYield = deadline.timeRemaining() < 1;
  }

  if (!nextUnitOfWork && wipRoot) commitRoot();

  requestIdleCallback(workloop);
}
requestIdleCallback(workloop);

// 执行工作单元
function performUnitOfWork(fiber: Fiber): Fiber | null {
  // 生成 Fiber 树对应的真实 DOM 节点
  if (!fiber.dom) fiber.dom = createReaalDom(fiber);

  // 将 Fiber 子集转换为 Fiber 树，并通过 Diff 算法生成 effectTag
  const elements = fiber.props.children ?? [];
  reconcileChildren(fiber, elements);

  if (fiber.child) return fiber.child;

  let nextFiber: Fiber | null = fiber;
  while (nextFiber) {
    // 找到下一个工作单元
    if (nextFiber.sibling) return nextFiber.sibling;

    // 若当亲 Fiber 子集已遍历完毕，则回退到父级 Fiber
    nextFiber = nextFiber.parent;
  }

  // 若所有 Fiber 子集已遍历完毕，则表示当前 Fiber 树已遍历完毕
  return null;
}

// 创建 Fiber 树
function createFiber(
  element: VirtualDOM | VirtualTextDOM,
  parent: Fiber,
): Fiber {
  const fiber: Fiber = {
    parent,
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
function reconcileChildren(
  wipFiber: Fiber,
  elements: (VirtualDOM | VirtualTextDOM)[],
) {
  let index = 0;
  let prevSibling: Fiber | null = null;
  // 获取 旧 Fiber 树
  let oldFiber: Fiber | null = wipFiber.alternate && wipFiber.alternate.child;

  while (index < elements.length || oldFiber) {
    const element = elements[index];
    const sameType = oldFiber && element.type === oldFiber.type;

    let newFiber: Fiber | null = null;

    if (sameType) {
      // 若新旧 Fiber 类型相同，则复用旧 Fiber
      console.log('复用 DOM', element);
      newFiber = {
        type: oldFiber!.type,
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
    } else if (!sameType && element) {
      // 若新旧 Fiber 类型不同，存在新子集 element，则创建新 Fiber
      console.log('新增 DOM', element);
      newFiber = createFiber(element, wipFiber);
      newFiber.effectTag = 'PLACEMENT';
    } else if (!sameType && oldFiber) {
      // 若新旧 Fiber 类型不同，存在旧子集 oldFiber，则标记旧 Fiber 为删除
      console.log('删除 DOM', oldFiber);
      oldFiber.effectTag = 'DELETION';
      deletions.push(oldFiber);
    }
    // 循环遍历，检测是否存在可复用的兄弟节点
    if (oldFiber) oldFiber = oldFiber.sibling;

    if (index === 0) {
      wipFiber.child = newFiber;
    } else if (element) {
      prevSibling!.sibling = newFiber;
    }

    prevSibling = newFiber; // 保存上一个兄弟节点
    index++;
  }
}

/** ======== 执行渲染更新操作 API ======== */
function commitRoot() {
  deletions.forEach(commitWork);
  commitWork(wipRoot!.child!);
  currentRoot = wipRoot;
  wipRoot = null;
}

function commitWork(fiber: Fiber | null) {
  if (!fiber) return;

  // 获取 Fiber 对象的父级 DOM 节点
  const parentDom = fiber.parent!.dom!;

  console.log(fiber.type === 'TEXT_ELEMENT', fiber.dom);

  if (fiber.effectTag === 'PLACEMENT' && fiber.dom != null) {
    parentDom.appendChild(fiber.dom);
  } else if (fiber.effectTag === 'UPDATE' && fiber.dom != null) {
    updateReaalDom(fiber.dom, fiber.alternate!.props, fiber.props);
  } else if (fiber.effectTag === 'DELETION') {
    parentDom.removeChild(fiber.dom!);
  }

  commitWork(fiber.child);
  commitWork(fiber.sibling);
}

function render(element: VirtualDOM, container: HTMLElement) {
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

const container = document.getElementById('root') as HTMLElement;

const dom1 = React.createElement(
  'section',
  { id: 'container', class: 'container' },
  React.createElement('div', { id: 'content' }, 'hello world'),
  'ok',
);

const dom2 = React.createElement(
  'section',
  { id: 'container', class: 'container' },
  React.createElement('h1', { id: 'title' }, 'xiaoyimi'),
);

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
