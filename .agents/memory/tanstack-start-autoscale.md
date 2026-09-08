---
name: TanStack Start no Autoscale
description: Decisão de runtime para publicar este app com PostgreSQL nativo do Replit.
---

Use o build Node do TanStack Start e um servidor Bun para publicar no Autoscale. Não use o adaptador Cloudflare/Wrangler enquanto o mural depender do driver PostgreSQL `pg`.

**Why:** O Worker abria a porta, mas a rota SSR ficava travada ao acessar PostgreSQL, causando falha contínua no health check de publicação. O build Node com servidor Bun respondeu HTTP 200 na rota raiz e nos assets.

**How to apply:** Ao mexer no build ou deployment, preserve o adaptador Cloudflare desativado e valide o comando de produção com a rota `/` antes de publicar.