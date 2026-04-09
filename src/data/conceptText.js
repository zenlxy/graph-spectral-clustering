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
      body: "This step decomposes the Laplacian matrix into UΛUᵀ to reveal cluster structure in the graph.",
      bullets: [
        "Λ is the diagonal matrix of eigenvalues.",
        "Zero eigenvalues indicate the number of connected components.",
        "U contains the eigenvectors of the Laplacian.",
        "Nodes with the same row pattern in the selected eigenvector columns belong to the same cluster.",
      ],
      showTryCard: false,
    },
  
    "Lᵏ Influence": {
      title: "Lᵏ Influence Explorer",
      body: "Select a node to see how its influence spreads through the graph as k increases.",
      bullets: [
        "L reflects how each node is connected to its neighbours.",
        "Raising L to higher powers (L², L³, ...) captures influence over longer paths — nodes up to k steps away in the graph.",
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