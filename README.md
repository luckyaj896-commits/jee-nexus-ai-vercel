# JEE NEXUS AI — Vercel version

A responsive static JEE study dashboard with practice questions, study planning, mistake logging, syllabus tracking, and an AI tutor endpoint.

## Deploy on Vercel from GitHub

1. Push the contents of this folder to the root of your GitHub repository.
2. In Vercel, choose **Add New → Project**, import the `jee-nexus-ai` GitHub repository, and deploy.
3. Use **Other** / no framework preset. Leave the build command and output directory blank unless Vercel asks for values; this project is plain HTML/CSS/JS with Node.js API functions in `/api`.
4. After the first deployment, open **Project → Settings → Environment Variables** and add:
   - `AI_API_URL` — your provider's OpenAI-compatible chat-completions endpoint
   - `AI_API_KEY` — your secret API key (never put this in frontend files or GitHub)
   - `AI_MODEL` — the model identifier your provider gave you
5. Apply the variables to Production (and Preview if desired), save, then redeploy.
6. Visit `/api/health` on your deployed domain. It should return `{"ok":true,"configured":true}` when all three variables exist.

## Important

- The AI endpoint currently expects an OpenAI-compatible Chat Completions API. Some providers use different request/response formats; those require adapting `api/chat.js`.
- Hosting may be free within Vercel's current plan limits; API inference may cost money or have provider-specific free quotas.
- Practice questions and progress tracking are starter features, not a verified complete official JEE question bank or synced account database.
- Never commit `.env` files, API keys, passwords, or other secrets.
