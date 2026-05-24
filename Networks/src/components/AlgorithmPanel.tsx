import { AlgorithmResult } from '../types/graph'

interface AlgorithmPanelProps {
  results: AlgorithmResult | null
  algorithm: string
}

export default function AlgorithmPanel({ results, algorithm }: AlgorithmPanelProps) {
  if (!results) {
    return (
      <div className="h-48 bg-gray-800 border-t border-gray-700 p-4">
        <h3 className="text-lg font-semibold text-gray-300 mb-2">Algorithm Results</h3>
        <p className="text-gray-500">Run an algorithm to see results</p>
      </div>
    )
  }

  return (
    <div className="h-48 bg-gray-800 border-t border-gray-700 p-4 overflow-auto">
      <div className="flex justify-between items-start mb-3">
        <h3 className="text-lg font-semibold text-gray-300">Algorithm Results</h3>
        <div className="text-sm">
          <span className="text-blue-400 font-medium">{results.algorithm}</span>
          <span className="text-gray-500 ml-2">
            Time: {results.executionTime.toFixed(2)}ms
          </span>
        </div>
      </div>

      {results.hasNegativeCycle && (
        <div className="bg-red-900/30 border border-red-700 rounded p-2 mb-3">
          <p className="text-red-400 text-sm">⚠️ Negative cycle detected!</p>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div>
          <h4 className="text-sm font-medium text-gray-400 mb-2">Shortest Paths</h4>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-gray-500">
                <th className="text-left py-1">Destination</th>
                <th className="text-right py-1">Distance</th>
                <th className="text-left py-1">Path</th>
              </tr>
            </thead>
            <tbody>
              {results.paths.map((path) => (
                <tr key={path.destination} className="text-gray-300">
                  <td className="py-1">Node {path.destination}</td>
                  <td className="text-right py-1">{path.distance}</td>
                  <td className="py-1 text-xs text-gray-400">
                    {path.path.join(' → ')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div>
          <h4 className="text-sm font-medium text-gray-400 mb-2">Distance Array</h4>
          <div className="grid grid-cols-5 gap-1 text-xs">
            {results.distances.map((dist, i) => (
              <div
                key={i}
                className={`p-1 rounded text-center ${
                  dist === Infinity
                    ? 'bg-gray-700 text-gray-500'
                    : 'bg-gray-700 text-gray-300'
                }`}
              >
                <div className="font-medium">{i}</div>
                <div>{dist === Infinity ? '∞' : dist}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
