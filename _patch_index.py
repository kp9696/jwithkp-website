import re

with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

# Replace hero h1 with typed headline
html = re.sub(
    r'<h1 class="cyber-title">.*?</h1>',
    '<h1 class="cyber-title">We Deliver <span class="gradient-text" id="typed-headline"></span></h1>',
    html,
    count=1,
    flags=re.DOTALL
)

# Add Typed.js CDN before </head>
if 'typed.js' not in html and 'typed.umd' not in html:
    html = html.replace(
        '</head>',
        '  <script src="https://unpkg.com/typed.js@2.1.0/dist/typed.umd.js"></script>\n</head>'
    )

# Add Typed.js init script before </body>
if 'typed-headline' not in html or 'new Typed' not in html:
    typed_init = '''  <script>
    (function() {
      var el = document.getElementById('typed-headline');
      if (!el || typeof Typed === 'undefined') return;
      new Typed('#typed-headline', {
        strings: [
          'IT Infrastructure',
          'Security Solutions',
          'Cost Optimization',
          'Open-Source Platforms',
          'Business Continuity'
        ],
        typeSpeed:    52,
        backSpeed:    28,
        backDelay:    1800,
        startDelay:   400,
        loop:         true,
        smartBackspace: true,
        cursorChar:   '|'
      });
    })();
  </script>'''
    html = html.replace('</body>', typed_init + '\n</body>')

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(html)

print('index.html patched successfully')
