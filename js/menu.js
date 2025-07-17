const navToggler = document.querySelector(".nav-toggler");
const navMenu = document.querySelector(".menu__list");
const overlay = document.getElementById("menuBlurOverlay");

function openMenu() {
  navMenu.classList.add("open");
  overlay.classList.add("menu-blur-active");
}

function closeMenu() {
  navMenu.classList.remove("open");
  overlay.classList.remove("menu-blur-active");
}

navToggler.addEventListener("click", () => {
  const isOpen = navMenu.classList.contains("open");
  if (isOpen) {
    closeMenu();
  } else {
    openMenu();
  }
});

overlay.addEventListener("click", closeMenu);

document.querySelector(".menu__close")?.addEventListener("click", closeMenu);

document.querySelectorAll(".menu-scroll").forEach((link) => {
  link.addEventListener("click", () => {
    document.querySelector(".menu__close")?.click();
  });
});
