export const ONBOARDING_QUESTIONS = [
  { id: 1, weight: 10, question: "What do you do, and what does a typical week look like for you?", hint: "Your routine, your work, your rhythm." },
  { id: 2, weight: 10, question: "What\u2019s been taking up most of your time and energy lately?", hint: "Exciting, stressful, mundane \u2014 it all counts." },
  { id: 3, weight: 10, question: "If you had a free weekend day with no obligations, how would you spend it?", hint: "No budget limits, no responsibilities \u2014 just you." },
  { id: 4, weight: 10, question: "What\u2019s a recent purchase you were really happy with, and why?", hint: "A specific story tells us more than a general preference." },
  { id: 5, weight: 10, question: "How do you usually discover new products or brands you end up loving?", hint: "Friends, algorithms, reviews, gut feeling?" },
  { id: 6, weight: 10, question: "When you\u2019re torn between the cheaper option and the one that feels right, which usually wins?", hint: "Price vs. quality, convenience vs. values, head vs. heart." },
  { id: 7, weight: 10, question: "What\u2019s something you\u2019ve been meaning to buy, try, or change but haven\u2019t gotten around to yet?", hint: "The gap between intention and action is interesting." },
  { id: 8, weight: 10, question: "What matters most to you in how you live your life?", hint: "Think big or small \u2014 what guides your choices?" },
];

// 8 questions × 10 points each = 80 max
export const TOTAL_WEIGHT = ONBOARDING_QUESTIONS.reduce((s, q) => s + q.weight, 0);

export const REWARD_TIERS = [
  { threshold: 60, reward: "$10", profiles: 1, color: "#C8A96E", name: "Bronze", icon: "\u{1F949}" },
  { threshold: 80, reward: "$25", profiles: 2, color: "#D4A853", name: "Silver", icon: "\u{1F948}" },
  { threshold: 95, reward: "$30", profiles: 3, color: "#FFD700", name: "Gold", icon: "\u{1F3C6}" },
];

export const COMPARISON_QUESTIONS = [
  "What\u2019s the best way to spend a rainy Sunday?",
  "Is it better to be brutally honest or diplomatically kind?",
  "What matters more \u2014 freedom or security?",
];

export const DEMOGRAPHIC_FIELDS = [
  {
    key: 'gender',
    label: 'Gender',
    icon: '\u{1F464}',
    options: ['Male', 'Female', 'Non-binary', 'Prefer to self-describe', 'Prefer not to say'],
  },
  {
    key: 'age_range',
    label: 'Age Range',
    icon: '\u{1F382}',
    options: ['18\u201324', '25\u201334', '35\u201344', '45\u201354', '55\u201364', '65+'],
  },
  {
    key: 'ethnicity',
    label: 'Ethnicity',
    icon: '\u{1F30D}',
    options: ['Asian', 'Black / African American', 'Hispanic / Latino', 'Middle Eastern / North African', 'Native American / Indigenous', 'Pacific Islander', 'White / Caucasian', 'Mixed / Multiracial', 'Prefer to self-describe', 'Prefer not to say'],
  },
  {
    key: 'region',
    label: 'Region',
    icon: '\u{1F4CD}',
    options: ['North America', 'Europe', 'Asia Pacific', 'Latin America', 'Middle East & Africa', 'Oceania'],
  },
  {
    key: 'education',
    label: 'Education Level',
    icon: '\u{1F393}',
    options: ['High school or less', 'Some college', 'Bachelor\u2019s degree', 'Master\u2019s degree', 'Doctorate / Professional', 'Prefer not to say'],
  },
  {
    key: 'income',
    label: 'Household Income',
    icon: '\u{1F4B0}',
    options: ['Under $30k', '$30k\u2013$60k', '$60k\u2013$100k', '$100k\u2013$150k', '$150k+', 'Prefer not to say'],
  },
  {
    key: 'household',
    label: 'Household',
    icon: '\u{1F3E0}',
    options: ['Living alone', 'With partner', 'With family / children', 'With roommates', 'With parents', 'Prefer not to say'],
  },
];

export const COMPARISON_RESPONSES = [
  {
    type: "generic",
    label: "Generic AI",
    responses: [
      "A rainy Sunday can be enjoyed with a good book, some tea, and relaxing music. Many people also enjoy watching movies or cooking.",
      "Both honesty and diplomacy have their merits. The best approach depends on the situation and the relationship.",
      "Freedom and security are both fundamental values. Most people seek a balance between the two.",
    ],
  },
  {
    type: "persona1",
    label: "Impact-Driven MBA Student",
    responses: [
      "I\u2019d split it \u2014 morning for catching up on reading or a side project, afternoon for anime and recharging. Rain makes me feel like it\u2019s okay to go deep on something without guilt.",
      "Diplomatically honest. In business school you learn fast that how you deliver truth matters as much as the truth itself \u2014 but I won\u2019t sugarcoat things that matter.",
      "Freedom, but with a foundation. I want enough security to take bold risks \u2014 that\u2019s the whole reason I\u2019m investing in an MBA. Build capability first, then use it freely.",
    ],
  },
  {
    type: "persona2",
    label: "Practical-Minded Foreman",
    responses: [
      "Rainy Sundays are for the workshop. I\u2019ve got a bookshelf project that\u2019s been waiting three weeks. Weather\u2019s not gonna build it for me.",
      "Honest, full stop. People respect you more when you tell it straight. My crew doesn\u2019t need diplomacy, they need to know if the work\u2019s right or not.",
      "Security. Freedom means nothing if your family\u2019s not taken care of. You earn freedom by building something solid first.",
    ],
  },
  {
    type: "personal",
    label: "Your Persona",
    responses: [
      "Based on your profile, you\u2019d use the quiet to dig deep into that topic you can\u2019t stop thinking about \u2014 rain is background music for focus.",
      "Given how you approach decisions, you\u2019d lean toward honest kindness \u2014 direct enough to be real, thoughtful enough to preserve the relationship.",
      "From your values, it\u2019s nuanced \u2014 enough security to take meaningful risks, seeing freedom as the power to choose.",
    ],
  },
];
