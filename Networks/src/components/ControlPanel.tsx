import { Graph } from '../types/graph'
import { dijkstra } from '../algorithms/dijkstra'
import { bellmanFord } from '../algorithms/bellmanFord'
import { aStar } from '../algorithms/astar'
import { bidirectionalDijkstra } from '../algorithms/bidirectionalDijkstra'
import { generateRandomGraph } from '../utils/graphUtils'
import { Download, Upload, Play, RotateCcw } from 'lucide-react'

interface ControlPanelProps {
  graph: Graph
  setGraph: (graph: Graph) => void
  selectedAlgorithm: string
  setSelectedAlgorithm: (algorithm: string) => void
  sourceNode: number
  setSourceNode: (node: number) => void
  setResults: (results: any) => void
}

export default function ControlPanel({
  graph,
  setGraph,
  selectedAlgorithm,
  setSelectedAlgorithm,
  sourceNode,
  setSourceNode,
  setResults,
}: ControlPanelProps) {
  const runAlgorithm = () => {
    let result
    switch (selectedAlgorithm) {
      case 'dijkstra':
        result = dijkstra(graph, sourceNode)
        break
      case 'bellman-ford':
        result = bellmanFord(graph, sourceNode)
        break
      case 'astar':
        result = aStar(graph, sourceNode, null, 'euclidean')
        break
      case 'bidirectional':
        const target = graph.nodes.find((n) => n.id !== sourceNode)?.id || 1
        result = bidirectionalDijkstra(graph, sourceNode, target)
        break
      default:
        result = dijkstra(graph, sourceNode)
    }
    setResults(result)
  }

  const generateGraph = () => {
    const newGraph = generateRandomGraph(
      Math.floor(Math.random() * 8) + 5,
      0.4,
      [1, 15]
    )
    setGraph(newGraph)
    setResults(null)
  }

  const resetGraph = () => {
    const resetNodes = graph.nodes.map((node) => ({ ...node, status: 'active' as const }))
    const resetEdges = graph.edges.map((edge) => ({ ...edge, status: 'active' as const }))
    setGraph({ nodes: resetNodes, edges: resetEdges })
    setResults(null)
  }

  const exportGraph = () => {
    const data = JSON.stringify(graph, null, 2)
    const blob = new Blob([data], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'graph.json'
    a.click()
    URL.revokeObjectURL(url)
  }

  const importGraph = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const importedGraph = JSON.parse(e.target?.result as string)
          setGraph(importedGraph)
          setResults(null)
        } catch (error) {
          console.error('Failed to import graph:', error)
        }
      }
      reader.readAsText(file)
    }
  }

  const addEdge = () => {
    if (graph.nodes.length < 2) return
    const source = Math.floor(Math.random() * graph.nodes.length)
    let target = Math.floor(Math.random() * graph.nodes.length)
    while (target === source) {
      target = Math.floor(Math.random() * graph.nodes.length)
    }
    const weight = Math.floor(Math.random() * 10) + 1
    
    // Check if edge already exists
    const exists = graph.edges.some(
      (e) =>
        (e.source === source && e.target === target) ||
        (e.source === target && e.target === source)
    )
    
    if (!exists) {
      setGraph({
        ...graph,
        edges: [...graph.edges, { source, target, weight }],
      })
    }
  }

  const removeNode = () => {
    if (graph.nodes.length <= 2) return
    const nodeId = graph.nodes[graph.nodes.length - 1].id
    const newNodes = graph.nodes.filter((n) => n.id !== nodeId)
    const newEdges = graph.edges.filter(
      (e) => e.source !== nodeId && e.target !== nodeId
    )
    setGraph({ nodes: newNodes, edges: newEdges })
    setResults(null)
  }

  return (
    <div className="w-72 bg-gray-800 border-r border-gray-700 p-4 overflow-auto">
      <h2 className="text-lg font-semibold text-gray-300 mb-4">Controls</h2>

      {/* Algorithm Selection */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-400 mb-2">
          Algorithm
        </label>
        <select
          value={selectedAlgorithm}
          onChange={(e) => setSelectedAlgorithm(e.target.value)}
          className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
        >
          <option value="dijkstra">Dijkstra (Binary Heap)</option>
          <option value="bellman-ford">Bellman-Ford</option>
          <option value="astar">A* (Euclidean)</option>
          <option value="bidirectional">Bidirectional Dijkstra</option>
        </select>
      </div>

      {/* Source Node Selection */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-400 mb-2">
          Source Node
        </label>
        <select
          value={sourceNode}
          onChange={(e) => setSourceNode(Number(e.target.value))}
          className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
        >
          {graph.nodes.map((node) => (
            <option key={node.id} value={node.id}>
              {node.label} (ID: {node.id})
            </option>
          ))}
        </select>
      </div>

      {/* Run Button */}
      <button
        onClick={runAlgorithm}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded mb-6 flex items-center justify-center gap-2 transition-colors"
      >
        <Play size={16} />
        Run Algorithm
      </button>

      {/* Graph Operations */}
      <div className="mb-6">
        <h3 className="text-sm font-medium text-gray-400 mb-3">Graph Operations</h3>
        <div className="space-y-2">
          <button
            onClick={generateGraph}
            className="w-full bg-gray-700 hover:bg-gray-600 text-white text-sm py-2 px-4 rounded transition-colors"
          >
            Generate Random Graph
          </button>
          <button
            onClick={addEdge}
            className="w-full bg-gray-700 hover:bg-gray-600 text-white text-sm py-2 px-4 rounded transition-colors"
          >
            Add Random Edge
          </button>
          <button
            onClick={removeNode}
            className="w-full bg-gray-700 hover:bg-gray-600 text-white text-sm py-2 px-4 rounded transition-colors"
          >
            Remove Last Node
          </button>
          <button
            onClick={resetGraph}
            className="w-full bg-gray-700 hover:bg-gray-600 text-white text-sm py-2 px-4 rounded flex items-center justify-center gap-2 transition-colors"
          >
            <RotateCcw size={14} />
            Reset Failures
          </button>
        </div>
      </div>

      {/* Import/Export */}
      <div className="mb-6">
        <h3 className="text-sm font-medium text-gray-400 mb-3">Import / Export</h3>
        <div className="space-y-2">
          <button
            onClick={exportGraph}
            className="w-full bg-gray-700 hover:bg-gray-600 text-white text-sm py-2 px-4 rounded flex items-center justify-center gap-2 transition-colors"
          >
            <Download size={14} />
            Export JSON
          </button>
          <label className="w-full bg-gray-700 hover:bg-gray-600 text-white text-sm py-2 px-4 rounded flex items-center justify-center gap-2 transition-colors cursor-pointer">
            <Upload size={14} />
            Import JSON
            <input
              type="file"
              accept=".json"
              onChange={importGraph}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {/* Graph Stats */}
      <div className="bg-gray-700 rounded p-3">
        <h3 className="text-sm font-medium text-gray-400 mb-2">Graph Stats</h3>
        <div className="text-sm text-gray-300 space-y-1">
          <div className="flex justify-between">
            <span>Nodes:</span>
            <span className="font-medium">{graph.nodes.length}</span>
          </div>
          <div className="flex justify-between">
            <span>Edges:</span>
            <span className="font-medium">{graph.edges.length}</span>
          </div>
          <div className="flex justify-between">
            <span>Failed Edges:</span>
            <span className="font-medium text-red-400">
              {graph.edges.filter((e) => e.status === 'failed').length}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
