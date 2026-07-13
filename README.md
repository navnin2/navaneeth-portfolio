# Navaneeth's Portfolio + Free Chatbot

A single-page terminal-themed portfolio with a built-in Q&A chatbot. The
chatbot uses the "stuffed context" approach — the resume is embedded directly
in the system prompt, so no vector database is needed (LangChain/Chroma/Pinecone
would be overkill for a one-page knowledge base).

## What's in this folder

```
portfolio-chatbot/
├── index.html        ← the portfolio site + chat widget UI
├── api/
│   └── chat.js        ← serverless function that answers questions (Vercel format)
├── package.json
└── README.md
```

## Cost

**$0/month** at normal portfolio traffic:
- Vercel Hobby plan (hosting + serverless functions): free
- Groq API (LLM inference): free tier, no credit card required

## Step-by-step deployment (5–10 minutes)

### 1. Get a free Groq API key
1. Go to https://console.groq.com and sign up (free)
2. Go to **API Keys** → **Create API Key**
3. Copy the key — you'll need it in step 4

### 2. Push this folder to GitHub
1. Create a new GitHub repo, e.g. `navaneeth-portfolio`
2. Upload all files in this folder, **keeping the folder structure** —
   `api/chat.js` must stay inside an `api` folder for Vercel to detect it as
   a serverless function

### 3. Deploy on Vercel
1. Go to https://vercel.com → sign up free (you can sign in with GitHub)
2. Click **Add New → Project**
3. Import your `navaneeth-portfolio` repo
4. Leave build settings as default (no framework — static + functions is
   auto-detected) → click **Deploy**

### 4. Add your Groq API key as an environment variable
1. In your Vercel project → **Settings → Environment Variables**
2. Add:
   - Name: `GROQ_API_KEY`
   - Value: *(paste the key from step 1)*
3. Click **Save**, then go to **Deployments** → click the ⋯ menu on the
   latest deployment → **Redeploy** (env vars only apply after a redeploy)

### 5. Test it
Visit your live Vercel URL (e.g. `navaneeth-portfolio.vercel.app`), click the
chat bubble in the bottom-right corner, and ask something like:

> "What backend frameworks does he know?"
> "Tell me about the whipflip.com project"

## Notes

- **Why Vercel instead of GitHub Pages/Netlify for this part?** GitHub Pages
  only serves static files — it can't run the `api/chat.js` function that
  keeps your API key secret. Vercel's free tier runs both the static site
  and the serverless function together. (Netlify also supports serverless
  functions for free, if you'd rather stay there — same idea, function goes
  in a `netlify/functions/` folder instead of `api/`.)
- **Updating the resume info the bot knows:** edit the `RESUME_CONTEXT`
  string at the top of `api/chat.js`, commit, and Vercel will auto-redeploy.
- **Model used:** `llama-3.1-8b-instant` on Groq — fast and free. You can
  swap the `model` field in `chat.js` for any other Groq-hosted model.
- **Growing beyond one page:** if you later add a blog, project write-ups,
  etc., that's when a real LangChain + vector-store RAG pipeline starts to
  pay off — happy to build that version when you're there.
