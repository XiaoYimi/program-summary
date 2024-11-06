"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
var React = {
    createElement: function (type, props) {
        var children = [];
        for (var _i = 2; _i < arguments.length; _i++) {
            children[_i - 2] = arguments[_i];
        }
        return {
            type: type,
            props: __assign(__assign({}, props), { children: children.map(function (child) {
                    if (typeof child === 'object')
                        return child;
                    return React.createTextElement(child);
                }) }),
        };
    },
    createTextElement: function (text) {
        return { type: 'TEXT_ELEMENT', nodeValue: text, children: [] };
    },
};
var dom = React.createElement('div', { id: 1 }, 'hello world', 'xiaoyimi');
console.log(dom);
var nextUnitWork = null; // 下一个要执行的任务
var currrentUnitWork = null; // 当前正在执行的任务
function workLoop(deadline) {
    var shouldYield = false;
    while (nextUnitWork && !shouldYield) {
        nextUnitWork = performUnitOfWork(nextUnitWork);
        shouldYield = deadline.timeRemaining() < 1;
    }
    requestIdleCallback(workLoop);
}
function performUnitOfWork(fiber) {
    return fiber;
}
