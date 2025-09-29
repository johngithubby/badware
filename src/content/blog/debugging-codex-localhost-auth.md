---
title: 'Fixing a localhost auth callback issue with the Codex VS Code extension'
description: 'Safari blocked a localhost OAuth redirect (port 1455) for the Codex extension—here is how we diagnosed and solved it.'
pubDate: 'Sep 28 2025'
# Chose a different placeholder image that better contrasts with terminal-style code snippets.
heroImage: '../../assets/blog-placeholder-1.jpg'
---

> TL;DR: The Codex extension’s sign‑in stalled because Safari blocked the `http://localhost:1455/auth/callback` redirect. Manually following the redirect (curl with `-L`) completed the flow.

## Background
I was signing into the **Codex – OpenAI’s coding agent** VS Code extension (v0.4.15). After authenticating in the browser, Safari tried to load:

```
http://localhost:1455/auth/callback?code=...&scope=openid+profile+email+offline_access&state=...
```

Safari instead showed an error: it refused to open the page (an HTTP localhost callback) and never hit the local server in a normal way. The extension sat at “Waiting for sign in…”.

## Symptoms
- Browser (Safari) error page instead of a success/close window.
- Extension remained in a pending auth state.
- `lsof -iTCP:1455 -sTCP:LISTEN` showed a listening `codex` process.
- Manually curling the callback URL (without following redirects) returned `302 Found` with a `Location: /success?id_token=...` header, but still no completion inside VS Code.

## Root Cause
Codex spins up a tiny local HTTP server (port 1455). The OAuth provider redirects back with `code` + `state`. The server responds with a **302** to `/success` carrying an `id_token` in the query so its success page (normally loaded in the browser) can finalize the handshake.

Because Safari blocked the initial navigation (HTTPS‑first / localhost HTTP handling quirk), the `/success` page *never loaded*. My first `curl` only requested `/auth/callback` and stopped—so Codex never reached its finalization step that happens when `/success` is fetched.

## Investigation Steps
1. Confirmed the server was listening:
   ```bash
   lsof -iTCP:1455 -sTCP:LISTEN
   ```
2. Replayed the callback manually:
   ```bash
   curl -v 'http://127.0.0.1:1455/auth/callback?code=...&state=...'
   ```
   Saw `HTTP/1.1 302 Found` → indicates the auth code was accepted.
3. Noticed VS Code still waiting → suspected missing follow‑up request.
4. Re‑ran with redirect following:
   ```bash
   curl -v -L 'http://127.0.0.1:1455/auth/callback?code=...&state=...'
   ```
   This fetched `/success` → extension immediately showed as signed in.

## The Fix
Follow the redirect so the `/success` endpoint is actually requested. Two easy ways:

```bash
# Option A: Use curl and follow redirects
curl -L 'http://127.0.0.1:1455/auth/callback?code=...&scope=openid+profile+email+offline_access&state=...'

# Option B: Open the callback (or the redirected /success URL) in a browser
open -a "Google Chrome" 'http://127.0.0.1:1455/auth/callback?code=...&state=...'
```

Chrome/Firefox typically allow the localhost HTTP redirect, so the success page loads and the extension finalizes auth.

## Preventing a Repeat
- Temporarily set a different default browser (Chrome / Firefox) for tools that rely on localhost callbacks.
- If using curl, always wrap the full URL in quotes and include `-L` so query params (&) aren’t lost and redirects are followed.
- Extension authors could finalize on `/auth/callback` directly (after verifying `state`) to be more resilient when the follow‑up page is blocked.

## Checklist for Similar Localhost Auth Issues
- [ ] Is the local server listening? (`lsof` or `netstat`)
- [ ] Does hitting the callback URL return 302 or 200?
- [ ] Are you following redirects to any `/success` (or equivalent) page?
- [ ] Try 127.0.0.1 instead of localhost.
- [ ] Switch browsers or disable strict HTTPS‑only behavior temporarily.
- [ ] Look for state mismatches in extension/dev tools logs.

## Closing Thoughts
Local OAuth-ish flows often hinge on *two* requests: the initial code handoff and the success page load. If you only complete the first, the extension appears stuck. A single `curl -L` was the missing piece here.

If the Codex team surfaces a clearer message (“Received code; waiting for success page…”) or supports device code / manual token fallback inline, this class of friction largely disappears.

Happy debugging! If you run into a twist on this, feel free to adapt the checklist above.
