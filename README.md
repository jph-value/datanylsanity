## Datanyl website

AI-native analytics that answers business questions. Ask in plain English. Datanyl turns data across your warehouse and tools into accurate answers, root-cause analysis, and next best actions.

### Tech
- Next.js 15 (App Router)
- React 19
- Tailwind CSS v4
- TypeScript

### Scripts
- `npm run dev` — start local dev at http://localhost:3000
- `npm run build` — production build
- `npm start` — run production server
- `npm run lint` — lint

### Waitlist storage (dev only)
The waitlist API writes submissions to `data/waitlist.json` on the local filesystem for ease of testing. In production, swap for a persistent store (Postgres, PlanetScale, DynamoDB) or a form backend.

### Deployment
- Vercel: import the `web` directory as the project root.
- Self-host: `npm run build` then `npm start` behind a reverse proxy.

### Customization
- SEO: edit `src/app/layout.tsx` metadata; add an OG image under `public/`.
- Copy/sections: edit `src/app/page.tsx`.

### License
Proprietary. All rights reserved.
