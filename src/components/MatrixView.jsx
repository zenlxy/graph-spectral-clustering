export default function MatrixView({
  matrix,
  type = "default",
  labels = [],
}) {
  if (!matrix || matrix.length === 0) {
    return <p className="empty-text">No matrix available yet.</p>;
  }

  const getCellClass = (value, rowIndex, colIndex) => {
    const isDiagonal = rowIndex === colIndex;

    if (type === "adjacency") {
      if (value === 1) return "matrix-cell matrix-cell-adjacency-active";
      return "matrix-cell";
    }

    if (type === "degree") {
      if (isDiagonal && value > 0) return "matrix-cell matrix-cell-degree-active";
      return "matrix-cell";
    }

    if (type === "laplacian") {
      if (isDiagonal && value > 0) {
        return "matrix-cell matrix-cell-laplacian-diagonal";
      }
      if (!isDiagonal && value < 0) {
        return "matrix-cell matrix-cell-laplacian-negative";
      }
      return "matrix-cell";
    }

    return "matrix-cell";
  };

  return (
    <div className="matrix-wrapper">
      <table className="matrix-table">
        <thead>
          <tr>
            <th className="matrix-index-cell"></th>
            {labels.map((label, colIndex) => (
              <th key={`col-${colIndex}`} className="matrix-index-cell">
                {label}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {matrix.map((row, rowIndex) => (
            <tr key={rowIndex}>
              <th className="matrix-index-cell">{labels[rowIndex]}</th>
              {row.map((value, colIndex) => (
                <td
                  key={`${rowIndex}-${colIndex}`}
                  className={getCellClass(value, rowIndex, colIndex)}
                >
                  {value}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}