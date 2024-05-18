// import vm from "node:vm";

// const contextifiedObject = vm.createContext({
//   secret: 42,
//   print: console.log,
// });

// // Step 1
// //
// // Create a Module by constructing a new `vm.SourceTextModule` object. This
// // parses the provided source text, throwing a `SyntaxError` if anything goes
// // wrong. By default, a Module is created in the top context. But here, we
// // specify `contextifiedObject` as the context this Module belongs to.
// //
// // Here, we attempt to obtain the default export from the module "foo", and
// // put it into local binding "secret".

// const bar = new vm.SourceTextModule(
//   `
//   import s from 'foo';
//   s;
//   print(s);
// `,
//   { context: contextifiedObject }
// );

// // Step 2
// //
// // "Link" the imported dependencies of this Module to it.
// //
// // The provided linking callback (the "linker") accepts two arguments: the
// // parent module (`bar` in this case) and the string that is the specifier of
// // the imported module. The callback is expected to return a Module that
// // corresponds to the provided specifier, with certain requirements documented
// // in `module.link()`.
// //
// // If linking has not started for the returned Module, the same linker
// // callback will be called on the returned Module.
// //
// // Even top-level Modules without dependencies must be explicitly linked. The
// // callback provided would never be called, however.
// //
// // The link() method returns a Promise that will be resolved when all the
// // Promises returned by the linker resolve.
// //
// // Note: This is a contrived example in that the linker function creates a new
// // "foo" module every time it is called. In a full-fledged module system, a
// // cache would probably be used to avoid duplicated modules.

// async function linker(specifier, referencingModule) {
//   if (specifier === "foo") {
//     return new vm.SourceTextModule(
//       `
//       // The "secret" variable refers to the global variable we added to
//       // "contextifiedObject" when creating the context.
//       export default secret;
//     `,
//       { context: referencingModule.context }
//     );

//     // Using `contextifiedObject` instead of `referencingModule.context`
//     // here would work as well.
//   }
//   throw new Error(`Unable to resolve dependency: ${specifier}`);
// }
// await bar.link(linker);

// // Step 3
// //
// // Evaluate the Module. The evaluate() method returns a promise which will
// // resolve after the module has finished evaluating.

// // Prints 42.
// await bar.evaluate();

import vm from "node:vm";

const context = vm.createContext({ console, x: 1 });

for (let i = 0; i < 10; i++) {
  const line = new vm.SourceTextModule(`await console.log(x++);`, {
    context,
  });
  // await line.link(() => {});
  await line.evaluate();
}
