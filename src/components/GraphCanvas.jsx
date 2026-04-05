import { useRef, useState, useCallback } from "react";
import { getClusterColor } from "../hooks/useGraph";

export default function GraphCanvas({
  nodes,
  edges,
  selectedNode,
  toolMode,
  edgeStart,
  clusterMap,
  showClusters,
  onCanvasClick,
  onNodeClick,
  onNodeDrag,
  onDeleteEdge,
}) {
  const svgRef = useRef(null);
  const [dragging, setDragging] = useState(null);

  const getSVGCoords = useCallback((e) => {
    const svg = svgRef.current;
    if (!svg) return { x: 0, y: 0 };

    const point = svg.createSVGPoint();
    point.x = e.clientX;
    point.y = e.clientY;

    const transformedPoint = point.matrixTransform(
      svg.getScreenCTM().inverse()
    );

    return {
      x: transformedPoint.x,
      y: transformedPoint.y,
    };
  }, []);

  const handleCanvasClick = useCallback(
    (e) => {
      if (e.target === svgRef.current || e.target.tagName === "rect") {
        const { x, y } = getSVGCoords(e);
        onCanvasClick(x, y);
      }
    },
    [getSVGCoords, onCanvasClick]
  );

  const handleMouseMove = useCallback(
    (e) => {
      if (!dragging) return;
      const { x, y } = getSVGCoords(e);
      onNodeDrag(dragging, x, y);
    },
    [dragging, getSVGCoords, onNodeDrag]
  );

  return (
    <div className="graph-canvas-card">
      <svg
        ref={svgRef}
        className={`graph-svg ${toolMode === "add-node" ? "add-node-mode" : ""}`}
        onClick={handleCanvasClick}
        onMouseMove={handleMouseMove}
        onMouseUp={() => setDragging(null)}
        onMouseLeave={() => setDragging(null)}
        viewBox="0 0 900 700"
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          <pattern id="light-grid" width="28" height="28" patternUnits="userSpaceOnUse">
            <path
              d="M 28 0 L 0 0 0 28"
              fill="none"
              stroke="#eef2f7"
              strokeWidth="1"
            />
          </pattern>
        </defs>

        <rect width="100%" height="100%" fill="url(#light-grid)" />

        {edges.map(({ source, target }) => {
          const s = nodes.find((n) => n.id === source);
          const t = nodes.find((n) => n.id === target);
          if (!s || !t) return null;

          return (
            <line
              key={`${source}-${target}`}
              x1={s.x}
              y1={s.y}
              x2={t.x}
              y2={t.y}
              stroke="#94a3b8"
              strokeWidth="3"
              strokeLinecap="round"
              className="graph-edge"
              onClick={(e) => {
                e.stopPropagation();
                if (toolMode === "delete") {
                  onDeleteEdge(source, target);
                }
              }}
              style={{ cursor: toolMode === "delete" ? "pointer" : "default" }}
            />
          );
        })}

        {edgeStart &&
          (() => {
            const startNode = nodes.find((n) => n.id === edgeStart);
            if (!startNode) return null;

            return (
              <circle
                cx={startNode.x}
                cy={startNode.y}
                r={34}
                fill="none"
                stroke="#14b8a6"
                strokeWidth="3"
                strokeDasharray="6 4"
                opacity="0.7"
              />
            );
          })()}

        {nodes.map((node) => {
          const isSelected = selectedNode === node.id;
          const isEdgeStart = edgeStart === node.id;

          const fillColor =
            showClusters && clusterMap.has(node.id)
              ? getClusterColor(clusterMap.get(node.id))
              : "#14b8a6";

          return (
            <g key={node.id}>
              {(isSelected || isEdgeStart) && (
                <circle
                  cx={node.x}
                  cy={node.y}
                  r={34}
                  fill="none"
                  stroke={isEdgeStart ? "#14b8a6" : "#f59e0b"}
                  strokeWidth="3"
                />
              )}

              <circle
                cx={node.x}
                cy={node.y}
                r={28}
                fill={fillColor}
                stroke="#000000"
                strokeWidth="2"
                className="graph-node"
                onClick={(e) => {
                  e.stopPropagation();
                  onNodeClick(node.id);
                }}
                onMouseDown={(e) => {
                  e.stopPropagation();
                  if (toolMode === "select") {
                    setDragging(node.id);
                  }
                }}
              />

              <text
                x={node.x}
                y={node.y + 1}
                textAnchor="middle"
                dominantBaseline="middle"
                fill="#0f172a"
                fontSize="18"
                fontWeight="700"
                className="node-label"
              >
                {node.label}
              </text>
            </g>
          );
        })}

        {nodes.length === 0 && (
          <text
            x="50%"
            y="50%"
            textAnchor="middle"
            fill="#94a3b8"
            fontSize="20"
            fontWeight="600"
          >
            Click "Add Node" and then click on the canvas to start building your graph
          </text>
        )}
      </svg>
    </div>
  );
}