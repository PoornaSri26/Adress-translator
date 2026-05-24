import { Graph, AlgorithmResult, PathResult } from '../types/graph'
import { MinHeap } from '../utils/MinHeap'
import { buildAdjacencyList, reconstructPath } from '../utils/graphUtils'

// Euclidean distance heuristic
function euclideanDistance(
  graph: Graph,
  node1: number,
  node2: number
): number {
  const n1 = graph.nodes.find((n) => n.id === node1)!
  const n2 = graph.nodes.find((n) => n.id === node2)!
  const dx = n1.x - n2.x
  const dy = n1.y - n2.y
  return Math.sqrt(dx * dx + dy * dy)
}

// Hop count heuristic (minimum number of edges)
function hopDistance(_graph: Graph, _node1: number, _node2: number): number {
  return 0 // Simplified - could use BFS for better estimate
}

export function aStar(
  graph: Graph,
  source: number,
  target: number | null = null,
  heuristic: 'euclidean' | 'hop' = 'euclidean'
): AlgorithmResult {
  const startTime = performance.now()
  const adj = buildAdjacencyList(graph)
  const n = graph.nodes.length
  
  const distances = Array(n).fill(Infinity)
  const predecessors = Array(n).fill(-1)
  const gScore = Array(n).fill(Infinity)
  const fScore = Array(n).fill(Infinity)
  
  distances[source] = 0
  gScore[source] = 0
  fScore[source] = target !== null 
    ? (heuristic === 'euclidean' 
        ? euclideanDistance(graph, source, target) 
        : hopDistance(graph, source, target))
    : 0
  
  const heap = new MinHeap<number>((a, b) => fScore[a] - fScore[b])
  heap.push(source, fScore[source])
  
  const openSet = new Set([source])
  
  while (!heap.isEmpty()) {
    const u = heap.pop()!
    openSet.delete(u)
    
    // If we have a specific target and reached it
    if (target !== null && u === target) {
      break
    }
    
    for (const [v, weight] of adj.get(u) || []) {
      const tentativeGScore = gScore[u] + weight
      
      if (tentativeGScore < gScore[v]) {
        predecessors[v] = u
        gScore[v] = tentativeGScore
        distances[v] = tentativeGScore
        fScore[v] = tentativeGScore + (target !== null 
          ? (heuristic === 'euclidean' 
              ? euclideanDistance(graph, v, target) 
              : hopDistance(graph, v, target))
          : 0)
        
        if (!openSet.has(v)) {
          openSet.add(v)
          heap.push(v, fScore[v])
        }
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
    algorithm: `A* (${heuristic} heuristic)`,
    executionTime: endTime - startTime,
    paths,
    distances,
    predecessors,
  }
}
