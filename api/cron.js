// api/cron.js
// Vercel cron job - runs on schedule defined in vercel.json

import sql from '../lib/db.js';
import { generatePost } from '../lib/generate.js';

export const config = {
  runtime: 'edge'
};

export default async function handler(req) {
  // Verify this is a legitimate cron call
  const authHeader = req.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    // Get next unused keyword
    const keywords = await sql`
      SELECT * FROM keywords
      WHERE used = FALSE
      ORDER BY created_at ASC
      LIMIT 1
    `;

    if (keywords.length === 0) {
      return new Response(JSON.stringify({ message: 'No keywords remaining' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const keywordRow = keywords[0];

    // Generate the post
    const post = await generatePost(keywordRow.keyword);

    // Save to database
    await sql`
      INSERT INTO posts (slug, title, excerpt, content, category, read_time, affiliate_url, affiliate_name)
      VALUES (
        ${post.slug},
        ${post.title},
        ${post.excerpt},
        ${post.content},
        ${post.category},
        ${post.read_time},
        ${post.affiliate_url},
        ${post.affiliate_name}
      )
      ON CONFLICT (slug) DO NOTHING
    `;

    // Mark keyword as used
    await sql`
      UPDATE keywords
      SET used = TRUE, used_at = NOW()
      WHERE id = ${keywordRow.id}
    `;

    return new Response(JSON.stringify({
      success: true,
      post: post.title,
      slug: post.slug
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Cron error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}