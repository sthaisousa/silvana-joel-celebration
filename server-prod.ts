import { existsSync } from "node:fs";
import { resolve, sep } from "node:path";

import app from "./dist/server/server.js";

const clientRoot = resolve(import.meta.dir, "dist/client");
const port = Number(process.env.PORT || 5000);

Bun.serve({
  hostname: "0.0.0.0",
  port,
  async fetch(request) {
    const url = new URL(request.url);
    const pathname = decodeURIComponent(url.pathname);
    const assetPath = resolve(clientRoot, `.${pathname}`);

    if (
      (assetPath === clientRoot || assetPath.startsWith(`${clientRoot}${sep}`)) &&
      existsSync(assetPath) &&
      pathname !== "/"
    ) {
      return new Response(Bun.file(assetPath));
    }

    return app.fetch(request, process.env, {});
  },
});

console.log(`Production server listening on port ${port}`);