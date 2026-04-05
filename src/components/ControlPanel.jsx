import { presetThreeClusters, presetBridgeGraph } from "../lib/presets";

export default function ControlPanel({ setGraph }) {
  return (
    <div className="controls">
      <button onClick={() => setGraph(presetThreeClusters())}>
        Load 3 Clusters Preset
      </button>

      <button onClick={() => setGraph(presetBridgeGraph())}>
        Load Bridge Preset
      </button>

      <button onClick={() => setGraph({ nodes: [], edges: [] })}>
        Clear Graph
      </button>
    </div>
  );
}