# Roadmap

## Repl

Fix the repl in the CLI

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
