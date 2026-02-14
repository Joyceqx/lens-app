export const ONBOARDING_QUESTIONS = [
  { id: 1, phase: "Ground" as const, tags: ["DEMOGRAPHIC", "LIFE CONTEXT"], weight: 10, question: "Tell us a little about yourself \u2014 what do you do, and what does a typical week look like for you?", hint: "Your routine, your work, your rhythm." },
  { id: 2, phase: "Open" as const, tags: ["LIFE CONTEXT", "VALUES"], weight: 10, question: "What\u2019s been taking up most of your time and energy lately \u2014 whether it\u2019s something exciting, stressful, or just all-consuming?", hint: "Exciting, stressful, mundane \u2014 it all counts." },
  { id: 3, phase: "Open" as const, tags: ["VALUES"], weight: 10, question: "What matters most to you when you think about how you want to live your life? What principles or values do you find yourself coming back to?", hint: "Think big or small \u2014 what guides your decisions?" },
  { id: 4, phase: "Connect" as const, tags: ["BEHAVIORAL", "VALUES"], weight: 10, question: "When you\u2019re not working, what do you genuinely enjoy spending your time and money on?", hint: "The 'and money' part matters \u2014 what do you actually invest in?" },
  { id: 5, phase: "Connect" as const, tags: ["BEHAVIORAL"], weight: 10, question: "Think about the last purchase you were really happy with \u2014 what was it, and what made it feel like the right choice?", hint: "A specific story tells us more than a general preference." },
  { id: 6, phase: "Connect" as const, tags: ["VALUES", "BEHAVIORAL"], weight: 10, question: "Is there something you believe in or care about that actually influences the choices you make \u2014 what you buy, where you spend, who you support?", hint: "If 'not really,' that\u2019s equally valuable." },
  { id: 7, phase: "Project" as const, tags: ["BEHAVIORAL"], weight: 10, question: "How do you usually discover new products or brands you end up loving? And when you\u2019re deciding between two similar options, what usually tips the scales?", hint: "Friends, algorithms, reviews, gut feeling?" },
  { id: 8, phase: "Project" as const, tags: ["LIFE CONTEXT", "BEHAVIORAL"], weight: 10, question: "What\u2019s something you\u2019ve been meaning to buy, try, or change in your life but haven\u2019t gotten around to yet?", hint: "The gap between intention and action is interesting." },
  { id: 9, phase: "Celebrate" as const, tags: ["VALUES", "BEHAVIORAL"], weight: 10, question: "If a close friend asked you to recommend one thing \u2014 a product, a place, an experience, anything \u2014 what would you be most excited to tell them about right now?", hint: "What you recommend reveals what you truly love." },
];

// 9 questions × 10 points each = 90 max
export const TOTAL_WEIGHT = ONBOARDING_QUESTIONS.reduce((s, q) => s + q.weight, 0);

export const REWARD_TIERS = [
  { threshold: 60, reward: "$10", profiles: 1, color: "#C8A96E", name: "Bronze", icon: "\u{1F949}" },
  { threshold: 80, reward: "$25", profiles: 2, color: "#D4A853", name: "Silver", icon: "\u{1F948}" },
  { threshold: 95, reward: "$30", profiles: 3, color: "#FFD700", name: "Gold", icon: "\u{1F3C6}" },
];

export const PHASES = [
  { name: "Ground", icon: "\u25C9", desc: "Getting to know you" },
  { name: "Open", icon: "\u25CE", desc: "What drives you" },
  { name: "Connect", icon: "\u25C8", desc: "Values meet behavior" },
  { name: "Project", icon: "\u25C7", desc: "Looking ahead" },
  { name: "Celebrate", icon: "\u2605", desc: "Share what you love" },
];

export const TAG_COLORS: Record<string, { bg: string; text: string }> = {
  DEMOGRAPHIC: { bg: "#EDE7F6", text: "#5E35B1" },
  "LIFE CONTEXT": { bg: "#E8F5E9", text: "#2E7D32" },
  VALUES: { bg: "#FFF3E0", text: "#E65100" },
  BEHAVIORAL: { bg: "#E3F2FD", text: "#1565C0" },
};

export const COMPARISON_QUESTIONS = [
  "What\u2019s the best way to spend a rainy Sunday?",
  "Is it better to be brutally honest or diplomatically kind?",
  "What matters more \u2014 freedom or security?",
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
