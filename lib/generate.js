// lib/generate.js

const AFFILIATE_MAP = {
  'passport america': {
    url: 'http://www.passportamerica.com/join/wild3',
    name: 'Passport America',
    code: 'WILD3'
  },
  'harvest host': {
    url: 'https://www.harvesthosts.com/?utm_source=influencer&utm_medium=socialmedia&utm_campaign=WildThornBaileys&utm_content=WILD20&show_code=true',
    name: 'Harvest Hosts',
    code: 'WILD20'
  },
  'thousand trails': {
    url: 'https://form.jotform.com/223255012725144',
    name: 'Thousand Trails',
    code: null
  },
  'lectric': {
    url: 'http://lectricebikes.sjv.io/2rbe1M',
    name: 'Lectric eBikes',
    code: null
  },
  'blu tech': {
    url: 'https://goblutech.com/?ref=WildThornBaileys',
    name: 'Blu Technology',
    code: null
  },
  'water filter': {
    url: 'https://goblutech.com/?ref=WildThornBaileys',
    name: 'Blu Technology',
    code: null
  },
  'cruise america': {
    url: 'https://cruiseamerica.pxf.io/YR6dJq',
    name: 'Cruise America',
    code: null
  },
  'open roads': {
    url: 'http://apply.myopenroads.com/r/wildthornbaileys',
    name: 'Open Roads',
    code: null
  },
  'fuel': {
    url: 'http://apply.myopenroads.com/r/wildthornbaileys',
    name: 'Open Roads Fuel Discount',
    code: null
  },
  'snappad': {
    url: 'https://www.rvsnappad.com/discount/WTB10',
    name: 'RV SnapPad',
    code: 'WTB10'
  },
  'unique camping': {
    url: 'https://uniquecampingmarine.com/',
    name: 'Unique Camping + Marine',
    code: 'wildthornbaileys'
  },
  'amazon': {
    url: 'http://amazon.com/shop/wildthornbaileys',
    name: 'Amazon',
    code: null
  },
  'default': {
    url: 'http://www.passportamerica.com/join/wild3',
    name: 'Passport America',
    code: 'WILD3'
  }
};

function getAffiliate(keyword) {
  const kw = keyword.toLowerCase();
  for (const [key, val] of Object.entries(AFFILIATE_MAP)) {
    if (kw.includes(key)) return val;
  }
  return AFFILIATE_MAP.default;
}

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 80);
}

function estimateReadTime(content) {
  const words = content.split(/\s+/).length;
  return Math.ceil(words / 225);
}

export async function generatePost(keyword) {
  const affiliate = getAffiliate(keyword);

  const prompt = `You are a writer for Camp Notes, an honest camping and RV travel blog. 
Write a complete blog post about: "${keyword}"

RULES:
- 900 to 1100 words total
- Tone: direct, honest, conversational, not corporate
- No motivational hype, no fake enthusiasm
- Write like someone who has actually camped and lived on the road
- Structure: hook paragraph, what you need to know, the real breakdown, bottom line
- Naturally mention "${affiliate.name}" once in the first half of the article with this exact link: ${affiliate.url}
- Mention "${affiliate.name}" a second time naturally in the bottom line section with the same link
${affiliate.code ? `- Include the discount code: ${affiliate.code}` : ''}
- No em dashes anywhere
- Start with a strong hook, not "Are you wondering..."
- End with one clear takeaway

Return ONLY valid JSON in this exact format, nothing else:
{
  "title": "SEO optimized title under 65 characters",
  "excerpt": "Meta description under 155 characters",
  "category": "one of: Memberships, RV Gear, Free Camping, Road Costs, Family Travel, RV Life",
  "content": "full HTML article content using <p>, <h2>, <h3>, <ul>, <li> tags only"
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
  const cleaned = raw.replace(/```json|```/g, '').trim();
  const post = JSON.parse(cleaned);

  const slug = slugify(post.title);
  const readTime = estimateReadTime(post.content);

  return {
    slug,
    title: post.title,
    excerpt: post.excerpt,
    content: post.content,
    category: post.category,
    read_time: readTime,
    affiliate_url: affiliate.url,
    affiliate_name: affiliate.name
  };
}
