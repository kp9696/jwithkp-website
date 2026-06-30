"""
Add AOS CDN link + stylesheet to all inner pages (not index.html which already has it),
and add data-aos attributes to key card elements.
"""
import re, os

ROOT = r"C:\Users\Admin\Documents\New project"

AOS_CSS = '  <link href="https://unpkg.com/aos@2.3.1/dist/aos.css" rel="stylesheet">'
AOS_JS  = '  <script src="https://unpkg.com/aos@2.3.1/dist/aos.js"></script>'

# Pages to add AOS to (index.html already has it)
PAGES = [
    "about.html",
    "services.html",
    "industries.html",
    "technology-stack.html",
    "blog.html",
    "contact.html",
    "roi-calculator.html",
    "case-studies.html",
    "guides.html",
    "privacy-policy.html",
    "terms.html",
    "blog-ntopng-network-monitoring.html",
    "blog-open-source-startup-cost-savings.html",
    "blog-proxmox-vmware-alternative.html",
    "blog-wazuh-security-smb.html",
    "blog-nextcloud-vs-microsoft365.html",
]

# Card class → AOS animation mapping
AOS_MAP = [
    # (selector pattern, aos value, delay-step in ms)
    (r'class="(value-card)"',       'fade-up',    100),
    (r'class="(service-card)"',     'fade-up',    100),
    (r'class="(industry-card)"',    'fade-up',    100),
    (r'class="(post-card)"',        'fade-up',    100),
    (r'class="(study-card)"',       'fade-up',    100),
    (r'class="(insight-card)"',     'fade-up',    100),
    (r'class="(case-study-card)"',  'fade-up',    100),
    (r'class="(tech-logo-tile)"',   'zoom-in',     80),
    (r'class="(content-card)"',     'fade-up',    120),
    (r'class="(trust-badge)"',      'fade-up',     80),
    (r'class="(page-hub-card)"',    'fade-up',    100),
    (r'class="(process-card)"',     'fade-up',    120),
    (r'class="(faq-item)"',         'fade-up',    100),
    (r'class="(guide-card)"',       'fade-up',    100),
]

def add_aos_to_cards(html):
    """Add data-aos and staggered data-aos-delay to repeated card elements."""
    for pattern, animation, delay_step in AOS_MAP:
        # Find all occurrences and add data-aos if not already present
        count = [0]
        def replacer(m, anim=animation, step=delay_step, cnt=count):
            cnt[0] += 1
            delay = min((cnt[0] - 1) * step, 500)  # cap at 500ms
            cls = m.group(1)
            return f'class="{cls}" data-aos="{anim}" data-aos-delay="{delay}"'
        html = re.sub(pattern, replacer, html)
    return html

def add_aos_to_two_col(html):
    """Add fade-right / fade-left to two-column hero grids."""
    # hero-grid first child → fade-right, second → fade-left
    # Already handled on index.html; apply to inner pages
    html = re.sub(
        r'class="(hero-panel)"(?!\s+data-aos)',
        lambda m, c=[0]: (
            c.__setitem__(0, c[0]+1) or
            f'class="{m.group(1)}" data-aos="{"fade-right" if c[0]==1 else "fade-left"}" data-aos-delay="0"'
        ),
        html
    )
    return html

for filename in PAGES:
    filepath = os.path.join(ROOT, filename)
    if not os.path.exists(filepath):
        continue

    with open(filepath, 'r', encoding='utf-8') as f:
        html = f.read()

    original = html

    # 1. Add AOS CSS (before css/style.css link)
    if 'aos@2.3.1' not in html and 'aos.css' not in html:
        html = html.replace(
            '  <link rel="stylesheet" href="css/style.css">',
            f'{AOS_CSS}\n  <link rel="stylesheet" href="css/style.css">'
        )

    # 2. Add AOS JS (before js/script.js)
    if 'aos@2.3.1' not in html or 'aos.js' not in html:
        html = html.replace(
            '  <script src="js/script.js" defer></script>',
            f'{AOS_JS}\n  <script src="js/script.js" defer></script>'
        )

    # 3. Add data-aos to cards (only if not already present)
    if 'data-aos' not in html:
        html = add_aos_to_cards(html)

    if html != original:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(html)
        print(f"  AOS added: {filename}")
    else:
        print(f"  No change: {filename}")

print("Done.")
