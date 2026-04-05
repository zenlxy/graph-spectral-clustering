import { useState } from "react";
import GraphCanvas from "./components/GraphCanvas";
import ControlToolbar from "./components/ControlToolbar";
import RightPanel from "./components/RightPanel";
import StepProgress from "./components/StepProgress";
import { useGraph } from "./hooks/useGraph";

export default function App() {
  const {
    nodes,
    edges,
    selectedNode,
    toolMode,
    edgeStart,
    setToolMode,
    reset,
    loadPreset,
    addNode,
    moveNode,
    handleNodeAction,
    deleteEdge,
    adjacencyMatrix,
    degreeMatrix,
    laplacianMatrix,
    eigenvalues,
    zeroEigenvalueCount,
    clusterMap,
    clusterCount,
    showClusters,
    setShowClusters,
  } = useGraph();

  const [activeStep, setActiveStep] = useState("Basics");

  const handleCanvasClick = (x, y) => {
    if (toolMode === "add-node") {
      addNode(x, y);
    }
  };

  const nodeLabels = nodes.map((node) => node.label);

  return (
    <div className="app-shell-light">
      <header className="topbar-light">
        <div className="brand">
          <span className="brand-dot" />
          <h1>Graph Spectral Clustering</h1>
        </div>

        <StepProgress activeStep={activeStep} onChangeStep={setActiveStep} />
      </header>

      <main className="workspace">
        <section className="canvas-panel">
          <ControlToolbar
            toolMode={toolMode}
            onSetTool={setToolMode}
            onLoadPreset={loadPreset}
            onReset={reset}
          />

          <GraphCanvas
            nodes={nodes}
            edges={edges}
            selectedNode={selectedNode}
            toolMode={toolMode}
            edgeStart={edgeStart}
            clusterMap={clusterMap}
            showClusters={showClusters}
            onCanvasClick={handleCanvasClick}
            onNodeClick={handleNodeAction}
            onNodeDrag={moveNode}
            onDeleteEdge={deleteEdge}
          />
        </section>

        <section className="info-panel">
          <RightPanel
            activeStep={activeStep}
            onChangeStep={setActiveStep}
            adjacencyMatrix={adjacencyMatrix}
            degreeMatrix={degreeMatrix}
            laplacianMatrix={laplacianMatrix}
            eigenvalues={eigenvalues}
            zeroEigenvalueCount={zeroEigenvalueCount}
            clusterCount={clusterCount}
            showClusters={showClusters}
            setShowClusters={setShowClusters}
            nodeLabels={nodeLabels}
          />
        </section>
      </main>
    </div>
  );
}