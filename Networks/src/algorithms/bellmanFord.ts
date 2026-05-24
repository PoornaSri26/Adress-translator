import { Graph, AlgorithmResult, PathResult } from '../types/graph'
import { buildAdjacencyList, reconstructPath } from '../utils/graphUtils'

export function bellmanFord(
  graph: Graph,
  source: number
): AlgorithmResult {
  const startTime = performance.now()
  const n = graph.nodes.length
  const edges = graph.edges.filter((e) => e.status !== 'failed')
  
  const distances = Array(n).fill(Infinity)
  const predecessors = Array(n).fill(-1)
  distances[source] = 0
  
  // Relax edges V-1 times
  for (let i = 0; i < n - 1; i++) {
    for (const edge of edges) {
      const { source: u, target: v, weight } = edge
      if (distances[u] !== Infinity && distances[u] + weight < distances[v]) {
        distances[v] = distances[u] + weight
        predecessors[v] = u
      }
      // For undirected graph
      if (distances[v] !== Infinity && distances[v] + weight < distances[u]) {
        distances[u] = distances[v] + weight
        predecessors[u] = v
      }
    }
  }
  
  // Check for negative cycles
  let hasNegativeCycle = false
  for (const edge of edges) {
    const { source: u, target: v, weight } = edge
    if (distances[u] !== Infinity && distances[u] + weight < distances[v]) {
      hasNegativeCycle = true
      break
    }
    if (distances[v] !== Infinity && distances[v] + weight < distances[u]) {
      hasNegativeCycle = true
      break
    }
  }
  
  const endTime = performance.now()
  
  // Build path results
  const paths: PathResult[] = []
  if (!hasNegativeCycle) {
    for (let i = 0; i < n; i++) {
      if (i !== source && distances[i] !== Infinity) {
        paths.push({
          destination: i,
          distance: distances[i],
          path: reconstructPath(predecessors, source, i),
        })
      }
    }
  }
  
  return {
    algorithm: 'Bellman-Ford',
    executionTime: endTime - startTime,
    paths,
    distances,
    predecessors,
    hasNegativeCycle,
  }
}
