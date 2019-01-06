# Type Annotation

Recently, I start a project with Python3 and try out one of Python3's new features: type annotation. Here is some issues I encounter during working on this project as well as their solutions.

Even throught Python3 supports type annotation, the python compiler itself will not check the type of variables in your code. So, you need a third party static type checker. What I use is [mypy](http://www.mypy-lang.org/). The version of python I am using is **3.7.2**. If you are using a different version of python, my solutions may not work for you.

## undefined name

```python
class Line(object):
    def __init__(
        self, k: Optional[float], b: Optional[float], a: Optional[float] = None
    ) -> None:
        self.k = k
        self.b = b
        self.a = a

    @classmethod
    def from_points(cls, p1: Point, p2: Point) -> Line:
        """Construct a line from 2 given points"""
        try:
            k = (p1.y - p2.y) / (p1.x - p2.x)
            b = (p1.x * p2.y - p2.x * p1.y) / (p1.x - p2.x)
            a = None
        except ZeroDivisionError:
            k = None
            b = None
            a = p1.x
        return cls(k, b, a)
```

The code above looks fine. However, if you check you code with tools like flake8, it will complain that

```
44,51,F,F821:undefined name 'Line'
```

And, if you try to run this code, a error will be raised:

```python
Exception has occurred: NameError
name 'Line' is not defined
  File "/Users/howard/Workspaces/Python/Advent_of_Code/utils.py", line 44, in Line
    def from_points(cls, p1: Point, p2: Point) -> Line:
  File "/Users/howard/Workspaces/Python/Advent_of_Code/utils.py", line 37, in <module>
    class Line(object):
```

The reason this happens is that `Line` is used before the definition of class `Line` is completed.

To solve this problem, you need to add

```python
from __future__ import annotations
```

in the beginning of your code. The detailed info can be found in [PEP-563](https://www.python.org/dev/peps/pep-0563/).

However, even so, flake8 may still complains that `Line` is not defined. This is because flake(3.6.0) does not fully support this syntax yet. A workaround is to turn class `Line` into a string.

```python
def from_points(cls, p1: Point, p2: Point) -> "Line":
```

## Incompatible types in assignment

```python
class Line(object):
    def __init__(
        self, k: Optional[float], b: Optional[float], a: Optional[float] = None
    ) -> None:
        self.k = k
        self.b = b
        self.a = a

    @classmethod
    def from_points(cls, p1: Point, p2: Point) -> "Line":
        """Construct a line from 2 given points"""
        try:
            k = (p1.y - p2.y) / (p1.x - p2.x)
            b = (p1.x * p2.y - p2.x * p1.y) / (p1.x - p2.x)
            a = None
        except ZeroDivisionError:
            k = None
            b = None
            a = p1.x
        return cls(k, b, a)
```

After fix first error, there are still some other errors:

```
utils.py:53: error: Incompatible types in assignment (expression has type "None", variable has type "float")
utils.py:54: error: Incompatible types in assignment (expression has type "None", variable has type "float")
```

In my souce code, the lines contains errors are 53 and 54, but in the demo above, they are actually line 17 and 18. The cause of this error is that the first value you assign to `k` is `(p1.y - p2.y) / (p1.x - p2.x)`. This implies `k` is a `float` variable and mypy will check if `k` is `float` or not for the rest of code. To avoid this behaviour, you need to explicitly declare the type of `k`. You can do it in 2 ways:

1. Declare the type of variable in code:

   ```python
   def from_points(cls, p1: Point, p2: Point) -> "Line":
       try:
           k: Optional[float] = (p1.y - p2.y) / (p1.x - p2.x)
           b: Optional[float] = (p1.x * p2.y - p2.x * p1.y) / (p1.x - p2.x)
           a = None
       except ZeroDivisionError:
           k = None
           b = None
           a = p1.x
   
       return cls(k, b, a)
   ```

2. Declare the type of variable in comment:

   ```python
   def from_points(cls, p1: Point, p2: Point) -> "Line":
       try:
           k = (p1.y - p2.y) / (p1.x - p2.x)  # type: Optional[float]
           b = (p1.x * p2.y - p2.x * p1.y) / (p1.x - p2.x)  # type: Optional[float]
           a = None
       except ZeroDivisionError:
           k = None
           b = None
           a = p1.x
       return cls(k, b, a)
   ```

## Unsupported operand types

```python
def y(self, x: float) -> float:
    if self.a is None:
        return self.k * x + self.b
    else:
        return self.a
```

`y` is a member of class `Line`. Mypy keeps complaining an error for line 3:

```python
utils.py:61: error: Unsupported operand types for * ("None" and "float")
utils.py:61: note: Left operand is of type "Optional[float]"
utils.py:61: error: Unsupported operand types for + ("float" and "None")
utils.py:61: note: Right operand is of type "Optional[float]"
```

This is because `self.k` has a type of `Optional[float]` which means `self.k` may be `float` or `None` and `+` or `*` does not support `None` type variable. In my code's logic, if `self.a` is `None`, `self.k` and `self.b` must not be `None`. But I cannot find a way to tell mypy about this rule. The only workaround I found is that add `--no-strict-optional` to your mypy command. So that, when mypy checks your code, it will not strictly check `Optional` types. More details can be found [here](https://mypy.readthedocs.io/en/stable/common_issues.html#unexpected-errors-about-none-and-or-optional-types).

## Item "xxx" of "Union[xxx, yyy]" has no attribute "zzz"

```python
from typing import Dict, Union, List

char: Dict[str, Union[str, List[str]]] = {}
char["char"] = "a"
char["list"] = []
char["list"].append("a")
```

In the above code, mypy complains:

```
example.py:6: error: Item "str" of "Union[str, List[str]]" has no attribute "append"
```

Indeed, `str` type does not have attribute `append`. Since python is a dynamic language, before it is run, you would not know what a variable's type is. So, mypy cannot decide  `char["list"]` is a `list` or `str` during static type checking. There are 2 solutions to this problem:

1. Use `Any` instead of `Union`.

   ```python
   from typing import Any
   
   char: Dict[str, Any] = {}
   char["char"] = "a"
   char["list"] = []
   char["list"].append("a")
   ```

   `Any` means any type, it basically disables further type checking for values `char`.

2. Use `TypedDict` from `mypy_extensions`

   ```python
   from typing import List
   from mypy_extensions import TypedDict
   
   MyDict = TypedDict("MyDict", {"char": str, "list": List[str]})
   
   char: MyDict = {"char": "a", "list": []}
   char["list"].append("a")
   ```

   With usage of `TypedDict`, it binds type to each `value` of a dict by its `key`.

I personally recommand the second solution, since it is more type-safe. Howerver, it does have some drawbacks:

1. You have to import extra module.
2. `TypedDict` is implemented by mypy, it may not be handled correctly by other static type checker.