// two-pointer 문제는 sort된 배열에서 사용해야한다.
// nlog(n)

function twoPointer(nums, target) {
    nums.sort((a, b) => a - b);

    let leftPointer = 0;
    let rightPointer = nums.length - 1;
    let result = false;

    while (leftPointer < rightPointer) {
        const left = nums[leftPointer];
        const right = nums[rightPointer];

        if (left + right === target) {
            result = true;
            break;
        } else {
            left + right > target ? rightPointer-- : leftPointer++;
        }
    }

    return result;
}

console.log(twoPointer([4,1,9,7,5,3,16], 14));
console.log(twoPointer([2,1,5,7], 4));