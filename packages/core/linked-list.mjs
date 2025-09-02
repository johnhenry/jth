const LinkedListNode = class {
  #value = undefined; // any
  #previous = null; // LinkedListNode<any> | null
  constructor(value, previous = null) {
    this.#value = value;
    this.#previous = previous;
  }
  *[Symbol.iterator]() {
    let current = this;
    while (current) {
      yield current.#value;
      current = current.#previous;
    }
  }
  get value() {
    return this.#value;
  }
  set value(value) {
    this.#value = value;
  }
  get previous() {
    return this.#previous;
  }
  set previous(previous) {
    this.#previous = previous;
  }
  *take(limit = Infinity) {
    if (limit <= 0) {
      return;
    }
    yield* new LinkedListNode(
      this.#value,
      this.#previous && limit > 0 ? this.#previous.take(limit - 1) : null
    );
  }
  map(func) {
    return new LinkedListNode(
      func(this.#value),
      this.#previous ? this.#previous.map(func) : null
    );
  }
  reduce(func, initial) {
    let current = this;
    let acc = initial;
    while (current) {
      acc = func(acc, current.#value);
      current = current.#previous;
    }
    return acc;
  }
  forEach(func) {
    let current = this;
    while (current) {
      func(current.#value);
      current = current.#previous;
    }
  }
  toString(limit = LinkedListNode.TO_STRING_LIMIT) {
    if (!this.#previous) {
      return `∅ -> ${this.#value}`;
    }
    if (limit < 1) {
      return `? -> ${this.#value}`;
    }
    return `${this.#previous.toString(limit - 1)} -> ${this.#value}`;
    // return this.#previous ? ` ? -> ${this.#value}` : `∅ -> ${this.#value}`;
  }
  get s() {
    return this.toString();
  }
  inspect() {
    return this.toString();
  }
  // add values to end of list
  push(...values) {
    let target = this;
    for (const value of values) {
      target = new LinkedListNode(value, target);
    }
    return target;
  }
  // remove values from end of list
  pop(limit = 1) {
    if (limit < 0) {
      return null;
    }
    if (limit === 0) {
      return this;
    }
    let target = this;
    while (limit > 0 && target) {
      limit--;
      if (limit < 1) {
        break;
      }
      target = target.#previous;
    }
    const previous = target.#previous;
    target.orphan();
    return previous;
  }
  popSplit(limit = 1) {
    const body = this.pop(limit);
    const head = this;
    return [body, head];
  }
  orphan() {
    this.#previous = null;
    return this;
  }
  valueOf() {
    return this.#value;
  }
  // reverses list (inefficient)
  get reversed() {
    return LinkedListNode.from(this);
  }
  // get first (inefficient)
  first() {
    let target = this;
    while (target) {
      target = target.#previous;
    }
    return target;
  }
};

const Stack = class {
  #head = null;
  #count = 0;
  constructor(...values) {
    this.#head = LinkedListNode.from(values);
    this.#count = values.length;
  }
  push(value) {
    this.#head = new LinkedListNode(value, this.#head);
    this.#count += 1;
    return this;
  }
  pop() {
    const [body, head] = this.#head.popSplit();
    this.#head = body;
    this.#count -= 1;
    return head.value;
  }
  peek() {
    return this.#head?.value ?? null;
  }
  toString(limit) {
    return this.#head.toString(limit);
  }
  valueOf(limit) {
    return this.#head.valueOf(limit);
  }
  get s() {
    return this.toString();
  }
};

const Queue = class {
  #front = null;
  #back = null;
  constructor() {}
  enqueue(value) {
    const newNode = new LinkedListNode(value);
    if (this.#back) {
      this.#back.previous = newNode;
      this.#back = newNode;
    } else {
      this.#back = newNode;
      this.#front = newNode;
    }
  }
  dequeue() {
    if (!this.#front) {
      throw new Error("empty");
    }
    const { value } = this.#front;
    this.#front = this.#front?.previous ?? null;
    this.#back = this.#back?.previous ?? null;
    return value;
  }
  toString() {
    return (
      (this.#back?.toString() || "∅ ") +
      " | " +
      (this.#front?.toString() || "∅ ")
    );
  }
  get s() {
    return this.toString();
  }
};

let TO_STRING_LIMIT = 0;

Object.defineProperty(LinkedListNode, "TO_STRING_LIMIT", {
  get() {
    return TO_STRING_LIMIT;
  },
  set(newValue) {
    if (newValue === Infinity) {
      TO_STRING_LIMIT = Infinity;
      return;
    }
    TO_STRING_LIMIT = parseInt(newValue, 10) || 0;
  },
  enumerable: true,
});

LinkedListNode.TO_STRING_LIMIT = 0;

LinkedListNode.from = (iterator) => {
  let list = null;
  for (const value of iterator) {
    list = new LinkedListNode(value, list);
  }
  return list;
};
LinkedListNode.fromReversed = (iterator) => {
  const subFromRecursive = (iter) => {
    const { value, done } = iter.next();
    if (done) {
      return null;
    }
    return new LinkedListNode(value, subFromRecursive(iter));
  };
  return subFromRecursive(iterator[Symbol.iterator]());
};

const TreeNode = class {
  #value = null;
  #left = null;
  #right = null;
  constructor(value=0, left=null, right=null) {
    this.#value = value;
    this.#left = left;
    this.#right = right;
  }
  insert(value){
    if(value < this.#value){
      if(this.#left){
        this.#left.insert(value)
      }else{
        this.#left = new TreeNode(value);
      }
    }else {
      if(this.#right){
        this.#right.insert(value)
      }else{
        this.#right = new TreeNode(value);
      }
    }
  }
  set right(right) {
    this.#right = right;
  }
  set left(left) {
    this.#left = left;
  }
  get right() {
    return this.#right;
  }
  get left() {
    return this.#left;
  }
  toString(){
    return [left.toString(), this.value, left.toString()].join(" ")
  }
  
};

const Tree = class {
  #root=null
  insert(value){
    const newnode = new TreeNode(value);
    if(this.#root){
      this.#root.insert(value);
    }else{
      this.#root = newnode;
    }
  }
}

Tree.from = (values){
  for(const value of values){

  }
}

export default LinkedListNode;
export { LinkedListNode, Stack, Queue, Tree };
