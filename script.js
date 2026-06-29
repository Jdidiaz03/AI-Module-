const toast = document.querySelector(".toast");
let toastTimeout;

document.querySelectorAll("[data-download]").forEach((button) => {
  button.addEventListener("click", (event) => {
    const href = button.getAttribute("href");

    if (!href || href === "#") {
      event.preventDefault();
      showToast();
    }
  });
});

function showToast() {
  if (!toast) return;

  toast.hidden = false;
  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => {
    toast.hidden = true;
  }, 3600);
}
