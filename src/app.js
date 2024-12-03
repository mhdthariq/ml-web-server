const Hapi = require("@hapi/hapi");
const { loadModel, predict } = require("./inference");

(async () => {
  // Load the model
  const model = await loadModel();
  console.log("Model loaded!");

  // Create a server with a host and port
  const server = Hapi.server({
    host: process.env.NODE_ENV !== "production" ? "localhost" : "0.0.0.0",
    port: 3000,
  });

  server.route({
    method: "POST",
    path: "/predicts",
    handler: async (request) => {
      // Get the image uploaded by the user
      const { image } = request.payload;
      // Predict the image
      const predictions = await predict(model, image);
      // Return the predictions
      const { paper, rock } = predictions;

      if (paper) {
        return { result: "paper" };
      }

      if (rock) {
        return { result: "rock" };
      }

      return { result: "scissors" };
    },
    // Make request payload as multipart form data to accept image
    options: {
      payload: {
        allow: "multipart/form-data",
        multipart: true,
      },
    },
  });

  // Start the server
  await server.start();
  console.log("Server running on %s", server.info.uri);
})();
