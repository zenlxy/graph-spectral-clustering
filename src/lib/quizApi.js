export async function generateQuiz(topic, graphSummary) {
    const response = await fetch("http://localhost:3001/api/generate-quiz", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ topic, graphSummary }),
    });
  
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || "Failed to generate quiz");
    }
  
    return response.json();
  }