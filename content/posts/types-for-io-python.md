---
title: "Mad Scientist: Make your own Types for IO in Python"
date: 2017-06-04T21:24:52+02:00
draft: true
tags: ["python", "type theory"]
---

You can use custom type classes to represent semantically a return type. That means that they aren’t enforced by the type checker, as they subclass the `NoneType`, but they may help you in modelling the program interactions with the world in your head. In fact, they make your head work better as a “type checker” with the outside, sort of the way that Monads do in Haskell. We start by importing our types and the `NewType` class from the typing module, and we go from there. A quick example for you using the `typing` module:

```python
from typing import NewType

DB = NewType(‘DB’, None)
StdOut = NewType(‘Stdout’, None)
```
 
And you can go from there. A nice experiment indeed. You know, types are eating the world. Our world.
