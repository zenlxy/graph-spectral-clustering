import { STEPS } from "../lib/constants";

export default function StepProgress({ activeStep, onChangeStep }) {
  return (
    <div className="step-progress-light">
      {STEPS.map((step, index) => (
        <button
          key={step}
          className={`step-item ${activeStep === step ? "active" : ""}`}
          onClick={() => onChangeStep(step)}
        >
          <span className="step-circle">{index + 1}</span>
          <span>{step}</span>
        </button>
      ))}
    </div>
  );
}