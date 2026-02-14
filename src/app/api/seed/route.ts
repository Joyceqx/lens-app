import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';

const DEMO_PERSONAS = [
  {
    narrative: `Sarah is a 29-year-old UX designer living in Brooklyn who approaches every purchase as a design problem. She researches obsessively, reads reviews from multiple sources, and values products that balance aesthetics with functionality. She switched from iPhone to Pixel because she felt Apple's design had become "predictable." She supports local businesses and sustainable brands, even when they cost more, because she believes consumer choices are political statements. She's skeptical of influencer marketing but trusts recommendations from close friends and niche subreddits.`,
    attributes_json: {
      display_name: 'Design-Obsessed UX Designer',
      demographics: { age_range: '25-34', location_type: 'urban', life_stage: 'young professional', household: 'single' },
      values: ['intentional design', 'sustainability', 'authenticity', 'community support', 'functional aesthetics'],
      behavioral_patterns: ['extensive pre-purchase research', 'reads niche reviews', 'values form + function equally', 'willing to pay premium for ethics'],
      interests: ['UX design', 'local food scene', 'sustainable fashion', 'typography', 'independent film'],
      life_context: ['lives alone in Brooklyn', 'works at a design agency', 'active in local maker community'],
      decision_style: 'analytical',
      communication_style: 'direct',
      taste_signals: { brands_mentioned: ['Pixel', 'Patagonia', 'Notion'], preferences: ['minimal design', 'ethical sourcing'], dislikes: ['influencer marketing', 'planned obsolescence'] },
    },
    confidence_scores: { demographics: 0.85, values: 0.9, behavioral: 0.88, interests: 0.82, life_context: 0.75, overall: 0.84 },
  },
  {
    narrative: `Marcus is a 42-year-old construction foreman in suburban Ohio who values practicality above all else. He buys things that last and distrusts marketing gimmicks. Brand loyalty runs deep for him — he's driven Ford trucks his entire adult life because his father did. He makes decisions quickly based on gut feeling and trusted recommendations from coworkers. He's frustrated by subscription models and products that require apps to function. His weekend purchases revolve around home improvement projects and family activities.`,
    attributes_json: {
      display_name: 'Tradition-Driven Construction Foreman',
      demographics: { age_range: '35-44', location_type: 'suburban', life_stage: 'established career', household: 'married with kids' },
      values: ['durability', 'family tradition', 'practicality', 'self-reliance', 'value for money'],
      behavioral_patterns: ['brand loyal', 'quick decision maker', 'trusts word-of-mouth', 'avoids subscriptions', 'DIY oriented'],
      interests: ['home improvement', 'fishing', 'football', 'grilling', 'woodworking'],
      life_context: ['foreman with 15 years experience', 'two kids in school', 'homeowner'],
      decision_style: 'practical',
      communication_style: 'direct',
      taste_signals: { brands_mentioned: ['Ford', 'DeWalt', 'Carhartt'], preferences: ['built to last', 'no subscriptions needed'], dislikes: ['subscription models', 'app-dependent products', 'marketing hype'] },
    },
    confidence_scores: { demographics: 0.9, values: 0.92, behavioral: 0.88, interests: 0.8, life_context: 0.85, overall: 0.87 },
  },
  {
    narrative: `Priya is a 35-year-old data scientist in Seattle who makes every major decision by weighing evidence. She maintains spreadsheets for comparing products, tracks her spending meticulously, and reads academic papers on consumer behavior for fun. She's an early adopter of technology but skeptical of wellness trends. She values transparency in companies — she once stopped buying from a brand after discovering misleading sustainability claims. She's introverted but influential in her professional network.`,
    attributes_json: {
      display_name: 'Evidence-Based Data Scientist',
      demographics: { age_range: '35-44', location_type: 'urban', life_stage: 'mid-career professional', household: 'married, no kids' },
      values: ['evidence-based decisions', 'transparency', 'intellectual honesty', 'efficiency', 'data privacy'],
      behavioral_patterns: ['creates comparison spreadsheets', 'tracks all spending', 'early tech adopter', 'boycotts dishonest brands', 'influences through expertise'],
      interests: ['data science', 'behavioral economics', 'hiking', 'specialty coffee', 'board games'],
      life_context: ['works at a tech company', 'dual income household', 'active in professional communities'],
      decision_style: 'analytical',
      communication_style: 'reserved',
      taste_signals: { brands_mentioned: ['Framework laptop', 'Aeropress', 'Signal'], preferences: ['open source', 'data transparency', 'no dark patterns'], dislikes: ['greenwashing', 'wellness pseudoscience', 'data harvesting'] },
    },
    confidence_scores: { demographics: 0.82, values: 0.95, behavioral: 0.9, interests: 0.78, life_context: 0.72, overall: 0.83 },
  },
  {
    narrative: `James is a 58-year-old recently retired high school teacher in rural Vermont who's rediscovering what he wants now that he's not defined by his career. He's cautious with money after decades of a teacher's salary but willing to invest in experiences over things. He deeply distrusts big tech companies and avoids smart home devices. He reads physical newspapers and prefers shopping at stores where he knows the owners. His buying decisions are slow and deliberate, often taking weeks to decide on anything over $50.`,
    attributes_json: {
      display_name: 'Community-Rooted Retired Teacher',
      demographics: { age_range: '55-64', location_type: 'rural', life_stage: 'recently retired', household: 'married, empty nest' },
      values: ['frugality', 'community connection', 'privacy', 'experiences over things', 'simplicity'],
      behavioral_patterns: ['very slow deliberate purchases', 'supports local shops', 'avoids big tech', 'reads physical media', 'asks shop owners for advice'],
      interests: ['gardening', 'local history', 'hiking', 'woodworking', 'community volunteering'],
      life_context: ['35 years teaching history', 'lives on teacher pension', 'deep community roots'],
      decision_style: 'practical',
      communication_style: 'warm',
      taste_signals: { brands_mentioned: ['L.L.Bean', 'local hardware store'], preferences: ['buy local', 'repairable products', 'no smart features'], dislikes: ['big tech', 'smart home devices', 'planned obsolescence'] },
    },
    confidence_scores: { demographics: 0.92, values: 0.88, behavioral: 0.9, interests: 0.85, life_context: 0.9, overall: 0.89 },
  },
];

export async function POST() {
  try {
    const supabase = createAdminClient();

    const results = [];
    for (const persona of DEMO_PERSONAS) {
      const { data, error } = await supabase
        .from('persona_profiles')
        .insert({
          narrative: persona.narrative,
          attributes_json: persona.attributes_json,
          confidence_scores: persona.confidence_scores,
          published: true,
          version: 1,
        })
        .select('id')
        .single();

      if (error) {
        results.push({ error: error.message });
      } else {
        results.push({ id: data.id });
      }
    }

    return NextResponse.json({
      message: `Seeded ${results.filter(r => 'id' in r).length} demo personas`,
      results,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
