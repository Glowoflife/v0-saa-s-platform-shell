import Anthropic from "@anthropic-ai/sdk"

const client = new Anthropic()

export async function POST(request: Request) {
  const brief = await request.json()

  const prompt = `You are the intelligence layer of a professional cosmetic 
formulation platform. A formulator is filling in a brief. Analyse the current 
brief state and return 2-4 intelligence cards that would genuinely help them.

Current brief state:
${JSON.stringify(brief, null, 2)}

INTELLIGENCE RULES — apply all that are relevant:

SULPHATE-FREE detection: If mustExclude contains any of [SLS, SLES, 
"sodium lauryl sulphate", "sodium laureth sulphate", "sulphate", "sulfate"] 
OR freeTextConstraints mentions sulphate/sulfate free:
→ Return amber card: "Sulphate-Free System" warning that SLS/SLES are 
excluded, recommend Cocamidopropyl Betaine, Sodium Cocoyl Isethionate, 
Disodium Cocoyl Glutamate, or Sodium Lauryl Glucose Carboxylate as 
alternatives. Note which have COSMOS approval if COSMOS is a target.

SILICONE-FREE detection: If mustExclude mentions silicone, dimethicone, 
cyclomethicone, or freeTextConstraints mentions silicone free:
→ Return amber card: "Silicone-Free Alternatives" — recommend 
C12-16 Alcohols, Isodecyl Neopentanoate, Hemisqualane, or 
Polyglyceryl esters for slip and skin feel. Flag that texture 
targets may need adjustment.

PARABEN-FREE / PRESERVATIVE: If mustExclude mentions parabens:
→ Return blue card recommending Phenoxyethanol/Ethylhexylglycerin, 
Sodium Benzoate/Potassium Sorbate, or Ethylhexylglycerin/Caprylyl 
Glycol blends. Note pH dependency for Sodium Benzoate systems.

COSMOS/ECOCERT target: If certificationTargets includes COSMOS or Ecocert:
→ Return amber card listing what is auto-excluded: synthetic silicones, 
PEGs, most synthetic preservatives. List COSMOS-approved preservatives.

MARKET CONFLICTS: If targetMarkets includes both CN (China) and EU:
→ Return red card flagging that some EU-permitted UV filters are 
not approved in China NMPA, and some China-permitted preservatives 
have EU restrictions. List: Tinosorb S (EU yes, CN no), 
Octocrylene (EU restricted, CN permitted).

INDIA BRIGHTENING: If targetMarkets includes IN and primaryFunctions 
includes Brightening:
→ Return amber card: CDSCO requires clinical substantiation evidence 
for brightening claims. Arbutin is not explicitly listed in India 
standards — use Niacinamide or Vitamin C derivatives as safer primary 
actives for IN market.

JAPAN QUASI-DRUG: If targetMarkets includes JP and 
(claims includes whitening OR SPF claims present):
→ Return red card: Japan MHLW quasi-drug pathway required for 
whitening/SPF claims. Separate registration from standard cosmetics. 
Only MHLW-approved actives at specified concentrations permitted: 
Arbutin ≤7%, Niacinamide ≤3%, Vitamin C derivatives per monograph.

GEL + OIL-SOLUBLE ACTIVES: If format is Gel and mustInclude contains 
oil-soluble ingredients (Bakuchiol, Retinol, Vitamin E, any oil):
→ Return amber card: gel vehicles are water-continuous and cannot 
solubilise oil-soluble actives without a solubiliser. Recommend 
switching to serum emulsion or adding Polysorbate 20/Caprylyl 
Capryl Glucoside as solubiliser.

MARKET CORPUS INTELLIGENCE: If targetMarkets and primaryFunctions are set:
→ Return one green card with realistic co-occurrence data for that 
combination from the platform's 550,000+ product corpus. Use real 
percentages and ingredient patterns appropriate to the market/function 
combination. This should feel like insider intelligence, not generic advice.

Always return valid JSON array only. No markdown, no explanation outside JSON.
Return 2-4 cards maximum. Prioritise conflicts and warnings over positive signals.
If brief is sparse (less than 3 fields filled), return a single blue card 
encouraging the formulator to add more context.

REQUIRED JSON SCHEMA — every card must have exactly these fields:
{
  "type": "red" | "amber" | "blue" | "green",
  "category": "string (e.g. REGULATORY, FORMULATION, MARKET, INTELLIGENCE)",
  "title": "string — short headline, max 8 words",
  "body": "string — 1-2 sentences of actionable detail"
}

Example output:
[
  {
    "type": "amber",
    "category": "FORMULATION",
    "title": "Sulphate-Free System Detected",
    "body": "SLS/SLES excluded. Recommend Cocamidopropyl Betaine or Sodium Cocoyl Isethionate as primary surfactants."
  }
]`

  const response = await client.messages.create({
    model: "claude-opus-4-5",
    max_tokens: 1000,
    messages: [{ role: "user", content: prompt }],
  })

  const text =
    response.content[0].type === "text" ? response.content[0].text : "[]"

  // Strip any markdown code fences Claude might add
  const cleaned = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim()

  try {
    const cards = JSON.parse(cleaned)
    return Response.json(cards)
  } catch (e) {
    console.error("[v0] Failed to parse Claude response:", text, e)
    return Response.json([])
  }
}
