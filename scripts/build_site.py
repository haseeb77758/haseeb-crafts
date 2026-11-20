"""Build crawlable GitHub Pages documents from source/site.html.
Run: python -m pip install lxml && python scripts/build_site.py
"""
from pathlib import Path
from copy import deepcopy
from lxml import html, etree
import json

ROOT=Path(__file__).resolve().parents[1]
BASE='/'
URL='https://haseebcrafts.com'+BASE
VERIFY='952w3cYsItd12V8_mYMvQMhhqZai5DPtdN3kej0U_p8'
META={
 '/':('Haseeb Crafts | Abdul Haseeb — Web Design & Creative Studio','Haseeb Crafts is Abdul Haseeb\'s creative studio in Pakistan for website development, WordPress, web apps, motion graphics, video editing and digital branding.'),
 '/about/':('About Abdul Haseeb | Haseeb Crafts Creative Studio','Meet Abdul Haseeb, the creator behind Haseeb Crafts. Explore his approach to websites, motion graphics, video editing, branding and digital tools.'),
 '/services/':('Web, Motion & Design Services | Haseeb Crafts','Explore Haseeb Crafts services: websites, WordPress, motion graphics, video editing, branding, social media design, apps, AI tools and automation.'),
 '/work/':('Website Portfolio & Live Projects | Haseeb Crafts','Explore Haseeb Crafts\' curated website portfolio: web design, WordPress, business websites and digital projects. Browse screenshots and visit original project websites.'),
 '/motion/':('Motion Graphics & Video Editing | Haseeb Crafts','Discover motion graphics and video editing by Haseeb Crafts: animated promos, kinetic typography, product reveals, captions and branded visual storytelling.'),
 '/faqs/':('Project & Service FAQs | Haseeb Crafts','Find answers about Haseeb Crafts services, project scope, timelines, revisions and final files before starting a website, design or motion graphics project.'),
 '/contact/':('Contact Abdul Haseeb | Start a Haseeb Crafts Project','Contact Haseeb Crafts by WhatsApp or email to discuss website development, WordPress, motion graphics, video editing, branding and other creative projects.'),
 '/services/website-development/':('Website Development Services | Haseeb Crafts','Get a responsive website or landing page from Haseeb Crafts. Explore website development, clear page structure, mobile layouts and a practical project process.'),
 '/services/wordpress-elementor/':('WordPress & Elementor Websites | Haseeb Crafts','Explore editable WordPress and Elementor websites by Haseeb Crafts, with custom layouts, responsive design and a clear handover for managing your content.'),
 '/services/motion-graphics/':('Motion Graphics & Animated Promos | Haseeb Crafts','Bring your message to life with Haseeb Crafts motion graphics: animated promos, kinetic typography, explainers and branded visuals designed around your brief.'),
 '/services/video-editing/':('Video Editing, Reels & Captions | Haseeb Crafts','Explore Haseeb Crafts video editing for reels, promos and social content, including pacing, motion titles, captions and a polished branded presentation.'),
 '/services/branding-identity/':('Brand Identity & Graphic Design | Haseeb Crafts','Create a consistent visual identity with Haseeb Crafts. Explore logo design, colour palettes, stationery, posters and graphic design for your brand.'),
 '/services/social-media-design/':('Social Media Design & Campaign Visuals | Haseeb Crafts','Explore Haseeb Crafts social media design: campaign creatives, post layouts, reel covers and reusable templates that keep your brand presentation consistent.'),
 '404':('Page Not Found | Haseeb Crafts','This page could not be found. Explore Haseeb Crafts services, portfolio and contact information.')
}

def meta(head,name,content,prop=False):
 e=etree.SubElement(head,'meta');e.set('property' if prop else 'name',name);e.set('content',content)

def build():
 original=html.document_fromstring((ROOT/'source/site.html').read_text())
 views=original.xpath('//main/section[@data-route]')
 routes=[v.get('data-route') for v in views]
 assert len(routes)==len(set(routes))
 for route in routes:
  doc=deepcopy(original);head=doc.find('head');main=doc.xpath('//main')[0]
  for v in list(main):
   if v.get('data-route')!=route:main.remove(v)
   else:v.attrib.pop('hidden',None);v.set('data-title',META.get(route,(v.get('data-title'),''))[0])
  view=main[0]
  title,desc=META.get(route,('',''))
  if not title:
   name=view.xpath('.//h1')[0].text_content().strip()
   title=name+' Design Concept | Haseeb Crafts Portfolio'
   lead=view.xpath('.//p[contains(@class,"lead")]')[0].text_content().strip()
   desc='Explore the '+name+' concept by Haseeb Crafts. '+lead
  for e in head.xpath('./title|./meta[@name="description"]|./meta[@name="robots"]|./meta[@name="google-site-verification"]|./link[@rel="canonical"]'):
   head.remove(e)
  etree.SubElement(head,'title').text=title
  meta(head,'description',desc)
  meta(head,'author','Abdul Haseeb — Haseeb Crafts')
  meta(head,'geo.region','PK-PB')
  meta(head,'geo.placename','Rawalpindi, Pakistan')
  meta(head,'google-site-verification',VERIFY)
  if route=='/':meta(head,'google-site-verification','6IWPdVt60qoQVswOCe10SlZ5-73Gxx38-ITdLqA_aOk')
  meta(head,'robots','noindex,follow' if route=='404' else 'index,follow,max-image-preview:large')
  canonical=URL+(route.strip('/')+'/' if route!='/' and route!='404' else '')
  if route!='404':etree.SubElement(head,'link',rel='canonical',href=canonical)
  for key,value in {'type':'website','site_name':'Haseeb Crafts','locale':'en_US','title':title,'description':desc,'url':canonical,'image':URL+'assets/social-preview.jpg','image:width':'1200','image:height':'630','image:alt':'Haseeb Crafts — Abdul Haseeb and creative studio services'}.items():meta(head,'og:'+key,value,True)
  for key,value in {'card':'summary_large_image','title':title,'description':desc,'image':URL+'assets/social-preview.jpg','image:alt':'Haseeb Crafts creative studio introduction'}.items():meta(head,'twitter:'+key,value)
  graph=[{'@type':'Organization','@id':URL+'#studio','name':'Haseeb Crafts','url':URL,'email':'hmm4405930@gmail.com','telephone':'+923144405930','founder':{'@id':URL+'#haseeb'},'description':'Haseeb Crafts is a Pakistan-based creative studio for websites, motion design, editing and digital solutions.','areaServed':{'@type':'Country','name':'Pakistan'}},
   {'@type':'Person','@id':URL+'#haseeb','name':'Abdul Haseeb','url':URL+'about/','worksFor':{'@id':URL+'#studio'},'jobTitle':'Web Developer and Motion Designer'},
   {'@type':'WebSite','@id':URL+'#website','url':URL,'name':'Haseeb Crafts','publisher':{'@id':URL+'#studio'},'alternateName':'Haseeb Crafts by Abdul Haseeb','inLanguage':'en'},
   {'@type':'WebPage','@id':canonical+'#webpage','url':canonical,'name':title,'description':desc,'isPartOf':{'@id':URL+'#website'},'about':{'@id':URL+'#studio'},'inLanguage':'en'}]
  if route.startswith('/services/') and route!='/services/':graph.append({'@type':'Service','name':view.xpath('.//h1')[0].text_content().strip(),'description':desc,'url':canonical,'provider':{'@id':URL+'#studio'}})
  if route!='404':etree.SubElement(head,'script',type='application/ld+json').text=json.dumps({'@context':'https://schema.org','@graph':graph},ensure_ascii=False)
  for a in doc.xpath('//*[@data-navlink or @data-navlink2]'):
   if a.get('href')==BASE+(route.strip('/').split('/')[0]+'/' if route!='/' else ''):a.set('aria-current','page')
  target=ROOT/('404.html' if route=='404' else route.strip('/')+'/index.html' if route!='/' else 'index.html')
  target.parent.mkdir(parents=True,exist_ok=True);target.write_text('<!DOCTYPE html>\n'+html.tostring(doc,encoding='unicode',method='html'))
 sitemap=etree.Element('urlset',nsmap={None:'http://www.sitemaps.org/schemas/sitemap/0.9'})
 for route in routes:
  if route=='404':continue
  u=etree.SubElement(sitemap,'url');etree.SubElement(u,'loc').text=URL+(route.strip('/')+'/' if route!='/' else '')
 (ROOT/'sitemap.xml').write_bytes(etree.tostring(sitemap,xml_declaration=True,encoding='UTF-8',pretty_print=True))
 (ROOT/'index (1).html').write_text('<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="robots" content="noindex,follow"><link rel="canonical" href="'+URL+'"><meta http-equiv="refresh" content="0;url='+URL+'"><title>Haseeb Crafts</title></head><body><a href="'+URL+'">Visit Haseeb Crafts</a></body></html>')
 # The template is not a public landing page.
 source_head=original.find('head');meta(source_head,'robots','noindex,follow')
 # Generated pages strip this template-only directive on subsequent builds.
 (ROOT/'source/site.html').write_text('<!DOCTYPE html>\n'+html.tostring(original,encoding='unicode',method='html'))
 print('Built',len(routes)-1,'indexable pages plus 404.html')
if __name__=='__main__':build()
