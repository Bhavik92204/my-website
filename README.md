# Student Portfolio (Static, No Build Tools)

This is a ready-to-use static portfolio you can open directly in VS Code and view in the browser. No installs required.

## Features
- Pages: Home, Projects, Project Detail, Skills, About, Resume, Contact
- Project data in JSON (easy to edit): `assets/data/projects.json`
- Clean responsive design with dark/light theme toggle
- Simple JS for dynamic project rendering and filtering

## Run Locally
1. Open this folder in VS Code.
2. Install the Live Server extension (Ritwick Dey) if not already installed.
3. Right-click `index.html` and choose “Open with Live Server”.
   - Or simply open `index.html` in your browser (some features like fetch may require Live Server due to CORS).

## Customize
- Replace "Your Name" and contact links in the HTML files (`index.html`, `about.html`, `resume.html`).
- Add your resume PDF at `assets/Resume.pdf` and update email/Formspree in `contact.html`.
- Edit `assets/data/projects.json` to include your real projects: update `links.github`, `links.demo`, `tech`, `features`, etc.
- Add screenshots to `assets/img/` and reference them from `projects.json`.

## Project JSON shape
```json
{
  "id": "issue-tracker",
  "title": "Issue Tracker",
  "summary": "Full‑stack bug tracker with auth, labels, and search.",
  "description": "…",
  "tech": ["React", "Node", "PostgreSQL", "Docker", "JWT"],
  "tags": ["fullstack", "api"],
  "skills": ["REST", "DB design"],
  "features": ["JWT auth", "CRUD"],
  "links": {"github": "https://github.com/yourhandle/issue-tracker", "demo": ""},
  "images": ["issue-1.png"],
  "featured": true
}
```

## Deploy
- GitHub Pages: push this folder to a repo and enable Pages (root).
- Netlify/Vercel: drag-and-drop the folder or connect repo; build command not required.

## License
MIT – personalize and ship.