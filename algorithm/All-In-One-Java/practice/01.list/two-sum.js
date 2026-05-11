// 반복문을 2개 쓰니까 O(n^2) 시간 복잡도.
function twoSum(nums, target) {
    for (let i = 0; i < nums.length; i++) {
        for (let j = i + 1; j < nums.length; j++) {
            if (nums[i] + nums[j] === target) {
                return true;
            }
        }
    }

    return false;
}

console.log(twoSum([2, 7, 11, 15], 9)); // true
console.log(twoSum([1, 2, 3, 4], 8)); // false