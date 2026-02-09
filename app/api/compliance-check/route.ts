import { NextRequest, NextResponse } from 'next/server'

const VA_ABC_REGULATIONS = `
Virginia ABC Compliance Regulations Reference

TIED-HOUSE RULES (CRITICAL):
- Brands/manufacturers CANNOT pay bars/venues to host promotions
- No direct compensation from brand to venue for hosting activations
- This is the most common violation - any payment structure that looks like brand-to-venue compensation is prohibited

TASTING REGULATIONS:
- Ambassador must hold a valid Solicitor Tasting Permit ($350/year from VA ABC)
- Bar/venue staff MUST pour all drinks - ambassador cannot serve/pour
- Sample limits per person:
  * Spirits: 0.5 oz per sample, 1.5 oz total per person
  * Wine: 6 oz total per person
  * Beer: 16 oz total per person
- Brand can purchase product from the bar at retail price, up to $100/day per location
- All tasting records must be maintained for 2 years

SPONSORED EVENTS:
- Only charity, cultural, or sports events qualify for sponsorship
- Requires PRIOR ABC approval via sponsorship request form
- Must submit VA ABC Sponsorship Request Form before the event
- Commercial events do not qualify

ADVERTISING & MATERIALS:
- Branded POS (point-of-sale) materials must be under $40 wholesale value each
- Consumer swag (hats, shirts, etc.) is permitted - must be for consumers, NOT as compensation to the bar/venue
- All advertising must comply with VA ABC advertising restrictions
- No false or misleading advertising about alcohol products

RECORD-KEEPING:
- All tasting and activation records must be kept for minimum 2 years
- Records should include: date, venue, ambassador, products sampled, estimated attendance, spending receipts

PERMIT REQUIREMENTS:
- Solicitor Tasting Permit: Required for any brand ambassador conducting tastings ($350/year)
- ABC Sponsorship Request Form: Required for sponsored events (must be submitted before event)

PENALTIES:
- Violations can result in fines, permit revocation, or criminal charges
- Tied-house violations are taken very seriously by VA ABC
`

interface ComplianceRequest {
    title: string
    activation_type: string
    venue_name: string
    city: string
    proposed_date: string
    description: string
}

function keywordFallback(data: ComplianceRequest) {
    const text = `${data.title} ${data.description}`.toLowerCase()
    const issues: string[] = []
    let status: 'compliant' | 'conditional' | 'blocked' = 'compliant'

    // Check for tied-house violations
    const paymentWords = ['pay bar', 'pay venue', 'compensation to bar', 'payment to venue', 'pay the bar', 'pay the venue']
    if (paymentWords.some(w => text.includes(w))) {
        issues.push('BLOCKED: Description suggests direct payment to venue, which violates Virginia tied-house rules.')
        status = 'blocked'
    }

    // Check for banned promotional language
    const bannedWords = ['free drinks', 'unlimited', '2-for-1', 'buy one get one', 'all you can drink', 'open bar']
    const foundBanned = bannedWords.filter(w => text.includes(w))
    if (foundBanned.length > 0) {
        issues.push(`BLOCKED: Promotional language "${foundBanned.join(', ')}" violates VA ABC advertising regulations.`)
        status = 'blocked'
    }

    // Check activation type specific rules
    if (data.activation_type === 'sponsored_event') {
        issues.push('CONDITIONAL: Sponsored events require prior ABC approval. Submit VA ABC Sponsorship Request Form before proceeding.')
        if (status !== 'blocked') status = 'conditional'
    }

    // Standard requirements
    const checklist = [
        'Ambassador must have valid Solicitor Tasting Permit',
        'Bar staff must pour all samples',
        'Sample limits: 0.5oz spirits/sample, 1.5oz total spirits, 6oz wine, 16oz beer per person',
        'Product purchases cannot exceed $100/day per location',
        'POS materials under $40 wholesale value each',
        'Maintain all records for 2 years',
    ]

    if (data.activation_type === 'sponsored_event') {
        checklist.unshift('Submit ABC Sponsorship Request Form for prior approval')
    }

    return {
        compliance_status: status,
        reasoning: issues.length > 0 ? issues : ['Basic keyword check passed. For comprehensive analysis, configure the ANTHROPIC_API_KEY.'],
        required_permits: ['Solicitor Tasting Permit ($350/year)'],
        required_forms: data.activation_type === 'sponsored_event'
            ? [{ name: 'VA ABC Sponsorship Request Form', url: 'https://www.abc.virginia.gov/licenses/forms' }]
            : [],
        suggested_checklist: checklist,
        legal_alternatives: status === 'blocked' ? [
            'Conduct a standard tasting with ambassador holding a Solicitor Tasting Permit',
            'Purchase product from venue at retail price (up to $100/day)',
            'Provide consumer swag instead of venue compensation',
        ] : [],
        ai_powered: false,
    }
}

export async function POST(request: NextRequest) {
    try {
        const data: ComplianceRequest = await request.json()

        const apiKey = process.env.ANTHROPIC_API_KEY
        if (!apiKey) {
            return NextResponse.json(keywordFallback(data))
        }

        // Real AI compliance check using Anthropic API
        const userMessage = `Analyze this alcohol brand activation plan for Virginia ABC compliance:

Title: ${data.title}
Activation Type: ${data.activation_type}
Venue: ${data.venue_name}
City: ${data.city || 'Virginia'}
Proposed Date: ${data.proposed_date}
Description: ${data.description}

Based on Virginia ABC regulations, provide your analysis in the following JSON format ONLY (no other text):
{
  "compliance_status": "compliant" | "conditional" | "blocked",
  "reasoning": ["array of specific findings, each a clear sentence"],
  "required_permits": ["array of required permits with costs"],
  "required_forms": [{"name": "form name", "url": "https://www.abc.virginia.gov/licenses/forms"}],
  "suggested_checklist": ["array of checklist items the brand should complete"],
  "legal_alternatives": ["if blocked, array of legal alternative approaches"]
}`

        const response = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': apiKey,
                'anthropic-version': '2023-06-01',
            },
            body: JSON.stringify({
                model: 'claude-sonnet-4-20250514',
                max_tokens: 2048,
                system: `You are a Virginia ABC (Alcoholic Beverage Control) compliance expert AI agent. Your job is to analyze alcohol brand activation plans and determine if they comply with Virginia state regulations.\n\n${VA_ABC_REGULATIONS}\n\nAlways respond with ONLY valid JSON matching the requested format. Be thorough but concise in your reasoning. Flag any potential violations clearly. When an activation is mostly compliant but has conditions, use "conditional" status. Only use "blocked" for clear violations that cannot proceed.`,
                messages: [
                    { role: 'user', content: userMessage }
                ],
            }),
        })

        if (!response.ok) {
            console.error('Anthropic API error:', response.status, await response.text())
            return NextResponse.json(keywordFallback(data))
        }

        const aiResponse = await response.json()
        const content = aiResponse.content?.[0]?.text

        if (!content) {
            return NextResponse.json(keywordFallback(data))
        }

        // Parse the JSON from AI response
        const jsonMatch = content.match(/\{[\s\S]*\}/)
        if (!jsonMatch) {
            return NextResponse.json(keywordFallback(data))
        }

        const parsed = JSON.parse(jsonMatch[0])
        return NextResponse.json({
            ...parsed,
            ai_powered: true,
        })
    } catch (error) {
        console.error('Compliance check error:', error)
        return NextResponse.json(
            { error: 'Compliance check failed' },
            { status: 500 }
        )
    }
}
