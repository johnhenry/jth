Example: access database and transduce results

```javascript
::import 'jth-surrealdb' createDB { query };
::import 'jth-transduce' { transduce };
::import './credentials.mjs' credentials;
::import './transducers' { t1 t2 t3 };

createDB(credentials) ::: [db];
'select * from people' ::: [QUERY];

db.query(QUERY)
... transduce(t1,t2,t3)
::: [...people];

db query(QUERY)
transduce(t1,t2,t3)
::: [...people];

db.query(QUERY)
...(t1,t2,t3)
::: [...people];
```

Example: train data

```javascript
::import 'jth-tf' : { train, load };
::import './training-parameters.json' trainingParameters;
100 ::: [input]

load('./data.csv')
...
train(trainingParameters)
::: [predictor];
input keep(predictor) @@;

predictor
load('./more-data.csv')
...
train(trainingParameters)
::: [predictor];

input keep(predictor) @@;
```

Example: loops data

```javascript
:::[a];
::loopval iterator value: 1 value + ::: [a];
::loopkey iterator key: 1 key + ::: [a];
::looprange min max step value: 1 value + ::: [a];
::loop i=1 : i<11 : i++ : /* good syntax?*/

```

Example: js-interop

```javascript
::embed javascript/.js/.mjs/.cjs console.log(123);
::embed coffeescript/.cs console.log 123;
```

```javascript
::embed python print(123);
```

```javascript
::import "path to import";
::import "path to import" defaultImport;
::import "path to import" ...importedGroup;
::import "path to import" { namedImport };
::import "path to import" defaultImport { namedImport:renamedImport };

::global "path to import" defaultImport { namedImport:renamedGlobal };

::export defaultExport;
::export { namedExport:renamedExport }

:::[x] /* declare var */
` `
1 2 3 4 ::: x /* set variable to line [1,2,3,4] */
1 2 3 4 ::: ...x  /* set variable to copy of line [1,2,3,4] */
1 2 3 4 ::: [...x]  /* set variable to copy of line [1,2,3,4] */
1 2 3 4 ::: [... x] /* set variable last entry 4 */
1 2 3 4 ::: [x y] /* set variables to first items 1, 2 */
1 2 3 4 ::: [x ...y] /* set variable to first item, and another to rest 1 [2,3,3] */
1 2 3 4 ::: [...x y] /* [1,2,3] 4 */

1 2 3 4 ::: [...x y z] /* [1,2] 3 4 */
4 3 2 1 ::: [z y ...x] /* 4 3 [2,1] */

1 2 3 4 ::: [x ...y z] /* 1 [2,3] 4 */
1 2 3 4 ::: [x ... y] /* 1 4 */

/* variable changes */
must be enclosed in [] (prevents (dangeous?) copying of original array.)
can have up to one spread expression that can appear anywhere
```

javascript engines https://en.wikipedia.org/wiki/JavaScript_engine#cite_note-10

- v8 https://v8.dev/
- SpiderMonkey https://firefox-source-docs.mozilla.org/js/index.html
- js core https://developer.apple.com/documentation/javascriptcore
- hermes https://reactnative.dev/docs/hermes

javascript runners

- just https://github.com/just-js/just
- https://github.com/boa-dev/boa
  https://twitter.com/zhuowei/status/1568659229887664129

Look at usage around https://github.com/n-riesco/jp-kernel in

https://github.com/n-riesco/ijavascript and
https://github.com/n-riesco/jp-babel.

To understand how to create a juypter pluging using transform
