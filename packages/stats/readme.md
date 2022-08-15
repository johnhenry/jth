# <picture> <img src="./logo.svg" alt="jth" style="height:32px"> - stats

⚠️WARNING⚠️
Jth is still very much a work in progress.

- Many ideas around how the language _should_ work
  are up in the air.
- Many bugs exist in the implementation.

<hr >
Statistics library for jth.

Note that by convention,
functions that operate
on the stack (by taking and returning an array) are suffixed with "$".

## Installation

Dependencies: [node/npm](https://nodejs.org)

Install with command:

```
npm install jth-stats
```

## In-File Usage

### Count

Returns the number of items in the current stack.

```javascript
import { count$ } from "jth-stats";
1 2 3 count$!! @!!; /*prints "3"*/
```

### randomize$

```javascript
import { randomize$ } from "jth-stats";
1 2 3 randomize$!! @!!; /*prints "1 2 3" or "3 1 2" or... it's random*/
```

### sort$

Sorts stack ascending

```javascript
import { sort$ } from "jth-stats";
2 1 3 sort$!! @!!; /*prints "1 2 3"*/
```

### sort$

Sorts stack descending

```javascript
import { sortD$ } from "jth-stats";
2 1 3 sortD$!! @!!; /*prints "3 2 1"*/
```

### sum$

Returns sum of numbers on stack

```javascript
import { sum$ } from "jth-stats";
1 2 3 4 sum$!! @!!; /*prints "10"*/
```

### product$

Returns product of numbers on stack

```javascript
import { product$ } from "jth-stats";
1 2 3 4 product$!! @!!; /*prints "24"*/
```

### mean$

Returns mean of numbers on stack

```javascript
import { mean$ } from "jth-stats";
1 2 3 4 mean$!! @!!; /*prints "2.5"*/
```

### median$

Returns median of numbers on stack

```javascript
import { median$ } from "jth-stats";
1 2 3 4 5 median$!! @!!; /*prints "3"*/
```

````

### mode$

Returns mode of numbers on stack

```javascript
import { mode$ } from "jth-stats";
1 1 2 3 4 mode$!! @!!; /*prints "1"*/
````

### modes$

Returns all modes on stack

```javascript
import { modes$ } from "jth-stats";
1 1 2 2 3 4 modes$!! @!!; /*prints "1 2"*/
```
