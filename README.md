# Frontend — The Great India News

Upload this **`client`** folder separately to host the React website (Netlify, Vercel, cPanel, etc.).

## Quick Start (Local)

1. Double-click **`start.bat`**  
   Or run:
   ```powershell
   cd client
   npm.cmd install
   npm.cmd run dev
   ```

2. Open http://localhost:5173

**Backend must be running separately** on port 5000.

## Environment Variables

Create `.env` from `.env.example`:

```env
# Local dev — leave empty (Vite proxy uses localhost:5000)
VITE_API_URL=

# Production — your deployed backend URL
# VITE_API_URL=https://your-api-domain.com
```

## Production Build

```powershell
npm.cmd install
npm.cmd run build
```

Upload the **`dist/`** folder to your web host.

Before building for production, set `VITE_API_URL` to your live backend URL.

## Deploy To

- **Netlify / Vercel** — connect repo or upload `dist/`
- **cPanel** — upload `dist/` contents to `public_html`
- **Any static host** — serve the `dist/` folder

## Folder Contents

```
client/
├── src/           React components & pages
├── public/        Static assets
├── start.bat      Windows starter
├── package.json
└── .env           API configuration
```
