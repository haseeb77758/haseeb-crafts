# Haseeb Crafts

Live site: https://haseeb77758.github.io/haseeb-crafts/

The site is published as 22 static, independently crawlable pages. Existing `#/…` links redirect to their corresponding real URLs. The Google Search Console verification token is preserved on every generated page.

## Editing and building

- Edit page content in `source/site.html` and shared presentation in `assets/site.css` / `assets/site.js`.
- Edit SEO titles, descriptions, canonical origin or deployment prefix in `scripts/build_site.py`.
- Install Python dependency: `python -m pip install lxml`.
- Run `python scripts/build_site.py`, then `python scripts/check_site.py`.
- Commit the source **and generated HTML**. GitHub Pages serves the files directly; there is no server-side application.
- Optional videos can be added to `videos/` as documented in `assets/site.js`. No missing video is represented as an existing published video.

## Google Search Console

After deployment, select the URL-prefix property `https://haseeb77758.github.io/haseeb-crafts/`, verify with the existing HTML meta tag, then submit:

https://haseeb77758.github.io/haseeb-crafts/sitemap.xml

Use URL Inspection on the homepage and main services pages to request indexing. Adding the verification tag does not itself submit the sitemap or request indexing.

`robots.txt` must be served at the host root (`https://haseeb77758.github.io/robots.txt`). A file inside this project directory would not control crawlers, so this repository does not pretend to configure host-wide crawling. No indexing or ranking guarantee is implied.

Portfolio entries retain their existing concept-study labels. Structured data uses the real contact details from the website, without invented ratings, client results or business addresses.
