/******************* 逻辑分析 ************************************
 ** 理解题意:                                                   **
 **  1.任意两个元素之和等于目标值(target);                         **
 **                                                            **
 ** 实现要求:                                                   **
 **  1.数组元素只允许使用一次;                                     **
 **  2.时间复杂度 O(n);                                          **
 **                                                            **
 ** 解题思路: (哈希表搜索)                                        **
 **  1.遍历数组，使用哈希存储 [value, index] 值;                   **
 **  2.在遍历中计算差值，并通过哈希表存在是否存在; 存在则直接返回结果只;  **
 ***********************************************/

function twoSum(nums: number[], target: number): number[] {
  if (nums.length < 2) return [-1, -1];

  const m = new Map();

  let index = 0;

  while (index < nums.length) {
    const value = nums[index];

    const prev = m.get(target - value);
    if (prev !== undefined) return [prev, index];

    m.set(value, index);
    index++;
  }

  return [-1, -1];
}

console.log(twoSum([15, 2, 7, 11], 9));
