import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider } from "@tanstack/react-router";

import { router } from "./app/router";
import { AppProviders } from "./app/providers";
import "./styles.css";

async function bootstrap() {
  if (import.meta.env.VITE_ENABLE_MOCKS === "true") {
    const { worker } = await import("./mocks/browser");

    await worker.start({
      serviceWorker: {
        url: "/mockServiceWorker.js",
      },
    });
  }

  ReactDOM.createRoot(document.getElementById("root")!).render(
    <React.StrictMode>
      <AppProviders>
        <RouterProvider router={router} />
      </AppProviders>
    </React.StrictMode>,
  );
}

bootstrap().catch((error) => {
  console.error("Erro ao inicializar a aplicação:", error);
});
