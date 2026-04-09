import { useState, useCallback, useMemo, useEffect } from "react";

const CLUSTER_COLORS = [
  "#14b8a6",
  "#3b82f6",
  "#a855f7",
  "#f59e0b",
  "#ef4444",
  "#22c55e",
  "#0ea5e9", 
  "#ec4899", 
  "#f97316", 
  "#84cc16"
];

export function getClusterColor(index) {
  // use predefined colors first
  if (index < CLUSTER_COLORS.length) {
    return CLUSTER_COLORS[index];
  }

  // generate new colors deterministically
  const hue = (index * 137.508) % 360; // golden angle
  return `hsl(${hue}, 65%, 55%)`;
}

function computeEigenvaluesSymmetric(matrix) {
  const n = matrix.length;
  if (n === 0) return [];
  if (n === 1) return [matrix[0][0]];

  const A = matrix.map((row) => [...row]);
  const maxIterations = 100;

  for (let iter = 0; iter < maxIterations; iter++) {
    let maxVal = 0;
    let p = 0;
    let q = 1;

    for (let i = 0; i < n; i++) {
      for (let j = i + 1; j < n; j++) {
        if (Math.abs(A[i][j]) > maxVal) {
          maxVal = Math.abs(A[i][j]);
          p = i;
          q = j;
        }
      }
    }

    if (maxVal < 1e-10) break;

    const app = A[p][p];
    const aqq = A[q][q];
    const apq = A[p][q];

    const theta =
      app === aqq ? Math.PI / 4 : 0.5 * Math.atan((2 * apq) / (aqq - app));

    const c = Math.cos(theta);
    const s = Math.sin(theta);

    for (let i = 0; i < n; i++) {
      if (i !== p && i !== q) {
        const aip = A[i][p];
        const aiq = A[i][q];
        A[i][p] = c * aip - s * aiq;
        A[p][i] = A[i][p];
        A[i][q] = s * aip + c * aiq;
        A[q][i] = A[i][q];
      }
    }

    A[p][p] = c * c * app - 2 * s * c * apq + s * s * aqq;
    A[q][q] = s * s * app + 2 * s * c * apq + c * c * aqq;
    A[p][q] = 0;
    A[q][p] = 0;
  }

  return A.map((row, i) => Math.max(0, row[i])).sort((a, b) => a - b);
}

export function useGraph() {
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [selectedNode, setSelectedNode] = useState(null);
  const [toolMode, setToolMode] = useState("add-node");
  const [edgeStart, setEdgeStart] = useState(null);
  const [nextId, setNextId] = useState(1);
  const [showClusters, setShowClusters] = useState(false);

  const addNode = useCallback(
    (x, y) => {
      const id = `n${nextId}`;
      setNodes((prev) => [
        ...prev,
        {
          id,
          x,
          y,
          label: String(nextId),
        },
      ]);
      setNextId((prev) => prev + 1);
    },
    [nextId]
  );

  const addEdge = useCallback((source, target) => {
    if (!source || !target || source === target) return;

    setEdges((prev) => {
      const exists = prev.some(
        (e) =>
          (e.source === source && e.target === target) ||
          (e.source === target && e.target === source)
      );

      if (exists) return prev;
      return [...prev, { source, target }];
    });
  }, []);

  const deleteNode = useCallback((id) => {
    setNodes((prev) => prev.filter((n) => n.id !== id));
    setEdges((prev) => prev.filter((e) => e.source !== id && e.target !== id));
    setSelectedNode((prev) => (prev === id ? null : prev));
    setEdgeStart((prev) => (prev === id ? null : prev));
  }, []);

  const deleteEdge = useCallback((source, target) => {
    setEdges((prev) =>
      prev.filter(
        (e) =>
          !(
            (e.source === source && e.target === target) ||
            (e.source === target && e.target === source)
          )
      )
    );
  }, []);

  const moveNode = useCallback((id, x, y) => {
    setNodes((prev) =>
      prev.map((node) => (node.id === id ? { ...node, x, y } : node))
    );
  }, []);

  const reset = useCallback(() => {
    setNodes([]);
    setEdges([]);
    setSelectedNode(null);
    setEdgeStart(null);
    setNextId(1);
    setShowClusters(false);
    setInfluenceSource(null);
    setInfluenceK(1);
  }, []);

  const loadPreset = useCallback(
    (preset) => {
      reset();

      setTimeout(() => {
        switch (preset) {
          case "circle": {
            const circleNodes = [];
            const circleEdges = [];
            const centerX = 360;
            const centerY = 240;
            const radius = 150;
            const n = 8;

            for (let i = 0; i < n; i++) {
              const angle = (2 * Math.PI * i) / n;
              circleNodes.push({
                id: `n${i + 1}`,
                x: centerX + radius * Math.cos(angle),
                y: centerY + radius * Math.sin(angle),
                label: String(i + 1),
              });

              circleEdges.push({
                source: `n${i + 1}`,
                target: `n${((i + 1) % n) + 1}`,
              });
            }

            setNodes(circleNodes);
            setEdges(circleEdges);
            setNextId(9);
            break;
          }

          case "cluster-chain": {
            const clusters = [];
            const clusterEdges = [];
            let id = 1;

            const clusterCenters = [
              { x: 180, y: 220 },
              { x: 470, y: 220 },
              { x: 760, y: 220 },
            ];

            const radius = 72;

            clusterCenters.forEach((center, clusterIdx) => {
              for (let i = 0; i < 4; i++) {
                const angle = -Math.PI / 2 + (2 * Math.PI * i) / 4;
                clusters.push({
                  id: `n${id}`,
                  x: center.x + radius * Math.cos(angle),
                  y: center.y + radius * Math.sin(angle),
                  label: String(id),
                });
                id++;
              }

              const start = clusterIdx * 4 + 1;
              for (let i = start; i < start + 4; i++) {
                for (let j = i + 1; j < start + 4; j++) {
                  clusterEdges.push({
                    source: `n${i}`,
                    target: `n${j}`,
                  });
                }
              }
            });

            clusterEdges.push({ source: "n2", target: "n5" });
            clusterEdges.push({ source: "n6", target: "n9" });

            setNodes(clusters);
            setEdges(clusterEdges);
            setNextId(13);
            break;
          }

          case "path":
            setNodes([
              { id: "n1", x: 120, y: 200, label: "1" },
              { id: "n2", x: 240, y: 200, label: "2" },
              { id: "n3", x: 360, y: 200, label: "3" },
              { id: "n4", x: 480, y: 200, label: "4" },
            ]);
            setEdges([
              { source: "n1", target: "n2" },
              { source: "n2", target: "n3" },
              { source: "n3", target: "n4" },
            ]);
            setNextId(5);
            break;

          case "snowflake":
            setNodes([
              { id: "n1", x: 420, y: 280, label: "1" },
              { id: "n2", x: 420, y: 160, label: "2" },
              { id: "n3", x: 560, y: 210, label: "3" },
              { id: "n4", x: 560, y: 350, label: "4" },
              { id: "n5", x: 420, y: 400, label: "5" },
              { id: "n6", x: 280, y: 350, label: "6" },
              { id: "n7", x: 280, y: 210, label: "7" },
              { id: "n8", x: 420, y: 80, label: "8" },
              { id: "n9", x: 680, y: 170, label: "9" },
              { id: "n10", x: 680, y: 390, label: "10" },
              { id: "n11", x: 420, y: 480, label: "11" },
              { id: "n12", x: 160, y: 390, label: "12" },
              { id: "n13", x: 160, y: 170, label: "13" },
            ]);

            setEdges([
              { source: "n1", target: "n2" },
              { source: "n1", target: "n3" },
              { source: "n1", target: "n4" },
              { source: "n1", target: "n5" },
              { source: "n1", target: "n6" },
              { source: "n1", target: "n7" },
              { source: "n2", target: "n8" },
              { source: "n3", target: "n9" },
              { source: "n4", target: "n10" },
              { source: "n5", target: "n11" },
              { source: "n6", target: "n12" },
              { source: "n7", target: "n13" },
            ]);

            setNextId(14);
            break;

            case "four-clusters": {
              const clusterNodes = [
                // cluster 1
                { id: "n1", x: 200, y: 110, label: "1" },
                { id: "n2", x: 310, y: 190, label: "2" },
                { id: "n3", x: 265, y: 310, label: "3" },
                { id: "n4", x: 135, y: 310, label: "4" },
                { id: "n5", x: 90, y: 190, label: "5" },
                { id: "n6", x: 200, y: 210, label: "6" }, 
            
                // cluster 2
                { id: "n7", x: 720, y: 110, label: "7" },
                { id: "n8", x: 840, y: 210, label: "8" },
                { id: "n9", x: 720, y: 310, label: "9" },
                { id: "n10", x: 600, y: 210, label: "10" },
            
                // cluster 3
                { id: "n11", x: 120, y: 520, label: "11" },
                { id: "n12", x: 240, y: 600, label: "12" },
                { id: "n13", x: 360, y: 520, label: "13" },
            
                // cluster 4
                { id: "n14", x: 700, y: 450, label: "14" },
                { id: "n15", x: 820, y: 510, label: "15" },
                { id: "n16", x: 780, y: 630, label: "16" },
                { id: "n17", x: 620, y: 630, label: "17" },
                { id: "n18", x: 700, y: 570, label: "18" },
              ];
            
              const clusterEdges = [
                // cluster 1 (star-ish, center n6)
                { source: "n6", target: "n2" },
                { source: "n6", target: "n3" },
                { source: "n6", target: "n4" },
                { source: "n6", target: "n5" },
                { source: "n1", target: "n2" },
                { source: "n4", target: "n5" },
            
                // cluster 2 (cycle)
                { source: "n7", target: "n8" },
                { source: "n8", target: "n9" },
                { source: "n9", target: "n10" },
                { source: "n10", target: "n7" },
            
                // cluster 3 (path)
                { source: "n11", target: "n12" },
                { source: "n12", target: "n13" },
            
                // cluster 4 (dense)
                { source: "n14", target: "n15" },
                { source: "n15", target: "n16" },
                { source: "n16", target: "n17" },
                { source: "n17", target: "n18" },
                { source: "n18", target: "n14" },
                { source: "n14", target: "n16" },
                { source: "n14", target: "n17" },
                { source: "n15", target: "n18" },
              ];
            
              setNodes(clusterNodes);
              setEdges(clusterEdges);
              setNextId(19);
              break;
            }

          default:
            break;
        }
      }, 0);
    },
    [reset]
  );

  const handleNodeAction = useCallback(
    (id) => {
      if (toolMode === "delete") {
        deleteNode(id);
        return;
      }

      if (toolMode === "select") {
        setSelectedNode(id);
        return;
      }

      if (toolMode === "add-edge") {
        if (!edgeStart) {
          setEdgeStart(id);
        } else if (edgeStart === id) {
          setEdgeStart(null);
        } else {
          addEdge(edgeStart, id);
          setEdgeStart(null);
        }
      }
    },
    [toolMode, edgeStart, addEdge, deleteNode]
  );

  const adjacencyMatrix = useMemo(() => {
    const n = nodes.length;
    const matrix = Array.from({ length: n }, () => Array(n).fill(0));
    const idxMap = new Map(nodes.map((node, i) => [node.id, i]));

    edges.forEach(({ source, target }) => {
      const si = idxMap.get(source);
      const ti = idxMap.get(target);

      if (si !== undefined && ti !== undefined) {
        matrix[si][ti] = 1;
        matrix[ti][si] = 1;
      }
    });

    return matrix;
  }, [nodes, edges]);

  const degreeMatrix = useMemo(() => {
    const n = nodes.length;
    const matrix = Array.from({ length: n }, () => Array(n).fill(0));

    adjacencyMatrix.forEach((row, i) => {
      matrix[i][i] = row.reduce((sum, value) => sum + value, 0);
    });

    return matrix;
  }, [adjacencyMatrix, nodes.length]);

  const laplacianMatrix = useMemo(() => {
    const n = nodes.length;
    return Array.from({ length: n }, (_, i) =>
      Array.from({ length: n }, (_, j) => degreeMatrix[i][j] - adjacencyMatrix[i][j])
    );
  }, [degreeMatrix, adjacencyMatrix, nodes.length]);

  const eigenvalues = useMemo(() => {
    return computeEigenvaluesSymmetric(laplacianMatrix);
  }, [laplacianMatrix]);

  const zeroEigenvalueCount = useMemo(() => {
    return eigenvalues.filter((value) => Math.abs(value) < 1e-6).length;
  }, [eigenvalues]);

  const clusterMap = useMemo(() => {
    const visited = new Set();
    const clusters = new Map();
    let clusterIndex = 0;

    const adjacencyList = new Map();
    nodes.forEach((node) => adjacencyList.set(node.id, []));
    edges.forEach((edge) => {
      adjacencyList.get(edge.source)?.push(edge.target);
      adjacencyList.get(edge.target)?.push(edge.source);
    });

    nodes.forEach((node) => {
      if (visited.has(node.id)) return;

      const queue = [node.id];
      visited.add(node.id);

      while (queue.length > 0) {
        const current = queue.shift();
        clusters.set(current, clusterIndex);

        const neighbors = adjacencyList.get(current) || [];
        neighbors.forEach((neighbor) => {
          if (!visited.has(neighbor)) {
            visited.add(neighbor);
            queue.push(neighbor);
          }
        });
      }

      clusterIndex += 1;
    });

    return clusters;
  }, [nodes, edges]);

  const clusterCount = useMemo(() => {
    return new Set(clusterMap.values()).size;
  }, [clusterMap]);

  const [influenceSource, setInfluenceSource] = useState(null);
  const [influenceK, setInfluenceK] = useState(1);

  const identityMatrix = (n) =>
    Array.from({ length: n }, (_, i) =>
      Array.from({ length: n }, (_, j) => (i === j ? 1 : 0))
    );
  
  const multiplyMatrices = (A, B) => {
    const rows = A.length;
    const cols = B[0].length;
    const inner = B.length;
  
    const result = Array.from({ length: rows }, () =>
      Array.from({ length: cols }, () => 0)
    );
  
    for (let i = 0; i < rows; i++) {
      for (let k = 0; k < inner; k++) {
        for (let j = 0; j < cols; j++) {
          result[i][j] += A[i][k] * B[k][j];
        }
      }
    }
  
    return result;
  };
  
  const matrixPower = (M, power) => {
    if (!M || M.length === 0) return [];
    if (power === 0) return identityMatrix(M.length);
  
    let result = M;
    for (let i = 1; i < power; i++) {
      result = multiplyMatrices(result, M);
    }
    return result;
  };

  const laplacianPowerMatrix = useMemo(() => {
    if (!laplacianMatrix || laplacianMatrix.length === 0) return [];
    const safeK = Math.max(0, Number(influenceK) || 0);
    return matrixPower(laplacianMatrix, safeK);
  }, [laplacianMatrix, influenceK]);
  
  const influenceMap = useMemo(() => {
    if (
      !laplacianPowerMatrix ||
      laplacianPowerMatrix.length === 0 ||
      influenceSource == null
    ) {
      return new Map();
    }
  
    const sourceIndex = nodes.findIndex((n) => n.id === influenceSource);
    if (sourceIndex === -1) return new Map();
  
    const row = laplacianPowerMatrix[sourceIndex] || [];
    const absValues = row.map((v) => Math.abs(v));
    const maxVal = Math.max(...absValues, 0);
  
    return new Map(
      nodes.map((node, idx) => [
        node.id,
        {
          raw: row[idx] ?? 0,
          strength: maxVal > 0 ? absValues[idx] / maxVal : 0,
        },
      ])
    );
  }, [laplacianPowerMatrix, influenceSource, nodes]);

  useEffect(() => {
    if (nodes.length > 0 && influenceSource == null) {
      setInfluenceSource(nodes[0].id);
    }
    if (nodes.length === 0) {
      setInfluenceSource(null);
    }
  }, [nodes, influenceSource]);

  return {
    nodes,
    edges,
    selectedNode,
    toolMode,
    edgeStart,
    setToolMode,
    setSelectedNode,
    setEdgeStart,
    addNode,
    addEdge,
    deleteNode,
    deleteEdge,
    moveNode,
    reset,
    loadPreset,
    handleNodeAction,
    adjacencyMatrix,
    degreeMatrix,
    laplacianMatrix,
    eigenvalues,
    zeroEigenvalueCount,
    clusterMap,
    clusterCount,
    showClusters,
    setShowClusters,
    influenceSource,
    setInfluenceSource,
    influenceK,
    setInfluenceK,
    laplacianPowerMatrix,
    influenceMap,
  };
}