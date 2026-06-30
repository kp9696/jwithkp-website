"""
Add filter buttons and filterable-card + data-tags to blog.html and case-studies.html
"""
import re

# ── blog.html ──────────────────────────────────────────────────────────────
with open('blog.html', 'r', encoding='utf-8') as f:
    blog = f.read()

# 1. Add filter bar before blog-grid
BLOG_FILTER_BAR = '''      <div class="filter-bar" role="group" aria-label="Filter blog posts by topic">
        <button class="filter-btn active" data-filter="all">All Posts</button>
        <button class="filter-btn" data-filter="Network Monitoring">Network Monitoring</button>
        <button class="filter-btn" data-filter="Cost Optimization">Cost Optimization</button>
        <button class="filter-btn" data-filter="Infrastructure">Infrastructure</button>
        <button class="filter-btn" data-filter="Security">Security</button>
        <button class="filter-btn" data-filter="Collaboration">Collaboration</button>
      </div>
'''

if 'filter-bar' not in blog:
    blog = blog.replace('<div class="blog-grid">', BLOG_FILTER_BAR + '      <div class="blog-grid" id="blog-grid">')

# 2. Add filterable-card class and data-tags to each post-card
tag_map = {
    'ntopng-network-monitoring':       'Network Monitoring',
    'open-source-startup-cost-savings':'Cost Optimization',
    'proxmox-vmware-alternative':      'Infrastructure',
    'wazuh-security-smb':              'Security',
    'nextcloud-vs-microsoft365':       'Collaboration',
}

for slug, tag in tag_map.items():
    # Find the article that links to this slug and add filterable-card + data-tags
    blog = re.sub(
        rf'(<article class="post-card"[^>]*)(>[\s\S]*?href="{re.escape("blog-" + slug + ".html")}")',
        lambda m, t=tag: m.group(1) + f' filterable-card data-tags="{t}"' + m.group(2),
        blog,
        count=1
    )

with open('blog.html', 'w', encoding='utf-8') as f:
    f.write(blog)
print('blog.html updated')

# ── case-studies.html ──────────────────────────────────────────────────────
with open('case-studies.html', 'r', encoding='utf-8') as f:
    cs = f.read()

# 1. Add filter bar before studies-grid
CS_FILTER_BAR = '''    <div class="filter-bar" role="group" aria-label="Filter case studies by topic">
      <button class="filter-btn active" data-filter="all">All</button>
      <button class="filter-btn" data-filter="Virtualization">Virtualization</button>
      <button class="filter-btn" data-filter="Security">Security</button>
      <button class="filter-btn" data-filter="Startup">Startup</button>
      <button class="filter-btn" data-filter="Collaboration">Collaboration</button>
    </div>
'''

if 'filter-bar' not in cs:
    cs = cs.replace('<section class="studies-grid">', CS_FILTER_BAR + '<section class="studies-grid" id="studies-grid">')

# 2. Add filterable-card + data-tags to each study-card
study_tags = [
    ('Virtualization Cost Reduction', 'Virtualization'),
    ('Security Visibility',           'Security'),
    ('Startup Infrastructure',        'Startup'),
    ('Collaboration Cost',            'Collaboration'),
]

for title_fragment, tag in study_tags:
    cs = re.sub(
        rf'(<article class="study-card"[^>]*)(>[\s\S]*?{re.escape(title_fragment)})',
        lambda m, t=tag: m.group(1) + f' filterable-card data-tags="{t}"' + m.group(2),
        cs,
        count=1
    )

with open('case-studies.html', 'w', encoding='utf-8') as f:
    f.write(cs)
print('case-studies.html updated')
