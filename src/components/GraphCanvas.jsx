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
  influenceSource,
  influenceMap,
  showInfluence,
  activeStep,
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

  const isActiveNode = (nodeId) => {
    if (!showInfluence) return true;
    if (nodeId === influenceSource) return true;

    const influence = influenceMap?.get(nodeId);
    return Math.abs(influence?.raw ?? 0) > 1e-10;
  };

  const blendWithBackground = (hex, amount = 0.65) => {
    const clean = hex.replace("#", "");
    const r = parseInt(clean.slice(0, 2), 16);
    const g = parseInt(clean.slice(2, 4), 16);
    const b = parseInt(clean.slice(4, 6), 16);

    const bg = 226;

    const nr = Math.round(r * (1 - amount) + bg * amount);
    const ng = Math.round(g * (1 - amount) + bg * amount);
    const nb = Math.round(b * (1 - amount) + bg * amount);

    return `rgb(${nr}, ${ng}, ${nb})`;
  };

  const getBaseNodeColor = (node) => {
    if (showClusters && clusterMap.has(node.id)) {
      return getClusterColor(clusterMap.get(node.id));
    }
    return "#14b8a6";
  };

  const getNodeFill = (node) => {
    const baseColor = getBaseNodeColor(node);

    if (!showInfluence) return baseColor;
    if (isActiveNode(node.id)) return baseColor;

    return blendWithBackground(baseColor, 0.65);
  };

  const getNodeLabelColor = (node) => {
    if (!showInfluence || isActiveNode(node.id)) return "#0f172a";
    return "#94a3b8";
  };

  const getEdgeStroke = (source, target) => {
    if (!showInfluence) return "#94a3b8";

    const sourceActive = isActiveNode(source);
    const targetActive = isActiveNode(target);

    return sourceActive && targetActive ? "#94a3b8" : "#d7dde5";
  };

  const getNodeStroke = (nodeId) => {
    if (!showInfluence) return "#000000";
    return isActiveNode(nodeId) ? "#000000" : "#94a3b8";
  };

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
        preserveAspectRatio="none"
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

        {showInfluence && (
          <rect
            width="100%"
            height="100%"
            fill="#0f172a"
            opacity="0.06"
            pointerEvents="none"
          />
        )}

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
              stroke={getEdgeStroke(source, target)}
              strokeWidth={showInfluence ? 4 : 3}
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
          const active = isActiveNode(node.id);
          const fillColor = getNodeFill(node);

          const clusterColor =
            clusterMap.has(node.id)
              ? getClusterColor(clusterMap.get(node.id))
              : "#14b8a6";

          return (
            <g key={node.id}>
              {(isSelected || isEdgeStart) && !showInfluence && (
                <circle
                  cx={node.x}
                  cy={node.y}
                  r={34}
                  fill="none"
                  stroke="#14b8a6"
                  strokeWidth="3"
                />
              )}

              {showInfluence && active && (
                <circle
                  cx={node.x}
                  cy={node.y}
                  r={36}
                  fill="none"
                  stroke={clusterColor}
                  strokeWidth={node.id === influenceSource ? "4" : "3"}
                  opacity={node.id === influenceSource ? 0.95 : 0.85}
                />
              )}

              <circle
                cx={node.x}
                cy={node.y}
                r={28}
                fill={fillColor}
                stroke={getNodeStroke(node.id)}
                strokeWidth="2"
                className="graph-node"
                onClick={(e) => {
                  e.stopPropagation();
                  onNodeClick(node.id);
                }}
                onMouseDown={(e) => {
                  e.stopPropagation();
                  if (toolMode === "select" && !showInfluence) {
                    setDragging(node.id);
                  }
                }}
              />

              <text
                x={node.x}
                y={node.y + 1}
                textAnchor="middle"
                dominantBaseline="middle"
                fill={getNodeLabelColor(node)}
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
            {activeStep === "Lᵏ Influence"
              ? "Go to earlier steps to start creating your graph"
              : "Click to add nodes or load a preset"}
          </text>
        )}
      </svg>
    </div>
  );
}