import Anthropic from "@anthropic-ai/sdk"

const client = new Anthropic()

// Mock surfactant data — mirrors the shape of the real FastAPI
// /surfactants?sulphate_free=true response. Swap for real fetch when
// FastAPI is wired.
const MOCK_SULPHATE_FREE_SURFACTANTS = [
  { inci_name: "Sodium Cocoyl Isethionate", mildness_index: 92, foam_profile: "Rich", zn_score: 1.2 },
  { inci_name: "Disodium Cocoyl Glutamate", mildness_index: 89, foam_profile: "Moderate", zn_score: 0.9 },
  { inci_name: "Sodium Lauryl Glucose Carboxylate", mildness_index: 88, foam_profile: "Moderate", zn_score: 1.1 },
  { inci_name: "Coco-Glucoside", mildness_index: 85, foam_profile: "Low", zn_score: 0.8 },
  { inci_name: "Cocamidopropyl Betaine", mildness_index: 81, foam_profile: "Stable", zn_score: 2.1 },
]

function formatSurfactantsForPrompt(surfactants: typeof MOCK_SULPHATE_FREE_SURFACTANTS): string {
  return surfactants
    .map(s => `  • ${s.inci_name} — mildness ${s.mildness_index}/100, foam: ${s.foam_profile}, ZN score: ${s.zn_score}`)
    .join("\n")
}

export async function POST(request: Request) {
  const body = await request.json()

  // ── PARSE MODE ────────────────────────────────────────────────────
  if (body.mode === "parse") {
    const { rawText } = body

    const prompt = `You are a cosmetic formulation brief parser. A formulator has pasted a free-text brief. Extract structured data and return a JSON object mapping to BriefState fields.

Raw brief:
"""
${rawText}
"""

Return ONLY a valid JSON object with fields you can confidently extract. Omit fields you cannot determine. Do not guess.

Fields to extract:
{
  "productType": string,          // "Serum" | "Toner" | "Cleanser" | "Moisturiser" | "Shampoo" | "Conditioner" | "Body Wash" | "Hand Cream" | "Lip Balm" | "Hair Oil" | "SPF"
  "format": string,               // "Gel" | "Emulsion" | "Oil" | "Balm" | "Foam" | "Powder" | "Stick" | "Wax" | "Paste"
  "texture": string,              // "Lightweight" | "Rich" | "Watery" | "Silky"
  "primaryFunctions": string[],   // from: ["Hydration","Brightening","Anti-Ageing","Acne Control","SPF Protection","Barrier Repair","Soothing","Firming"]
  "targetSkinTypes": string[],    // from: ["All Skin","Dry","Oily","Sensitive","Combination","Mature"]
  "targetMarkets": string[],      // from: ["UK","EU","USA","Australia","China","Japan","India","Korea","Canada","Brazil","ASEAN","Malaysia","Singapore"]
  "claims": string[],             // from: ["Dermatologist Tested","Hypoallergenic","Non-Comedogenic","Clinically Proven","Fragrance-Free","Cruelty-Free","Vegan"]
  "targetRetailers": string[],    // from: ["Sephora Clean","Credo Clean Standard","Ulta Conscious Beauty","Whole Foods Premium Body Care"]
  "regulatoryPriority": string,   // "Strictest market governs" | "Per-market variants" | "EU baseline"
  "mustInclude": string[],        // INCI or ingredient names explicitly requested
  "mustExclude": string[],        // INCI or ingredient names explicitly excluded
  "preferNatural": boolean,       // true if natural/clean/green/COSMOS language present
  "fragranceApproach": string,    // "Fragrance-free" | "Essential oils only" | "Nature-identical" | "No preference"
  "colorantApproach": string,     // "No colorants" | "Natural only" | "No preference"
  "budgetTier": string,           // "Entry" | "Mid" | "Premium" | "Ultra-premium"
  "viscosityTarget": string,      // "Water-thin" | "Light lotion" | "Medium cream" | "Thick balm" | "Paste"
  "preservationStrategy": string, // "Conventional" | "Natural/hurdle" | "Self-preserving" | "Formulator will specify"
  "packagingType": string,        // "Jar" | "Pump" | "Tube" | "Dropper" | "Airless" | "Spray" | "Sachet"
  "shelfLifeMonths": number,      // 12 | 18 | 24 | 36
  "batchSize": string,            // "Lab (1–5 kg)" | "Pilot (50–200 kg)" | "Production (500+ kg)"
  "referenceProducts": string[],  // brand/product names mentioned as references or competitors
  "pricePositioning": string,     // "Below market" | "At market" | "Premium" | "Ultra-premium"
  "differentiators": string[],    // from: ["Novel actives","Clean label","Clinical claims","Texture innovation","Multi-functional","Speed to market"]
  "targetLaunchDate": string,     // "ASAP" | "3 months" | "6 months" | "12+ months"
  "phMin": number,                // e.g. 4.5
  "phMax": number                 // e.g. 5.5
}

Return ONLY the JSON object. No markdown, no backticks, no explanation.`

    const response = await client.messages.create({
      model: "claude-opus-4-5",
      max_tokens: 1000,
      messages: [{ role: "user", content: prompt }],
    })

    const text = response.content[0].type === "text" ? response.content[0].text : "{}"
    try {
      const parsed = JSON.parse(text.replace(/```json|```/g, "").trim())
      if (parsed.phMin !== undefined || parsed.phMax !== undefined) {
        parsed.phRange = { min: parsed.phMin ?? 0, max: parsed.phMax ?? 14 }
        delete parsed.phMin
        delete parsed.phMax
      }
      return Response.json({ success: true, fields: parsed })
    } catch {
      return Response.json({ success: false, fields: {} })
    }
  }

  // ── INTELLIGENCE MODE (default) ───────────────────────────────────
  const brief = body

  // Detect sulphate-free signal from mustExclude or freeTextConstraints
  const sulphateTerms = ["sls", "sles", "sulphate", "sulfate", "sodium lauryl", "sodium laureth"]
  const isSulphateFree =
    brief.mustExclude?.some((i: string) =>
      sulphateTerms.some(t => i.toLowerCase().includes(t))
    ) ||
    sulphateTerms.some(t => (brief.freeTextConstraints ?? "").toLowerCase().includes(t))

  const surfactantBlock = isSulphateFree
    ? `\nSULPHATE-FREE SURFACTANT DATA (from platform database, ranked by mildness):
${formatSurfactantsForPrompt(MOCK_SULPHATE_FREE_SURFACTANTS)}
Use these exact INCI names and scores when recommending sulphate-free alternatives. Do not suggest any surfactant not in this list.\n`
    : ""

  const prompt = `You are the intelligence layer of a professional cosmetic formulation platform. Analyse the current brief and return 2–4 intelligence cards.

Current brief:
${JSON.stringify(brief, null, 2)}
${surfactantBlock}
STRICT OUTPUT FORMAT — each card body must follow this structure:
- Maximum 2 sentences total. Ideally 1.
- Sentence 1: The signal or conflict — stated as a direct fact. No preamble.
- Sentence 2 (optional): The fix or implication — one concrete action or number.
- NO hedging phrases: never use "may", "might", "could potentially", "it is worth noting", "please be aware"
- NO intros: never start with "This", "Note that", "Please note", "Keep in mind"
- Write as a senior chemist would annotate a lab notebook — blunt and precise
- INCI names only — no trade names

BAD example (too long):
"When targeting the sulphate-free market, it is worth noting that SLS and SLES are excluded from your brief. You may want to consider alternatives such as Sodium Cocoyl Isethionate or Disodium Cocoyl Glutamate, which offer good mildness profiles and are widely used in sulphate-free systems."

GOOD example (correct):
"SLS/SLES excluded. Primary alternatives: Sodium Cocoyl Isethionate (mildness 92/100) or Disodium Cocoyl Glutamate (89/100) — both pH-stable 4.5–6.5."

INTELLIGENCE RULES — apply all that are relevant:

SULPHATE-FREE: If isSulphateFree detected → amber card "Sulphate-Free System". Use ONLY surfactants from SULPHATE-FREE SURFACTANT DATA above. Include mildness + ZN scores.

SILICONE-FREE: If mustExclude mentions silicone/dimethicone/cyclomethicone → amber card. Alternatives: C12-16 Alcohols, Isodecyl Neopentanoate, Hemisqualane.

PRESERVATIVE pH CONFLICT: If preservationStrategy "Natural/hurdle" AND phRange.max > 5.5 → red card. Sodium Benzoate/Potassium Sorbate effective only below pH 5.5.

PACKAGING + VISCOSITY MISMATCH: If packagingType "Dropper" and viscosityTarget not "Water-thin" → amber card.

RETAILER RESTRICTIONS: If targetRetailers includes "Sephora Clean" → amber card. 87 prohibited ingredients including Phenoxyethanol >1%.

NATURAL PREFERENCE: If preferNatural true → green card. Natural-origin alternatives prioritised.

MARKET CONFLICTS — EU + China: If both in targetMarkets → red card. Bis-Ethylhexyloxyphenol Methoxyphenyl Triazine EU-approved, not NMPA-approved.

INDIA BRIGHTENING: If targetMarkets includes India + primaryFunctions includes Brightening → amber card. CDSCO requires clinical substantiation. Use Niacinamide or Vitamin C derivatives.

JAPAN QUASI-DRUG: If targetMarkets includes Japan + SPF/whitening claims → red card. MHLW quasi-drug pathway required.

GEL + OIL-SOLUBLE ACTIVES: If format Gel + mustInclude has Retinol/Bakuchiol/oils → amber card. Add solubiliser or switch to emulsion.

COMPETITIVE INTELLIGENCE: If referenceProducts set → green card with positioning intel.

MARKET CORPUS: If targetMarkets + primaryFunctions set → green card with co-occurrence % from 561k product corpus.

ABSOLUTE RULES:
- INCI names only. No trade names.
- 2–4 cards max. Prioritise conflicts over positive signals.
- If brief <3 fields filled → single blue card encouraging more context.
- Return ONLY valid JSON array. No markdown.

Card shape: { "type": "amber"|"green"|"blue"|"red", "category": string, "title": string, "body": string }`

  const response = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 600,
    messages: [{ role: "user", content: prompt }],
  })

  const text = response.content[0].type === "text" ? response.content[0].text : "[]"
  try {
    const cards = JSON.parse(text.replace(/```json|```/g, "").trim())
    return Response.json(cards)
  } catch {
    return Response.json([])
  }
}
