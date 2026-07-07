# Iberia Outfitters S.L. Opportunity Recommendation

**Recommendation:** Conditional pursue: price only serviceable scope and require leadership review.

## Executive Summary
Iberia Outfitters is an Outdoor apparel and accessories opportunity at Demo / Qualification stage. The automation recommends conditional pursue: price only serviceable scope and require leadership review. Serviceable volume is 765,912 parcels annually (2,098 daily), not the full raw opportunity. Key exclusions include Portugal - Mainland, France, Locker delivery requested for some rural customers.

## Serviceable Scope
- Raw annual volume: 840,000
- Serviceable annual volume: 765,912
- Serviceable daily volume: 2,098
- Serviceable share: 91.2%
- Parcel adjustment: Most parcels are apparel and accessories under 5kg, but 3% of camping equipment may exceed the 80x80x60cm envelope and should be carved out until validated.

## Blocked Scope
- Portugal - Mainland: Portugal is outside current Amazon Shipping scope for this challenge.
- France: France is outside current Amazon Shipping scope for this challenge.
- Locker delivery requested for some rural customers: Pickup/drop-off and locker delivery are outside the current challenge service scope.

## Pricing Scenarios
### Aggressive
- Price: EUR 2.00 per parcel
- Margin: 13%
- Approval: within_guardrails
- Annual contribution: EUR 198,947
- Rationale: Use only if Amazon needs a sharp entry price and leadership accepts minimum-margin risk.
- Trade-offs: Maximizes price competitiveness but leaves little room for concessions. Includes SOD premium controls.
- Negotiation: Use as a floor only after the customer confirms all unsupported scope is removed or split.
### Balanced
- Price: EUR 2.20 per parcel
- Margin: 21%
- Approval: within_guardrails
- Annual contribution: EUR 353,920
- Rationale: Recommended anchor because it meets the finance target while preserving room to negotiate.
- Trade-offs: Balances competitiveness with the 21% target margin and keeps negotiation room. Includes SOD premium controls.
- Negotiation: Lead with this option and frame it around service reliability, peak readiness, and transparent pricing.
### Conservative
- Price: EUR 2.32 per parcel
- Margin: 25%
- Approval: within_guardrails
- Annual contribution: EUR 443,805
- Rationale: Use when the customer values resilience, premium controls, and implementation certainty over lowest price.
- Trade-offs: Protects margin and execution risk, but may weaken price-score competitiveness. Includes SOD premium controls.
- Negotiation: Use if Iberia Outfitters prioritizes service certainty and scope discipline over the lowest possible rate.

## Risk Assessment
Risk level: High
- [High] Portugal - Mainland: Exclude from Amazon Shipping proposal or route to a separate partner/workaround outside the priced scope.
- [High] France: Exclude from Amazon Shipping proposal or route to a separate partner/workaround outside the priced scope.
- [High] Locker delivery requested for some rural customers: Exclude from Amazon Shipping proposal or route to a separate partner/workaround outside the priced scope.
- [Medium] Seasonal return pickups: Confirm details with customer and operations before customer-facing commitment.
- [Medium] Oversize camping equipment: Confirm details with customer and operations before customer-facing commitment.

## Follow-Up Actions
- Business Development: Confirm that the customer accepts Amazon Shipping pricing only for serviceable scope. (blocks export)
- Pricing: Review the balanced scenario before customer-facing proposal release. (blocks export)

## Client Proposal Draft
### Executive Recommendation
Conditional pursue: price only serviceable scope and require leadership review.

### Proposed Scope
Amazon Shipping proposes to serve 765,912 annual parcels within supported Spain scope, subject to parcel-level eligibility checks.

### Pricing Anchor
Balanced scenario: EUR 2.20 per parcel at 21% target contribution margin.

### Explicit Exclusions
Portugal - Mainland; France; Locker delivery requested for some rural customers

### Implementation Plan
Confirm scope, validate parcel data, complete API readiness review, run peak-readiness governance, then release final proposal.

## Sources Used
- FIN-01: PL_Industry_Challenge.xlsx - Read Me / Finance Guardrails per deal - Target margin 21%, minimum margin 13%, VP approval below 13%, automatic no-go below 9%.
- IBER-DIM-01: Demo_IberiaOutfitters_NormalizedInput.json - Demo intake / parcel profile - 3% of camping equipment may exceed 80x80x60cm and needs validation.
- IBER-GEO-01: Demo_IberiaOutfitters_NormalizedInput.json - Demo intake / geography - Spain Peninsula 88%, Balearics 6%, Portugal 4%, France 2%.
- IBER-PARCEL-01: Demo_IberiaOutfitters_NormalizedInput.json - Demo intake / parcel profile - Most parcels are apparel and accessories under 5kg.
- IBER-PEAK-01: Demo_IberiaOutfitters_NormalizedInput.json - Demo intake / peak demand - Campaign drops can reach 3.5x normal daily volume.
- IBER-PUDO-01: Demo_IberiaOutfitters_NormalizedInput.json - Demo intake / service needs - Locker delivery was requested for some rural customers.
- IBER-RET-01: Demo_IberiaOutfitters_NormalizedInput.json - Demo intake / service needs - The customer asks about seasonal return pickups.
- IBER-SVC-01: Demo_IberiaOutfitters_NormalizedInput.json - Demo intake / service needs - The customer requests home delivery for ecommerce customers.
- IBER-TECH-01: Demo_IberiaOutfitters_NormalizedInput.json - Demo intake / integration - The customer wants tracking events for customer support.
- IBER-VOL-01: Demo_IberiaOutfitters_NormalizedInput.json - Demo intake / volume - Iberia Outfitters is estimated at 840,000 annual parcels.
- SVC-01: Amazon_Shipping_AI_Copilot.pptx - Service guardrails slide - Supported challenge scope is Peninsular Spain and Balearics, 1-2 day delivery, OTP/SOD, max 15kg, max 80x80x60cm.

## Loop Validation
- Iterations: 1
- Passed: True
- Code Quality Agent: pass
- Project Alignment Agent: pass
- KPI Trial Agent: pass
