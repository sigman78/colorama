export const code = `\
#include <vector>
#include <string>

#define MAX_SIZE 1024

/* Compute the n-th Fibonacci number using dynamic programming */
template <typename T>
T fibonacci(int n) {
  if (n <= 1) return static_cast<T>(n);
  std::vector<T> dp(n + 1);
  dp[0] = 0;
  dp[1] = 1;
  // Fill the table iteratively
  for (int i = 2; i <= n; i++)
    dp[i] = dp[i - 1] + dp[i - 2];
  return dp[n];
}

class Matrix {
public:
  Matrix(int rows, int cols) : rows_(rows), cols_(cols) {}
  ~Matrix() = default;

  double get(int r, int c) const { return data_[r * cols_ + c]; }

private:
  int rows_, cols_;
  std::vector<double> data_;
};

int main() {
  const std::string label = "Result";
  auto result = fibonacci<long>(10);
  return 0;
}`;
