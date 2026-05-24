import { Graph, Edge } from '../types/graph'

export function buildAdjacencyList(graph: Graph): Map<number, Array<[number, number]>> {
  const adj = new Map<number, Array<[number, number]>>()
  
  for (const node of graph.nodes) {
    adj.set(node.id, [])
  }
  
  for (const edge of graph.edges) {
    if (edge.status === 'failed') continue
    
    const neighbors = adj.get(edge.source) || []
    neighbors.push([edge.target, edge.weight])
    adj.set(edge.source, neighbors)
    
    // For undirected graphs, add reverse edge
    const reverseNeighbors = adj.get(edge.target) || []
    reverseNeighbors.push([edge.source, edge.weight])
    adj.set(edge.target, reverseNeighbors)
  }
  
  return adj
}

export function reconstructPath(
  predecessors: number[],
  source: number,
  target: number
): number[] {
  const path: number[] = []
  let current = target
  
  if (predecessors[current] === -1 && current !== source) {
    return [] // No path exists
  }
  
  while (current !== -1) {
    path.unshift(current)
    current = predecessors[current]
  }
  
  return path
}

export function calculateEdgeUtilization(
  graph: Graph,
  allPaths: number[][]
): Map<string, number> {
  const utilization = new Map<string, number>()
  
  // Initialize all edges with 0
  for (const edge of graph.edges) {
    const key = `${edge.source}-${edge.target}`
    utilization.set(key, 0)
  }
  
  // Count how many paths use each edge
  for (const path of allPaths) {
    for (let i = 0; i < path.length - 1; i++) {
      const u = path[i]
      const v = path[i + 1]
      const key1 = `${u}-${v}`
      const key2 = `${v}-${u}`
      
      if (utilization.has(key1)) {
        utilization.set(key1, (utilization.get(key1) || 0) + 1)
      } else if (utilization.has(key2)) {
        utilization.set(key2, (utilization.get(key2) || 0) + 1)
      }
    }
  }
  
  return utilization
}

export function generateRandomGraph(
  nodeCount: number,
  edgeProbability: number = 0.3,
  weightRange: [number, number] = [1, 10]
): Graph {
  const nodes = Array.from({ length: nodeCount }, (_, i) => ({
    id: i,
    label: String.fromCharCode(65 + (i % 26)) + (i >= 26 ? Math.floor(i / 26) : ''),
    x: Math.random() * 700 + 50,
    y: Math.random() * 500 + 50,
  }))
  
  const edges: Edge[] = []
  
  for (let i = 0; i < nodeCount; i++) {
    for (let j = i + 1; j < nodeCount; j++) {
      if (Math.random() < edgeProbability) {
        const weight = Math.floor(
          Math.random() * (weightRange[1] - weightRange[0] + 1) + weightRange[0]
        )
        edges.push({ source: i, target: j, weight })
      }
    }
  }
  
  // Ensure graph is connected by adding a spanning tree
  for (let i = 1; i < nodeCount; i++) {
    const exists = edges.some(
      (e) => (e.source === i && e.target === i - 1) || (e.source === i - 1 && e.target === i)
    )
    if (!exists) {
      edges.push({ source: i - 1, target: i, weight: 1 })
    }
  }
  
  return { nodes, edges }
}
