export interface Node {
  id: number
  label: string
  x: number
  y: number
  status?: 'active' | 'failed'
}

export interface Edge {
  source: number
  target: number
  weight: number
  status?: 'active' | 'failed'
  capacity?: number
}

export interface Graph {
  nodes: Node[]
  edges: Edge[]
}

export interface PathResult {
  destination: number
  distance: number
  path: number[]
}

export interface AlgorithmResult {
  algorithm: string
  executionTime: number
  paths: PathResult[]
  distances: number[]
  predecessors: number[]
  hasNegativeCycle?: boolean
}
