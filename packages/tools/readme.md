# <img src="./logo.svg" alt="jth" style="height:32px" height="32"> - tools

⚠️WARNING⚠️
**Jth** is still _very much_ a work in progress.

- Many ideas around how the language _should_ work
  are up in the air.
- Many bugs exist in the implementation.

<hr >

Basic tools for jth.

Note that by convention,
functions that operate
on the stack (by taking and returning an array) are suffixed with "$".

### Installation

Dependencies: [node/npm](https://nodejs.org)

Install with command:

```
npm install jth-tools
```

## In-File Usage

### identity$

Returns current stack

```javascript
import { identity$ } from "jth-tools";
1 2 3 identity$!! @!!; /*prints "1 2 3"*/
```

### clear$

Clears current stack

```javascript
import { clear$ } from "jth-tools";
1 2 3 clear$!! @!!; /*prints ""*/
```

### collect$

Converts current stack int an array

```javascript
import { collect$ } from "jth-tools";
1 2 3 collect$!! @!!; /*prints "[1,2,3]"*/
```

### repeat$

Repeats current stack

```javascript
import { repeat$ } from "jth-tools";
1 2 3 repeat$!! @!!; /*prints "1 2 3 1 2 3"*/
```

### repeat$

Duplicates last item on stack

```javascript
import { dupe$ } from "jth-tools";
1 2 3 dupe$!! @!!; /*prints "1 2 3 3"*/
```

### if$

Keeps last item if truthy

```javascript
import { if$ } from "jth-tools";
1 2 3 if$!! @!!; /*prints "1 2 3"*/
1 2 0 if$!! @!!; /*prints "1 2"*/
```

### ifElse$

Keeps all items if last is truthy.
Removes all items otherwise.

```javascript
import { ifElse$ } from "jth-tools";
1 2 3 ifElse$!! @!!; /*prints "1 2 3"*/
1 2 0 if$!! @!!; /*prints ""*/
```

### equal$

Replaces stack with true if all items are equal. Replaces stack with false otherwise.

```javascript
import { equal$ } from "jth-tools";
1 2 3 3 equal$!! @!!; /*prints "true"*/
1 2 3 4 if$!! @!!; /*prints "false"*/
```

### and$

Keep items on stack unless a falsy one is encountered.

```javascript
import { and$ } from "jth-tools";
1 2 3 and$!! @!!; /*prints "1 2 3"*/
1 0 3 and$!! @!!; /*prints ""*/
```

### or$

Pops items from stack until a truthy one is encountered.

```javascript
import { or$ } from "jth-tools";
1 2 3 4 and$!! @!!; /*prints "1 2 3 4"*/
1 0 3 0 and$!! @!!; /*prints "1 0 3"*/
```

### reverse$

Reverse the current stack.

```javascript
import { reverse$ } from "jth-tools";
1 2 3 reverse$!! @!!; /*prints "3 2 1"*/
1 2 3 reverse$!! reverse$!! @!!; /_prints "1 2 3"_/
```

### first$

Replace items on stack with first item

```javascript
import { first$ } from "jth-tools";
1 2 3 first$!! @!!; /*prints "1"*/
```

### dropFirst$

Drop first item on stack

```javascript
import { dropFirst$ } from "jth-tools";
1 2 3 dropFirst$!! @!!; /*prints "2 3"*/
```

### last$

Replace items on stack with last item

```javascript
import { last$ } from "jth-tools";
1 2 3 last$!! @!!; /_prints "3"_/
```

### dropLast$

Drop last item on stack

```javascript
import { dropLast$ } from "jth-tools";
1 2 3 dropLast$!! @!!; /*prints "1 2"*/
```

### map$

Apply map to stack

```javascript
import { map$ } from "jth-tools";
1 2 3 (x=>x**x) map$!! @!!; /*prints "1 4 27"*/
```

### filter$

Apply filter to stack

```javascript
import { filter$ } from "jth-tools";
1 2 3 (x=>x*%2) filter$!! @!!; /*prints "1 3"*/
```

### to$

Add integers in the range (m, n) to the stack

```javascript
import { to$ } from "jth-tools";
4 10 to$!! @!!; /*prints "5 6 7 8 9"*/
```

### fromTo$

Add integers in the range [m, n) to the stack

```javascript
import { fromTo$ } from "jth-tools";
4 10 fromTo$!! @!!; /*prints "4 5 6 7 8 9"*/
```

### toInc$

Add integers in the range (m, n] to the stack

```javascript
import { toInc$ } from "jth-tools";
4 10 toInc$!! @!!; /*prints "5 6 7 8 9 10"*/
```

### fromToInc$

Add integers in the range [m, n] to the stack

```javascript
import { fromToInc$ } from "jth-tools";
4 10 fromToInc$!! @!!; /*prints "4 5 6 7 8 9 10"*/
```
