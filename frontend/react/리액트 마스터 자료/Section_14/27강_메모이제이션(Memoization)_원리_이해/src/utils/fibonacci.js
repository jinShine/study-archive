const memo = {};
export function pureFibonacci(n) {
  if (n <= 1) return n;
  return pureFibonacci(n - 1) + pureFibonacci(n - 2);
}
export function memoFibonacci(n) {
  if (n in memo) return memo[n];
  if (n <= 1) return n;
  return memo[n] = memoFibonacci(n - 1) + memoFibonacci(n - 2);
}