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

  const prompt = `You are the intelligence layer of a professional cosmetic formulation platform. Analyse the current brief and return 2-4 intelligence cards that would genuinely help the formulator.

Current brief:
${JSON.stringify(brief, null, 2)}
${surfactantBlock}
INTELLIGENCE RULES — apply all that are relevant:

SULPHATE-FREE: If isSulphateFree is detected (see brief.mustExclude or freeTextConstraints):
→ Return amber card titled "Sulphate-Free System". Use ONLY the surfactants from the SULPHATE-FREE SURFACTANT DATA block above. Rank them by mildness_index. Include mildness score and ZN score for each. Note that Cocamidopropyl Betaine works best as a co-surfactant (higher ZN score = more irritation potential as primary).

SILICONE-FREE: If mustExclude or freeTextConstraints mentions silicone, dimethicone, cyclomethicone:
→ Return amber card recommending C12-16 Alcohols, Isodecyl Neopentanoate, Hemisqualane, Polyglyceryl esters for slip and skin feel. Group by function: slip agents vs skin feel vs film forming.

PRESERVATIVE pH CONFLICT: If preservationStrategy is "Natural/hurdle" AND phRange.max > 5.5:
→ Return red card: "pH-Preservative Conflict". Sodium Benzoate and Potassium Sorbate are only effective below pH 5.5. Current pH target creates preservation failure risk. Either lower pH target or switch to conventional preservation.

PACKAGING + VISCOSITY MISMATCH: If packagingType is "Dropper" and viscosityTarget is not "Water-thin":
→ Return amber card flagging that dropper packaging requires water-thin viscosity.

RETAILER RESTRICTIONS: If targetRetailers includes "Sephora Clean":
→ Return amber card: Sephora Clean prohibits 87 ingredients including parabens, formaldehyde releasers, Phenoxyethanol above 1%, and several UV filters. Recommend adding these to mustExclude. Consider Ethylhexylglycerin/Caprylyl Glycol or Sodium Benzoate/Potassium Sorbate preservation systems.

NATURAL PREFERENCE: If preferNatural is true:
→ Return green card noting that natural-origin alternatives will be prioritised for emulsifiers, preservatives, and surfactants across the formulation.

MARKET CONFLICTS — EU + China: If targetMarkets includes both China and EU:
→ Return red card: Bis-Ethylhexyloxyphenol Methoxyphenyl Triazine is EU-approved but not NMPA-approved. Several preservative concentration limits differ. Per-market variants strongly recommended.

INDIA BRIGHTENING: If targetMarkets includes India and primaryFunctions includes Brightening:
→ Return amber card: CDSCO requires clinical substantiation for brightening claims. Arbutin status is ambiguous under Indian standards — Niacinamide and Vitamin C derivatives are safer primary actives for IN market.

JAPAN QUASI-DRUG: If targetMarkets includes Japan and primaryFunctions includes SPF Protection or claims includes whitening:
→ Return red card: MHLW quasi-drug pathway required. Only approved actives at specified concentrations: Arbutin ≤7%, Niacinamide ≤3%, Vitamin C derivatives per monograph.

GEL + OIL-SOLUBLE ACTIVES: If format is Gel and mustInclude contains oil-soluble ingredients (Retinol, Bakuchiol, Vitamin E, any oil):
→ Return amber card: gel vehicles are water-continuous and cannot solubilise oil-soluble actives without a solubiliser. Recommend switching to serum emulsion or adding a solubiliser.

COMPETITIVE INTELLIGENCE: If referenceProducts has entries:
→ Return green card with brief positioning intelligence relative to the named products.

MARKET CORPUS: If targetMarkets and primaryFunctions are both set:
→ Return one green card with co-occurrence intelligence from the platform's 561,000+ product corpus. Include realistic ingredient co-occurrence percentages for that market/function combination.

ABSOLUTE RULES:
- INCI names only. Never use trade names (Carbopol, Sepineo, Euxyl, Tinosorb, Naticide etc.)
- Return 2-4 cards maximum. Prioritise conflicts and warnings over positive signals.
- If brief has fewer than 3 fields filled, return a single blue card encouraging more context.
- Return ONLY a valid JSON array. No markdown, no explanation, no backticks.

Card shape: { "type": "amber"|"green"|"blue"|"red", "category": string, "title": string, "body": string }`

  const response = await client.messages.create({
    model: "claude-opus-4-5",
    max_tokens: 1000,
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
