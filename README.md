# Haseeb Crafts

## Explore Haseeb Crafts

- [Haseeb Crafts official website](https://haseebcrafts.com/) — Abdul Haseeb's web development and creative studio.
- [Haseeb Crafts website development services](https://haseebcrafts.com/services/website-development/)
- [WordPress and Elementor services](https://haseebcrafts.com/services/wordpress-elementor/)
- [Live website portfolio](https://haseebcrafts.com/work/)
- [Motion graphics and video editing](https://haseebcrafts.com/motion/)
- [Contact Haseeb Crafts](https://haseebcrafts.com/contact/)

Live site: https://haseebcrafts.com/

The site is published as 22 static, independently crawlable pages. Existing `#/…` links redirect to their corresponding real URLs. The Google Search Console verification token is preserved on every generated page.

## Editing and building

- Edit page content in `source/site.html` and shared presentation in `assets/site.css` / `assets/site.js`.
- Edit SEO titles, descriptions, canonical origin or deployment prefix in `scripts/build_site.py`.
- Install Python dependency: `python -m pip install lxml`.
- Run `python scripts/build_site.py`, then `python scripts/check_site.py`.
- Commit the source **and generated HTML**. GitHub Pages serves the files directly; there is no server-side application.
- Optional videos can be added to `videos/` as documented in `assets/site.js`. No missing video is represented as an existing published video.

## Google Search Console

After deployment, select the URL-prefix property `https://haseebcrafts.com/`, verify with the existing HTML meta tag, then submit:

https://haseebcrafts.com/sitemap.xml

Use URL Inspection on the homepage and main services pages to request indexing. Adding the verification tag does not itself submit the sitemap or request indexing.

`robots.txt` must be served at the host root (`https://haseeb77758.github.io/robots.txt`). A file inside this project directory would not control crawlers, so this repository does not pretend to configure host-wide crawling. No indexing or ranking guarantee is implied.

Portfolio entries retain their existing concept-study labels. Structured data uses the real contact details from the website, without invented ratings, client results or business addresses.
