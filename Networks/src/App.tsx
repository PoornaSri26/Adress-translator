import { useState } from 'react'
import GraphVisualizer from './components/GraphVisualizer'
import AlgorithmPanel from './components/AlgorithmPanel'
import ControlPanel from './components/ControlPanel'
import { Graph, Edge, Node } from './types/graph'

function App() {
  const [graph, setGraph] = useState<Graph>({
    nodes: [
      { id: 0, label: 'A', x: 400, y: 100 },
      { id: 1, label: 'B', x: 200, y: 300 },
      { id: 2, label: 'C', x: 600, y: 300 },
      { id: 3, label: 'D', x: 300, y: 500 },
      { id: 4, label: 'E', x: 500, y: 500 },
    ],
    edges: [
      { source: 0, target: 1, weight: 4 },
      { source: 0, target: 2, weight: 2 },
      { source: 1, target: 2, weight: 1 },
      { source: 1, target: 3, weight: 5 },
      { source: 2, target: 4, weight: 10 },
      { source: 3, target: 4, weight: 3 },
    ],
  })

  const [selectedAlgorithm, setSelectedAlgorithm] = useState<string>('dijkstra')
  const [sourceNode, setSourceNode] = useState<number>(0)
  const [results, setResults] = useState<any>(null)

  return (
    <div className="h-screen w-screen bg-gray-900 text-white flex flex-col">
      <header className="bg-gray-800 border-b border-gray-700 p-4">
        <h1 className="text-2xl font-bold text-blue-400">AdaptiveNet RouterLab</h1>
        <p className="text-sm text-gray-400">Next-Generation Network Routing Simulator</p>
      </header>
      
      <div className="flex flex-1 overflow-hidden">
        <ControlPanel
          graph={graph}
          setGraph={setGraph}
          selectedAlgorithm={selectedAlgorithm}
          setSelectedAlgorithm={setSelectedAlgorithm}
          sourceNode={sourceNode}
          setSourceNode={setSourceNode}
          setResults={setResults}
        />
        
        <div className="flex-1 flex flex-col">
          <GraphVisualizer
            graph={graph}
            setGraph={setGraph}
            results={results}
          />
          <AlgorithmPanel
            results={results}
            algorithm={selectedAlgorithm}
          />
        </div>
      </div>
    </div>
  )
}

export default App
