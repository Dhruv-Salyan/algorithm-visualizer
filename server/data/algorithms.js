/**
 * Static metadata for the four DSA patterns.
 * This is the single source of truth consumed by the API and, through it,
 * by both the home page cards and the visualization page.
 */

const algorithms = [
  {
    slug: 'two-pointers',
    name: 'Two Pointers',
    tagline: 'Walk two array positions toward each other to prune the search space in one pass.',
    shortDescription:
      'Two indices scan a sorted array from opposite ends, moving inward based on a comparison, to find a pair that satisfies a condition.',
    longDescription:
      'The Two Pointers pattern keeps one pointer at each end of a sorted array. At every step it compares the sum of the two pointed-at values against a target: if the sum is too small the left pointer moves right to increase it, if it is too large the right pointer moves left to decrease it, and if it matches, a pair has been found. Because the array is sorted, every move safely discards one element from consideration, giving a single O(n) sweep instead of the O(n²) of checking every pair.',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(1)',
    useCase: 'Pair with target sum in a sorted array',
    whatItIs: 'A technique that scans a sorted array with two indices moving toward each other instead of checking every pair.',
    whenToUse: 'When the array is sorted and you need to find a pair, triplet, or window that satisfies a sum or comparison condition.',
    coreIdea: 'Moving one pointer always eliminates exactly one element from consideration, so the whole array is covered in a single pass.',
    commonPattern: 'Pair sum, container with most water, remove duplicates, reversing an array in place.',
    example: 'Given a sorted array, find two numbers that add up to a target value — e.g. [2,7,11,15], target 9 → (2,7).',
    pseudocode: [
      'left = 0, right = n - 1',
      'while left < right:',
      '    sum = arr[left] + arr[right]',
      '    if sum == target: return (left, right)',
      '    else if sum < target: left += 1',
      '    else: right -= 1',
      'return "no pair found"'
    ],
    defaultInput: { array: [2, 4, 7, 11, 15, 18, 22, 26], target: 26 }
  },
  {
    slug: 'binary-search',
    name: 'Binary Search',
    tagline: 'Cut a sorted search space in half on every comparison until the target is pinned down.',
    shortDescription:
      'Repeatedly compares the target with the middle element of a shrinking sorted range, discarding the half that cannot contain it.',
    longDescription:
      'Binary Search maintains a low and high boundary over a sorted array. It looks at the middle element: if it equals the target, the search is done; if the target is smaller, the right half is discarded by moving high before mid; if larger, the left half is discarded by moving low past mid. Each comparison halves the remaining search space, which is what gives the logarithmic running time.',
    timeComplexity: 'O(log n)',
    spaceComplexity: 'O(1)',
    useCase: 'Locating a value in a sorted array',
    whatItIs: 'A search technique that repeatedly cuts a sorted range in half instead of scanning it element by element.',
    whenToUse: 'When your data is sorted and you need to check for existence, find an exact value, or find an insertion point quickly.',
    coreIdea: 'Comparing the target to the middle element throws away half of the remaining search space on every step.',
    commonPattern: 'Search in sorted array, find first/last occurrence, search in rotated array, find boundary of a condition.',
    example: 'Find 23 in [2,5,8,12,16,23,38,45] — check the middle, discard the half that can\u2019t contain it, repeat.',
    pseudocode: [
      'low = 0, high = n - 1',
      'while low <= high:',
      '    mid = floor((low + high) / 2)',
      '    if arr[mid] == target: return mid',
      '    else if arr[mid] < target: low = mid + 1',
      '    else: high = mid - 1',
      'return "not found"'
    ],
    defaultInput: { array: [2, 5, 8, 12, 16, 23, 38, 45, 56, 72, 91], target: 23 }
  },
  {
    slug: 'sliding-window',
    name: 'Sliding Window',
    tagline: 'Grow and shrink a contiguous window over the array instead of re-scanning from scratch.',
    shortDescription:
      'A window bounded by a left and right pointer expands to the right to include elements and contracts from the left once a condition is satisfied.',
    longDescription:
      'The Sliding Window pattern avoids recomputation by reusing work from the previous window. The right pointer expands the window one element at a time, adding to a running sum. Whenever the running sum meets the required condition, the left pointer contracts the window from the left, shrinking it while the condition still holds and recording the smallest window seen. This turns an O(n²) brute-force scan of every subarray into a single O(n) pass.',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(1)',
    useCase: 'Smallest subarray with a sum ≥ target',
    whatItIs: 'A technique that maintains a contiguous "window" over the array, growing and shrinking it instead of re-scanning subarrays.',
    whenToUse: 'When you need something about every contiguous subarray/substring — a sum, count, or longest/shortest length — of a sequence.',
    coreIdea: 'The right edge expands to include new elements; once the window satisfies the condition, the left edge shrinks it to look for a smaller valid window — each element is added and removed at most once.',
    commonPattern: 'Max sum subarray of size K, longest substring without repeats, minimum window substring.',
    example: 'Smallest subarray of [2,1,5,2,3,2] with sum ≥ 7 → [5,2] has length 2.',
    pseudocode: [
      'left = 0, windowSum = 0, best = infinity',
      'for right in 0..n-1:',
      '    windowSum += arr[right]',
      '    while windowSum >= target:',
      '        best = min(best, right - left + 1)',
      '        windowSum -= arr[left]',
      '        left += 1',
      'return best'
    ],
    defaultInput: { array: [2, 1, 5, 2, 3, 2, 8, 1, 6], target: 9 }
  },
  {
    slug: 'prefix-sum',
    name: 'Prefix Sum',
    tagline: 'Precompute running totals once so any range sum becomes a single subtraction.',
    shortDescription:
      'Builds an auxiliary array where each entry holds the cumulative sum up to that index, enabling O(1) range-sum queries afterward.',
    longDescription:
      'Prefix Sum trades a small amount of preprocessing for very fast queries. A new array is built where prefix[i] holds the sum of all elements from the start of the array up to index i. Once this array exists, the sum of any range [L, R] can be answered instantly as prefix[R] - prefix[L - 1], without re-adding the elements in between. This is especially valuable when many range-sum queries are made on the same array.',
    timeComplexity: 'O(n) build, O(1) per query',
    spaceComplexity: 'O(n)',
    useCase: 'Answering range-sum queries efficiently',
    whatItIs: 'A precomputed running-total array that lets you answer "sum of this range" instantly instead of re-adding elements.',
    whenToUse: 'When the array doesn\u2019t change but you need to answer many range-sum queries on it.',
    coreIdea: 'prefix[i] stores the sum of everything up to index i, so any range [L, R] is just one subtraction: prefix[R] - prefix[L-1].',
    commonPattern: 'Range sum queries, equilibrium index, subarray sum equals K, 2D grid sum regions.',
    example: 'For [4,2,7,1,9], the sum of range [1,3] (2+7+1) is answered as prefix[3] - prefix[0] = 14 - 4 = 10.',
    pseudocode: [
      'prefix[0] = arr[0]',
      'for i in 1..n-1:',
      '    prefix[i] = prefix[i-1] + arr[i]',
      '',
      'rangeSum(L, R):',
      '    if L == 0: return prefix[R]',
      '    return prefix[R] - prefix[L-1]'
    ],
    defaultInput: { array: [4, 2, 7, 1, 9, 3, 6, 5], query: { left: 2, right: 6 } }
  }
];

module.exports = algorithms;
