-- Run this in your Neon SQL editor after creating your database

CREATE TABLE IF NOT EXISTS posts (
  id SERIAL PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  excerpt TEXT,
  content TEXT NOT NULL,
  category TEXT,
  read_time INTEGER DEFAULT 8,
  affiliate_url TEXT,
  affiliate_name TEXT,
  published_at TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS keywords (
  id SERIAL PRIMARY KEY,
  keyword TEXT NOT NULL,
  used BOOLEAN DEFAULT FALSE,
  used_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS subscribers (
  id SERIAL PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  first_name TEXT,
  subscribed_at TIMESTAMP DEFAULT NOW(),
  active BOOLEAN DEFAULT TRUE
);

-- Seed initial keywords
INSERT INTO keywords (keyword) VALUES
  ('passport america membership review'),
  ('best rv water filtration systems 2026'),
  ('harvest host vs boondockers welcome'),
  ('lectric ebike for rv camping'),
  ('thousand trails membership worth it'),
  ('how to keep pests out of rv'),
  ('rv fuel discount programs compared'),
  ('free camping sites usa guide'),
  ('best campgrounds in florida'),
  ('family road trip packing list'),
  ('cruise america rv rental review'),
  ('rv snappad review'),
  ('unique camping marine review'),
  ('how to become a travel agent'),
  ('best rv accessories for families'),
  ('homeschooling on the road'),
  ('work from home while traveling'),
  ('budget family road trip tips'),
  ('best national parks for families'),
  ('rv internet solutions remote work'),
  ('campground discount memberships compared'),
  ('amazon must haves for rv living'),
  ('outdoor rugs for camping review'),
  ('how to prevent pests in your rv'),
  ('printable road trip activities for kids'),
  ('rv living with kids full time'),
  ('open roads fuel discount review'),
  ('harvest hosts winery camping guide'),
  ('rv water filter buying guide'),
  ('passport america campground list 2026');
