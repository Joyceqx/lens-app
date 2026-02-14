/**
 * Lens MVP - Seed Data Script
 * Creates 6 demo personas with realistic profiles
 * Run: npx tsx scripts/seed.ts
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:54321';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'your-service-role-key';

const supabase = createClient(supabaseUrl, supabaseKey);

const PERSONAS = [
  {
    name: 'Sarah M.',
    responses: [
      { q: 1, text: "I'm a 32-year-old UX designer living in Portland. I work remotely for a mid-size tech company and share a home with my partner and our rescue dog, Luna. We moved here from Chicago three years ago for the lifestyle — more nature, slower pace, but still connected to tech." },
      { q: 2, text: "Growing up, my family was frugal but not poor. My parents were both teachers. We valued education and experiences over things. I remember road trips to national parks, library visits every Saturday, and my mom's rule: 'If you can't explain why you need it, you don't.' That stuck with me." },
      { q: 3, text: "I'm passionate about sustainable design and accessible technology. I volunteer with a local nonprofit teaching basic digital skills to seniors. I also maintain a small native plant garden — it started as a pandemic project and became a real passion." },
      { q: 4, text: "Honestly, I think about climate change a lot. And not just abstractly — I mean whether the choices I make today with purchases, transportation, food — whether they actually matter. I've also been thinking about having kids and what kind of world we're building for them." },
      { q: 5, text: "I research thoroughly before buying anything over $50. I read reviews, check sustainability certifications, and compare options. For everyday items, I tend to stick with brands I trust. I'm willing to pay more for quality and ethical sourcing, but I'm not immune to a good deal either." },
      { q: 6, text: "I've been loyal to Patagonia for years — their repair program alone won me over. I also love Aesop for skincare and Notion for work tools. I trust brands that are transparent about their supply chain and don't try too hard to seem 'woke.'" },
      { q: 7, text: "I'd love a product that actually helps me track the environmental impact of my everyday purchases — not in a guilt-trippy way, but empowering. Think carbon footprint tracker meets personal finance app." },
      { q: 8, text: "Greenwashing is the fastest way to lose my trust. Also, subscription models for things that shouldn't be subscriptions. And influencer marketing that pretends to be authentic. Just be honest about what you're selling." },
      { q: 9, text: "In five years, I hope to have started my own sustainable design consultancy. I want to help small businesses build brands that are genuinely good for people and the planet. And maybe have a kid. We'll see." },
    ],
    profile: {
      narrative: "Sarah is a 32-year-old UX designer in Portland who values sustainability, transparency, and intentional living. Raised by teacher parents who prioritized experiences over material goods, she carries a thoughtful, research-driven approach to every purchase. She's willing to pay premium prices for brands that demonstrate genuine environmental commitment and transparent supply chains, but has zero tolerance for greenwashing or performative corporate activism.\n\nHer life revolves around meaningful work, nature, and community. She volunteers teaching digital skills to seniors, maintains a native plant garden, and works remotely for a tech company. She's at a crossroads thinking about starting a family and launching her own sustainable design consultancy.\n\nSarah represents the conscious consumer who does her homework — she reads certifications, compares options, and stays loyal to brands that earn her trust through consistency and authenticity, not marketing spend.",
      attributes: {
        demographics: { age_range: '30-34', location_type: 'urban', life_stage: 'young professional', household: 'partnered, no kids' },
        values: ['sustainability', 'transparency', 'intentional living', 'community', 'quality over quantity'],
        behavioral_patterns: ['thorough researcher before purchases', 'brand loyal once trust is earned', 'willing to pay premium for ethics', 'skeptical of marketing claims', 'early adopter of productivity tools'],
        interests: ['sustainable design', 'native gardening', 'accessible technology', 'outdoor activities', 'cooking'],
        life_context: ['remote worker', 'considering parenthood', 'career transition planned', 'relocated for lifestyle', 'partner and rescue dog'],
        decision_style: 'analytical',
        communication_style: 'warm',
        taste_signals: { brands_mentioned: ['Patagonia', 'Aesop', 'Notion'], preferences: ['ethical sourcing', 'repair programs', 'transparent supply chains'], dislikes: ['greenwashing', 'unnecessary subscriptions', 'fake influencer marketing'] }
      },
      confidence: { demographics: 0.95, values: 0.9, behavioral: 0.85, interests: 0.8, life_context: 0.9, overall: 0.88 }
    }
  },
  {
    name: 'Marcus T.',
    responses: [
      { q: 1, text: "I'm Marcus, 45, living in suburban Atlanta. I run a small logistics company with about 30 employees. Married with two kids — Jaylen (12) and Aisha (9). We've been in the same house for 8 years now, and I coach my son's basketball team on weekends." },
      { q: 2, text: "I grew up in a working-class neighborhood in Detroit. My dad worked at a Ford plant, my mom was a nurse. They taught me that hard work pays off but also that you need to be smart with money. I was the first in my family to finish college, which was a big deal." },
      { q: 3, text: "My business is my main passion, but family time is non-negotiable. I'm into fitness — I run at 5am most mornings. I also mentor young Black entrepreneurs through a local chamber program. Giving back to the community that raised me matters a lot." },
      { q: 4, text: "Running a business in this economy keeps me up at night. Supply chain issues, finding good employees, health insurance costs. On a personal level, I worry about my kids growing up in a world where social media defines their self-worth." },
      { q: 5, text: "For business purchases, I'm all about ROI — show me the numbers, give me case studies, let me talk to other customers. For personal stuff, I'm more brand-loyal than I'd like to admit. Once something works, I stick with it. I don't have time to shop around for everything." },
      { q: 6, text: "I trust companies that stand behind their products. Amazon for business supplies — their logistics are unbeatable, I should know. Nike for athletic gear. My accountant recommended QuickBooks years ago and I've never switched. For my truck, it's always been Ford — family loyalty I guess." },
      { q: 7, text: "I'd want better tools for managing a small business that don't require an IT department to set up. Something that handles payroll, scheduling, and fleet management in one place without costing a fortune or requiring a PhD to use." },
      { q: 8, text: "When companies make promises they can't keep. When customer service is a maze of automated systems. And honestly? When brands try to be political to sell products. Just make good stuff and treat people right." },
      { q: 9, text: "I want to grow my company to 50+ employees and open a second location. I want my kids to see that building something from nothing is possible. And I want to be healthy enough to enjoy it all." },
    ],
    profile: {
      narrative: "Marcus is a 45-year-old small business owner in suburban Atlanta who embodies practical, results-driven decision-making shaped by a working-class upbringing in Detroit. As the first college graduate in his family, he carries both the pride of that achievement and the financial prudence his parents instilled. He runs a 30-person logistics company and evaluates every business purchase on hard ROI.\n\nFamily and community are his anchors. He coaches his son's basketball team, mentors young entrepreneurs, and maintains a strict work-life balance despite the pressures of business ownership. He worries about the economy, healthcare costs, and the impact of social media on his children.\n\nMarcus is deeply brand-loyal once trust is established — he values reliability, straightforward communication, and products that just work without requiring extensive setup or maintenance. He has no patience for corporate posturing or overly complicated tools.",
      attributes: {
        demographics: { age_range: '45-49', location_type: 'suburban', life_stage: 'established professional', household: 'married with children' },
        values: ['hard work', 'family', 'community', 'practical results', 'financial prudence'],
        behavioral_patterns: ['ROI-driven business decisions', 'brand loyal for personal purchases', 'time-constrained shopper', 'values word-of-mouth recommendations', 'early morning routine person'],
        interests: ['fitness/running', 'basketball coaching', 'mentoring entrepreneurs', 'business growth', 'family activities'],
        life_context: ['small business owner', 'father of two', 'first-generation college graduate', 'community mentor', 'health-conscious'],
        decision_style: 'practical',
        communication_style: 'direct',
        taste_signals: { brands_mentioned: ['Amazon Business', 'Nike', 'QuickBooks', 'Ford'], preferences: ['reliable products', 'good customer service', 'all-in-one solutions'], dislikes: ['political brand messaging', 'automated customer service', 'overcomplicated tools'] }
      },
      confidence: { demographics: 0.95, values: 0.9, behavioral: 0.85, interests: 0.8, life_context: 0.85, overall: 0.87 }
    }
  },
  {
    name: 'Priya K.',
    responses: [
      { q: 1, text: "I'm Priya, 28, living in a shared apartment in San Francisco. I'm a data scientist at a health tech startup. Originally from Bangalore, I came to the US for grad school and stayed. I love the energy of the city but honestly the cost of living is brutal." },
      { q: 2, text: "My family in India is upper-middle class. Both parents are engineers. Education was everything — I went to one of the top schools in India before coming to Stanford. My parents still expect weekly video calls and have opinions about everything from my career to my cooking." },
      { q: 3, text: "I'm obsessed with data visualization and creative coding. I make generative art as a hobby. I also teach a free coding bootcamp for women on weekends. And I'm really into specialty coffee — I probably spend too much on beans, but it's my daily ritual." },
      { q: 4, text: "Immigration uncertainty weighs on me. My H-1B situation is stable but not permanent. I also think about whether I should move back to India eventually — the tech scene there is booming. And loneliness, honestly. It's hard to build deep friendships as an adult immigrant." },
      { q: 5, text: "I'm a mix of impulsive and analytical. For tech and gadgets, I research obsessively. For food and experiences, I'm all about trying new things on impulse. I use a lot of recommendation algorithms — Spotify Discover, YouTube suggestions. I trust data-driven recommendations." },
      { q: 6, text: "Apple for devices — the ecosystem lock-in is real and I'm okay with it. Figma for design work. I love small DTC brands for skincare — I found my favorites through Reddit. For food, I trust Yelp reviews more than any influencer." },
      { q: 7, text: "An AI-powered personal finance app that actually understands immigrant finances — like how to optimize for remittances, dual-country tax situations, and building credit from scratch in a new country." },
      { q: 8, text: "Brands that assume everyone's American. Products that don't work internationally. Also, dark patterns in UX — as a designer, I notice them immediately and I lose all respect for the company." },
      { q: 9, text: "I want to either get my green card and build a life here, or go back to India and start something in health tech. Either way, I want to be making decisions that matter — building products that actually help people, not just optimize ad clicks." },
    ],
    profile: {
      narrative: "Priya is a 28-year-old data scientist at a San Francisco health tech startup, originally from Bangalore. She represents the globally mobile, highly educated young professional navigating the intersection of ambitious career goals and immigration uncertainty. With Stanford credentials and engineer parents, she carries high expectations and analytical rigor into every domain of her life.\n\nHer purchasing behavior is fascinatingly split: obsessively researched for tech and tools, impulsively adventurous for food and experiences. She's deeply embedded in recommendation algorithms and trusts data-driven discovery over traditional marketing. Small DTC brands found through Reddit and community forums win her loyalty over big-budget campaigns.\n\nPriya is acutely aware of UX patterns (dark or otherwise) and penalizes brands that use manipulative design. She craves products that acknowledge non-American experiences — from international finances to global perspectives. She's building a meaningful life between two cultures while trying to maximize impact through technology.",
      attributes: {
        demographics: { age_range: '25-29', location_type: 'urban', life_stage: 'young professional', household: 'single, shared apartment' },
        values: ['impact through technology', 'education', 'cultural identity', 'community', 'ethical design'],
        behavioral_patterns: ['research-heavy for tech purchases', 'impulsive for food/experiences', 'trusts algorithmic recommendations', 'active on Reddit and forums', 'teaches and gives back'],
        interests: ['data visualization', 'generative art', 'specialty coffee', 'coding education', 'health tech'],
        life_context: ['immigrant on H-1B visa', 'between two cultures', 'cost-of-living pressured', 'close family ties abroad', 'career-focused'],
        decision_style: 'analytical',
        communication_style: 'expressive',
        taste_signals: { brands_mentioned: ['Apple', 'Figma', 'Spotify', 'Yelp'], preferences: ['DTC brands', 'data-driven recommendations', 'clean UX'], dislikes: ['US-centric product design', 'dark patterns', 'ad-optimized products'] }
      },
      confidence: { demographics: 0.95, values: 0.85, behavioral: 0.9, interests: 0.85, life_context: 0.9, overall: 0.89 }
    }
  },
  {
    name: 'Robert H.',
    responses: [
      { q: 1, text: "I'm Robert, 67, retired from 35 years in public school administration. Living in a small town in Vermont with my wife Carol. We've been married 40 years. Our two kids are grown — one's in Boston, the other in Seattle. We see them a few times a year plus video calls." },
      { q: 2, text: "Grew up on a dairy farm in rural Wisconsin. My parents worked incredibly hard and never wasted anything. We repaired, reused, made do. Going to state college was a big step. Those values of thrift and self-reliance never left me, even when we became comfortable." },
      { q: 3, text: "I read voraciously — history, science, biography. I volunteer at the local library and serve on the town planning board. Carol and I take one big trip a year — last year was Portugal. I also maintain a substantial vegetable garden and do all my own home repairs." },
      { q: 4, text: "Healthcare costs are a real concern as we age. I worry about being a burden on our kids. I'm also troubled by political polarization — I've seen communities torn apart. On a lighter note, I struggle with keeping up with technology. Things change so fast." },
      { q: 5, text: "I buy quality and expect things to last. I'd rather pay more once than replace something three times. I read Consumer Reports, ask friends for recommendations, and avoid anything that feels like a gimmick. I'm skeptical of online reviews but my wife has convinced me to use Amazon for some things." },
      { q: 6, text: "L.L. Bean — lifetime guarantee means something. Honda for cars — we've had three and they all ran forever. For tools, it's always been Stanley and DeWalt. I trust brands with long track records, not trendy startups that might disappear next year." },
      { q: 7, text: "Something that makes it easier to manage healthcare decisions. A simple, clear tool that helps me compare Medicare plans, track medications, and communicate with doctors. Not an app with a million features — just something that works for people my age." },
      { q: 8, text: "Companies that make things intentionally hard to repair. Planned obsolescence in general. Also, when tech companies assume everyone is 25 and on TikTok. And fine print — if you have to hide the terms, something's wrong." },
      { q: 9, text: "I want to stay healthy and independent. I want to see my grandkids grow up. I want to keep contributing to my community. Carol and I talk about simplifying — maybe a smaller house eventually. But Vermont is home." },
    ],
    profile: {
      narrative: "Robert is a 67-year-old retired school administrator in rural Vermont whose purchasing philosophy is rooted in durability, value, and self-reliance. Raised on a Wisconsin dairy farm where nothing was wasted, he carries deep-seated values of thrift and quality that guide every spending decision. He'd rather pay premium once for something built to last than deal with replacements.\n\nHe and his wife Carol live a rich life centered on community service, travel, reading, and gardening. He's active on the town planning board and volunteers at the library. Technology is an area of admitted struggle — he appreciates tools that are simple and purposeful, not feature-bloated or designed for a younger demographic.\n\nRobert represents the experienced consumer who values track record over trendiness. He trusts brands like L.L. Bean and Honda that have proven reliability over decades. He's deeply skeptical of planned obsolescence, hidden terms, and products that assume digital fluency. His biggest unmet need is straightforward healthcare management tools designed with older adults in mind.",
      attributes: {
        demographics: { age_range: '65-69', location_type: 'rural', life_stage: 'retiree', household: 'married, empty nest' },
        values: ['quality and durability', 'self-reliance', 'community service', 'thrift', 'simplicity'],
        behavioral_patterns: ['buys quality to last', 'reads Consumer Reports', 'asks friends for recommendations', 'skeptical of online reviews', 'prefers in-store shopping'],
        interests: ['reading', 'gardening', 'travel', 'home repair', 'local governance'],
        life_context: ['retired educator', 'long marriage', 'adult children far away', 'healthcare concerns', 'technology-challenged'],
        decision_style: 'analytical',
        communication_style: 'reserved',
        taste_signals: { brands_mentioned: ['L.L. Bean', 'Honda', 'Stanley', 'DeWalt', 'Consumer Reports'], preferences: ['lifetime guarantees', 'proven track records', 'simple interfaces'], dislikes: ['planned obsolescence', 'youth-focused design', 'hidden terms and fine print'] }
      },
      confidence: { demographics: 0.95, values: 0.95, behavioral: 0.9, interests: 0.85, life_context: 0.9, overall: 0.91 }
    }
  },
  {
    name: 'Lin W.',
    responses: [
      { q: 1, text: "I'm Lin, 38, living in Brooklyn. I'm a freelance brand strategist working with fashion and beauty brands. Originally from Shanghai, been in the US for 15 years. I live with my cat Mochi in a studio apartment that I've somehow made look way bigger than it is." },
      { q: 2, text: "I grew up in a competitive academic environment in Shanghai. My parents sacrificed a lot to send me to a top university in the US. They're proud but don't fully understand my career — 'brand strategist' doesn't translate well. They wish I were a doctor or had a stable corporate job." },
      { q: 3, text: "Fashion, obviously — but not fast fashion. I curate vintage pieces and mix them with contemporary design. I'm into photography, both film and digital. I run a small but engaged Instagram where I share styling tips and brand analysis. Meditation has been a game changer for my anxiety." },
      { q: 4, text: "Freelance income instability is real. Some months I'm flush, others I'm stressed. I also think about the ethics of the fashion industry constantly — it's hard to work in an industry you love but also find deeply problematic. And the pressure to perform a perfect life on social media." },
      { q: 5, text: "I'm highly influenced by aesthetics and design. If a product looks beautiful and the branding is cohesive, I'm already halfway sold. But I also look at materials, sourcing, and whether the brand has a genuine point of view vs. just chasing trends. I discover most things through Instagram and niche newsletters." },
      { q: 6, text: "Aritzia for everyday basics. Glossier changed my skincare routine — their branding is just perfect. I love Muji for home goods — minimalism that actually works. For work tools, it's Figma and Canva. I also support several independent designers I've found through Instagram." },
      { q: 7, text: "A platform that connects freelance creatives with brands in a way that isn't exploitative. Current platforms take huge cuts and treat creatives as expendable. Something that values the relationship and helps build long-term partnerships." },
      { q: 8, text: "Brands that copy Asian aesthetics without credit. Cultural appropriation dressed up as 'inspiration.' Also, brands that performatively celebrate diversity in ads but have zero diversity in their leadership. And bad typography — if your logo looks cheap, I can't take you seriously." },
      { q: 9, text: "I want to build my consultancy into a proper agency. Hire a small team, work with brands that genuinely want to do better. Maybe split time between New York and Shanghai. And finally learn to take a vacation without checking email." },
    ],
    profile: {
      narrative: "Lin is a 38-year-old freelance brand strategist in Brooklyn, originally from Shanghai, who operates at the intersection of fashion, design, and cultural identity. Her purchasing decisions are heavily driven by aesthetics and brand coherence — if the visual identity is strong and authentic, she's drawn in. But she goes deeper, evaluating materials, sourcing ethics, and whether a brand has genuine creative conviction or is merely trend-chasing.\n\nHer discovery channels are distinctly modern: Instagram, niche newsletters, and independent designer communities. She's both a consumer and a professional critic of branding, giving her unusually sophisticated taste and high standards. She curates vintage fashion, practices meditation, and maintains an engaged social media presence sharing brand analysis.\n\nLin navigates the tension between loving her industry and recognizing its ethical problems. She's sensitive to cultural appropriation, performative diversity, and the exploitative economics of freelance creative work. She represents the design-literate, globally-minded consumer who demands authenticity in every pixel.",
      attributes: {
        demographics: { age_range: '35-39', location_type: 'urban', life_stage: 'established freelancer', household: 'single' },
        values: ['aesthetic excellence', 'cultural authenticity', 'creative integrity', 'ethical fashion', 'independence'],
        behavioral_patterns: ['aesthetics-driven purchasing', 'discovers via Instagram and newsletters', 'supports independent designers', 'curates rather than accumulates', 'professional brand evaluator'],
        interests: ['fashion curation', 'photography', 'brand strategy', 'meditation', 'vintage shopping'],
        life_context: ['freelance income variability', 'bicultural identity', 'industry ethics tension', 'social media presence', 'building agency aspirations'],
        decision_style: 'emotional',
        communication_style: 'expressive',
        taste_signals: { brands_mentioned: ['Aritzia', 'Glossier', 'Muji', 'Figma', 'Canva'], preferences: ['strong visual identity', 'minimalist design', 'indie designers'], dislikes: ['cultural appropriation', 'performative diversity', 'bad typography'] }
      },
      confidence: { demographics: 0.95, values: 0.9, behavioral: 0.9, interests: 0.9, life_context: 0.85, overall: 0.9 }
    }
  },
  {
    name: 'James O.',
    responses: [
      { q: 1, text: "James, 23, just graduated from community college in Austin, Texas. Working as a barista and doing rideshare driving while I figure out what's next. Living with two roommates in a house we're probably paying too much for. First in my family to finish any kind of college degree." },
      { q: 2, text: "Single mom raised me and my younger sister. We moved around a lot — different apartments, different schools. Money was always tight. My mom worked two jobs and I started working at 16 to help out. I don't have any illusions about how hard things can be." },
      { q: 3, text: "Gaming is my escape and my community. I'm into competitive FPS games and have a decent streaming setup. I also got into personal finance through YouTube — Graham Stephan, Andrei Jikh, that world. Trying to break the cycle and actually build some wealth." },
      { q: 4, text: "Student loan debt. Not having a clear career path. Everyone my age seems to be thriving on social media and I'm just trying to make rent. I worry about my mom's health — she doesn't have great insurance. And honestly, the housing market feels impossible for my generation." },
      { q: 5, text: "I'm extremely price-sensitive but I don't want trash. I look for the best value — quality per dollar. I use Reddit, YouTube reviews, and Wirecutter before buying anything significant. For everyday stuff, I'm a store-brand guy. I use cashback apps and never pay full retail if I can help it." },
      { q: 6, text: "For gaming, it's Logitech for peripherals and I just saved up for a custom PC build. IKEA for furniture — good enough design at prices I can handle. I buy everything I can from Costco, even with the membership fee it saves me money. For clothes, honestly, Target and thrift stores." },
      { q: 7, text: "A real career guidance platform for people who didn't go the traditional 4-year college route. Not another 'learn to code' bootcamp, but something that shows you realistic paths based on your skills, connects you to mentors, and doesn't cost thousands of dollars upfront." },
      { q: 8, text: "When brands market luxury aspirational stuff to people who clearly can't afford it. Also, hidden fees — like when the price changes at checkout. And companies that prey on financial illiteracy with bad credit products. That's predatory." },
      { q: 9, text: "I want to be financially stable. Like, not rich, just not stressed about money every day. I want my mom to be able to retire. I want to find a career that I actually care about, not just a paycheck. And maybe own a home someday — wild dream, I know." },
    ],
    profile: {
      narrative: "James is a 23-year-old recent community college graduate in Austin, navigating the challenging transition from education to career while working as a barista and rideshare driver. Raised by a single mother who worked two jobs, he's developed a sharp eye for value and a deep skepticism of anything that smells like financial exploitation. He's the quintessential value-maximizer: price-sensitive but quality-aware.\n\nHis discovery and research process is thoroughly digital — YouTube reviewers, Reddit communities, Wirecutter, and cashback apps form his purchasing infrastructure. Gaming is both his primary hobby and social community, and he's channeled his digital fluency into self-educating on personal finance through YouTube creators.\n\nJames represents an underserved demographic: the non-traditional education pathway consumer who is financially constrained but digitally sophisticated. He resents aspirational marketing aimed at people who can't afford it and has zero tolerance for hidden fees or predatory financial products. His biggest unmet need is accessible career guidance that doesn't gatekeep behind expensive programs.",
      attributes: {
        demographics: { age_range: '20-24', location_type: 'urban', life_stage: 'early career', household: 'shared housing with roommates' },
        values: ['financial stability', 'family responsibility', 'value for money', 'self-improvement', 'authenticity'],
        behavioral_patterns: ['extreme value optimizer', 'heavy YouTube and Reddit researcher', 'uses cashback and coupon apps', 'store-brand buyer', 'saves up for quality tech'],
        interests: ['competitive gaming', 'personal finance', 'streaming', 'PC building', 'career development'],
        life_context: ['student debt', 'first-generation graduate', 'gig economy worker', 'supporting family', 'housing-cost stressed'],
        decision_style: 'practical',
        communication_style: 'direct',
        taste_signals: { brands_mentioned: ['Logitech', 'IKEA', 'Costco', 'Target', 'Wirecutter'], preferences: ['best value per dollar', 'honest pricing', 'bulk savings'], dislikes: ['aspirational luxury marketing', 'hidden fees', 'predatory credit products'] }
      },
      confidence: { demographics: 0.95, values: 0.9, behavioral: 0.9, interests: 0.85, life_context: 0.95, overall: 0.91 }
    }
  },
];

async function seed() {
  console.log('Seeding Lens database with 6 demo personas...\n');

  for (const persona of PERSONAS) {
    console.log(`Creating persona: ${persona.name}...`);

    // 1. Create contributor
    const { data: contributor, error: contribError } = await supabase
      .from('contributors')
      .insert({ consent_status: 'granted' })
      .select('id')
      .single();

    if (contribError) {
      console.error(`  Error creating contributor: ${contribError.message}`);
      continue;
    }

    console.log(`  Contributor ID: ${contributor.id}`);

    // 2. Insert raw responses
    const responses = persona.responses.map(r => ({
      contributor_id: contributor.id,
      question_number: r.q,
      response_text: r.text,
    }));

    const { error: respError } = await supabase
      .from('raw_responses')
      .insert(responses);

    if (respError) {
      console.error(`  Error inserting responses: ${respError.message}`);
      continue;
    }

    console.log(`  Inserted ${responses.length} responses`);

    // 3. Create persona profile
    const { data: profile, error: profileError } = await supabase
      .from('persona_profiles')
      .insert({
        contributor_id: contributor.id,
        narrative: persona.profile.narrative,
        attributes_json: persona.profile.attributes,
        confidence_scores: persona.profile.confidence,
        published: true,
        version: 1,
      })
      .select('id')
      .single();

    if (profileError) {
      console.error(`  Error creating profile: ${profileError.message}`);
      continue;
    }

    console.log(`  Persona ID: ${profile.id}`);
    console.log(`  ✓ ${persona.name} created successfully\n`);
  }

  console.log('Done! 6 personas seeded.');
}

seed().catch(console.error);
