import { Graph, AlgorithmResult, PathResult } from '../types/graph'
import { MinHeap } from '../utils/MinHeap'
import { buildAdjacencyList, reconstructPath } from '../utils/graphUtils'

export function dijkstra(
  graph: Graph,
  source: number
): AlgorithmResult {
  const startTime = performance.now()
  const adj = buildAdjacencyList(graph)
  const n = graph.nodes.length
  
  const distances = Array(n).fill(Infinity)
  const predecessors = Array(n).fill(-1)
  distances[source] = 0
  
  const heap = new MinHeap<number>((a, b) => distances[a] - distances[b])
  heap.push(source, 0)
  
  while (!heap.isEmpty()) {
    const u = heap.pop()!
    const currentDist = distances[u]
    
    for (const [v, weight] of adj.get(u) || []) {
      const newDist = currentDist + weight
      if (newDist < distances[v]) {
        distances[v] = newDist
        predecessors[v] = u
        heap.push(v, newDist)
      }
    }
  }
  
  const endTime = performance.now()
  
  // Build path results
  const paths: PathResult[] = []
  for (let i = 0; i < n; i++) {
    if (i !== source && distances[i] !== Infinity) {
      paths.push({
        destination: i,
        distance: distances[i],
        path: reconstructPath(predecessors, source, i),
      })
    }
  }
  
  return {
    algorithm: 'Dijkstra (Binary Heap)',
    executionTime: endTime - startTime,
    paths,
    distances,
    predecessors,
  }
}
