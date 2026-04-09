export default function MatrixView({
  matrix,
  type = "default",
  labels = [],
  selectedRowIndex = -1,
  selectedRowColor = "#ddd6fe",
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
  
    if (abs === 0) return "0";
    if (abs >= 1000) return value.toExponential(2);
    if (abs >= 100) return Math.round(value).toString();
    return Number(value.toFixed(2)).toString();
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
                  style={getCellStyle(value, rowIndex, colIndex)}
                >
                  <span className="matrix-cell-text" data-full-value={value}>
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