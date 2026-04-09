import { createElement } from "react";
import { MousePointer, Plus, Link, Trash2, RotateCcw } from "lucide-react";

export default function ControlToolbar({
  toolMode,
  onSetTool,
  onLoadPreset,
  onReset,
}) {
  const toolButtons = [
    { key: "select", icon: MousePointer, label: "Select / Drag Nodes" },
    { key: "add-node", icon: Plus, label: "Add Node" },
    { key: "add-edge", icon: Link, label: "Add Edge" },
    { key: "delete", icon: Trash2, label: "Delete" },
  ];

  return (
    <div className="toolbar-light">
      <div className="toolbar-group">
        {toolButtons.map(({ key, icon, label }) => (
          <button
            key={key}
            title={label}
            aria-label={label}
            className={`toolbar-icon-btn ${toolMode === key ? "active" : ""}`}
            onClick={() => onSetTool(key)}
          >
            {createElement(icon, { size: 22 })}
          </button>
        ))}

        <button
          title="Clear Graph"
          aria-label="Clear Graph"
          className="toolbar-icon-btn"
          onClick={() => {
            const confirmed = window.confirm(
              "Are you sure you want to clear the entire graph?"
            );
            if (confirmed) {
              onReset();
            }
          }}
        >
          <RotateCcw size={22} />
        </button>
      </div>

      <div className="toolbar-divider" />

      <div className="toolbar-group">
        <span className="toolbar-label">Presets:</span>

        <button className="toolbar-chip" onClick={() => onLoadPreset("circle")}>
          Circle
        </button>

        <button className="toolbar-chip" onClick={() => onLoadPreset("cluster-chain")}>
          Cluster Chain
        </button>

        <button className="toolbar-chip" onClick={() => onLoadPreset("path")}>
          Path
        </button>

        <button className="toolbar-chip" onClick={() => onLoadPreset("snowflake")}>
          Snowflake
        </button>

        <button className="toolbar-chip" onClick={() => onLoadPreset("four-clusters")}>
          Four Clusters
        </button>

      </div>
    </div>
  );
}