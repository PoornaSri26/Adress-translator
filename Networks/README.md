# AdaptiveNet RouterLab

A next-generation network routing simulator with real-time interactivity, advanced algorithms, and dynamic visualization.

## Features

### 🧩 Live Graph Editor
- **Click to add/remove nodes** - Double-click anywhere on the canvas to add a new node
- **Drag nodes** - Click and drag nodes to rearrange the layout
- **Edit edges** - Click on edges to toggle link failure simulation
- **Dynamic updates** - All changes reflect immediately in the visualization

### 🧠 Advanced Algorithms Suite
| Algorithm | Complexity | Use Case |
|-----------|------------|----------|
| **Dijkstra (Binary Heap)** | O((V+E) log V) | Default single-source shortest path |
| **Bellman-Ford** | O(VE) | Negative weight detection + paths |
| **A* (Euclidean)** | O((V+E) log V) | Faster goal-directed routing with spatial heuristics |
| **Bidirectional Dijkstra** | O((V+E) log V) | Nearly 2× speed for large graphs |

### 📊 Real-time Simulation
- **Link failure simulation** - Click edges to "break" them, see paths recompute instantly
- **Path highlighting** - Visual feedback for computed shortest paths
- **Performance metrics** - Execution time displayed for each algorithm run
- **Distance array visualization** - See computed distances for all nodes

### 🎨 Interactive Visualization
- **D3.js powered graph rendering** - Smooth, performant visualization
- **Color-coded states** - Active nodes/edges vs failed links
- **Animated path tracing** - Highlighted shortest paths
- **Responsive design** - Works on various screen sizes

### 📁 Import / Export
- **JSON export** - Save your graph configuration
- **JSON import** - Load previously saved graphs
- **Random graph generation** - Generate test graphs with custom parameters

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

### Usage

1. **Select Algorithm** - Choose from Dijkstra, Bellman-Ford, A*, or Bidirectional Dijkstra
2. **Choose Source Node** - Select the starting node for path computation
3. **Run Algorithm** - Click "Run Algorithm" to compute shortest paths
4. **Interact with Graph**:
   - Double-click to add nodes
   - Drag nodes to reposition
   - Click edges to simulate failures
   - Use control panel for bulk operations

## Project Structure

```
src/
├── components/
│   ├── GraphVisualizer.tsx    # D3.js graph visualization
│   ├── AlgorithmPanel.tsx     # Results display
│   └── ControlPanel.tsx       # User controls
├── algorithms/
│   ├── dijkstra.ts            # Dijkstra with binary heap
│   ├── bellmanFord.ts         # Bellman-Ford with negative cycle detection
│   ├── astar.ts               # A* with Euclidean heuristic
│   └── bidirectionalDijkstra.ts  # Bidirectional search
├── utils/
│   ├── MinHeap.ts             # Binary heap implementation
│   └── graphUtils.ts          # Graph utilities
├── types/
│   └── graph.ts               # TypeScript type definitions
├── App.tsx                    # Main application
└── main.tsx                   # Entry point
```

## Algorithm Details

### Dijkstra (Binary Heap)
- Uses adjacency list for O(V+E) memory
- Binary heap priority queue for O(log V) operations
- Lazy deletion to handle stale entries
- Total complexity: O((V+E) log V)

### Bellman-Ford
- Detects negative weight cycles
- Works with graphs containing negative edges
- Total complexity: O(VE)
- Returns negative cycle flag if detected

### A* (Euclidean)
- Uses Euclidean distance as heuristic
- Goal-directed search for faster convergence
- Admissible heuristic (never overestimates)
- Total complexity: O((V+E) log V) in practice

### Bidirectional Dijkstra
- Simultaneous forward and backward search
- Meets in the middle for faster termination
- Best for point-to-point queries
- Total complexity: O((V+E) log V) with ~2× speedup

## Performance

- **Scalability**: Handles graphs with 10K+ nodes efficiently
- **Memory**: O(V+E) using adjacency lists
- **Speed**: Sub-millisecond for typical graphs (<100 nodes)
- **Visualization**: Optimized D3.js rendering with lazy updates

## Future Enhancements

- [ ] Yen's K-Shortest Paths algorithm
- [ ] D* Lite / LPA* for dynamic replanning
- [ ] Floyd-Warshall for all-pairs shortest paths
- [ ] Step-by-step algorithm visualization
- [ ] Traffic load simulation
- [ ] Multi-source routing (anycast)
- [ ] GraphML import/export
- [ ] PDF report generation
- [ ] WebSocket backend for collaborative editing

## Tech Stack

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **TailwindCSS** - Styling
- **D3.js** - Data visualization
- **Lucide React** - Icons

## License

MIT License - Feel free to use for learning and prototyping.

## Contributing

Contributions welcome! Please feel free to submit issues or pull requests.
