from pathlib import Path
import shutil
from jinja2 import Environment, FileSystemLoader


def main():
    base_dir = Path(__file__).resolve().parent
    templates_dir = base_dir / "templates"
    dist_dir = base_dir / "dist"
    dist_dir.mkdir(exist_ok=True)

    env = Environment(loader=FileSystemLoader(str(templates_dir)), autoescape=True)
    template = env.get_template("waitlist.html")

    bg_icon = "bg-icon.png"

    context = {
        "first_name": "Alicia",
        "cta_text": "Visit Website",
        "cta_url": "http://localhost:3000",
        "hero_image": "email-hero.png",
        "brand_logo": "logo.png",
        "bg_icon": bg_icon,
        "preheader_text": "Thanks for joining the Legal WatchDog waitlist. You're now in line for early access.",
        "current_year": "2025",
        "social_icons": [
          {"url": "https://facebook.com", "src": "Facebook.svg", "alt": "Facebook", "width": 11, "height": 19},
          {"url": "https://twitter.com", "src": "Twitter.svg", "alt": "Twitter", "width": 18, "height": 15},
          {"url": "https://instagram.com", "src": "Instagram.svg", "alt": "Instagram", "width": 19, "height": 19},
          {"url": "https://linkedin.com", "src": "LinkedIn.svg", "alt": "LinkedIn", "width": 19, "height": 18},
          {"url": "https://youtube.com", "src": "YouTube.svg", "alt": "YouTube", "width": 20, "height": 14},
        ],
    }

    hero_image = context["hero_image"]
    brand_logo = context["brand_logo"]

    rendered_html = template.render(context)

    output_path = dist_dir / "index.html"
    output_path.write_text(rendered_html, encoding="utf-8")

    assets_to_copy = {hero_image, brand_logo}
    if bg_icon:
        assets_to_copy.add(bg_icon)
    for icon in context.get("social_icons", []):
        src = icon.get("src")
        if src:
            assets_to_copy.add(src)

    for asset in assets_to_copy:
        asset_path = base_dir / asset
        if asset_path.exists():
            shutil.copy2(asset_path, dist_dir / asset)

    print(f"Rendered to {output_path} (assets copied to {dist_dir})")


if __name__ == "__main__":
    main()
