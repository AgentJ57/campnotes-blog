// api/posts/[slug].js
// Renders individual blog post pages

import sql from '../../lib/db.js';

export const config = {
  runtime: 'nodejs'
};

export default async function handler(req) {
  const url = new URL(req.url);
  const slug = url.pathname.replace('/api/posts/', '').replace('/', '');

  try {
    const posts = await sql`
      SELECT * FROM posts WHERE slug = ${slug} LIMIT 1
    `;

    if (posts.length === 0) {
      return new Response('Post not found', { status: 404 });
    }

    const post = posts[0];
    const publishedDate = new Date(post.published_at).toLocaleDateString('en-US', {
      month: 'long', day: 'numeric', year: 'numeric'
    });

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1.0"/>
<title>${post.title} — Camp Notes</title>
<meta name="description" content="${post.excerpt}"/>
<meta property="og:title" content="${post.title}"/>
<meta property="og:description" content="${post.excerpt}"/>
<meta property="og:type" content="article"/>
<meta property="og:url" content="https://campnotes.blog/post/${post.slug}"/>
<link rel="canonical" href="https://campnotes.blog/post/${post.slug}"/>
<script type="application/ld+json">${JSON.stringify({
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  "headline": post.title,
  "description": post.excerpt,
  "datePublished": post.published_at,
  "url": `https://campnotes.blog/post/${post.slug}`,
  "publisher": {
    "@type": "Organization",
    "name": "Camp Notes",
    "url": "https://campnotes.blog"
  }
})}</script>
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garant:ital,wght@0,400;0,600;0,700;1,400;1,700&family=DM+Sans:wght@300;400;500;600&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet"/>
<style>
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
:root{
  --parchment:#FDFAF5;
  --parchment2:#F6F0E8;
  --night:#18120A;
  --ember:#D4601A;
  --gold:#B8922E;
  --forest:#2E5E3E;
  --forest-light:#4A7D5C;
  --ink:#1A1410;
  --ink-soft:#594F42;
  --ink-muted:#9E8E7C;
  --border:rgba(26,20,16,0.08);
  --border-warm:rgba(184,146,46,0.18);
  --shadow:0 4px 16px rgba(26,20,16,0.08);
}
html{scroll-behavior:smooth}
body{font-family:'DM Sans',sans-serif;background:var(--parchment);color:var(--ink);line-height:1.6;-webkit-font-smoothing:antialiased}

/* NAV */
nav{position:sticky;top:0;z-index:100;height:62px;padding:0 clamp(20px,5vw,64px);display:flex;align-items:center;justify-content:space-between;background:rgba(253,250,245,0.95);backdrop-filter:blur(20px);border-bottom:1px solid var(--border)}
.nav-logo{text-decoration:none;display:flex;align-items:center;gap:10px}
.nav-wordmark{font-family:'Cormorant Garant',serif;font-size:20px;font-weight:700;color:var(--ink);letter-spacing:-0.5px}
.nav-wordmark em{color:var(--ember);font-style:normal}
.nav-back{font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:1.5px;text-transform:uppercase;color:var(--ink-soft);text-decoration:none;padding:7px 13px;border-radius:7px;border:1px solid var(--border);transition:all .18s}
.nav-back:hover{color:var(--ink);border-color:var(--forest)}

/* POST HERO */
.post-hero{background:var(--night);padding:clamp(48px,8vh,80px) clamp(20px,5vw,64px);border-bottom:3px solid var(--ember)}
.post-hero-inner{max-width:740px;margin:0 auto}
.post-kicker{font-family:'JetBrains Mono',monospace;font-size:9px;letter-spacing:2.5px;text-transform:uppercase;color:var(--gold);margin-bottom:16px;display:flex;align-items:center;gap:12px}
.post-kicker::before{content:'';width:24px;height:1px;background:var(--gold);display:block}
.post-h1{font-family:'Cormorant Garant',serif;font-size:clamp(30px,5vw,56px);font-weight:700;line-height:1.08;letter-spacing:-1.5px;color:#F6EDD8;margin-bottom:20px}
.post-meta{font-family:'JetBrains Mono',monospace;font-size:9px;letter-spacing:1px;text-transform:uppercase;color:rgba(246,237,216,0.4);display:flex;gap:14px;flex-wrap:wrap}

/* DISCLOSURE */
.disclosure{background:rgba(184,146,46,0.08);border:1px solid rgba(184,146,46,0.2);border-radius:8px;padding:12px 16px;margin:28px auto 0;max-width:740px;font-family:'JetBrains Mono',monospace;font-size:9px;letter-spacing:.5px;color:rgba(246,237,216,0.4);font-style:italic}

/* CONTENT */
.post-body{max-width:740px;margin:0 auto;padding:clamp(40px,6vw,72px) clamp(20px,5vw,64px)}
.post-content p{font-size:16px;color:var(--ink-soft);line-height:1.85;margin-bottom:22px}
.post-content h2{font-family:'Cormorant Garant',serif;font-size:clamp(22px,3vw,32px);font-weight:700;letter-spacing:-0.5px;color:var(--ink);margin:40px 0 16px;line-height:1.15}
.post-content h3{font-family:'Cormorant Garant',serif;font-size:clamp(18px,2.5vw,24px);font-weight:700;color:var(--ink);margin:28px 0 12px}
.post-content ul{padding-left:20px;margin-bottom:22px}
.post-content ul li{font-size:16px;color:var(--ink-soft);line-height:1.8;margin-bottom:8px}
.post-content a{color:var(--forest);text-decoration:none;border-bottom:1px solid rgba(46,94,62,0.3);transition:all .2s}
.post-content a:hover{color:var(--ember);border-color:rgba(212,96,26,0.3)}
.post-content strong{color:var(--ink);font-weight:600}

/* AFFILIATE CTA CARD */
.aff-card{background:var(--night);border:1px solid var(--border-warm);border-radius:14px;padding:28px;margin:40px 0;display:flex;align-items:center;justify-content:space-between;gap:20px;flex-wrap:wrap}
.aff-card-text h3{font-family:'Cormorant Garant',serif;font-size:22px;font-weight:700;color:#F6EDD8;margin-bottom:6px}
.aff-card-text p{font-size:13px;color:rgba(246,237,216,0.5);line-height:1.6}
.aff-card-btn{display:inline-flex;align-items:center;gap:8px;background:var(--ember);color:#fff;padding:13px 24px;border-radius:8px;font-size:13px;font-weight:500;text-decoration:none;transition:all .2s;white-space:nowrap;flex-shrink:0}
.aff-card-btn:hover{background:#b85015;transform:translateY(-1px)}
.aff-disc{font-family:'JetBrains Mono',monospace;font-size:8px;color:rgba(246,237,216,0.25);margin-top:10px;font-style:italic;width:100%}

/* RELATED + FOOTER */
.related{background:var(--parchment2);border-top:1px solid var(--border);padding:clamp(40px,6vw,64px) clamp(20px,5vw,64px)}
.related-inner{max-width:740px;margin:0 auto}
.related h2{font-family:'Cormorant Garant',serif;font-size:28px;font-weight:700;letter-spacing:-0.5px;color:var(--ink);margin-bottom:24px}
.related-links{display:flex;flex-direction:column;gap:12px}
.related-link{display:flex;align-items:center;justify-content:space-between;background:#fff;border:1px solid var(--border);border-radius:10px;padding:16px 18px;text-decoration:none;transition:all .2s}
.related-link:hover{border-color:var(--border-warm);transform:translateX(3px)}
.related-link-title{font-family:'Cormorant Garant',serif;font-size:17px;font-weight:700;color:var(--ink)}
.related-link-tag{font-family:'JetBrains Mono',monospace;font-size:9px;letter-spacing:1px;text-transform:uppercase;color:var(--ink-muted)}
.related-link-arrow{color:var(--ember);font-size:16px;flex-shrink:0}

footer{background:var(--night);padding:32px clamp(20px,5vw,64px);text-align:center}
.footer-logo{font-family:'Cormorant Garant',serif;font-size:18px;font-weight:700;color:#F6EDD8;text-decoration:none;display:inline-block;margin-bottom:8px}
.footer-logo em{color:var(--ember);font-style:normal}
.footer-disc{font-family:'JetBrains Mono',monospace;font-size:8px;letter-spacing:.5px;color:rgba(246,237,216,0.18);margin-top:8px;line-height:1.8}
</style>
</head>
<body>

<nav>
  <a href="/" class="nav-logo">
    <span class="nav-wordmark">camp<em>notes</em></span>
  </a>
  <a href="/" class="nav-back">← All Guides</a>
</nav>

<div class="post-hero">
  <div class="post-hero-inner">
    <div class="post-kicker">${post.category}</div>
    <h1 class="post-h1">${post.title}</h1>
    <div class="post-meta">
      <span>${publishedDate}</span>
      <span>·</span>
      <span>${post.read_time} min read</span>
    </div>
  </div>
  <div class="disclosure">
    This post contains affiliate links. We may earn a small commission at no extra cost to you.
  </div>
</div>

<!-- AdSense Top -->
<div style="background:var(--parchment2);border-bottom:1px solid var(--border);padding:16px clamp(20px,5vw,64px);text-align:center">
  <div style="border:1px dashed var(--border);border-radius:6px;padding:14px;font-family:'JetBrains Mono',monospace;font-size:8px;letter-spacing:2px;text-transform:uppercase;color:var(--ink-muted);max-width:728px;margin:0 auto">
    Advertisement — AdSense
  </div>
</div>

<div class="post-body">
  <div class="post-content">
    ${post.content}
  </div>

  <!-- Affiliate CTA Card -->
  <div class="aff-card">
    <div class="aff-card-text">
      <h3>${post.affiliate_name}</h3>
      <p>Check current pricing and availability. Discount may apply at checkout.</p>
    </div>
    <a href="${post.affiliate_url}" class="aff-card-btn" target="_blank" rel="noopener noreferrer">
      Check Current Price →
    </a>
    <div class="aff-disc">Affiliate link. We may earn a commission at no extra cost to you.</div>
  </div>
</div>

<!-- AdSense Bottom -->
<div style="background:var(--parchment2);border-top:1px solid var(--border);border-bottom:1px solid var(--border);padding:16px clamp(20px,5vw,64px);text-align:center">
  <div style="border:1px dashed var(--border);border-radius:6px;padding:14px;font-family:'JetBrains Mono',monospace;font-size:8px;letter-spacing:2px;text-transform:uppercase;color:var(--ink-muted);max-width:728px;margin:0 auto">
    Advertisement — AdSense
  </div>
</div>

<div class="related">
  <div class="related-inner">
    <h2>More from Camp Notes</h2>
    <div class="related-links">
      <a href="/post/is-passport-america-worth-it" class="related-link">
        <div>
          <div class="related-link-tag">Memberships</div>
          <div class="related-link-title">Is Passport America Actually Worth It?</div>
        </div>
        <div class="related-link-arrow">→</div>
      </a>
      <a href="/post/harvest-host-vs-boondockers-welcome" class="related-link">
        <div>
          <div class="related-link-tag">Free Camping</div>
          <div class="related-link-title">Harvest Host vs Boondockers Welcome</div>
        </div>
        <div class="related-link-arrow">→</div>
      </a>
      <a href="/post/best-rv-water-filtration-systems-2026" class="related-link">
        <div>
          <div class="related-link-tag">RV Gear</div>
          <div class="related-link-title">Best RV Water Filtration Systems in 2026</div>
        </div>
        <div class="related-link-arrow">→</div>
      </a>
    </div>
  </div>
</div>

<footer>
  <a href="/" class="footer-logo">camp<em>notes</em></a>
  <div class="footer-disc">
    2026 campnotes.blog — This site contains affiliate links. We may earn a commission at no extra cost to you.
  </div>
</footer>

</body>
</html>`;

    return new Response(html, {
      status: 200,
      headers: { 'Content-Type': 'text/html; charset=utf-8' }
    });

  } catch (error) {
    return new Response('Server error', { status: 500 });
  }
}