## Legal WatchDog Email Templates

This folder hosts the Legal WatchDog transactional email system powered by Jinja2 templates.

### Structure
- `templates/base.html` – shared email layout (preheader, container, responsive styles).
- `templates/waitlist.html` – waitlist confirmation content that extends the base layout.
- `render.py` – Python helper that renders Jinja templates and exports HTML plus assets into `dist/`.
- `dist/` – output directory created by `render.py`. Contains `index.html` (rendered email) and copied assets.
- Image assets (`email-hero.png`, `logo.png`, `bg-icon.png`, social icons) – referenced from the template and shipped with the final HTML.

### Requirements
- Python 3.8+
- `jinja2` installed in your environment (`pip install Jinja2`)

### Rendering the Waitlist Email
1. Update the context in `render.py` if you need different personalization (recipient name, CTA, links, year, assets).
2. Run `python3 render.py` from the `email-templates` directory or project root.
3. Grab the generated HTML from `dist/index.html`. The script also copies all referenced images into `dist/` so you can zip and upload the folder to your ESP.

### Adding New Templates
1. Create a new file in `templates/` and extend `base.html`.
2. Override the necessary blocks (`title`, `header`, `content_body`, etc.).
3. Update `render.py` (or create a new renderer script) to point to the template and supply its context data.

### Notes
- Inline styles and table layouts are necessary for broad email client compatibility.
- Keep asset file names consistent; `render.py` copies whatever `hero_image`, `brand_logo`, `bg_icon`, and `social_icons[*].src` reference.
- If you introduce external fonts or remote images, ensure your ESP allows them or provide fallbacks.
