import { Graph, AlgorithmResult, PathResult } from '../types/graph'
import { MinHeap } from '../utils/MinHeap'
import { buildAdjacencyList, reconstructPath } from '../utils/graphUtils'

export function bidirectionalDijkstra(
  graph: Graph,
  source: number,
  target: number
): AlgorithmResult {
  const startTime = performance.now()
  const adj = buildAdjacencyList(graph)
  const n = graph.nodes.length
  
  // Forward search
  const distForward = Array(n).fill(Infinity)
  const predForward = Array(n).fill(-1)
  distForward[source] = 0
  
  const heapForward = new MinHeap<number>((a, b) => distForward[a] - distForward[b])
  heapForward.push(source, 0)
  
  const visitedForward = new Set<number>()
  
  // Backward search
  const distBackward = Array(n).fill(Infinity)
  const predBackward = Array(n).fill(-1)
  distBackward[target] = 0
  
  const heapBackward = new MinHeap<number>((a, b) => distBackward[a] - distBackward[b])
  heapBackward.push(target, 0)
  
  const visitedBackward = new Set<number>()
  
  let bestDistance = Infinity
  let meetingNode = -1
  
  while (!heapForward.isEmpty() && !heapBackward.isEmpty()) {
    // Forward step
    if (!heapForward.isEmpty()) {
      const u = heapForward.pop()!
      visitedForward.add(u)
      
      if (visitedBackward.has(u)) {
        const totalDist = distForward[u] + distBackward[u]
        if (totalDist < bestDistance) {
          bestDistance = totalDist
          meetingNode = u
        }
      }
      
      for (const [v, weight] of adj.get(u) || []) {
        const newDist = distForward[u] + weight
        if (newDist < distForward[v]) {
          distForward[v] = newDist
          predForward[v] = u
          heapForward.push(v, newDist)
        }
      }
    }
    
    // Backward step
    if (!heapBackward.isEmpty()) {
      const u = heapBackward.pop()!
      visitedBackward.add(u)
      
      if (visitedForward.has(u)) {
        const totalDist = distForward[u] + distBackward[u]
        if (totalDist < bestDistance) {
          bestDistance = totalDist
          meetingNode = u
        }
      }
      
      for (const [v, weight] of adj.get(u) || []) {
        const newDist = distBackward[u] + weight
        if (newDist < distBackward[v]) {
          distBackward[v] = newDist
          predBackward[v] = u
          heapBackward.push(v, newDist)
        }
      }
    }
  }
  
  const endTime = performance.now()
  
  // Reconstruct full path if meeting point found
  const distances = [...distForward]
  const predecessors = Array(n).fill(-1)
  const paths: PathResult[] = []
  
  if (meetingNode !== -1) {
    // Build forward path
    const forwardPath: number[] = []
    let current = meetingNode
    while (current !== -1) {
      forwardPath.unshift(current)
      current = predForward[current]
    }
    
    // Build backward path
    const backwardPath: number[] = []
    current = meetingNode
    while (current !== -1) {
      backwardPath.push(current)
      current = predBackward[current]
    }
    
    // Combine paths (remove duplicate meeting node)
    const fullPath = [...forwardPath, ...backwardPath.slice(1)]
    
    // Set predecessors for full path
    for (let i = 1; i < fullPath.length; i++) {
      predecessors[fullPath[i]] = fullPath[i - 1]
    }
    
    paths.push({
      destination: target,
      distance: bestDistance,
      path: fullPath,
    })
  }
  
  return {
    algorithm: 'Bidirectional Dijkstra',
    executionTime: endTime - startTime,
    paths,
    distances,
    predecessors,
  }
}
