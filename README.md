# YR Language Services website

This is a small, dependency-free Node.js app that serves the responsive static website. GoDaddy Node.js Hosting expects `package.json` at the repository root and uses its `build` and `start` scripts. The app listens on the port GoDaddy supplies through `PORT`.

## Connect this repository to GoDaddy Node.js Hosting

1. Push this repository to GitHub. The GoDaddy site source files and `package.json` must be at the repository root.
2. In GoDaddy, create a **Node.js** app and choose the option to connect a GitHub repository. Select this repository and the branch you want GoDaddy to use (`master` in this workspace).
3. Let GoDaddy create a private preview. Review the page and build/start logs there before publishing.
4. When the preview looks right, publish the app and attach your domain. GoDaddy says published Node.js apps receive HTTPS automatically. Publishing requires a GoDaddy Web Hosting plan with an available app slot.
5. For later changes, push to GitHub, pull the selected branch into the GoDaddy preview if prompted, check the preview, then publish the update.

GoDaddy's GitHub integration behavior can vary by dashboard flow: a connected branch may be pulled for preview, while the Hosting CLI documentation describes pulling a branch and publishing as separate steps. Check the dashboard's current status after each push rather than assuming a commit is live immediately.

## Security choices

- The Node server uses only Node's built-in modules; the project has no runtime dependencies to keep updated.
- It serves an explicit list of public website files. It does not expose project files, directory listings, or a general filesystem path.
- It accepts only `GET` and `HEAD`, and sets a restrictive Content Security Policy plus other browser security headers.
- It does not collect, store, or upload visitor documents. The email link opens a draft on the visitor's device; configure the business email address in `index.html` before launch if you want it pre-addressed.
- GoDaddy provides HTTPS for published apps. Do not put passwords, API keys, or `.env` files in the repository; GoDaddy's app secrets should be used for any future private configuration.

## Main files

- `index.html` — content and page structure
- `styles.css` — visual design and responsive layout
- `script.js` — mobile navigation and small interactions
- `server.js` — minimal static file server and response security headers
- `package.json` — GoDaddy's Node.js build and start commands
- `public/` — logo and local brand fonts
