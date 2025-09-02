import { LinkedListNode, Stack, Queue, Tree } from "./linked-list.mjs";
import { sum, plus, dupe, swap } from "./stack-lib.mjs";

LinkedListNode.TO_STRING_LIMIT = Infinity;
// console.log(LinkedListNode.TO_STRING_LIMIT);
// const l0 = LinkedListNode.from([0, 1, 2, 3, 4, 5, 6, 7]);
// console.log(l0.s);
// const l1 = plus(l0);
// console.log(l1.s);
// const l2 = plus(l1);
// console.log(l2.s);
// const l3 = sum(l2);
// console.log(l3.s);
// const l4 = LinkedListNode.from([0, 1]);
// console.log(dupe(swap(l4)).s);

// const s = new Stack(1, 2, 3);

// console.log(s.s);
// console.log(s.pop());
// console.log(s.s);
// s.push(4).push(5);
// console.log(s.s);

const q = new Queue();
q.enqueue(1);
q.enqueue(2);
console.log(q.s);
console.log(q.dequeue());
console.log(q.s);
console.log(q.dequeue());
console.log(q.s);
