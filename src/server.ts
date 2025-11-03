import { buildApp } from "./app.js";
import { config } from "./config/index.js";

async function start() {
  try {
    const app = await buildApp();

    await app.listen({
      host: config.server.host,
      port: config.server.port,
    });

    app.log.info(`Server listening on ${config.server.host}:${config.server.port}`);

    if (config.swagger.enabled) {
      app.log.info(`Swagger documentation available at http://localhost:${config.server.port}/docs`);
    }
  } catch (err) {
    console.error("Error starting server:", err);
    process.exit(1);
  }
}

start();
