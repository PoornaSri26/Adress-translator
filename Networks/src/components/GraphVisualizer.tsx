import { useEffect, useRef, useState } from 'react'
import * as d3 from 'd3'
import { Graph, AlgorithmResult } from '../types/graph'

interface GraphVisualizerProps {
  graph: Graph
  setGraph: (graph: Graph) => void
  results: AlgorithmResult | null
}

export default function GraphVisualizer({ graph, setGraph, results }: GraphVisualizerProps) {
  const svgRef = useRef<SVGSVGElement>(null)
  const [selectedNode, setSelectedNode] = useState<number | null>(null)
  const [draggedNode, setDraggedNode] = useState<number | null>(null)

  useEffect(() => {
    if (!svgRef.current) return

    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()

    const width = 800
    const height = 600

    // Create arrow marker
    svg.append('defs')
      .append('marker')
      .attr('id', 'arrowhead')
      .attr('viewBox', '-0 -5 10 10')
      .attr('refX', 20)
      .attr('refY', 0)
      .attr('orient', 'auto')
      .attr('markerWidth', 6)
      .attr('markerHeight', 6)
      .append('path')
      .attr('d', 'M 0,-5 L 10 ,0 L 0,5')
      .attr('fill', '#6b7280')

    // Create arrow marker for highlighted paths
    svg.append('defs')
      .append('marker')
      .attr('id', 'arrowhead-highlight')
      .attr('viewBox', '-0 -5 10 10')
      .attr('refX', 20)
      .attr('refY', 0)
      .attr('orient', 'auto')
      .attr('markerWidth', 6)
      .attr('markerHeight', 6)
      .append('path')
      .attr('d', 'M 0,-5 L 10 ,0 L 0,5')
      .attr('fill', '#3b82f6')

    // Get highlighted edges from results
    const highlightedEdges = new Set<string>()
    if (results) {
      for (const path of results.paths) {
        for (let i = 0; i < path.path.length - 1; i++) {
          const u = path.path[i]
          const v = path.path[i + 1]
          highlightedEdges.add(`${u}-${v}`)
          highlightedEdges.add(`${v}-${u}`)
        }
      }
    }

    // Draw edges
    const edges = svg.selectAll<SVGLineElement, any>('line')
      .data(graph.edges)
      .enter()
      .append('line')
      .attr('x1', (d: any) => graph.nodes.find((n) => n.id === d.source)!.x)
      .attr('y1', (d: any) => graph.nodes.find((n) => n.id === d.source)!.y)
      .attr('x2', (d: any) => graph.nodes.find((n) => n.id === d.target)!.x)
      .attr('y2', (d: any) => graph.nodes.find((n) => n.id === d.target)!.y)
      .attr('stroke', (d: any) => {
        if (d.status === 'failed') return '#ef4444'
        const key = `${d.source}-${d.target}`
        return highlightedEdges.has(key) ? '#3b82f6' : '#6b7280'
      })
      .attr('stroke-width', (d: any) => highlightedEdges.has(`${d.source}-${d.target}`) ? 3 : 2)
      .attr('marker-end', (d: any) => highlightedEdges.has(`${d.source}-${d.target}`) ? 'url(#arrowhead-highlight)' : 'url(#arrowhead)')
      .style('cursor', 'pointer')
      .on('click', (event: MouseEvent, d: any) => {
        event.stopPropagation()
        const newEdges = graph.edges.map((edge) =>
          edge.source === d.source && edge.target === d.target
            ? { ...edge, status: edge.status === 'failed' ? 'active' : 'failed' }
            : edge
        )
        setGraph({ ...graph, edges: newEdges })
      })

    // Draw edge labels
    svg.selectAll<SVGTextElement, any>('text.edge-label')
      .data(graph.edges)
      .enter()
      .append('text')
      .attr('class', 'edge-label')
      .attr('x', (d: any) => {
        const n1 = graph.nodes.find((n) => n.id === d.source)!
        const n2 = graph.nodes.find((n) => n.id === d.target)!
        return (n1.x + n2.x) / 2
      })
      .attr('y', (d: any) => {
        const n1 = graph.nodes.find((n) => n.id === d.source)!
        const n2 = graph.nodes.find((n) => n.id === d.target)!
        return (n1.y + n2.y) / 2 - 10
      })
      .attr('text-anchor', 'middle')
      .attr('fill', '#9ca3af')
      .attr('font-size', '12px')
      .text((d: any) => d.weight)

    // Draw nodes
    const nodes = svg.selectAll<SVGCircleElement, any>('circle')
      .data(graph.nodes)
      .enter()
      .append('circle')
      .attr('cx', (d: any) => d.x)
      .attr('cy', (d: any) => d.y)
      .attr('r', 20)
      .attr('fill', (d: any) => {
        if (d.status === 'failed') return '#ef4444'
        if (selectedNode === d.id) return '#3b82f6'
        return '#1f2937'
      })
      .attr('stroke', (d: any) => highlightedEdges.size > 0 && results?.paths.some((p) => p.path.includes(d.id)) ? '#3b82f6' : '#374151')
      .attr('stroke-width', (d: any) => highlightedEdges.size > 0 && results?.paths.some((p) => p.path.includes(d.id)) ? 3 : 2)
      .style('cursor', 'grab')
      .on('mousedown', (event: MouseEvent, d: any) => {
        event.stopPropagation()
        setDraggedNode(d.id)
        setSelectedNode(d.id)
      })
      .on('click', (event: MouseEvent, d: any) => {
        event.stopPropagation()
        setSelectedNode(d.id)
      })

    // Draw node labels
    svg.selectAll<SVGTextElement, any>('text.node-label')
      .data(graph.nodes)
      .enter()
      .append('text')
      .attr('class', 'node-label')
      .attr('x', (d: any) => d.x)
      .attr('y', (d: any) => d.y + 5)
      .attr('text-anchor', 'middle')
      .attr('fill', '#ffffff')
      .attr('font-size', '14px')
      .attr('font-weight', 'bold')
      .style('pointer-events', 'none')
      .text((d: any) => d.label)

    // Drag behavior
    svg.on('mousemove', (event: MouseEvent) => {
      if (draggedNode !== null) {
        const [x, y] = d3.pointer(event)
        const newNodes = graph.nodes.map((node) =>
          node.id === draggedNode ? { ...node, x, y } : node
        )
        setGraph({ ...graph, nodes: newNodes })
      }
    })

    svg.on('mouseup', () => {
      setDraggedNode(null)
    })

    svg.on('mouseleave', () => {
      setDraggedNode(null)
    })

    // Double click to add node
    svg.on('dblclick', (event: MouseEvent) => {
      const [x, y] = d3.pointer(event)
      const newId = Math.max(...graph.nodes.map((n) => n.id)) + 1
      const newNode = {
        id: newId,
        label: String.fromCharCode(65 + (newId % 26)) + (newId >= 26 ? Math.floor(newId / 26) : ''),
        x,
        y,
      }
      setGraph({ ...graph, nodes: [...graph.nodes, newNode] })
    })

  }, [graph, results, selectedNode, draggedNode])

  return (
    <div className="flex-1 bg-gray-800 p-4 overflow-auto">
      <svg
        ref={svgRef}
        width="100%"
        height="100%"
        viewBox="0 0 800 600"
        className="bg-gray-900 rounded-lg"
      />
      <div className="mt-4 text-sm text-gray-400">
        <p>• Click node to select • Double-click to add node • Drag to move • Click edge to toggle failure</p>
      </div>
    </div>
  )
}
