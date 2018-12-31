# String Concatenation

## `str.join()` is always better than `+`?

Python has 2 common ways to concatenate strings. One is to use `+` operator, another is to use `str.join()` method. While learning Python, I heard a lot voices telling me that:

> In Python, it is always more efficient to concatenate strings using `str.join()` method instead of `+` operator.

However, someone show me a demo:

```python
Python 3.7.1 (default, Nov  6 2018, 18:46:03)
Type 'copyright', 'credits' or 'license' for more information
IPython 7.1.1 -- An enhanced Interactive Python. Type '?' for help.

In [1]: def a():
   ...:     return ''.join(['a', 'b', 'c'])
   ...:

In [2]: def b():
   ...:     return 'a' + 'b' + 'c'
   ...:

In [3]: %timeit a()
243 ns ± 3.99 ns per loop (mean ± std. dev. of 7 runs, 1000000 loops each)

In [4]: %timeit b()
74.1 ns ± 2.94 ns per loop (mean ± std. dev. of 7 runs, 10000000 loops each)
```

This demo uses `str.join()` and `+` seperatly to concatenate 3 characters: a, b, c. Then, measuring how long each function takes to finish using IPython's built-in magic command `%timeit`. The average time of running  `str.join()` is about 243 ns and running  `+` is about 74.1 ns. Apparently, `str.join()` is much slower than `+`.

## So, we should use `+` instead of `str.join()`?

Hold on a second, let's see what really happens when you call `a()` and `b()`. With the help of Python built-in module `dis`, we can see clearly the bytecode operation of each function.

```python
In [5]: import dis

In [6]: dis.dis(a)
  2           0 LOAD_CONST               1 ('')
              2 LOAD_METHOD              0 (join)
              4 LOAD_CONST               2 ('a')
              6 LOAD_CONST               3 ('b')
              8 LOAD_CONST               4 ('c')
             10 BUILD_LIST               3
             12 CALL_METHOD              1
             14 RETURN_VALUE

In [7]: dis.dis(b)
  2           0 LOAD_CONST               1 ('abc')
              2 RETURN_VALUE
```

When we call `a()`, actually, most of time is spent on `LOAD_CONST` and `BUILD_LIST`. From the name, we can tell that these 2 operations are not concatenating strings, they are constructing a list `['a', 'b', 'c']` to be used as the parameter for `str.join()`. When we call `b()`, line  `return 'a' + 'b' + 'c'`  is turned into `return 'abc'` during compiling time due to Python compiler's optimization (I guess). Because `dis(b)` and `dis(f)` below return the same result.

```python
In [18]: def f():
    ...:     return 'abc'
    ...:
        
In [20]: dis.dis(f)
  2           0 LOAD_CONST               1 ('abc')
              2 RETURN_VALUE
```

This comparation is not actually not fair. The total time of running `a()` is the time of `str.join()` and constructing list. And the  string in `b()` is concatenated during compile time instead of runtime.

## Let us compare again

```python
In [8]: a = 'a'

In [9]: b = 'b'

In [10]: c = 'c'

In [12]: def d():
    ...:     return ''.join([a ,b ,c])
    ...:

In [13]: def e():
    ...:     return a + b + c
    ...:

In [14]: %timeit d()
267 ns ± 1.16 ns per loop (mean ± std. dev. of 7 runs, 1000000 loops each)

In [15]: %timeit e()
210 ns ± 2.81 ns per loop (mean ± std. dev. of 7 runs, 1000000 loops each)
```

It seems `+` is still faster, so, we should use `+` instead of `str.join()`? Let's see another demo, this time, we contatenate more strings.

```python
In [39]: a = ['a' for _ in range(1000)]

In [40]: def b():
    ...:     return ''.join(a)
    ...:

In [41]: def c():
    ...:     return a[0] + a[1] + a[2] + ... + a[997] + a[998] + a[999]
    ...:

In [42]: %timeit b()
6.98 µs ± 86.8 ns per loop (mean ± std. dev. of 7 runs, 100000 loops each)

In [43]: %timeit c()
102 µs ± 7.01 µs per loop (mean ± std. dev. of 7 runs, 10000 loops each)
```

This time `str.join()` is much faster than `+`.

## What happened?

Let's see the `dis()` result of second demo:

```python
In [63]: dis.dis(d)
  2           0 LOAD_CONST               1 ('')
              2 LOAD_METHOD              0 (join)
              4 LOAD_GLOBAL              1 (a)
              6 LOAD_GLOBAL              2 (b)
              8 LOAD_GLOBAL              3 (c)
             10 BUILD_LIST               3
             12 CALL_METHOD              1
             14 RETURN_VALUE

In [64]: dis.dis(e)
  2           0 LOAD_GLOBAL              0 (a)
              2 LOAD_GLOBAL              1 (b)
              4 BINARY_ADD
              6 LOAD_GLOBAL              2 (c)
              8 BINARY_ADD
             10 RETURN_VALUE
```

From output above, we can conclude that to concatenate $N$ strings, the total number of operations for `str.join` is 

$$
N + 5
$$
but for `+` is

$$
N + (N-1) + 1 => 2N
$$

When $N$ is less than 5, `+` will be faster than `str.join()`. However, once $N$ is larger than 5, `str.join()` become more and more efficient than `+`. This explains why when concatenating 3 strings `+` is still faster, but it become much slower when concatenation 1000 strings.

## Conclusion

Whenever you want to concatenate strings in Python, use `str.join()`.