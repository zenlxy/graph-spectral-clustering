import { useEffect, useState } from "react";
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
    clearSelectedNode,
    toolMode,
    edgeStart,
    changeToolMode,
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
    eigenvectors,
    lambdaMatrix,
    zeroEigenIndices,
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
  } = useGraph();

  const [activeStep, setActiveStep] = useState("Basics");

  useEffect(() => {
    if (activeStep === "Lᵏ Influence") {
      changeToolMode("select");
    }
  }, [activeStep, changeToolMode]);

  const handleStepChange = (nextStep) => {
    if (activeStep === "Lᵏ Influence" && nextStep !== "Lᵏ Influence") {
      changeToolMode("add-node");
    } else if (nextStep === "Lᵏ Influence") {
      changeToolMode("select");
    }
  
    setActiveStep(nextStep);
  };

  const handleCanvasClick = (x, y) => {
    if (activeStep === "Lᵏ Influence") return;
  
    if (toolMode === "add-node") {
      addNode(x, y);
    }

    if (toolMode === "select") {
      clearSelectedNode();
    }

  };

  const nodeLabels = nodes.map((node) => node.label);

  const handleNodeClick = (nodeId) => {
    if (activeStep === "Lᵏ Influence") {
      setInfluenceSource(nodeId);
      return;
    }
  
    handleNodeAction(nodeId);
  };

  return (
    <div className="app-shell-light">
      <header className="topbar-light">
        <div className="brand">
          <span className="brand-dot" />
          <h1>Graph Spectral Clustering</h1>
        </div>

        <StepProgress activeStep={activeStep} onChangeStep={handleStepChange} />
      </header>

      <main className="workspace">
        <section className="canvas-panel">
          <ControlToolbar
            toolMode={toolMode}
            onSetTool={changeToolMode}
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
            onNodeClick={handleNodeClick}
            onNodeDrag={moveNode}
            onDeleteEdge={deleteEdge}
            influenceSource={influenceSource}
            influenceMap={influenceMap}
            showInfluence={activeStep === "Lᵏ Influence"}
            activeStep={activeStep}
          />
        </section>

        <section className="info-panel">
        <RightPanel
          activeStep={activeStep}
          onChangeStep={handleStepChange}
          adjacencyMatrix={adjacencyMatrix}
          degreeMatrix={degreeMatrix}
          laplacianMatrix={laplacianMatrix}
          laplacianPowerMatrix={laplacianPowerMatrix}
          eigenvalues={eigenvalues}
          eigenvectors={eigenvectors}
          lambdaMatrix={lambdaMatrix}
          zeroEigenIndices={zeroEigenIndices}
          zeroEigenvalueCount={zeroEigenvalueCount}
          clusterCount={clusterCount}
          showClusters={showClusters}
          setShowClusters={setShowClusters}
          nodeLabels={nodeLabels}
          nodes={nodes}
          edges={edges}
          influenceSource={influenceSource}
          setInfluenceSource={setInfluenceSource}
          influenceK={influenceK}
          setInfluenceK={setInfluenceK}
          influenceMap={influenceMap}
          clusterMap={clusterMap}
        />
        </section>
      </main>
    </div>
  );
}