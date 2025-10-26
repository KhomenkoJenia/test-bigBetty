function swapToMobileImages() {
  const isMobile = window.innerWidth <= 730;
  const images = document.querySelectorAll(".brand-img-absolute");

  images.forEach((img) => {
    const originalSrc = img.getAttribute("data-original") || img.src;

    if (!img.dataset.original) {
      img.setAttribute("data-original", originalSrc);
    }

    if (isMobile) {
      const mobileSrc = originalSrc.replace(
        /(\.png|\.jpg|\.jpeg|\.webp)$/i,
        "-mobile$1"
      );
      img.src = mobileSrc;
    } else {
      img.src = img.dataset.original;
    }
  });
}

window.addEventListener("DOMContentLoaded", swapToMobileImages);

window.addEventListener("resize", swapToMobileImages);

document.querySelectorAll(".openPopup").forEach(function (button) {
  button.addEventListener("click", function (event) {
    event.preventDefault();
    document.getElementById("popup").style.display = "block";
    document.body.classList.add("noscroll");
    document.documentElement.classList.add("noscroll");
  });
});

document.querySelector(".popup .close").addEventListener("click", function () {
  popup.style.display = "none";
  document.body.classList.remove("noscroll");
  document.documentElement.classList.remove("noscroll");
});

const closeToButton = document.querySelector(".popup .close-to");

if (closeToButton) {
  closeToButton.addEventListener("click", function () {
    const popup = document.getElementById("popup");
    popup.style.display = "none";
    document.body.classList.remove("noscroll");
    document.documentElement.classList.remove("noscroll");
  });
}

window.addEventListener("click", function (event) {
  const popup = document.getElementById("popup");
  if (event.target === popup) {
    popup.style.display = "none";
    document.body.classList.remove("noscroll");
    document.documentElement.classList.remove("noscroll");
  }
});

document.querySelectorAll(".custom-dropdown").forEach((drop) => {
  const selected = drop.querySelector(".dropdown-selected");
  const options = drop.querySelector(".dropdown-options");
  const hiddenInput = drop.querySelector('input[type="hidden"]');

  selected.addEventListener("click", () => {
    drop.classList.toggle("open");
  });

  options.querySelectorAll("li").forEach((option) => {
    option.addEventListener("click", () => {
      selected.textContent = option.textContent;
      selected.classList.remove("placeholder");
      selected.classList.add("active");
      hiddenInput.value = option.dataset.value;
      drop.classList.remove("open");
    });
  });

  document.addEventListener("click", (e) => {
    if (!drop.contains(e.target)) {
      drop.classList.remove("open");
    }
  });
});
var whyWeAreSwiper = new Swiper(".why-we-are-slider", {
  slidesPerView: 1,
  loop: true,
  spaceBetween: 0,
  pagination: {
    el: ".why-pagination",
    clickable: true,
  },
  autoplay: {
    delay: 2500,
    disableOnInteraction: true,
  },
});

// Керування анімацією по кліку на .hero__main_image
document.addEventListener("DOMContentLoaded", function () {
  const heroMainImage = document.querySelector(".hero__main_image");
  const animatedPattern = document.querySelector(".main-image-bg-hero");

  if (heroMainImage && animatedPattern) {
    let isStopped = false;

    heroMainImage.addEventListener("click", function () {
      if (isStopped) {
        // Відновити анімацію (видалити клас зупинки)
        // Використовуємо requestAnimationFrame щоб дати час CSS transition спрацювати
        requestAnimationFrame(() => {
          animatedPattern.classList.remove("speed-stop");
        });
        isStopped = false;
      } else {
        // Зупинити анімацію
        animatedPattern.classList.add("speed-stop");
        isStopped = true;
      }
    });
  }
});

window.addEventListener("load", function () {
  const loader = document.getElementById("preloader");
  loader.style.opacity = "0";
  setTimeout(() => {
    loader.style.display = "none";
  }, 500);
});
