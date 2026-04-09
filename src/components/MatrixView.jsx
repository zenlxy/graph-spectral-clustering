export default function MatrixView({
  matrix,
  type = "default",
  labels = [],
  rowLabels = null,
  selectedRowIndex = -1,
  selectedRowColor = "#ddd6fe",
  highlightCols = [],
}) {

  if (!matrix || matrix.length === 0) {
    return <p className="empty-text">No matrix available yet.</p>;
  }

  const displayColLabels = labels.map((label) => String(label));
  const displayRowLabels = (rowLabels ?? labels).map((label) => String(label));

  const isHighlightedCol = (colIndex) => highlightCols.includes(colIndex);

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
  
    if (type === "influence") {
      const isSelectedRow = rowIndex === selectedRowIndex;
      const isActive = Math.abs(value) > 1e-10;
  
      if (isSelectedRow && isActive) {
        return "matrix-cell matrix-cell-influence-active";
      }
  
      if (isSelectedRow) {
        return "matrix-cell matrix-cell-influence-row";
      }
  
      return "matrix-cell";
    }

    if (type === "lambda") {
      const isDiagonal = rowIndex === colIndex;
      const isNearZero = Math.abs(value) < 1e-6;
    
      if (isDiagonal && isNearZero) {
        return "matrix-cell matrix-cell-spectral-highlight";
      }
    
      return "matrix-cell";
    }
  
    return "matrix-cell";
  };

  const getCellStyle = (value, rowIndex) => {
    if (type !== "influence" || rowIndex !== selectedRowIndex) return {};
  
    const isActive = Math.abs(value) > 1e-10;
  
    return {
      backgroundColor: isActive ? selectedRowColor : `${selectedRowColor}33`,
      fontWeight: isActive ? 700 : 500,
    };
  };

  const formatValue = (value) => {
    if (typeof value !== "number") return value;
  
    const abs = Math.abs(value);
  
    if (abs < 1e-10) return "0"; 
    if (abs >= 1000) return value.toExponential(2);
  
    return value.toFixed(4);
  };

  return (
    <div className="matrix-wrapper">
      <table className="matrix-table">
        <thead>
          <tr>
            <th className="matrix-corner-cell"></th>
            {displayColLabels.map((label, colIndex) => (
              <th
                key={`col-${colIndex}`}
                className={`matrix-header-cell ${
                  type === "spectral" && isHighlightedCol(colIndex) ? "highlighted-col" : ""
                }`}
              >
                {label}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {matrix.map((row, rowIndex) => (
            <tr key={rowIndex}>
              <th className="matrix-index-cell">{displayRowLabels[rowIndex]}</th>
              {row.map((value, colIndex) => (
                <td
                  key={`${rowIndex}-${colIndex}`}
                  className={`${getCellClass(value, rowIndex, colIndex)} ${
                    type === "spectral" && isHighlightedCol(colIndex)
                      ? "matrix-cell-spectral-highlight"
                      : ""
                  }`}
                  style={getCellStyle(value, rowIndex, colIndex)}
                >
                  <span className="matrix-cell-text" data-full-value={formatValue(value)}>
                    {formatValue(value)}
                  </span>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}