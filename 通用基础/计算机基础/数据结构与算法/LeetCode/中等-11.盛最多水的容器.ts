/******************* 逻辑分析 *****************************
 ** 理解题意:                                            **
 **  1.坐标轴所构成盛水容器最大值,即底 * 高的值。             **
 **  2.根据面积公式,须知特性:                              **
 **   1) 相同高度时,底边越长，面积值越大。                   **
 **   2) 相同底边时,取决于木桶最最短高度值。                 **
 **                                                     **
 ** 实现要求:                                            **
 **  1.时间复杂度O(n).                                    **
 **                                                     **
 ** 解题思路: (双指针移动)                                 **
 **  1.以双指针不发生碰撞情况下，获取最大底边、最小高度，面积值。 **
 **  2.更新当前最大面积值。                                 **
 **  3.根据双指针对应的元素值比较大小，决定双指针一侧移动。      **
 **                                                     **
 ********************************************************/

function maxArea(height: number[]): number {
  // 界定边界(存在左右 2 块木板才能装水)
  if (height.length < 2) return 0;

  // 双指针以及最大面积值
  let left = 0;
  let right = height.length - 1;
  let maxArea = 0;

  while (left !== right) {
    // 获取最大底边，最小高度值，以及面积值
    const leftHeight = height[left];
    const rightHeight = height[right];
    const isLeftMin = leftHeight < rightHeight;
    const minHeight = isLeftMin ? leftHeight : rightHeight;
    const maxWidth = right - left;
    const area = minHeight * maxWidth;

    // 更新最大面积值，移动指针
    maxArea = Math.max(maxArea, area);
    isLeftMin ? left++ : right--;
  }

  return maxArea;
}

console.log(maxArea([1, 8, 6, 2, 5, 4, 8, 3, 7]));
