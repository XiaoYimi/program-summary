export type HTML5Tag =
  | 'h1'
  | 'h2'
  | 'h3'
  | 'h4'
  | 'h5'
  | 'h6'
  | 'section'
  | 'div'
  | 'p'
  | 'ul'
  | 'ol'
  | 'li'
  | 'form'
  | 'input'
  | 'button'
  | 'a'
  | 'span'
  | 'img'
  | 'br'
  | 'hr'
  | 'script'
  | 'style'
  | 'template'
  | 'svg'
  | 'path'
  | 'rect'
  | 'circle'
  | 'text'
  | 'use'
  | 'g'
  | 'defs'
  | 'marker'
  | 'line'
  | 'polyline'
  | 'polygon';

export type ReactTextTag = 'TEXT_ELEMENT';

export type RealDom = HTML5Tag | null;

export interface VirtualDomProps {
  children?: (VirtualDom | VirtualTextDom)[];
  [key: string]: unknown;
}

export interface VirtualDom {
  type: HTML5Tag;
  props: VirtualDomProps;
}

export interface VirtualTextDom {
  type: ReactTextTag;
  nodeValue: string;
  children?: VirtualDom[];
}

export interface DeadLine {
  timeRemaining: () => number;
  didTimeout: boolean;
}

export interface Fiber {}

const React = {
  createElement: (
    type: HTML5Tag,
    props: VirtualDomProps,
    ...children: (string | VirtualDom)[]
  ): VirtualDom => {
    return {
      type,
      props: {
        ...props,
        children: children.map(child => {
          if (typeof child === 'object') return child;
          return React.createTextElement(child);
        }),
      },
    };
  },

  createTextElement: (text: string): VirtualTextDom => {
    return { type: 'TEXT_ELEMENT', nodeValue: text, children: [] };
  },
};

const dom = React.createElement('div', { id: 1 }, 'hello world', 'xiaoyimi');
console.log(dom);

let nextUnitWork: Fiber | null = null; // 下一个要执行的任务
let currrentUnitWork: Fiber | null = null; // 当前正在执行的任务

function workLoop(deadline: DeadLine) {
  let shouldYield = false;

  while (nextUnitWork && !shouldYield) {
    nextUnitWork = performUnitOfWork(nextUnitWork);
    shouldYield = deadline.timeRemaining() < 1;
  }

  requestIdleCallback(workLoop);
}

function performUnitOfWork(fiber: Fiber): Fiber {
  return fiber;
}
