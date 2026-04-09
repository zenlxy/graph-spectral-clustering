import MatrixView from "./MatrixView";
import { STEPS } from "../lib/constants";
import { conceptText } from "../data/conceptText";
import { getClusterColor } from "../hooks/useGraph";

export default function RightPanel({
  activeStep,
  onChangeStep,
  adjacencyMatrix,
  degreeMatrix,
  laplacianMatrix,
  laplacianPowerMatrix,
  eigenvalues,
  zeroEigenvalueCount,
  clusterCount,
  showClusters,
  setShowClusters,
  nodeLabels,
  nodes,
  clusterMap,
  influenceSource,
  setInfluenceSource,
  influenceK,
  setInfluenceK,
  influenceMap,
}) {
  const content = conceptText[activeStep];

  const getMatrixType = () => {
    if (activeStep === "Adjacency") return "adjacency";
    if (activeStep === "Degree") return "degree";
    if (activeStep === "Laplacian") return "laplacian";
    return "default";
  };

  const getClusterLegendColor = (index) => getClusterColor(index);

  const selectedClusterColor =
  influenceSource && clusterMap.has(influenceSource)
    ? getClusterColor(clusterMap.get(influenceSource))
    : "#14b8a6";

  return (
    <div className="right-panel-light">
      <div className="tabs-light">
        {STEPS.map((step) => (
          <button
            key={step}
            className={`tab-light ${activeStep === step ? "active" : ""}`}
            onClick={() => onChangeStep(step)}
          >
            {step}
          </button>
        ))}
      </div>

      <div className="right-panel-content">
        <div className="content-card">
          <h2>{content.title}</h2>
          <p>{content.body}</p>

          {content.bullets && content.bullets.length > 0 && !content.showTryCard && (
            <ul className="content-bullets">
              {content.bullets.map((bullet) => (
                <li key={bullet}>{bullet}</li>
              ))}
            </ul>
          )}
        </div>

        {content.showTryCard && content.bullets && content.bullets.length > 0 && (
          <div className="content-card">
            <h3>{content.tryTitle || "Try it out"}</h3>
            <ul className="content-bullets">
              {content.bullets.map((bullet) => (
                <li key={bullet}>{bullet}</li>
              ))}
            </ul>
          </div>
        )}

        {activeStep === "Adjacency" && (
          <div className="content-card">
            <h3>Adjacency Matrix</h3>
            <MatrixView matrix={adjacencyMatrix} type={getMatrixType()} labels={nodeLabels} />
          </div>
        )}

        {activeStep === "Degree" && (
          <div className="content-card">
            <h3>Degree Matrix</h3>
            <MatrixView matrix={degreeMatrix} type={getMatrixType()} labels={nodeLabels} />
          </div>
        )}

        {activeStep === "Laplacian" && (
          <div className="content-card">
            <h3>Laplacian Matrix</h3>
            <MatrixView matrix={laplacianMatrix} type={getMatrixType()} labels={nodeLabels}/>
          </div>
        )}

        {activeStep === "Spectral" && (
        <>
            <div className="content-card">
            <h3>Computed Eigenvalues</h3>
            <div className="eigenvalue-list">
                {eigenvalues.map((value, index) => {
                const isZero = Math.abs(value) < 1e-6;
                return (
                    <div
                    key={index}
                    className={`eigenvalue-pill ${isZero ? "zero" : ""}`}
                    >
                    λ{index + 1} = {value.toFixed(4)}
                    </div>
                );
                })}
            </div>
            </div>

            <div className="spectral-summary-card">
            <div className="spectral-summary-top">
                <div>
                <h3 className="spectral-summary-title">
                    Connected Components:{" "}
                    <span className="spectral-highlight-number">{clusterCount}</span>
                </h3>

                <p className="spectral-summary-subtext">
                    Zero eigenvalues:{" "}
                    <span className="spectral-inline-highlight">
                    {zeroEigenvalueCount}
                    </span>
                </p>
                </div>

                <button
                className="cluster-action-btn"
                onClick={() => setShowClusters((prev) => !prev)}
                >
                {showClusters ? "Hide Clusters" : "Color Clusters"}
                </button>
            </div>

            <div className="cluster-legend">
                {Array.from({ length: clusterCount }, (_, index) => (
                <div key={index} className="cluster-legend-item">
                    <span
                    className="cluster-legend-dot"
                    style={{ backgroundColor: getClusterLegendColor(index) }}
                    />
                    <span>Cluster {index + 1}</span>
                </div>
                ))}
            </div>
            </div>
        </>
        )}

        {activeStep === "Lᵏ Influence" && (
          <>
            <div className="content-card">
              <h3>Lᵏ Controls</h3>

              <div className="influence-controls influence-controls-vertical">
                <p className="selected-source-text">
                  <strong>Selected source:</strong>{" "}
                  {nodes.find((n) => n.id === influenceSource)?.label ?? "Click a node"}
                </p>

                <label className="influence-control-group influence-slider-group">
                  <span>k = {influenceK}</span>
                  <input
                    type="range"
                    min="0"
                    max={Math.max(0, nodes.length || 0)}
                    step="1"
                    value={influenceK}
                    onChange={(e) => setInfluenceK(Number(e.target.value))}
                  />
                </label>
              </div>
            </div>

            <div className="content-card">
              <h3>Lᵏ Matrix</h3>
              <MatrixView
                matrix={laplacianPowerMatrix}
                type="influence"
                labels={nodeLabels}
                selectedRowIndex={nodes.findIndex((n) => n.id === influenceSource)}
                selectedRowColor={selectedClusterColor}
              />
            </div>
          </>
        )}

        <div className="nav-row">
          <button
            className="secondary-btn"
            onClick={() => {
              const idx = STEPS.indexOf(activeStep);
              if (idx > 0) onChangeStep(STEPS[idx - 1]);
            }}
          >
            ← Previous
          </button>

          <button
            className="primary-btn"
            onClick={() => {
              const idx = STEPS.indexOf(activeStep);
              if (idx < STEPS.length - 1) onChangeStep(STEPS[idx + 1]);
            }}
          >
            Next →
          </button>
        </div>
      </div>
    </div>
  );
}