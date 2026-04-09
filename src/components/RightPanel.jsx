import { useEffect, useState } from "react";
import MatrixView from "./MatrixView";
import { STEPS } from "../lib/constants";
import { conceptText } from "../data/conceptText";
import { getClusterColor } from "../hooks/useGraph";
import { generateQuiz } from "../lib/quizApi";

export default function RightPanel({
  activeStep,
  onChangeStep,
  adjacencyMatrix,
  degreeMatrix,
  laplacianMatrix,
  laplacianPowerMatrix,
  eigenvalues,
  eigenvectors,
  lambdaMatrix,
  zeroEigenIndices,
  zeroEigenvalueCount,
  clusterCount,
  showClusters,
  setShowClusters,
  nodeLabels,
  nodes,
  edges,
  clusterMap,
  influenceSource,
  influenceK,
  setInfluenceK,
}) {

  const content = conceptText[activeStep];

  const [quiz, setQuiz] = useState(null);
  const [quizLoading, setQuizLoading] = useState(false);
  const [quizError, setQuizError] = useState("");
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [showQuizResults, setShowQuizResults] = useState(false);

  const eigenvectorLabels = eigenvalues.map((_, index) => `u${index + 1}`);
  const lambdaLabels = eigenvalues.map((_, index) => `λ${index + 1}`);

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

  const fallbackQuiz = {
    questions: [
      {
        question: "What does the number of zero eigenvalues of the Laplacian indicate?",
        options: [
          "The number of nodes",
          "The number of connected components",
          "The number of edges",
          "The number of eigenvectors",
        ],
        answer: "The number of connected components",
        explanation:
          "For the graph Laplacian, the multiplicity of eigenvalue 0 equals the number of connected components.",
      },
      {
        question: "What is the graph Laplacian?",
        options: ["A + D", "D - A", "A - D", "A × D"],
        answer: "D - A",
        explanation:
          "The Laplacian matrix is defined as the degree matrix minus the adjacency matrix.",
      },
      {
        question: "What does a zero on the off-diagonal of the Laplacian indicate?",
        options: [
          "The two nodes are connected",
          "The two nodes are not connected",
          "The two nodes have the same degree",
          "The graph is disconnected",
        ],
        answer: "The two nodes are not connected",
        explanation:
          "Off-diagonal entries of the Laplacian are -1 if an edge exists between nodes i and j, and 0 otherwise.",
      },
      {
        question: "If a graph has 4 connected components, how many zero eigenvalues should its Laplacian have?",
        options: ["1", "2", "4", "8"],
        answer: "4",
        explanation:
          "The number of zero eigenvalues equals the number of connected components.",
      },
      {
        question: "As k increases in Lᵏ influence, what generally happens?",
        options: [
          "Influence reaches nodes further away",
          "The graph loses nodes",
          "The Laplacian becomes diagonal",
          "The number of clusters always increases",
        ],
        answer: "Influence reaches nodes further away",
        explanation:
          "Higher powers capture influence over longer paths in the graph.",
      },
    ],
  };

  useEffect(() => {
    if (activeStep !== "Quiz") return;
    if (quiz) return;
  
    const loadQuiz = async () => {
      try {
        setQuizLoading(true);
        setQuizError("");
  
        const graphSummary = `
        Nodes: ${nodes.map((n) => n.label).join(", ")}
        Edges: ${edges.map((e) => {
          const sourceNode = nodes.find((n) => n.id === e.source);
          const targetNode = nodes.find((n) => n.id === e.target);
          return `${sourceNode?.label}-${targetNode?.label}`;
        }).join(", ")}
        Connected components: ${clusterCount}
        Zero eigenvalues: ${zeroEigenvalueCount}
        Current source node for L^k influence: ${
          nodes.find((n) => n.id === influenceSource)?.label ?? "None"
        }
        Current k for L^k influence: ${influenceK}
        `.trim();
  
        const data = await generateQuiz(
          "Graph Spectral Clustering",
          graphSummary
        );
  
        setQuiz(data);
      } catch (error) {
        console.error(error);
        setQuiz(fallbackQuiz);
        setQuizError("Using fallback quiz.");
      } finally {
        setQuizLoading(false);
      }
    };
  
    loadQuiz();
  }, [
    activeStep,
    quiz,
    nodes.length,
    edges.length,
    clusterCount,
    zeroEigenvalueCount,
  ]);

  const totalQuestions = quiz?.questions?.length || 0;

  const score = quiz
    ? quiz.questions.reduce((acc, q, index) => {
        return selectedAnswers[index] === q.answer ? acc + 1 : acc;
      }, 0)
    : 0;

  const allAnswered =
  quiz &&
  quiz.questions.every((_, index) => selectedAnswers[index] !== undefined);

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
              <h3>Eigenvalue Matrix (Λ)</h3>
              <p>
                Λ is the diagonal matrix of eigenvalues. Zero diagonal entries
                indicate connected components.
              </p>
              <MatrixView
                matrix={lambdaMatrix}
                type="lambda"
                labels={lambdaLabels}
                rowLabels={lambdaLabels}
                highlightCols={zeroEigenIndices}
              />
            </div>

            <div className="content-card">
              <h3>Eigenvector Matrix (U)</h3>
              <p>
                Each column of U is an eigenvector. The highlighted columns corresponding to
                zero eigenvalues are the key columns used to identify clusters. Nodes that belong 
                to the same cluster will have the same values in these highlighted columns.
              </p>
              <MatrixView
                matrix={eigenvectors}
                type="spectral"
                labels={eigenvectorLabels}
                rowLabels={nodeLabels}
                highlightCols={zeroEigenIndices}
              />
              <p>
              <em>(May have slight variations due to numerical precision.)</em>
              </p>
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

        {activeStep === "Quiz" && (
          <div className="content-card">
            <p>
              💡 This quiz adapts to your graph. Modify the graph and regenerate quiz to explore new questions.
            </p>

            {quizLoading && <p>Generating quiz...</p>}

            {quizError && (
              <p>
                <em>{quizError}</em>
              </p>
            )}

            {!quizLoading &&
              quiz &&
              quiz.questions.map((q, qIndex) => (
                <div key={qIndex} className="quiz-question-card">
                  <p>
                    <strong>
                      {qIndex + 1}. {q.question}
                    </strong>
                  </p>

                  <div className="quiz-options">
                    {q.options.map((option) => {
                      const isSelected = selectedAnswers[qIndex] === option;
                      const isCorrect = showQuizResults && q.answer === option;
                      const isWrong =
                        showQuizResults && isSelected && q.answer !== option;

                      return (
                        <button
                          key={option}
                          className={`quiz-option-btn ${
                            isSelected ? "selected" : ""
                          } ${isCorrect ? "correct" : ""} ${
                            isWrong ? "wrong" : ""
                          }`}
                          onClick={() =>
                            setSelectedAnswers((prev) => ({
                              ...prev,
                              [qIndex]: option,
                            }))
                          }
                          disabled={showQuizResults}
                        >
                          {option}
                        </button>
                      );
                    })}
                  </div>

                  {showQuizResults && (
                    <p className="quiz-explanation">
                      <strong>Explanation:</strong> {q.explanation}
                    </p>
                  )}
                </div>
              ))}

            {showQuizResults && (
              <div className="quiz-score">
                <strong>Score: {score} / {totalQuestions}</strong>
              </div>
            )}

            {!quizLoading && quiz && (
              <div className="quiz-actions">
                <button
                  className="secondary-btn"
                  onClick={() => {
                    setQuiz(null);
                    setSelectedAnswers({});
                    setShowQuizResults(false);
                    setQuizError("");
                  }}
                >
                  Regenerate Quiz
                </button>
                
                <button
                  className="primary-btn"
                  onClick={() => {
                    if (!allAnswered) {
                      window.alert("Please answer all questions before checking your answers.");
                      return;
                    }
                    setShowQuizResults(true);
                  }}
                >
                  Check Answers
                </button>
              </div>
            )}
          </div>
        )}

<div className="nav-row">
          {STEPS.indexOf(activeStep) > 0 ? (
            <button
              className="secondary-btn"
              onClick={() => {
                const idx = STEPS.indexOf(activeStep);
                if (idx > 0) onChangeStep(STEPS[idx - 1]);
              }}
            >
              ← Previous
            </button>
          ) : (
            <div />
          )}

          {STEPS.indexOf(activeStep) < STEPS.length - 1 ? (
            <button
              className="primary-btn"
              onClick={() => {
                const idx = STEPS.indexOf(activeStep);
                if (idx < STEPS.length - 1) onChangeStep(STEPS[idx + 1]);
              }}
            >
              Next →
            </button>
          ) : null}
        </div>

      </div>
    </div>
  );
}