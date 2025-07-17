const tabs = document.querySelectorAll(".tab");
const tabContents = document.querySelectorAll(".tab-content");

tabs.forEach((t) => t.classList.remove("active"));
tabContents.forEach((tc) => tc.classList.remove("active"));

let defaultIndex = 0;
let hash = window.location.hash;
let found = false;

if (hash) {
  const targetTab = document.querySelector(
    `.tab[data-tab="${hash.replace("#tab-", "")}"]`
  );
  const targetContent = document.querySelector(hash);

  if (targetTab && targetContent) {
    targetTab.classList.add("active");
    targetContent.classList.add("active");
    found = true;
  }
}

if (!found) {
  tabs[defaultIndex].classList.add("active");
  tabContents[defaultIndex].classList.add("active");
}

tabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    const target = document.getElementById(`tab-${tab.dataset.tab}`);

    tabs.forEach((t) => t.classList.remove("active"));
    tabContents.forEach((tc) => tc.classList.remove("active"));

    tab.classList.add("active");
    target.classList.add("active");

    history.replaceState(null, null, `#tab-${tab.dataset.tab}`);
  });
});
