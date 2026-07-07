const cases = {
  tecnomania: {
    name: "Tecnomania S.L.U.",
    type: "Structured RFQ",
    recommendation: "Conditional pursue",
    reason:
      "Spain and Balearics fit the core service, but Portugal, Canary Islands, returns, PUDO fallback, and heavier parcels must be carved out.",
    score: "74/100",
    scoreDetail: "Strong volume, mixed scope quality.",
    win: "61%",
    winDetail: "Rule-based demo estimate.",
    risk: "Medium-high",
    riskDetail: "Scope gaps need clear framing.",
    workflow: [
      ["Uploaded", "Opportunity RFQ received", "complete"],
      ["Parsed", "DOCX and workbook text extracted", "complete"],
      ["Extracted", "39 sourced facts captured", "complete"],
      ["Guardrails checked", "5 blocked requirements found", "running"],
      ["Pricing calculated", "3 scenarios drafted", "complete"],
      ["Recommendation drafted", "Awaiting BD review", "complete"],
      ["Verified", "Citations required before export", "running"]
    ],
    serviceFacts: [
      ["Annual volume", "2.92M parcels forecast for 2027"],
      ["Serviceable geography", "Spain Peninsula 80% and Balearics 4%"],
      ["Out-of-scope geography", "Portugal 14% plus Canary Islands, Ceuta and Melilla 2%"],
      ["Parcel profile", "10% above 15kg and 10% XL or XXL need exclusion checks"],
      ["Commercial hook", "High-value electronics support OTP and SOD positioning"]
    ],
    strategy: [
      ["Scope the deal in slices", "Price only supported Spanish home-delivery volume, then show exclusions transparently."],
      ["Use premium proof services", "Recommend OTP and SOD for high-value products to reduce delivery disputes."],
      ["Hold returns out of proposal", "Returns and PUDO fallback should be documented as unsupported for v1."]
    ],
    followups: [
      ["Serviceable volume", "Confirm overlap between overweight and oversized parcels."],
      ["Peak plan", "Validate Black Friday week capacity and dispatch profile."],
      ["B2B edge cases", "Check business-hour deliveries and palletized order frequency."]
    ],
    guardrails: [
      ["Spain Peninsula", "Pass", "Pass", "80% of total volume", "Include in proposal"],
      ["Balearic Islands", "Pass", "Watch", "4% of total volume", "Apply 1.35x cost multiplier"],
      ["Portugal", "Blocked", "Blocked", "14% total including islands", "Exclude or require partner path"],
      ["Canary Islands, Ceuta, Melilla", "Blocked", "Blocked", "2% of total volume", "Exclude from Amazon Shipping scope"],
      ["Weight above 15kg", "Blocked", "Blocked", "10% of shipments", "Filter before pricing"],
      ["XL or XXL dimensions", "Needs review", "Review", "Up to 110 x 80 x 30cm", "Confirm dimensions per SKU"],
      ["Returns", "Blocked", "Blocked", "8.5% return volume requested", "Do not include as supported service"],
      ["OTP and SOD", "Pass", "Pass", "High-value electronics", "Offer as premium add-ons"]
    ],
    pricing: [
      ["Aggressive", "2.24M parcels", "EUR 1.78", "EUR 2.08", "14.4%", "Above minimum"],
      ["Balanced", "2.24M parcels", "EUR 1.78", "EUR 2.25", "20.9%", "Near target"],
      ["Conservative", "2.08M parcels", "EUR 1.86", "EUR 2.44", "23.8%", "Recommended for risk"]
    ],
    evidence: [
      ["Annual forecast", "2,920,000 parcels", "Opportunity1_Tecnomania.txt, Section 5.1", "High", "Accepted"],
      ["Geographic split", "Spain Peninsula 80%, Balearics 4%, Portugal 14%", "Opportunity1_Tecnomania.txt, Section 5.3", "High", "Accepted"],
      ["Weight issue", "10% above 15kg", "Opportunity1_Tecnomania.txt, Section 5.4", "High", "Needs review"],
      ["Dimension issue", "XL or XXL up to 110 x 80 x 30cm", "Opportunity1_Tecnomania.txt, Section 5.5", "High", "Needs review"],
      ["Returns ask", "Approx. 8.5% of forward shipments", "Opportunity1_Tecnomania.txt, Section 7.4", "High", "Blocked"],
      ["Finance guardrail", "Target 21%, minimum 13%, no-go below 9%", "PL_Industry_Challenge.txt, Read Me", "High", "Accepted"]
    ],
    proposal: [
      "Recommend a conditional Spain-first proposal for Tecnomania.",
      "The offer should cover Peninsular Spain and Balearics only, with Balearics priced using the required multiplier.",
      "Portugal, Canary Islands, returns, PUDO fallback, overweight parcels, and oversized parcels should be excluded or handled through a separate commercial path."
    ]
  },
  pinkpapaya: {
    name: "Pink Papaya S.L.",
    type: "CRM and email pack",
    recommendation: "Conditional pursue",
    reason:
      "Spain home delivery is a strong fit, but France is strategically important to the customer and is outside current scope.",
    score: "78/100",
    scoreDetail: "Strong pain match, one major scope gap.",
    win: "58%",
    winDetail: "Founder concern about France lowers confidence.",
    risk: "Medium",
    riskDetail: "Geography and home line dimensions need review.",
    workflow: [
      ["Uploaded", "CRM notes and emails received", "complete"],
      ["Parsed", "Unstructured thread normalized", "complete"],
      ["Extracted", "34 sourced facts captured", "complete"],
      ["Guardrails checked", "France flagged as blocked", "running"],
      ["Pricing calculated", "Spain-only scenarios drafted", "complete"],
      ["Recommendation drafted", "Client framing ready", "complete"],
      ["Verified", "Open assumptions remain", "running"]
    ],
    serviceFacts: [
      ["Normal volume", "About 3,800 parcels per day"],
      ["Peak volume", "Black Friday roughly 6x normal day"],
      ["Serviceable geography", "Spain represents about 76% of parcels"],
      ["Out-of-scope geography", "France 18%, Italy 5%, Portugal 1%"],
      ["Parcel profile", "90% apparel and accessories, mostly under 2kg"]
    ],
    strategy: [
      ["Lead with peak reliability", "Make the proposal about home delivery resilience during drops and Black Friday."],
      ["Be direct on France", "Offer a Spain-first path but do not imply Amazon Shipping covers France."],
      ["Validate Papaya Home", "Filter heavy or awkward home decor before committing to full parcel coverage."]
    ],
    followups: [
      ["France expectation", "Confirm whether France coverage is required from day one."],
      ["Home decor", "Collect weights and dimensions for ceramic lamps, mirrors, and rugs."],
      ["Pickup points", "Confirm PUDO is only a workaround, not a required service."]
    ],
    guardrails: [
      ["Spain home delivery", "Pass", "Pass", "Spain 76% of parcels", "Include in proposal"],
      ["France", "Blocked", "Blocked", "France 18% and founder says it is core", "Escalate scope conflict"],
      ["Italy and Portugal", "Blocked", "Review", "Italy 5%, Portugal 1%", "Exclude from v1 scope"],
      ["Pickup points", "Needs review", "Review", "Customer calls it a workaround", "Position home delivery only"],
      ["Weight above 15kg", "Needs review", "Review", "Papaya Home may include heavy items", "Request SKU detail"],
      ["Peak capacity", "Pass", "Watch", "Black Friday roughly 6x", "Build peak plan into proposal"],
      ["Returns and claims", "Needs review", "Review", "Claims are a key pain point", "Avoid unsupported returns promise"]
    ],
    pricing: [
      ["Aggressive", "2,888 parcels/day", "EUR 1.05", "EUR 1.23", "14.6%", "Above minimum"],
      ["Balanced", "2,888 parcels/day", "EUR 1.05", "EUR 1.34", "21.6%", "Recommended"],
      ["Conservative", "2,650 parcels/day", "EUR 1.12", "EUR 1.48", "24.3%", "Risk buffer"]
    ],
    evidence: [
      ["Normal volume", "About 3,800 parcels per day", "Opportunity2_PinkPapaya.txt, email from Lucia", "Medium", "Accepted"],
      ["Peak volume", "Roughly six times a normal day", "Opportunity2_PinkPapaya.txt, email from Lucia", "Medium", "Accepted"],
      ["Geographic split", "Spain 76%, France 18%, Italy 5%, Portugal 1%", "Opportunity2_PinkPapaya.txt, email from Lucia", "Medium", "Accepted"],
      ["France concern", "Founder says France is not a maybe later", "Opportunity2_PinkPapaya.txt, email from Marta", "High", "Blocked"],
      ["Parcel profile", "90% apparel and accessories under 2kg", "Opportunity2_PinkPapaya.txt, email from Lucia", "Medium", "Accepted"],
      ["Home decor risk", "Some items heavy or awkwardly large", "Opportunity2_PinkPapaya.txt, email from Lucia", "Medium", "Needs review"]
    ],
    proposal: [
      "Recommend a Spain-first proposal for Pink Papaya focused on peak reliability, claims experience, and home delivery.",
      "The commercial story should be honest about France: it is strategically important to the customer but outside current Amazon Shipping scope.",
      "Before final pricing, request dimensions and weights for Papaya Home items and confirm that pickup points are not a required service."
    ]
  }
};

const workflowList = document.querySelector("#workflowList");
const caseButtons = document.querySelectorAll(".case-button");
const tabs = document.querySelectorAll(".tab");
const panels = document.querySelectorAll(".tab-panel");
const approvalChecks = document.querySelectorAll(".approval-check");
const approveButton = document.querySelector("#approveButton");
const approvalNote = document.querySelector("#approvalNote");
const toast = document.querySelector("#toast");
const fileInput = document.querySelector("#fileInput");
const fileSummary = document.querySelector("#fileSummary");
const dropzone = document.querySelector("#dropzone");
const intakeForm = document.querySelector("#intakeForm");
const analyzeButton = document.querySelector("#analyzeButton");
const loadSampleButton = document.querySelector("#loadSampleButton");
const companyName = document.querySelector("#companyName");
const opportunityType = document.querySelector("#opportunityType");

let activeCaseKey = "tecnomania";
let toastTimer;

function statusClass(status) {
  const key = status.toLowerCase();
  if (key.includes("pass") || key.includes("accepted") || key.includes("above") || key.includes("recommended")) return "status-pass";
  if (key.includes("block") || key.includes("no-go")) return "status-danger";
  if (key.includes("review") || key.includes("watch") || key.includes("minimum")) return "status-review";
  return "status-info";
}

function renderWorkflow(items) {
  workflowList.innerHTML = items
    .map(
      ([name, detail, state], index) => `
        <li class="${state}">
          <span class="step-marker">${index + 1}</span>
          <span><strong>${name}</strong><span>${detail}</span></span>
        </li>
      `
    )
    .join("");
}

function renderFacts(facts) {
  document.querySelector("#serviceFacts").innerHTML = facts
    .map(([label, value]) => `<div><dt>${label}</dt><dd>${value}</dd></div>`)
    .join("");
}

function renderStrategy(items) {
  document.querySelector("#strategyList").innerHTML = items
    .map(([title, body]) => `<li><strong>${title}</strong><span>${body}</span></li>`)
    .join("");
}

function renderFollowups(items) {
  document.querySelector("#followupGrid").innerHTML = items
    .map(([title, body]) => `<article class="action-card"><strong>${title}</strong><span>${body}</span></article>`)
    .join("");
}

function renderGuardrails(rows) {
  document.querySelector("#guardrailRows").innerHTML = rows
    .map(
      ([rule, result, severity, evidence, action]) => `
        <tr>
          <td><strong>${rule}</strong></td>
          <td><span class="status-pill ${statusClass(result)}">${result}</span></td>
          <td>${severity}</td>
          <td><span class="cell-muted">${evidence}</span></td>
          <td>${action}</td>
        </tr>
      `
    )
    .join("");
}

function renderPricing(rows) {
  document.querySelector("#pricingRows").innerHTML = rows
    .map(
      ([scenario, volume, cost, price, margin, approval]) => `
        <tr>
          <td><strong>${scenario}</strong></td>
          <td>${volume}</td>
          <td class="mono">${cost}</td>
          <td class="mono">${price}</td>
          <td class="mono">${margin}</td>
          <td><span class="status-pill ${statusClass(approval)}">${approval}</span></td>
        </tr>
      `
    )
    .join("");
}

function renderEvidence(rows) {
  document.querySelector("#evidenceRows").innerHTML = rows
    .map(
      ([fact, value, source, confidence, review]) => `
        <tr>
          <td><strong>${fact}</strong></td>
          <td>${value}</td>
          <td><span class="cell-muted">${source}</span></td>
          <td>${confidence}</td>
          <td><span class="status-pill ${statusClass(review)}">${review}</span></td>
        </tr>
      `
    )
    .join("");
}

function renderProposal(lines) {
  document.querySelector("#proposalPreview").innerHTML = `
    <h4>Draft recommendation</h4>
    <blockquote>${lines[0]}</blockquote>
    <p>${lines[1]}</p>
    <p>${lines[2]}</p>
  `;
}

function renderCase(key) {
  const current = cases[key];
  activeCaseKey = key;

  document.querySelector("#recommendationLabel").textContent = current.recommendation;
  document.querySelector("#recommendationReason").textContent = current.reason;
  document.querySelector("#scoreValue").textContent = current.score;
  document.querySelector("#scoreDetail").textContent = current.scoreDetail;
  document.querySelector("#winValue").textContent = current.win;
  document.querySelector("#winDetail").textContent = current.winDetail;
  document.querySelector("#riskValue").textContent = current.risk;
  document.querySelector("#riskDetail").textContent = current.riskDetail;
  companyName.value = current.name;
  opportunityType.value = current.type === "Structured RFQ" ? "Structured RFQ" : "Discovery notes";

  renderWorkflow(current.workflow);
  renderFacts(current.serviceFacts);
  renderStrategy(current.strategy);
  renderFollowups(current.followups);
  renderGuardrails(current.guardrails);
  renderPricing(current.pricing);
  renderEvidence(current.evidence);
  renderProposal(current.proposal);

  caseButtons.forEach((button) => {
    button.classList.toggle("active", button.dataset.case === key);
  });

  document.querySelector("#verifierStatus").textContent = current.name.includes("Pink") ? "France review required" : "Scope review required";
}

function setActiveTab(tab) {
  tabs.forEach((item) => {
    const selected = item === tab;
    item.classList.toggle("active", selected);
    item.setAttribute("aria-selected", String(selected));
  });

  panels.forEach((panel) => {
    const selected = panel.id === tab.getAttribute("aria-controls");
    panel.classList.toggle("active", selected);
    panel.hidden = !selected;
  });
}

function showToast(message) {
  window.clearTimeout(toastTimer);
  toast.textContent = message;
  toast.classList.add("show");
  toastTimer = window.setTimeout(() => toast.classList.remove("show"), 4200);
}

function updateFileSummary(files) {
  if (!files || files.length === 0) {
    fileSummary.textContent = "No uploaded demo files selected yet.";
    return;
  }
  const names = Array.from(files).map((file) => file.name).join(", ");
  fileSummary.textContent = `${files.length} file${files.length === 1 ? "" : "s"} ready: ${names}`;
}

function simulateAnalysis() {
  analyzeButton.disabled = true;
  analyzeButton.textContent = "Analyzing...";
  showToast("Zapier workflow started. Extraction, guardrails, pricing, and verifier steps are running.");

  const current = cases[activeCaseKey];
  const staged = current.workflow.map((step) => [...step]);
  staged.forEach((step, index) => {
    step[2] = index <= 1 ? "complete" : "waiting";
  });
  renderWorkflow(staged);

  staged.forEach((step, index) => {
    window.setTimeout(() => {
      step[2] = "complete";
      if (index + 1 < staged.length) staged[index + 1][2] = "running";
      renderWorkflow(staged);
    }, 450 + index * 360);
  });

  window.setTimeout(() => {
    renderWorkflow(current.workflow);
    analyzeButton.disabled = false;
    analyzeButton.textContent = "Analyze Opportunity";
    showToast("Analysis complete. Review guardrails and approve the export when ready.");
  }, 3600);
}

function updateApprovalState() {
  const complete = Array.from(approvalChecks).every((check) => check.checked);
  approveButton.disabled = !complete;
  approvalNote.textContent = complete ? "Export is unlocked for the current case." : "Complete all checks to unlock export.";
}

caseButtons.forEach((button) => {
  button.addEventListener("click", () => {
    renderCase(button.dataset.case);
    approvalChecks.forEach((check) => {
      check.checked = false;
    });
    updateApprovalState();
    showToast(`${cases[button.dataset.case].name} loaded.`);
  });
});

tabs.forEach((tab) => tab.addEventListener("click", () => setActiveTab(tab)));

fileInput.addEventListener("change", () => updateFileSummary(fileInput.files));

["dragenter", "dragover"].forEach((eventName) => {
  dropzone.addEventListener(eventName, (event) => {
    event.preventDefault();
    dropzone.classList.add("dragging");
  });
});

["dragleave", "drop"].forEach((eventName) => {
  dropzone.addEventListener(eventName, (event) => {
    event.preventDefault();
    dropzone.classList.remove("dragging");
  });
});

dropzone.addEventListener("drop", (event) => {
  const files = event.dataTransfer.files;
  updateFileSummary(files);
  showToast(`${files.length || 0} file${files.length === 1 ? "" : "s"} staged for analysis.`);
});

intakeForm.addEventListener("submit", (event) => {
  event.preventDefault();
  simulateAnalysis();
});

loadSampleButton.addEventListener("click", () => {
  const current = cases[activeCaseKey];
  fileSummary.textContent = `${current.type} sample pack loaded from source extracts.`;
  showToast("Sample opportunity pack loaded.");
});

approvalChecks.forEach((check) => check.addEventListener("change", updateApprovalState));

approveButton.addEventListener("click", () => {
  showToast("Export approved. In Zapier, this would create the Google Docs proposal and internal memo.");
  document.querySelector("#verifierStatus").textContent = "Export approved";
  document.querySelector("#verifierStatus").className = "status-pill status-pass";
});

document.querySelector("#exportTopButton").addEventListener("click", () => {
  setActiveTab(document.querySelector("#tab-export"));
  document.querySelector("#panel-export").scrollIntoView({ behavior: "smooth", block: "start" });
});

renderCase(activeCaseKey);
updateApprovalState();
