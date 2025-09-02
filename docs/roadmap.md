# Roadmap

## In-line Functions

Currently functions are either defined in javascript and imported OR via compositon.

I would like to define them in-line via jth.

Consider the following syntax:

```javascript
(*){* *} => [dupe$];
(X){X ((a,b=1)=>{a*b}) fold$!!} => [product$];
dupe!product => [square$];
(*1){* *0 1 fromToInc$!{2} product!{*0}} => [factorial$];
```

That might work with the following code to define an inline function

```javascript
const matchSym = /^\(\s*(?<symbol>[\S^d])(?<popped>\d*)\s*\){(?<body>.*)}$/;

const { symbol, size, body } = matchSym.exec(sym).groups;
const __FUNCTION__ = (sym, popped, body) => {
  const size = Number(popped);
  return (stack) => {
    const args = [];
    for (let i = 0; i < size; i++) {
      args.push(stack.pop());
    }
    for (let i = args.length - 1; i >= 0; i--) {
      body = body.replaceAll(`${symbol}${i}`, args[i]);
    }
    body = body.replaceAll(`${symbol}`, `${args.join(" ")}`);
    return "...?";
  };
};
```

## Transition to stack data structure

Currently the "stack" is an array.
Perhaps a linked list or [perhaps not](https://stackoverflow.com/a/25922596/1290781) would be better?
This means that we'll have to drop some things like counts and peeks,
but this should overall improve performance

## Loops

Currently looking into using [folds and bends](https://github.com/HigherOrderCO/bend/blob/main/GUIDE.md#folds-and-bends)
rather than loops.

<else> else <elseif> elseif <if> <condition> if
