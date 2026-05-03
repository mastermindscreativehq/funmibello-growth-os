// Content Idea Service — FUNMI BELLO Growth OS
// Generates professional fashion content ideas.
// Uses OpenAI if OPENAI_API_KEY is valid, otherwise falls back safely.

const axios = require('axios');

const FALLBACK_IDEAS = [
  {
    title: 'Before You Buy Native Wear',
    hook: 'Most men waste money on native wear because they ignore fit.',
    format: 'Educational Reel',
    caption: 'Before you buy your next premium native outfit, check the fit, fabric, and finishing. Luxury is in the details.',
    angle: 'Style education',
    cta: 'DM us “STYLE” for premium menswear guidance.'
  },
  {
    title: 'Abuja Premium Men Style Check',
    hook: 'If you’re a young man in Abuja, your outfit is speaking before you talk.',
    format: 'Talking-head video',
    caption: 'Your clothes communicate status, taste, and confidence. Funmi Bello Fashion helps men show up sharp.',
    angle: 'Identity/status',
    cta: 'Message us to build your next look.'
  },
  {
    title: 'One Outfit, Three Occasions',
    hook: 'One premium native outfit can serve more than one event.',
    format: 'Carousel',
    caption: 'Style one native outfit for weddings, business visits, and evening hangouts with the right accessories.',
    angle: 'Practical styling',
    cta: 'Save this before your next event.'
  },
  {
    title: 'Fabric Quality Test',
    hook: 'Cheap fabric always exposes itself after one wash.',
    format: 'Reel demo',
    caption: 'Premium menswear starts with fabric selection. We choose materials that look good and last.',
    angle: 'Quality proof',
    cta: 'DM “FABRIC” to ask about available options.'
  },
  {
    title: 'Customer Transformation',
    hook: 'This is what happens when the outfit finally matches the man.',
    format: 'Before/after Reel',
    caption: 'A strong outfit changes posture, confidence, and presence. That is the Funmi Bello effect.',
    angle: 'Transformation',
    cta: 'Book your look today.'
  }
];

function cleanInput(input = {}) {
  return {
    brand: input.brand || 'Funmi Bello Fashion',
    niche: input.niche || 'premium menswear',
    audience: input.audience || 'young men in Abuja',
    goal: input.goal || 'increase engagement and sales'
  };
}

function buildPrompt(input) {
  return `
You are a senior fashion content strategist for a Nigerian premium menswear brand.

Brand: ${input.brand}
Niche: ${input.niche}
Audience: ${input.audience}
Goal: ${input.goal}

Generate 10 professional content ideas.

Return ONLY valid JSON in this exact format:
{
  "ideas": [
    {
      "title": "",
      "hook": "",
      "format": "",
      "caption": "",
      "angle": "",
      "cta": ""
    }
  ]
}
`;
}

async function generateWithOpenAI(input) {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey || !apiKey.startsWith('sk-')) {
    return null;
  }

  const response = await axios.post(
    'https://api.openai.com/v1/chat/completions',
    {
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You generate clean JSON content strategy outputs for fashion brands.'
        },
        {
          role: 'user',
          content: buildPrompt(input)
        }
      ],
      temperature: 0.7,
      response_format: { type: 'json_object' }
    },
    {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      timeout: 30000
    }
  );

  const content = response.data?.choices?.[0]?.message?.content;

  if (!content) {
    throw new Error('OpenAI returned empty content');
  }

  const parsed = JSON.parse(content);

  if (!parsed.ideas || !Array.isArray(parsed.ideas)) {
    throw new Error('OpenAI response does not contain ideas array');
  }

  return parsed.ideas;
}

async function generateContentIdeas(payload = {}) {
  const input = cleanInput(payload);

  let ideas;

  try {
    const aiIdeas = await generateWithOpenAI(input);
    ideas = aiIdeas || FALLBACK_IDEAS;
  } catch (err) {
    console.error('[CONTENT IDEA OPENAI ERROR]', {
      message: err.message,
      status: err.response?.status,
      data: err.response?.data
    });

    ideas = FALLBACK_IDEAS;
  }

  return {
    brand: input.brand,
    niche: input.niche,
    audience: input.audience,
    goal: input.goal,
    source: ideas === FALLBACK_IDEAS ? 'fallback' : 'openai',
    ideas
  };
}

module.exports = {
  generateContentIdeas
};