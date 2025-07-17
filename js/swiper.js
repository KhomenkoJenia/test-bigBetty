var swiper = new Swiper(".swiper-container", {
  pagination: ".swiper-pagination",
  navigation: {
    nextEl: ".swiper-button-next",
    prevEl: ".swiper-button-prev",
  },
  paginationClickable: true,
  loop: true,
  slidesPerView: 3, // Отображать 3 слайда на десктопе
  centeredSlides: false, // Отключить центрирование слайдов
  autoplayDisableOnInteraction: true,
  autoplay: 2500,
  breakpoints: {
    1024: {
      slidesPerView: 3, // Для ширины экрана от 1024px отображать 3 слайда
      spaceBetween: 30,
    },
    768: {
      slidesPerView: 1, // Для ширины экрана от 768px отображать 1 слайд
      spaceBetween: 20,
    },
    640: {
      slidesPerView: 1, // Для ширины экрана от 640px отображать 1 слайд
      spaceBetween: 10,
    },
    320: {
      slidesPerView: 1, // Для ширины экрана от 320px отображать 1 слайд
      spaceBetween: 20,
    },
  },
});

var brandSwiper = new Swiper(".brand-swiper", {
  pagination: ".swiper-pagination",
  navigation: {
    nextEl: ".swiper-button-next",
    prevEl: ".swiper-button-prev",
  },
  paginationClickable: true,
  loop: true,
  slidesPerView: 3, // Отображать 3 слайда на десктопе
  centeredSlides: false, // Отключить центрирование слайдов
  autoplayDisableOnInteraction: true,
  autoplay: 2500,
  breakpoints: {
    1024: {
      slidesPerView: 3, // Для ширины экрана от 1024px отображать 3 слайда
      spaceBetween: 30,
    },
    768: {
      slidesPerView: 1, // Для ширины экрана от 768px отображать 1 слайд
      spaceBetween: 20,
    },
    640: {
      slidesPerView: 1, // Для ширины экрана от 640px отображать 1 слайд
      spaceBetween: 10,
    },
    320: {
      slidesPerView: 1, // Для ширины экрана от 320px отображать 1 слайд
      spaceBetween: 20,
    },
  },
});
const sliderNav = new Swiper(".gallery-slider", {
  spaceBetween: 0,
  slidesPerView: 18,
  allowTouchMove: false,
  loop: false,
  breakpoints: {
    0: {
      slidesPerView: 5,
    },
    768: {
      slidesPerView: 18,
    },
  },
});

const sliderMain = new Swiper(".gallery-main", {
  loop: true,
  loopedSlides: 18,
  spaceBetween: 5,
  slidesPerView: 4,
  loopFillGroupWithBlank: true,
  watchSlidesProgress: true,
  watchSlidesVisibility: true,
  preloadImages: true,
  centeredSlides: false,
  thumbs: {
    swiper: sliderNav,
  },
  breakpoints: {
    0: {
      slidesPerView: 1.7,
      spaceBetween: 1,
    },
    390: {
      slidesPerView: 1.8,
    },
    415: {
      slidesPerView: 1.9,
    },
    440: {
      slidesPerView: 2,
    },
    480: {
      slidesPerView: 2,
      spaceBetween: 1,
    },

    768: {
      slidesPerView: 5,
    },
  },
});

if (window.innerWidth < 768) {
  setTimeout(() => {
    sliderMain.slideToLoop(1, 0);
  }, 100);
}

const sliderBar = document.querySelector(".gallery-slider .swiper-wrapper");

sliderBar.addEventListener("mousedown", startDrag);
sliderBar.addEventListener("touchstart", startDrag, { passive: true });

function startDrag(e) {
  const wrapperRect = sliderBar.getBoundingClientRect();

  function move(ev) {
    const clientX = ev.touches ? ev.touches[0].clientX : ev.clientX;
    const percent = (clientX - wrapperRect.left) / wrapperRect.width;
    const slideIndex = Math.floor(percent * 12);

    sliderMain.slideTo(slideIndex);
  }

  function stopDrag() {
    document.removeEventListener("mousemove", move);
    document.removeEventListener("mouseup", stopDrag);
    document.removeEventListener("touchmove", move);
    document.removeEventListener("touchend", stopDrag);
  }

  document.addEventListener("mousemove", move);
  document.addEventListener("mouseup", stopDrag);
  document.addEventListener("touchmove", move);
  document.addEventListener("touchend", stopDrag);
}
