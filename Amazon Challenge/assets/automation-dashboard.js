const DASHBOARD_INDEX = "automation/outputs/dashboard_index.json";
const FALLBACK_OUTPUT_FILES = [
  "automation/outputs/pink_papaya_analysis.json",
  "automation/outputs/tecnomania_analysis.json",
  "automation/outputs/iberia_outfitters_analysis.json",
];
const LOOP_REPORT = "automation/outputs/loop_report.json";

const projectOverview = document.querySelector("#project-overview");
const caseSwitcher = document.querySelector("#case-switcher");
const caseDashboard = document.querySelector("#case-dashboard");
const dashboardState = document.querySelector("#dashboard-state");
const dataSourceStatus = document.querySelector("#data-source-status");

let caseOutputs = [];
let activeCaseId = new URLSearchParams(window.location.search).get("case");
const requestedCaseId = activeCaseId;
let latestLoopReport = null;
const SUBMITTED_OUTPUTS_KEY = "amazonCopilotSubmittedOutputs";

function formatNumber(value) {
  return new Intl.NumberFormat("en-US").format(value || 0);
}

function formatPercent(value) {
  return `${Math.round((value || 0) * 100)}%`;
}

function formatCurrency(value) {
  return `EUR ${Number(value || 0).toFixed(2)}`;
}

function cleanStatus(value) {
  return String(value || "").replaceAll("_", " ");
}

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, (char) => (
    {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    }[char]
  ));
}

function escapeAttribute(value) {
  return escapeHtml(value);
}

async function fetchJson(path) {
  const response = await fetch(path, { cache: "no-store" });
  if (!response.ok) {
    throw new Error(`${path} returned ${response.status}`);
  }
  return response.json();
}

async function loadDashboard() {
  try {
    const outputFiles = await loadOutputFiles();
    const [loopReport, ...outputs] = await Promise.all([
      fetchJson(LOOP_REPORT),
      ...outputFiles.map(fetchJson),
    ]);
    latestLoopReport = loopReport;
    caseOutputs = mergeOutputs(outputs, loadSubmittedOutputs())
      .sort((a, b) => a.analysis.company.localeCompare(b.analysis.company));
    if (requestedCaseId && !caseOutputs.some((item) => item.case_id === requestedCaseId)) {
      dataSourceStatus.textContent = "Requested case missing";
      projectOverview.innerHTML = "";
      dashboardState.classList.add("is-error");
      dashboardState.textContent =
        `No generated result was found for ${requestedCaseId}. Submit the form again from this browser or rerun the automation server.`;
      return;
    }
    if (!activeCaseId) {
      activeCaseId = caseOutputs[0]?.case_id;
    }
    dataSourceStatus.textContent = loadSubmittedOutputs().length
      ? "Connected to automation outputs and submitted reviews"
      : "Connected to automation outputs";
    renderProjectOverview(loopReport, caseOutputs);
    renderCaseSwitcher();
    renderActiveCase();
  } catch (error) {
    console.error(error);
    dataSourceStatus.textContent = "Data load failed";
    projectOverview.innerHTML = "";
    dashboardState.classList.add("is-error");
    dashboardState.textContent =
      "Automation output could not be loaded. Start a local server from the project folder, then open http://localhost:8000/dashboard.html.";
  }
}

function loadSubmittedOutputs() {
  try {
    const parsed = JSON.parse(localStorage.getItem(SUBMITTED_OUTPUTS_KEY) || "[]");
    return Array.isArray(parsed)
      ? parsed.filter((item) => item?.case_id && item?.analysis)
      : [];
  } catch (error) {
    console.warn("Submitted dashboard results could not be loaded.", error);
    return [];
  }
}

function mergeOutputs(staticOutputs, submittedOutputs) {
  const byId = new Map();
  [...staticOutputs, ...submittedOutputs].forEach((output) => {
    if (output?.case_id) {
      byId.set(output.case_id, output);
    }
  });
  return Array.from(byId.values());
}

async function loadOutputFiles() {
  try {
    const index = await fetchJson(DASHBOARD_INDEX);
    const files = (index.cases || []).map((item) => item.file).filter(Boolean);
    return files.length ? files : FALLBACK_OUTPUT_FILES;
  } catch (error) {
    console.warn("Dashboard index missing; using fallback outputs.", error);
    return FALLBACK_OUTPUT_FILES;
  }
}

function renderProjectOverview(loopReport, outputs) {
  const sources = outputs.flatMap((item) => item.analysis.sources_used || []);
  const uniqueDocs = new Set(sources.map((item) => item.source));
  const allPassed = outputs.every((item) => item.passed);
  const cards = [
    {
      label: "KPI result",
      value: allPassed ? "Passed" : "Needs review",
      detail: `${outputs.length} generated cases available`,
    },
    {
      label: "Reviewer loop",
      value: "3 agents",
      detail: `${loopReport.cases_processed} baseline cases in latest loop report`,
    },
    {
      label: "Evidence rows",
      value: formatNumber(sources.length),
      detail: `${uniqueDocs.size} source documents cited`,
    },
    {
      label: "Export state",
      value: "Locked",
      detail: "Human approval required before proposal use",
    },
  ];
  projectOverview.innerHTML = cards
    .map(
      (card) => `
        <article class="dashboard-card">
          <p class="dashboard-label">${card.label}</p>
          <p class="dashboard-value">${card.value}</p>
          <p class="dashboard-detail">${card.detail}</p>
        </article>
      `,
    )
    .join("");
}

function renderCaseSwitcher() {
  caseSwitcher.innerHTML = caseOutputs
    .map(
      (output) => `
        <button class="case-tab${output.case_id === activeCaseId ? " is-active" : ""}" type="button" data-case-id="${escapeAttribute(output.case_id)}">
          ${escapeHtml(output.analysis.company)}
        </button>
      `,
    )
    .join("");
  caseSwitcher.querySelectorAll("button").forEach((button) => {
    button.addEventListener("click", () => {
      activeCaseId = button.dataset.caseId;
      renderCaseSwitcher();
      renderActiveCase();
    });
  });
}

function renderActiveCase() {
  const output = caseOutputs.find((item) => item.case_id === activeCaseId);
  if (!output) {
    dashboardState.hidden = false;
    dashboardState.textContent = "No case output found.";
    caseDashboard.hidden = true;
    return;
  }

  const analysis = output.analysis;
  const serviceFit = analysis.service_fit;
  const pricing = analysis.pricing_recommendation;
  const scenarios = pricing?.scenarios || [];
  const score = analysis.opportunity_score;
  const win = analysis.win_probability_score;
  const loopCase = latestLoopReport?.case_results?.find((item) => item.case_id === output.case_id);
  const isSubmittedCase = output.case_id?.startsWith("submitted_");
  const recommendationHref = `automation/outputs/${output.case_id}_recommendation.md`;
  const delivery = output.delivery;
  dashboardState.hidden = true;
  caseDashboard.hidden = false;
  caseDashboard.innerHTML = `
    <section class="result-hero">
      <div>
        <span class="case-status">${escapeHtml(analysis.recommendation)}</span>
        <h3>${escapeHtml(analysis.company)}</h3>
        <p>${escapeHtml(analysis.executive_summary)}</p>
        <div class="result-links" aria-label="Generated output links">
          ${isSubmittedCase ? "" : `<a href="${escapeAttribute(recommendationHref)}">Open generated recommendation</a>`}
          <a href="automation/outputs/loop_report.md">Open loop report</a>
        </div>
      </div>
      <div class="result-metrics" aria-label="Case metrics">
        ${metric("Opportunity score", `${score.score}/${score.scale.split("-").pop()}`)}
        ${metric("Win probability", formatPercent(win.probability))}
        ${metric("Risk level", analysis.risk_assessment.level)}
        ${metric("Raw annual", formatNumber(serviceFit.raw_annual_volume))}
        ${metric("Serviceable annual", formatNumber(serviceFit.serviceable_annual_volume))}
        ${metric("Serviceable daily", formatNumber(serviceFit.serviceable_daily_volume))}
        ${metric("Serviceable share", formatPercent(serviceFit.serviceable_share))}
        ${metric("Export status", cleanStatus(analysis.export_status))}
      </div>
    </section>

    <section class="dashboard-columns">
      ${scopePanel("Supported scope", serviceFit.supported_scope, "pass")}
      ${scopePanel("Blocked scope", serviceFit.blocked_scope, "blocked")}
      ${scopePanel("Needs review", serviceFit.review_scope, "review")}
    </section>

    <section class="dashboard-panel">
      <div class="panel-title-row">
        <div>
          <p class="dashboard-label">Pricing recommendation</p>
          <h3>${pricing?.pricing_blocked ? "Pricing blocked by guardrails" : "Three finance-checked scenarios"}</h3>
        </div>
        <span class="status-chip">Anchor: ${escapeHtml(pricing?.recommended_scenario_id || "review required")}</span>
      </div>
      <div class="pricing-grid">
        ${scenarios.length ? scenarios.map(pricingCard).join("") : missingPricingCard(pricing)}
      </div>
    </section>

    <section class="dashboard-columns two-up">
      <article class="dashboard-panel">
        <p class="dashboard-label">Validator agents</p>
        <h3>Loop result${loopCase ? ` after ${loopCase.iterations} iteration${loopCase.iterations === 1 ? "" : "s"}` : ""}</h3>
        <div class="validator-list">
          ${output.validator_results.map(validatorRow).join("")}
        </div>
      </article>
      <article class="dashboard-panel">
        <p class="dashboard-label">Follow-up actions</p>
        <h3>Before export</h3>
        <ul class="compact-list">
          ${analysis.required_follow_up_actions.map(actionItem).join("")}
        </ul>
      </article>
    </section>

    ${delivery ? deliveryPanel(delivery) : ""}

    <section class="dashboard-panel">
      <div class="panel-title-row">
        <div>
          <p class="dashboard-label">Sources used</p>
          <h3>Evidence behind the recommendation</h3>
        </div>
        <span class="status-chip warning">${escapeHtml(analysis.export_status.replaceAll("_", " "))}</span>
      </div>
      <div class="source-grid">
        ${analysis.sources_used.map(sourceCard).join("")}
      </div>
    </section>
  `;
}

function metric(label, value) {
  return `
    <div class="metric-card">
      <h3>${escapeHtml(label)}</h3>
      <p>${escapeHtml(value)}</p>
    </div>
  `;
}

function scopePanel(title, items, tone) {
  const empty = `<p class="dashboard-detail">No items in this category.</p>`;
  return `
    <article class="dashboard-panel scope-panel ${tone}">
      <p class="dashboard-label">${escapeHtml(title)}</p>
      <ul class="compact-list">
        ${(items || []).map(scopeItem).join("") || empty}
      </ul>
    </article>
  `;
}

function scopeItem(item) {
  const evidence = item.evidence?.length ? `<em>Evidence: ${escapeHtml(item.evidence.join(", "))}</em>` : "";
  return `
    <li>
      <strong>${escapeHtml(item.label)}</strong>
      <span>${escapeHtml(item.reason)}</span>
      ${evidence}
    </li>
  `;
}

function pricingCard(scenario) {
  return `
    <article class="pricing-card">
      <div class="panel-title-row">
        <h4>${escapeHtml(scenario.label)}</h4>
        <span class="status-chip">${escapeHtml(cleanStatus(scenario.approval_status))}</span>
      </div>
      <p class="price-line">${escapeHtml(formatCurrency(scenario.price_per_parcel_eur))} <span>per parcel</span></p>
      <dl class="pricing-facts">
        <div><dt>Margin</dt><dd>${escapeHtml(formatPercent(scenario.target_margin))}</dd></div>
        <div><dt>Annual contribution</dt><dd>EUR ${escapeHtml(formatNumber(scenario.annual_contribution_eur))}</dd></div>
      </dl>
      <p>${escapeHtml(scenario.trade_offs)}</p>
    </article>
  `;
}

function missingPricingCard(pricing) {
  const isBlocked = pricing?.pricing_blocked;
  return `
    <article class="pricing-card missing-card">
      <div class="panel-title-row">
        <h4>${isBlocked ? "No compliant pricing" : "Pricing data missing"}</h4>
        <span class="status-chip danger">${isBlocked ? "Blocked" : "Needs review"}</span>
      </div>
      <p>
        ${escapeHtml(isBlocked
          ? pricing.blocked_reason
          : "This case does not include complete scenario data in the automation output. Pricing should be regenerated before the recommendation is exported.")}
      </p>
    </article>
  `;
}

function validatorRow(result) {
  return `
    <div class="validator-row">
      <span>${escapeHtml(result.agent)}</span>
      <strong>${escapeHtml(result.status)}</strong>
    </div>
  `;
}

function actionItem(action) {
  return `
    <li>
      <strong>${escapeHtml(action.owner)}</strong>
      <span>${escapeHtml(action.question)}</span>
    </li>
  `;
}

function deliveryPanel(delivery) {
  const email = delivery.email || {};
  const isLocal = ["localhost", "127.0.0.1", ""].includes(window.location.hostname);
  const queuedPath = isLocal && email.path ? `<span>Outbox file: ${escapeHtml(email.path)}</span>` : "";
  const queuedHeading = isLocal
    ? "Result email queued locally"
    : "Email not sent until SMTP is configured";
  return `
    <section class="dashboard-panel">
      <p class="dashboard-label">Email delivery</p>
      <h3>${email.status === "sent" ? "Result email sent" : queuedHeading}</h3>
      <ul class="compact-list">
        <li>
          <strong>Recipient</strong>
          <span>${escapeHtml(delivery.recipient || "No recipient recorded")}</span>
        </li>
        <li>
          <strong>Status</strong>
          <span>${escapeHtml(email.status || "unknown")}</span>
          ${queuedPath}
        </li>
      </ul>
    </section>
  `;
}

function sourceCard(source) {
  return `
    <article class="source-card">
      <p class="dashboard-label">${escapeHtml(source.id)}</p>
      <h4>${escapeHtml(source.source)}</h4>
      <p><strong>${escapeHtml(source.locator)}</strong></p>
      <p>${escapeHtml(source.claim)}</p>
    </article>
  `;
}

if (projectOverview && caseDashboard) {
  loadDashboard();
}
