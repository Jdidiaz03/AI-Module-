const notice = document.createElement("div");
notice.className = "concept-toast";
notice.textContent = "Store link placeholder. Add the live app URL before launch.";
notice.hidden = true;
document.body.appendChild(notice);

let noticeTimer;

document.querySelectorAll("[data-download]").forEach((link) => {
  link.addEventListener("click", (event) => {
    if (link.getAttribute("href") === "#") {
      event.preventDefault();
      notice.hidden = false;
      clearTimeout(noticeTimer);
      noticeTimer = setTimeout(() => {
        notice.hidden = true;
      }, 3200);
    }
  });
});
