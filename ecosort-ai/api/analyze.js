import { GoogleGenerativeAI } from '@google/generative-ai'

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '15mb',
    },
  },
}

const ALLOWED_CATEGORIES = [
  'Plastic',
  'Paper',
  'Glass',
  'Metal',
  'Organic',
  'E-Waste',
  'Hazardous',
  'Other',
]

const PROMPT = `
You are EcoSort AI, an intelligent mixed-waste segregation assistant.

Analyze the entire uploaded image carefully.

The image may contain:
- one waste item
- multiple waste items
- a mixed garbage pile
- roadside garbage
- landfill waste
- dumpster contents
- garbage collection vehicle waste
- heavily overlapping mixed waste

Your job is to identify ALL clearly visible waste items and estimate the number of INDIVIDUAL PHYSICAL OBJECTS for each type.

═══════════════════════════════════════════
CRITICAL: WHAT "quantity" MEANS
═══════════════════════════════════════════

"quantity" means: THE ESTIMATED NUMBER OF INDIVIDUAL PHYSICAL WASTE OBJECTS belonging to that item group.

"quantity" DOES NOT mean:
- number of clusters
- number of categories
- number of item groups
- number of entries in the items array
- always 1

Example:
If you see approximately 20 plastic bottles:
{ "item": "Plastic bottles", "quantity": 20 }

NOT:
{ "item": "Plastic bottles", "quantity": 1 }

If you see approximately 15 plastic bags:
{ "item": "Plastic bags/wrappers", "quantity": 15 }

NOT:
{ "item": "Plastic bags/wrappers", "quantity": 1 }

═══════════════════════════════════════════
DENSE GARBAGE PILE RULE
═══════════════════════════════════════════

When the image contains a garbage pile, roadside garbage, landfill waste, dumpster contents, garbage collection vehicle, large mixed-waste pile, or heavily overlapping waste:

1. Do NOT assign quantity 1 simply because many similar objects overlap or form a cluster.
2. ESTIMATE how many individual physical objects of each recognizable type are visible.
3. A pile containing many plastic bags must have an estimated quantity such as 15, 25, 35, 40 — not quantity 1.
4. Similarly estimate individual bottles, cans, paper pieces, organic items, etc.
5. For dense or partially occluded piles, provide the BEST CONSERVATIVE VISUAL ESTIMATE.
6. Do NOT reduce a large pile to only a few representative objects with quantity 1 each.

Example for a garbage pile:
If a garbage pile visually appears to contain approximately:
25 plastic bags/wrappers,
12 plastic bottles/containers,
8 cardboard/paper pieces,
10 food/organic waste items,
5 metal cans,
10 miscellaneous objects,

the item quantities should be approximately:
25, 12, 8, 10, 5, 10

and totalItems should be approximately 70, NOT 6.

═══════════════════════════════════════════
GROUPING RULE
═══════════════════════════════════════════

Group visually similar items together.

For example:
If you see 3 plastic bottles, do NOT return three separate entries.
Return one entry with:
"item": "Plastic bottles",
"quantity": 3

═══════════════════════════════════════════
DO NOT LIMIT DETECTION
═══════════════════════════════════════════

Do NOT intentionally limit analysis to 5, 6, 7, or 10 objects.
Identify ALL clearly distinguishable waste GROUPS and estimate the physical quantity for each group.

═══════════════════════════════════════════
AVOID VAGUE CATCH-ALL GROUPS
═══════════════════════════════════════════

Avoid output such as:
"Miscellaneous mixed municipal waste", quantity: 1

when the visible objects can be classified into meaningful waste groups.

Use "Other" only when objects genuinely do not fit Plastic, Paper, Glass, Metal, Organic, E-Waste, or Hazardous.

Do NOT use a single "Other" entry with quantity 1 to represent a large pile of unidentified objects. If many unidentifiable objects are visible, estimate their quantity conservatively.

Return ONLY a valid JSON object using exactly this structure:

{
  "wasteDetected": true,
  "totalItems": 0,

  "items": [
    {
      "item": "Name of waste item",
      "quantity": 1,
      "material": "Likely material",
      "category": "Plastic",
      "recyclable": true,
      "disposal": "Recommended disposal method",
      "explanation": "Short explanation based on visual evidence"
    }
  ],

  "summary": {
    "Plastic": 0,
    "Paper": 0,
    "Glass": 0,
    "Metal": 0,
    "Organic": 0,
    "E-Waste": 0,
    "Hazardous": 0,
    "Other": 0
  },

  "uncertainty": "Mention objects that are unclear, hidden, overlapping, or difficult to count."
}

RULES:

1. Detect as many clearly visible waste items as possible.

2. "quantity" MUST be a positive whole number representing the ESTIMATED COUNT OF INDIVIDUAL PHYSICAL OBJECTS in that group.

3. "totalItems" must equal the sum of all item quantities (i.e., the total estimated physical object count).

4. Group identical or visually similar objects together.

5. "category" MUST be exactly ONE of:
Plastic
Paper
Glass
Metal
Organic
E-Waste
Hazardous
Other

6. The summary values represent NUMBER OF INDIVIDUAL PHYSICAL OBJECTS, not number of item groups.

Example:
3 plastic bottles and 5 plastic bags means:
"Plastic": 8

7. If the material cannot be determined visually, use:
"Unknown"
or
"Likely ..."

8. Do NOT invent confidence percentages.

9. Quantity is a visual estimate.
If objects overlap or cannot be counted reliably, explain this in "uncertainty".

10. Do NOT count the same object twice.

11. Ignore background objects that are clearly not waste.

12. For recyclable objects, set "recyclable" to true.
If recyclability depends heavily on local facilities or contamination, make that clear in the disposal recommendation.

13. Batteries, chemicals, medical waste, bulbs, and similar dangerous materials should be categorized as Hazardous when appropriate.

14. Electronic devices, cables, chargers, circuit boards and similar electronic waste should be categorized as E-Waste.

15. Hazardous waste and E-Waste should include special disposal warnings and should not be recommended for ordinary household trash.

16. Recycling and disposal regulations vary by location. Mention this where appropriate.

17. Keep explanations and disposal recommendations concise.

18. Return ONLY raw JSON.

19. NO markdown.
20. NO code fences.
21. NO text before the JSON.
22. NO text after the JSON.

23. CRITICAL DOUBLE-COUNTING RULE:
- Every physical object may belong to ONLY ONE category.
- NEVER include the same object in multiple item groups or categories.
- Hazardous takes priority over E-Waste when an object such as a battery or hazardous bulb could fit both.
- Example: if a battery is classified as Hazardous, do NOT also include that battery in the E-Waste quantity.
- Before returning the JSON, verify that no visible object has been counted twice.

24. NO-WASTE / UNCLEAR IMAGE RULE:

First determine whether the image contains identifiable waste.

If there is no clearly identifiable waste, return:

{
  "wasteDetected": false,
  "totalItems": 0,
  "items": [],
  "summary": {
    "Plastic": 0,
    "Paper": 0,
    "Glass": 0,
    "Metal": 0,
    "Organic": 0,
    "E-Waste": 0,
    "Hazardous": 0,
    "Other": 0
  },
  "uncertainty": "No clearly identifiable waste was detected in this image."
}

If clearly identifiable waste is present, set:
"wasteDetected": true

and return the complete normal analysis structure above.

Do not invent waste objects when the image does not clearly contain waste.
If the image is too blurry, dark, obstructed, or ambiguous to analyze reliably,
set wasteDetected to false and explain the reason in uncertainty.

25. UNCERTAINTY FOR DENSE PILES:
When the image shows a dense garbage pile or heavily overlapping waste, quantities cannot be exact.
Provide the best conservative visual estimate and clearly state in "uncertainty" that:
- quantities are approximate visual estimates
- overlapping or partially hidden objects may affect accuracy
- the count represents a conservative estimate of visible individual objects

A suitable uncertainty message:
"AI visual estimate — overlapping or partially hidden objects may affect quantity accuracy. Counts represent conservative estimates of individually distinguishable waste objects."
`

export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') {
    return res.status(200).json({})
  }

  if (req.method !== 'POST') {
    return res.status(405).json({
      error: 'Method not allowed. Use POST.',
    })
  }

  // API key
  const apiKey = process.env.GEMINI_API_KEY

  if (!apiKey || apiKey === 'your_key_here') {
    console.error('GEMINI_API_KEY is not configured')

    return res.status(500).json({
      error:
        'Server configuration error: Gemini API key is not set. Add your key to .env.local.',
    })
  }

  // Request body
  const { image, mimeType } = req.body || {}

  if (!image || !mimeType) {
    return res.status(400).json({
      error:
        'Missing required fields: "image" (base64 string) and "mimeType".',
    })
  }

  const validMimeTypes = [
    'image/jpeg',
    'image/png',
    'image/webp',
  ]

  if (!validMimeTypes.includes(mimeType)) {
    return res.status(400).json({
      error: `Unsupported image type "${mimeType}". Accepted types: JPG, PNG, WebP.`,
    })
  }

  // Image size check
  const estimatedBytes = (image.length * 3) / 4

  if (estimatedBytes > 10 * 1024 * 1024) {
    return res.status(400).json({
      error: 'Image exceeds the 10 MB limit.',
    })
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey)

    // KEEP THIS MODEL — it is working for your project
    const model = genAI.getGenerativeModel({
      model: 'gemini-3.5-flash-lite',
    })

    let result
    let lastError

    // Retry if Gemini is temporarily busy
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        result = await model.generateContent([
          PROMPT,
          {
            inlineData: {
              data: image,
              mimeType,
            },
          },
        ])

        break
      } catch (error) {
        lastError = error

        console.error(
          `Gemini attempt ${attempt} failed:`,
          error.message
        )

        const retryable =
          error.status === 503 ||
          error.status === 429 ||
          error.message?.includes('503') ||
          error.message?.includes('429') ||
          error.message?.includes('high demand') ||
          error.message?.includes('fetch failed')

        if (!retryable || attempt === 3) {
          throw error
        }

        await new Promise((resolve) =>
          setTimeout(resolve, attempt * 2000)
        )
      }
    }

    if (!result) {
      throw lastError
    }

    const responseText = result.response.text()

    // Parse JSON
    let parsed

    try {
      const cleaned = responseText
        .replace(/```json\s*/gi, '')
        .replace(/```\s*/g, '')
        .trim()

      parsed = JSON.parse(cleaned)
    } catch {
      console.error(
        'Failed to parse Gemini response:',
        responseText
      )

      return res.status(502).json({
        error:
          'The AI returned an unparseable response. Please try again.',
      })
    }

    // Validate items array
    if (!Array.isArray(parsed.items)) {
      return res.status(502).json({
        error:
          'The AI returned an invalid item list. Please try again.',
      })
    }
    // Determine whether valid waste was detected
parsed.wasteDetected =
  parsed.wasteDetected !== false && parsed.items.length > 0

    // Clean every detected item
    parsed.items = parsed.items.map((item) => {
      // Category validation
      if (!ALLOWED_CATEGORIES.includes(item.category)) {
        item.category = 'Other'
      }

      // Quantity validation
      const quantity = Number(item.quantity)

      item.quantity =
        Number.isInteger(quantity) && quantity > 0
          ? quantity
          : 1

      // Boolean validation
      if (typeof item.recyclable !== 'boolean') {
        item.recyclable = null
      }

      // Fallback fields
      item.item = item.item || 'Unknown item'
      item.material = item.material || 'Unknown'
      item.disposal =
        item.disposal ||
        'Check local waste disposal guidelines.'

      item.explanation =
        item.explanation ||
        'Classification based on visible characteristics.'

      return item
    })

    // Calculate total ourselves instead of trusting AI
    parsed.totalItems = parsed.items.reduce(
      (total, item) => total + item.quantity,
      0
    )

    // Calculate category summary ourselves
    const summary = {
      Plastic: 0,
      Paper: 0,
      Glass: 0,
      Metal: 0,
      Organic: 0,
      'E-Waste': 0,
      Hazardous: 0,
      Other: 0,
    }

    parsed.items.forEach((item) => {
      summary[item.category] += item.quantity
    })

    parsed.summary = summary

    // Uncertainty fallback
    if (!parsed.uncertainty) {
      parsed.uncertainty =
        'Quantities are estimated from visible objects and may vary when items overlap or are partially hidden.'
    }

    return res.status(200).json(parsed)

  } catch (error) {
    console.error('Gemini API error:', error)

    // Invalid API key
    if (
      error.message?.includes('API_KEY_INVALID') ||
      error.message?.includes('API key not valid')
    ) {
      return res.status(401).json({
        error:
          'Invalid Gemini API key. Check your .env.local file.',
      })
    }

    // Rate limit
    if (
      error.status === 429 ||
      error.message?.includes('quota') ||
      error.message?.includes('RATE_LIMIT') ||
      error.message?.includes('429')
    ) {
      return res.status(429).json({
        error:
          'Gemini API rate limit reached. Please wait a moment and try again.',
      })
    }

    // Gemini busy
    if (
      error.status === 503 ||
      error.message?.includes('503') ||
      error.message?.includes('high demand') ||
      error.message?.includes('Service Unavailable')
    ) {
      return res.status(503).json({
        error:
          'Gemini is temporarily busy. Please wait a few seconds and try again.',
      })
    }

    // Network problem
    if (error.message?.includes('fetch failed')) {
      return res.status(503).json({
        error:
          'Unable to reach Gemini. Check your internet connection and try again.',
      })
    }

    // Safety
    if (error.message?.includes('SAFETY')) {
      return res.status(400).json({
        error:
          'The image was blocked by safety filters. Please try a different image.',
      })
    }

    return res.status(500).json({
      error:
        'Failed to analyze the image. Please try again.',
    })
  }
}
