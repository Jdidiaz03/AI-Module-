# Tecnomania S.L.U. Opportunity Recommendation

**Recommendation:** Conditional pursue: price only serviceable scope and require leadership review.

## Executive Summary
Tecnomania is a Consumer electronics retail opportunity at Tender / RFQ stage. The automation recommends conditional pursue: price only serviceable scope and require leadership review. Serviceable volume is 2,207,520 parcels annually (6,048 daily), not the full raw opportunity. Key exclusions include Spain - Canary Islands, Ceuta & Melilla, Portugal - Mainland, Portugal - Madeira & Azores, Standard return shipments from customer to Tecnomania.

## Serviceable Scope
- Raw annual volume: 2,920,000
- Serviceable annual volume: 2,207,520
- Serviceable daily volume: 6,048
- Serviceable share: 75.6%
- Parcel adjustment: At least 10% of shipments are over 15kg and 10% are XL/XXL. Treat overlap as unknown and use a conservative 90% parcel-profile eligibility factor.

## Blocked Scope
- Spain - Canary Islands, Ceuta & Melilla: Canary Islands, Ceuta and Melilla are outside current Amazon Shipping scope for this challenge.
- Portugal - Mainland: Portugal is outside current Amazon Shipping scope for this challenge.
- Portugal - Madeira & Azores: Madeira and Azores are outside current Amazon Shipping scope for this challenge.
- Standard return shipments from customer to Tecnomania: Client returns are outside the current challenge service scope.
- Pickup point / parcel locker fallback: Pickup/drop-off and locker delivery are outside the current challenge service scope.
- Parcels above 15kg or above 80x80x60cm: Heavy or bulky parcels above challenge limits require exclusion or separate carrier handling.

## Pricing Scenarios
### Aggressive
- Price: EUR 1.74 per parcel
- Margin: 13%
- Approval: within_guardrails
- Annual contribution: EUR 498,108
- Rationale: Use only if Amazon needs a sharp entry price and leadership accepts minimum-margin risk.
- Trade-offs: Maximizes price competitiveness but leaves little room for concessions. Includes SOD premium controls.
- Negotiation: Use as a floor only after the customer confirms all unsupported scope is removed or split.
### Balanced
- Price: EUR 2.35 per parcel
- Margin: 21%
- Approval: within_guardrails
- Annual contribution: EUR 1,091,501
- Rationale: Recommended anchor because it meets the finance target while preserving room to negotiate.
- Trade-offs: Balances competitiveness with the 21% target margin and keeps negotiation room. Includes SOD, OTP premium controls.
- Negotiation: Lead with this option and frame it around service reliability, peak readiness, and transparent pricing.
### Conservative
- Price: EUR 2.48 per parcel
- Margin: 25%
- Approval: within_guardrails
- Annual contribution: EUR 1,368,707
- Rationale: Use when the customer values resilience, premium controls, and implementation certainty over lowest price.
- Trade-offs: Protects margin and execution risk, but may weaken price-score competitiveness. Includes SOD, OTP premium controls.
- Negotiation: Use as the executive-safe option for high-value electronics with OTP/SOD and strict scope carve-outs.

## Risk Assessment
Risk level: High
- [High] Spain - Canary Islands, Ceuta & Melilla: Exclude from Amazon Shipping proposal or route to a separate partner/workaround outside the priced scope.
- [High] Portugal - Mainland: Exclude from Amazon Shipping proposal or route to a separate partner/workaround outside the priced scope.
- [High] Portugal - Madeira & Azores: Exclude from Amazon Shipping proposal or route to a separate partner/workaround outside the priced scope.
- [High] Standard return shipments from customer to Tecnomania: Exclude from Amazon Shipping proposal or route to a separate partner/workaround outside the priced scope.
- [High] Pickup point / parcel locker fallback: Exclude from Amazon Shipping proposal or route to a separate partner/workaround outside the priced scope.
- [High] Parcels above 15kg or above 80x80x60cm: Exclude from Amazon Shipping proposal or route to a separate partner/workaround outside the priced scope.

## Follow-Up Actions
- Business Development: Confirm that the customer accepts Amazon Shipping pricing only for serviceable scope. (blocks export)
- Pricing: Review the balanced scenario before customer-facing proposal release. (blocks export)
- Operations: Validate parcel-level exclusion method for over-15kg and oversize electronics before contract language. (blocks export)
- Business Development: Confirm whether Tecnomania accepts separate handling for Portugal, Canary/Ceuta/Melilla, returns, and PUDO fallback. (blocks export)

## Client Proposal Draft
### Executive Recommendation
Conditional pursue: price only serviceable scope and require leadership review.

### Proposed Scope
Amazon Shipping proposes to serve 2,207,520 annual parcels within supported Spain scope, subject to parcel-level eligibility checks.

### Pricing Anchor
Balanced scenario: EUR 2.35 per parcel at 21% target contribution margin.

### Explicit Exclusions
Spain - Canary Islands, Ceuta & Melilla; Portugal - Mainland; Portugal - Madeira & Azores; Standard return shipments from customer to Tecnomania; Pickup point / parcel locker fallback; Parcels above 15kg or above 80x80x60cm

### Implementation Plan
Confirm scope, validate parcel data, complete API readiness review, run peak-readiness governance, then release final proposal.

## Sources Used
- FIN-01: PL_Industry_Challenge.xlsx - Read Me / Finance Guardrails per deal - Target margin 21%, minimum margin 13%, VP approval below 13%, automatic no-go below 9%.
- SVC-01: Amazon_Shipping_AI_Copilot.pptx - Service guardrails slide - Supported challenge scope is Peninsular Spain and Balearics, 1-2 day delivery, OTP/SOD, max 15kg, max 80x80x60cm.
- TECM-DIM-01: Opportunity1_Tecnomania.docx - Section 5.5 Parcel Dimensions - 10% of parcels are XL/XXL up to 110x80x30cm, above the 80x80x60cm challenge size envelope.
- TECM-GEO-01: Opportunity1_Tecnomania.docx - Section 5.3 Geographic Distribution - Spain Peninsula 80%, Balearics 4%, Canary/Ceuta/Melilla 2%, Portugal Mainland 12%, Madeira/Azores 2%.
- TECM-PUDO-01: Opportunity1_Tecnomania.docx - Section 6.2 Alternative Delivery Options - Tecnomania asks for pickup point / locker fallback after failed home delivery attempts.
- TECM-RET-01: Opportunity1_Tecnomania.docx - Section 7.4 Returns Management - Tecnomania expects returns volume of approximately 8.5% of forward shipments.
- TECM-SVC-01: Opportunity1_Tecnomania.docx - Section 7.2 Delivery Attempts - Tecnomania requires a minimum of three home-delivery attempts.
- TECM-TECH-01: Opportunity1_Tecnomania.docx - Section 9.1 Integration Requirements - Tecnomania requires API label, manifest, tracking, claims, and webhook integration.
- TECM-VOL-01: Opportunity1_Tecnomania.docx - Section 5.1 Annual Volume Projection - Total annual parcels forecast is 2,920,000.
- TECM-WGT-01: Opportunity1_Tecnomania.docx - Section 5.4 Weight Profile - 6% of parcels are 15-20kg and 4% are 20-30kg, above the 15kg challenge limit.

## Loop Validation
- Iterations: 1
- Passed: True
- Code Quality Agent: pass
- Project Alignment Agent: pass
- KPI Trial Agent: pass
