/******************* 逻辑分析 *********************************
 ** 理解题意:                                                **
 **  1.三数值和等于 0; 且三个元素在不同索引上，即索引值两两不相同。。 **
 **  2.以二维数组形式返回三数值和列表。                          **
 **                                                         **
 ** 实现要求:                                                **
 **                                                         **
 **                                                         **
 ** 解题思路: (固定指针+双指针)                                 **
 **                                                         **
 ************************************************************/

function threeSum(nums: number[]): number[][] {
  nums.sort((a, b) => a - b);
  const target = 0;
  const result: number[][] = [];

  let k = 0; // 固定指针

  while (k < nums.length - 2) {
    const kValue = nums[k];

    let i = k + 1; // 左指针
    let j = nums.length - 1; // 右指针

    while (i < j) {
      const iValue = nums[i];
      const jValue = nums[j];

      // 获取三数值和
      const sum = kValue + iValue + jValue;

      if (sum > target) {
        j--;
      } else if (sum < target) {
        i++;
      } else {
        result.push([kValue, iValue, jValue]);

        // 去重处理
        while (i < j && nums[i] === iValue) {
          i++;
        }
        while (i < j && nums[j] === jValue) {
          j--;
        }

        i++;
        j--;
        console.log(`三元组列表去重存在问题，待优化`);
      }
    }

    k++;
  }

  return result;
}

console.log(threeSum([-1, 0, 1, 2, -1, -4])); // [[-1,-1,2],[-1,0,1]]

console.log(threeSum([0, 0, 0, 0])); // [[0,0,0]]
