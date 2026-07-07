const form = document.querySelector("#opportunity-form");

if (form) {
  const message = document.querySelector("#form-message");
  const submitButton = form.querySelector('button[type="submit"]');

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (!form.reportValidity()) {
      return;
    }

    const formData = new FormData(form);
    const files = Array.from(formData.getAll("opportunity-pack"))
      .filter((file) => file && file.name)
      .map((file) => ({ name: file.name, size: file.size, type: file.type }));
    const body = {
      name: formData.get("name") || formData.get("full-name") || "",
      email: formData.get("email") || formData.get("work-email") || "",
      company: String(formData.get("company") || ""),
      opportunity_type: formData.get("opportunity-type") || "",
      monthly_volume: formData.get("monthly-volume") || "",
      primary_region: formData.get("primary-region") || "",
      notes: formData.get("notes") || "",
      files,
      submitted_at: new Date().toISOString(),
      source: "amazon-shipping-opportunity-copilot-site",
    };

    submitButton.disabled = true;
    message.classList.remove("is-visible");

    try {
      const response = await fetch("/api/review", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });
      const result = await response.json();
      if (!response.ok || !result.ok) {
        throw new Error(result.error || `Review endpoint failed with status ${response.status}`);
      }
      form.reset();
      message.textContent = "";
      const link = document.createElement("a");
      link.href = result.dashboard_url;
      link.textContent = "Open the automation dashboard";
      const emailStatus =
        result.email?.status === "sent"
          ? `Email sent to ${body.email}.`
          : `Email queued locally because SMTP is not configured. ${result.email?.path || ""}`;
      message.append(
        `Automation complete for ${result.company}. ${emailStatus} `,
        link,
        ".",
      );
      message.classList.add("is-visible");
      message.scrollIntoView({ behavior: "smooth", block: "nearest" });
    } catch (error) {
      console.error("Failed to run review request", error);
      message.textContent =
        "The automation server is not responding. Stop the basic http.server and run: python3 automation/server.py 8000";
      message.classList.add("is-visible");
      message.scrollIntoView({ behavior: "smooth", block: "nearest" });
    } finally {
      submitButton.disabled = false;
    }
  });
}
