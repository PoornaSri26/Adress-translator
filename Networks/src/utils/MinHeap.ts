export interface HeapItem<T> {
  item: T
  priority: number
}

export class MinHeap<T> {
  private heap: HeapItem<T>[] = []

  constructor(private compare: (a: T, b: T) => number) {}

  push(item: T, priority: number): void {
    this.heap.push({ item, priority })
    this.bubbleUp(this.heap.length - 1)
  }

  pop(): T | undefined {
    if (this.heap.length === 0) return undefined
    if (this.heap.length === 1) return this.heap.pop()!.item

    const root = this.heap[0]
    this.heap[0] = this.heap.pop()!
    this.bubbleDown(0)
    return root.item
  }

  peek(): T | undefined {
    return this.heap[0]?.item
  }

  size(): number {
    return this.heap.length
  }

  isEmpty(): boolean {
    return this.heap.length === 0
  }

  private bubbleUp(index: number): void {
    while (index > 0) {
      const parentIndex = Math.floor((index - 1) / 2)
      if (this.heap[parentIndex].priority <= this.heap[index].priority) break
      ;[this.heap[parentIndex], this.heap[index]] = [
        this.heap[index],
        this.heap[parentIndex],
      ]
      index = parentIndex
    }
  }

  private bubbleDown(index: number): void {
    const length = this.heap.length
    while (true) {
      let leftChild = 2 * index + 1
      let rightChild = 2 * index + 2
      let smallest = index

      if (
        leftChild < length &&
        this.heap[leftChild].priority < this.heap[smallest].priority
      ) {
        smallest = leftChild
      }

      if (
        rightChild < length &&
        this.heap[rightChild].priority < this.heap[smallest].priority
      ) {
        smallest = rightChild
      }

      if (smallest === index) break

      ;[this.heap[index], this.heap[smallest]] = [
        this.heap[smallest],
        this.heap[index],
      ]
      index = smallest
    }
  }
}
