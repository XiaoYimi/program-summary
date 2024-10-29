/******************* 逻辑分析 ******************************
 ** 理解题意:                                             **
 **  1.字母异位词: 是由重新排列源单词的所有字母得到的一个新单词。 **
 **  2.单空字符,也算一个字母;字母都为小写字符。                **
 **  3.返回所有字母异位词组列表, 即 [[...], [...], ...]。    **
 **                                                      **
 ** 实现要求:                                             **
 **  1.时间复杂度O(n)。                                    **
 **                                                      **
 ** 解题思路: (哈希表搜索)                                  **
 **  1.遍历数量元素，并通过分割、排序、拼接字母形成分组 key。    **
 **  2.将数组元素添加到相同分组 key 列表中。                  **
 **  3.返回二维数组分租 key 列表                            **
 *********************************************************/

/** ======== 优化版本 ======== */
function groupAnagrams(strs: string[]): string[][] {
  const map = new Map();

  while (strs.length) {
    const str = strs.shift()!;

    const key = str.split('').sort().join('');
    const group = map.get(key) ?? [];

    group.push(str);
    map.set(key, group);
  }

  return Array.from(map.values());
}

console.log(groupAnagrams(['eat', 'tea', 'tan', 'ate', 'nat', 'bat']));
