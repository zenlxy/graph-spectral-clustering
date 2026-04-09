export const conceptText = {
    Basics: {
      title: "What is a Graph?",
      body: "A graph consists of nodes (vertices) connected by edges. They model relationships — social networks, road maps, molecular structures and more.",
      bullets: [
        "Select \"Add Node\" and click the canvas.",
        "Select \"Add Edge\" and click two nodes to connect them",
        "Select \"Delete\" to remove any nodes or edges.",
        "Or load a preset graph to get started quickly.",
      ],
      tryTitle: "Try it out",
      showTryCard: true,
    },
  
    Adjacency: {
      title: "Adjacency Matrix (A)",
      body: "The adjacency matrix records which pairs of nodes are connected. For an undirected graph, A is symmetric.",
      bullets: [
        "A[i][j] = 1 if node i and node j are connected.",
        "Otherwise, A[i][j] = 0.",
        "Each row tells you which nodes a node is directly connected to.",
      ],
      showTryCard: false,
    },
  
    Degree: {
      title: "Degree Matrix (D)",
      body: "The degree matrix is diagonal. Each diagonal entry tells you how many edges are attached to that node.",
      bullets: [
        "D[i][i] = degree of node i.",
        "All non-diagonal entries are zero.",
        "You can derive D by summing each row of A.",
      ],
      showTryCard: false,
    },
  
    Laplacian: {
      title: "Laplacian Matrix (L = D - A)",
      body: "The graph Laplacian combines connectivity and node degree, and it is the core matrix used in spectral clustering.",
      bullets: [
        "L = D - A.",
        "Diagonal values come from node degrees.",
        "Negative off-diagonal values indicate direct connections.",
      ],
      showTryCard: false,
    },
  
    Spectral: {
      title: "Spectral Clustering",
      body: "This step will use eigenvalues and eigenvectors of the Laplacian matrix to identify clusters in the graph.",
      bullets: [
        "Zero eigenvalues correspond to connected components.",
        "Eigenvectors contain cluster membership clues.",
        "This reveals graph structure through linear algebra.",
      ],
      showTryCard: false,
    },
  
    "Lᵏ Influence": {
      title: "Lᵏ Influence Explorer",
      body: "This step explores how the influence of a node expands across the graph as k increases.",
      bullets: [
        "L captures local structure.",
        "Higher powers like L² and L³ spread farther across the graph.",
        "This helps motivate graph convolution ideas.",
      ],
      showTryCard: false,
    },
  
    Quiz: {
      title: "Quiz",
      body: "Test your understanding of graphs, matrices, clustering, and influence.",
      bullets: [
        "What does A represent?",
        "Why is D diagonal?",
        "What does a zero eigenvalue indicate?",
      ],
      tryTitle: "Try it out",
      showTryCard: true,
    },
  };