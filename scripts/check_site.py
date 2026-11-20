"""Validate generated page metadata, crawlable links, assets and sitemap coverage."""
from pathlib import Path
from urllib.parse import urlsplit,unquote
from lxml import html,etree
import json
ROOT=Path(__file__).resolve().parents[1]
BASE='/'
ORIGIN='https://haseebcrafts.com'
ns={'s':'http://www.sitemaps.org/schemas/sitemap/0.9'}
urls=etree.parse(str(ROOT/'sitemap.xml')).xpath('//s:loc/text()',namespaces=ns)
assert len(urls)==22 and len(set(urls))==22
seen_titles=set();seen_desc=set()
for url in urls:
 path=urlsplit(url).path
 file=ROOT/path.removeprefix(BASE)/'index.html'
 doc=html.document_fromstring(file.read_text())
 assert len(doc.xpath('//h1'))==1, file
 assert len(doc.xpath('//main/section[@data-route]'))==1, file
 assert not doc.xpath('//main/section[@hidden]'),file
 title=doc.xpath('//title/text()')[0];desc=doc.xpath('//meta[@name="description"]/@content')[0]
 assert title not in seen_titles and desc not in seen_desc,file
 seen_titles.add(title);seen_desc.add(desc)
 assert doc.xpath('//link[@rel="canonical"]/@href')==[url],file
 assert 'noindex' not in doc.xpath('//meta[@name="robots"]/@content')[0],file
 assert doc.xpath('//meta[@name="google-site-verification"]/@content')==(['952w3cYsItd12V8_mYMvQMhhqZai5DPtdN3kej0U_p8','6IWPdVt60qoQVswOCe10SlZ5-73Gxx38-ITdLqA_aOk'] if path==BASE else ['952w3cYsItd12V8_mYMvQMhhqZai5DPtdN3kej0U_p8']),file
 assert doc.xpath('//meta[@property="og:url"]/@content')==[url],file
 for sc in doc.xpath('//script[@type="application/ld+json"]'):json.loads(sc.text)
 for el in doc.xpath('//*[@src or @href]'):
  for key in ['src','href']:
   link=el.get(key,'');p=urlsplit(link).path
   assert not link.startswith('#/'),(file,link)
   if p.startswith(BASE) and (not urlsplit(link).netloc or urlsplit(link).netloc == urlsplit(ORIGIN).netloc):
    target=ROOT/unquote(p.removeprefix(BASE));target=target/'index.html' if p.endswith('/') else target
    assert target.exists(),(file,link)
 assert not doc.xpath('//img[not(@alt)]'),file
nf=html.document_fromstring((ROOT/'404.html').read_text())
assert 'noindex' in nf.xpath('//meta[@name="robots"]/@content')[0]
print(f'PASS: {len(urls)} crawlable pages; unique metadata; canonical, schema, verification, internal links and image assets valid.')
