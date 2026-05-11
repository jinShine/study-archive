# Linked List

Linked List는 Node라는 구조체가 연결되는 형식으로 데이터를 저장하는 자료구조.
Node는 데이터값과 next node의 주소값을 저장합니다.
Linked List는 메모리상에서는 비연속적으로 저장이 되어 있지만, 각각의 node가 next node의 메모리 주소값을 가리킴으로써 논리적인 연속성을 갖게 된다.

```
class Node {
    constructor(value, next = null) {
        this.value = value;
        this.next = next;
    }
}

const first = new Node(1);
const second = new Node(2);
third = new Node(3);

first.next = second;
second.next = third;

first.value = 6;
```

class LinkedList {
    
}