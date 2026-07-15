const fs = require('fs');
const path = require('path');
const CleanCSS = require('clean-css');
const { minify } = require('terser');

const GTM_HEAD_SNIPPET = `<!-- Google Tag Manager -->
<script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-M98KB4X7');</script>
<!-- End Google Tag Manager -->`;

const GTM_BODY_SNIPPET = `<!-- Google Tag Manager (noscript) -->
<noscript><iframe src="https://www.googletagmanager.com/ns.html?id=GTM-M98KB4X7"
height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>
<!-- End Google Tag Manager (noscript) -->`;

function ensureCoreSeoMeta(content) {
  if (!/meta name="author"/i.test(content)) {
    content = content.replace(/(<meta name="description"[^>]*>)/i, '$1\n  <meta name="author" content="JWithKP">');
  }

  return content;
}

function ensureGtmSnippets(content) {
  if (!content.includes('GTM-M98KB4X7')) {
    content = content.replace(/<head>/i, '<head>\n' + GTM_HEAD_SNIPPET);
    content = content.replace(/<body([^>]*)>/i, '<body$1>\n    ' + GTM_BODY_SNIPPET);
  }

  return content;
}


async function build() {
  console.log('Starting build compilation...');

  // 1. Minify CSS
  try {
    const cssPath = path.join(__dirname, 'css', 'style.css');
    const minCssPath = path.join(__dirname, 'css', 'style.min.css');
    const cssContent = fs.readFileSync(cssPath, 'utf8');
    const minifiedCss = new CleanCSS().minify(cssContent).styles;
    fs.writeFileSync(minCssPath, minifiedCss, 'utf8');
    console.log('CSS Minification: Successful (style.min.css)');
  } catch (err) {
    console.error('Error minifying CSS:', err);
  }

  // 2. Minify JS (script.js -> script.min.js)
  try {
    const jsPath = path.join(__dirname, 'js', 'script.js');
    const minJsPath = path.join(__dirname, 'js', 'script.min.js');
    const jsContent = fs.readFileSync(jsPath, 'utf8');
    const minifiedJs = (await minify(jsContent)).code;
    fs.writeFileSync(minJsPath, minifiedJs, 'utf8');
    console.log('JS Minification: Successful (script.min.js)');
  } catch (err) {
    console.error('Error minifying JS:', err);
  }

  // 3. Load Templates
  const navbarTemplatePath = path.join(__dirname, 'templates', 'navbar.html');
  const footerTemplatePath = path.join(__dirname, 'templates', 'footer.html');
  const navbarTemplate = fs.readFileSync(navbarTemplatePath, 'utf8');
  const footerTemplate = fs.readFileSync(footerTemplatePath, 'utf8');

  // 4. Process all HTML files in root directory
  const files = fs.readdirSync(__dirname);
  for (const file of files) {
    if (file.endsWith('.html') && file !== 'google662243390838af12.html') {
      const filePath = path.join(__dirname, file);
      let content = fs.readFileSync(filePath, 'utf8');

      // Template Compilation: Navbar
      if (content.includes('<!-- NAV_START -->') && content.includes('<!-- NAV_END -->')) {
        // Set dynamic active state on navbar
        let dynamicNavbar = navbarTemplate;
        const navMatch = dynamicNavbar.match(new RegExp('href="' + file + '"'));
        if (navMatch) {
          dynamicNavbar = dynamicNavbar.replace(new RegExp('href="' + file + '"'), 'href="' + file + '" class="active"');
        } else if (file.startsWith('blog-') || file === 'case-studies.html' || file === 'guides.html') {
          // Highlight Blog link for sub-resources
          dynamicNavbar = dynamicNavbar.replace('href="blog.html"', 'href="blog.html" class="active"');
        }
        
        content = content.replace(
          /<!-- NAV_START -->[\s\S]*?<!-- NAV_END -->/,
          `<!-- NAV_START -->\n${dynamicNavbar}\n<!-- NAV_END -->`
        );
      }

      // Template Compilation: Footer
      if (content.includes('<!-- FOOTER_START -->') && content.includes('<!-- FOOTER_END -->')) {
        content = content.replace(
          /<!-- FOOTER_START -->[\s\S]*?<!-- FOOTER_END -->/,
          `<!-- FOOTER_START -->\n${footerTemplate}\n<!-- FOOTER_END -->`
        );
      }

      content = ensureCoreSeoMeta(content);
      content = ensureGtmSnippets(content);

      // Performance Optimization: Defer third-party scripts (AOS, Typed.js)
      content = content.replace(/<script\s+src="([^"]+)"(?![\s>]*defer)/gi, '<script src="$1" defer');

      // Reference Minified CSS in production build
      content = content.replace('href="css/style.css"', 'href="css/style.min.css"');

      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`Compiled: ${file}`);
    }
  }

  console.log('Build completed successfully.');
}

build();
