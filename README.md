# Cloudflare Workers Full-Stack Template

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/azadi-gh/prism-gateway-minimalist-web-proxy)

A production-ready full-stack starter template for Cloudflare Workers, featuring a React frontend with Tailwind CSS & shadcn/ui, Hono backend API, and Durable Objects for stateful storage. Deploy instantly to Cloudflare's global edge network.

## ✨ Features

- **Full-Stack**: React 18 + Vite frontend with SSR/SSG support via Cloudflare assets
- **Type-Safe API**: Hono router with end-to-end TypeScript types shared between client/server
- **Stateful Storage**: Cloudflare Durable Objects with SQLite persistence for counters, lists, and custom data
- **Modern UI**: shadcn/ui components, Tailwind CSS, dark mode, responsive design
- **Developer Experience**: Hot reload, TanStack Query, React Router, error boundaries
- **Production-Ready**: CORS, logging, health checks, client error reporting
- **Zero Config Deployment**: Single command deploy to Cloudflare Workers

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, shadcn/ui, Lucide icons, TanStack Query, React Router, Sonner toasts
- **Backend**: Hono 4.x, Cloudflare Workers, Durable Objects
- **State**: Cloudflare Durable Objects (SQLite-backed)
- **Styling**: Tailwind CSS (New York style), CSS animations, CSS variables
- **Tools**: Bun (package manager), Wrangler CLI, ESLint, TypeScript 5.x

## 🚀 Quick Start

### Prerequisites

- [Bun](https://bun.sh/) installed (`curl -fsSL https://bun.sh/install | bash`)
- [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/install-and-update/) (`bunx wrangler@latest init` or `npm i -g wrangler`)

### Installation

1. Clone or download the repository
2. Install dependencies:
   ```bash
   bun install
   ```
3. Generate Worker types:
   ```bash
   bun run cf-typegen
   ```

### Development

- Start the dev server (frontend + Worker proxy):
  ```bash
  bun dev
  ```
  Open [http://localhost:3000](http://localhost:3000)

- Lint code:
  ```bash
  bun lint
  ```

### Build for Production

```bash
bun run build
```

Assets are built to `dist/` and Worker to `worker/`.

## 📖 Usage

### Frontend

- Replace `src/pages/HomePage.tsx` with your app UI
- Add routes to `src/main.tsx` via React Router
- Use `AppLayout` for sidebar layouts
- API calls via TanStack Query (fully typed via shared types)

### Backend API

Customize routes in `worker/userRoutes.ts` (do **not** edit `worker/index.ts`).

**Demo Endpoints** (powered by Durable Object):

```bash
# GET counter value
curl http://localhost:3000/api/counter

# POST increment counter
curl -X POST http://localhost:3000/api/counter/increment

# GET demo items
curl http://localhost:3000/api/demo

# POST new demo item
curl -X POST http://localhost:3000/api/demo \
  -H "Content-Type: application/json" \
  -d '{"name": "New Item", "value": 123}'
```

Shared types in `shared/types.ts` ensure type safety.

### Client Error Reporting

Errors from the frontend are automatically reported to `/api/client-errors`.

## ☁️ Deployment

1. Login to Cloudflare:
   ```bash
   wrangler login
   ```

2. Deploy (builds assets + Worker):
   ```bash
   bun run deploy
   ```

3. Or use the button:

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/azadi-gh/prism-gateway-minimalist-web-proxy)

Your app will be live at `https://${wrangler.jsonc:name}.${your-subdomain}.workers.dev`.

### Custom Domain

```bash
wrangler deploy --vars ASSETS_URL:https://your-pages-project.pages.dev
```

## 🤝 Contributing

1. Fork the repo
2. Create a feature branch (`bun dev`)
3. Commit changes (`bun lint`)
4. Open a Pull Request

## 📄 License

MIT License - see [LICENSE](LICENSE) for details.

---

⭐ &nbsp; Star to support the template! Questions? [Cloudflare Workers Docs](https://developers.cloudflare.com/workers/)