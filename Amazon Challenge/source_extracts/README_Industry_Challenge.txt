INDUSTRY CHALLENGE 2026 - AMAZON SHIPPING
Disclaimer
This challenge has been created for academic purposes only. It is inspired by real business situations encountered in the enterprise logistics industry, but it has been substantially modified, simplified and anonymised to support the learning objectives of this course.
All companies, brands, individuals, opportunities, volumes, prices, costs, service metrics and historical outcomes presented in these materials are fictional. Any resemblance to actual companies, brands or persons — including the prospect companies created for this exercise — is purely coincidental. The cost figures, pricing structures and financial guardrails have been randomised and do not reflect Amazon Shipping's real cost base, commercial terms or operating economics.
These materials do not constitute an official Amazon Shipping presentation, commercial proposal or company position, and should not be relied upon for any commercial or operational decision. They are intended solely for use within the IE University Industry Challenge 2026 and must not be distributed outside that context.
Building an AI-Powered Pricing & Opportunity Copilot for Enterprise Logistics Opportunities
Background
Amazon Shipping is Amazon’s last-mile parcel delivery service for external businesses. Leveraging Amazon’s logistics infrastructure, technology capabilities and transportation network, Amazon Shipping provides fast, reliable and scalable delivery solutions to e-commerce merchants and enterprise retailers.
In May 2026, Amazon launched Amazon Supply Chain Services (ASCS), a new end-to-end logistics offering that opens Amazon’s vast logistics infrastructure—including air, ocean and ground transportation, warehousing, inventory management and parcel delivery—to businesses of all sizes, regardless of whether they sell on Amazon. Within this broader portfolio, Amazon Shipping serves as the last-mile delivery component, connecting Amazon’s supply chain capabilities directly to end customers. ASCS represents one of Amazon’s most ambitious business expansion initiatives and is widely viewed internally as a strategic long-term growth engine, with aspirations to become for logistics what Amazon Web Services (AWS) became for cloud computing: a large-scale, high-growth business serving customers far beyond Amazon’s traditional retail ecosystem.
The opportunity is significant. Spain is one of the largest e-commerce markets in Southern Europe, generating an estimated 1.3 to 1.5 billion parcel deliveries annually, with continued growth driven by online retail adoption, marketplace expansion and increasing customer expectations for fast delivery. Industry estimates suggest that the Spanish last-mile parcel delivery market exceeds €4 billion annually, making it one of the most strategically important logistics sectors in the region.
As Amazon Shipping continues to expand its Enterprise customer portfolio across Spain and Portugal, the Business Development team is increasingly required to evaluate large and complex opportunities involving multiple stakeholders, service requirements, pricing scenarios and operational constraints.
Today, many of these decisions are still heavily dependent on manual analysis performed by experienced Business Developers, Pricing Managers and Operations teams.
A typical enterprise opportunity may require reviewing:
Customer RFQs and tender documents
Meeting notes and discovery call summaries
Emails and informal customer communications
Commercial requirements
Service level expectations
Historical opportunities
Internal operational capabilities
Pricing frameworks
Competitor intelligence
Capacity constraints
Peak season forecasts
This is slow, manual and expensive work. Preparing the analysis behind a single opportunity can take several days of effort, and the end-to-end deal cycle — from first conversation to signature — often runs for several months (up to years). Industry-wide, enterprise Business Developers spend an estimated 30-40% of their time not on selling, but on gathering and reconciling information across Sales, Pricing, Operations and Finance before a recommendation can even reach leadership.
Amazon Shipping is exploring how Artificial Intelligence could help accelerate and improve this decision-making process.
The Business Challenge
Your team has been asked to design and build an AI-powered solution capable of assisting Amazon Shipping Enterprise Business Developers when evaluating new business opportunities.
The solution should be able to analyze opportunities regardless of how information is provided. In real-world scenarios, opportunities may arrive as formal RFQs (tender documents), meeting notes, call transcripts, email exchanges, CRM records, customer presentations, spreadsheets, or a combination of multiple unstructured and structured sources.
The solution should help determine:
Can Amazon Shipping realistically meet the customer's requirements?
What are the main operational and commercial risks?
What pricing approach should be recommended?
What additional information is required before making a final decision?
What commercial strategy should the sales team follow?
What is the likelihood of winning the opportunity based on similar historical tenders?
The final solution should provide clear recommendations while ensuring transparency, traceability and explainability of the underlying reasoning.
Your Mission
Build an AI-powered Enterprise Opportunity Copilot capable of analyzing the information provided in this challenge and generating actionable recommendations for Amazon Shipping decision makers.
The Opportunity Copilot must be capable of ingesting, understanding and reasoning across multiple input formats, including but not limited to:
RFQs and tender documents
Meeting notes
Discovery call summaries
Call transcripts
Customer emails
CRM opportunity records
Presentations and slide decks
Spreadsheets and operational data
Internal documentation
Mixed structured and unstructured datasets
Your solution may include:
Retrieval-Augmented Generation (RAG)
AI Agents
Multi-Agent Architectures
Workflow Automation
Knowledge Bases
Pricing Engines
Recommendation Systems
Dashboards or User Interfaces
Human-in-the-loop validation mechanisms
Teams are encouraged to be creative in both the technical implementation and the user experience.
The goal is not only to generate answers but to support high-quality business decisions.
Expected Outputs
Your solution should be capable of generating all of the following outputs:
Executive Summary: A concise summary of the opportunity.
Opportunity Score: A numerical or qualitative assessment of the opportunity's attractiveness.
Risk Assessment: Identification of operational, commercial and financial risks.
Pricing Recommendation: Three pricing scenarios to support commercial negotiations, ranging from the most aggressive discount level to the most conservative discount level. All scenarios must comply with the financial guardrails provided in the challenge and include a clear rationale, expected trade-offs and recommended negotiation strategy.
Commercial Strategy: Recommended positioning and negotiation approach.
Required Follow-Up Actions: Additional questions, meetings or validations required before proceeding.
Client Proposal / Pitch Deck: A professional, customer-facing deliverable that could be shared and presented to the prospective client in the next commercial meeting. Teams are free to choose the format that best fits the opportunity — a slide deck, a written proposal document, or an equivalent — as long as it is genuinely client-ready. Whatever the format, it should clearly communicate Amazon Shipping's value proposition, service capabilities, operational strengths, technology advantages, proposed solution, pricing approach, implementation plan and the reasons why Amazon Shipping is the best partner to support the customer's growth objectives. It should be tailored to the specific opportunity and include executive-level messaging, supporting data, visuals and key differentiators.
Win Probability Score: An estimated probability of winning the tender based on analysis of historical opportunities, comparable customer profiles, pricing competitiveness, service fit and past tender outcomes.
Sources Used: A detailed list of the evidence used by the AI system, including both the challenge documents provided and any additional sources, datasets, benchmarks, historical opportunities, market intelligence, operational assumptions or external references incorporated into the analysis.
Documents
You will be provided with the following documents. Together they form the information environment a real Business Developer would have to work with — some structured, some not, and not always perfectly consistent.
Service Description (presentation): An overview of what Amazon Shipping can and cannot do — coverage, delivery features, premium options, weight and size limits, integration and service standards. This is your source of truth for service capabilities. Read it carefully: several opportunities will contain requirements that fall partly outside what Amazon Shipping currently offers, and identifying those gaps is part of the task.
Pricing Workbook (P&L): A simplified but realistic cost model covering first mile, middle mile, last mile and overhead costs, along with the financial guardrails that any recommendation must respect. You will need to build your own pricing logic on top of it.
Historical Opportunities Dataset: A structured dataset of past opportunities and their outcomes (won or lost). Use it to benchmark the opportunities you are evaluating, identify patterns and estimate win probability. More importantly, the approach you build on top of it should not be hard-coded to these two cases: it should generalise, so that any future opportunity — with its own volumes, geography, pain points and service fit — can be scored and assessed with the same logic.
Opportunity 1 — Tecnomania (RFQ): A formal, structured tender from a consumer electronics retailer. The information is relatively clean and well organised, but a careful reading is required: not every volume the customer describes is something Amazon Shipping can actually serve. Your job is to size the real serviceable opportunity, price it and decide whether to pursue it.
Opportunity 2 — Pink Papaya (Discovery Pack): A real-world-style collection of CRM notes and email correspondence with a fast-growing fashion brand. Unlike the RFQ, this information is fragmentary and, in places, could be contradictory — different sources say different things about volumes, geography, parcel profile and what the customer actually needs.
A note on ambiguity: Some of this inconsistency is intentional, and it reflects reality. Customers are often inconsistent in the information they share, and they do not always know exactly what they want. A good Business Developer does two things well: 1)they make sound decisions based on the information they do have, clearly stating their assumptions; and 2)they are crystal clear about the open questions that still need answering, and persistent in going back to the client to resolve them. The goal is not to pretend the ambiguity away, but to navigate it — so you can ultimately help the customer in the best possible way. Your solution should surface these inconsistencies, take a reasoned position where it can, and flag what it would confirm with the client before committing.
