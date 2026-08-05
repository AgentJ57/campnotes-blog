// api/cron.js
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL);

const AFFILIATE_MAP = {
  'passport america': { url: 'http://www.passportamerica.com/join/wild3', name: 'Passport America', code: 'WILD3' },
  'harvest host': { url: 'https://www.harvesthosts.com/?utm_source=influencer&utm_medium=socialmedia&utm_campaign=WildThornBaileys&utm_content=WILD20&show_code=true', name: 'Harvest Hosts', code: 'WILD20' },
  'thousand trails': { url: 'https://form.jotform.com/223255012725144', name: 'Thousand Trails', code: null },
  'lectric': { url: 'http://lectricebikes.sjv.io/2rbe1M', name: 'Lectric eBikes', code: null },
  'water filter': { url: 'https://goblutech.com/?ref=WildThornBaileys', name: 'Blu Technology', code: null },
  'cruise america': { url: 'https://cruiseamerica.pxf.io/YR6dJq', name: 'Cruise America', code: null },
  'fuel': { url: 'http://apply.myopenroads.com/r/wildthornbaileys', name: 'Open Roads Fuel Discount', code: null },
  'snappad': { url: 'https://www.rvsnappad.com/discount/WTB10', name: 'RV SnapPad', code: 'WTB10' },
  'unique camping': { url: 'https://uniquecampingmarine.com/', name: 'Unique Camping + Marine', code: 'wildthornbaileys' },
  'amazon': { url: 'http://amazon.com/shop/wildthornbaileys', name: 'Amazon', code: null },
  'default': { url: 'http://www.passportamerica.com/join/wild3', name: 'Passport America', code: 'WILD3' }
};

function getAffiliate(keyword) {
  const kw = keyword.toLowerCase();
  for (const [key, val] of Object.entries(AFFILIATE_MAP)) {
    if (kw.includes(key)) return val;
  }
  return AFFILIATE_MAP.default;
}

function slugify(text) {
  return text.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').slice(0, 80);
}

function estimateReadTime(content) {
  return Math.ceil(content.split(/\s+/).length / 225);
}

export default async function handler(req, res) {
  const authHeader = req.headers['authorization'];
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const keywords = await sql`
      SELECT * FROM keywords WHERE used = FALSE ORDER BY created_at ASC LIMIT 1
    `;

    if (keywords.length === 0) {
      return res.status(200).json({ message: 'No keywords remaining' });
    }

    const keywordRow = keywords[0];
    const affiliate = getAffiliate(keywordRow.keyword);

    const prompt = `You are a writer for Camp Notes, an honest camping and RV travel blog.
Write a complete blog post about: "${keywordRow.keyword}"

RULES:
- 900 to 1100 words total
- Tone: direct, honest, conversational, not corporate
- No motivational hype, no fake enthusiasm
- Structure: hook paragraph, what you need to know, the real breakdown, bottom line
- Naturally mention "${affiliate.name}" once in the first half with this link: ${affiliate.url}
- Mention "${affiliate.name}" again in the bottom line with the same link
${affiliate.code ? `- Include discount code: ${affiliate.code}` : ''}
- No em dashes anywhere
- Start with a strong hook

Return ONLY valid JSON, nothing else:
{
  "title": "SEO optimized title under 65 characters",
  "excerpt": "Meta description under 155 characters",
  "category": "one of: Memberships, RV Gear, Free Camping, Road Costs, Family Travel, RV Life",
  "content": "full HTML using only p, h2, h3, ul, li tags"
}`;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 2000,
        messages: [{ role: 'user', content: prompt }]
      })
    });

    const data = await response.json();
    const raw = data.content[0].text.trim();
    const post = JSON.parse(raw.replace(/```json|```/g, '').trim());
    const slug = slugify(post.title);

    await sql`
      INSERT INTO posts (slug, title, excerpt, content, category, read_time, affiliate_url, affiliate_name)
      VALUES (${slug}, ${post.title}, ${post.excerpt}, ${post.content}, ${post.category}, ${estimateReadTime(post.content)}, ${affiliate.url}, ${affiliate.name})
      ON CONFLICT (slug) DO NOTHING
    `;

    await sql`
      UPDATE keywords SET used = TRUE, used_at = NOW() WHERE id = ${keywordRow.id}
    `;

    return res.status(200).json({ success: true, post: post.title, slug });

  } catch (error) {
    console.error('Cron error:', error);
    return res.status(500).json({ error: error.message });
  }
}
