/******************* 逻辑分析 ********************************
 ** 理解题意:                                               **
 **  1.不要求序列元素在原数组中连续.                            **
 **  2.最长连续,即每次涨幅都为1所构成的数据段。                  **
 **                                                        **
 ** 实现要求:                                               **
 **  1.时间复杂度O(n)。                                      **
 **                                                        **
 ** 解题思路: (哈希表搜索)                                    **
 **  1.将源数组排序、去重,并存储到哈希表 Set 对象。              **
 **  2.重置变量 nums 为已排序、去重的列表。                     **
 **  3.遍历数组列表 nums,判断是否存在当前值 + 1,即下一个增幅元素。 **
 **  4.若存在下一个增幅元素，即累计增幅值+1；最后结算最大增幅值。   **
 ***********************************************************/

function longestConsecutive(nums: number[]): number {
  if (nums.length < 2) return nums.length;

  nums.sort((a, b) => a - b);
  const list = new Set(nums);
  nums = Array.from(list);

  let maxLen = 1;
  let growth = maxLen;

  let index = 0;
  while (index < list.size) {
    const value = nums[index];
    const toNext = list.has(value + 1);
    growth = toNext ? ++growth : 1;
    maxLen = Math.max(maxLen, growth);

    index++;
  }

  return maxLen;
}

console.log(longestConsecutive([100, 4, 6, 5, 200, 1, 3, 2]));
