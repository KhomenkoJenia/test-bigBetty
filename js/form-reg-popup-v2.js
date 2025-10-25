// form-reg-popup-v2.js

// — API endpoints —
const signInUrl = "https://affiliates.bigbetty.io/api/client/partner/sign_in";
const signUpUrl = "https://affiliates.bigbetty.io/api/client/partner";
const forgetPassUrl =
  "https://affiliates.bigbetty.io/api/client/partner/password";
const dashboardUrl = "https://affiliates.bigbetty.io/partner/dashboard";

// — Google reCAPTCHA v3 helpers —
function getSiteKey() {
  return "6LeBbYMrAAAAAPtXZfBh5qEfyZ5g7kB5zr7WHcfo";
}
function loadRecaptcha(siteKey) {
  return new Promise((resolve) => {
    if (window.grecaptcha) return resolve();
    const s = document.createElement("script");
    s.src = `https://www.google.com/recaptcha/api.js?render=${siteKey}`;
    s.async = true;
    s.defer = true;
    s.onload = resolve;
    document.head.appendChild(s);
  });
}
async function getToken(action) {
  const siteKey = getSiteKey();
  await loadRecaptcha(siteKey);
  return new Promise((resolve) => {
    grecaptcha.ready(() => {
      grecaptcha.execute(siteKey, { action }).then((token) => resolve(token));
    });
  });
}

// [ADDED] — helper: безопасная отправка пикселя
function firePixel(url) {
  try {
    const s = document.createElement("script");
    s.src = url;
    s.async = true;
    s.defer = true;
    document.body.appendChild(s);
  } catch (e) {
    console.warn("Pixel inject error:", e);
  }
}

// [ADDED] — hash(email): CryptoJS если есть, иначе Web Crypto
async function sha256Hex(email) {
  const str = (email || "").toString();
  if (window.CryptoJS && window.CryptoJS.SHA256) {
    return window.CryptoJS.SHA256(str).toString(window.CryptoJS.enc.Hex);
  }
  const enc = new TextEncoder().encode(str);
  const buf = await crypto.subtle.digest("SHA-256", enc);
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

// Показываем ошибку рядом с полем и подчёркиваем его красным
function showError(el, msg) {
  el.style.border = "1px solid red";
  const wrap = el.closest(".input-group, .checkbox-group") || el.parentNode;
  wrap.querySelectorAll(".error-message").forEach((x) => x.remove());
  const d = document.createElement("div");
  d.className = "error-message";
  d.style.color = "#ff0a25";
  d.style.fontSize = "12px";
  d.style.fontWeight = "900";
  d.textContent = msg;
  wrap.appendChild(d);
}

// Очищаем все ошибки внутри контейнера
function clearErrors(ctx) {
  ctx.querySelectorAll(".error-message").forEach((x) => x.remove());
  ctx.querySelectorAll("input, textarea").forEach((x) => (x.style.border = ""));
}

// Открыть модалку Log In
function openLoginModal() {
  console.log("openLoginModal()");
  const mainModal = document.getElementById("mainModal");
  const tabLogin = document.querySelector(".tab-login");
  mainModal.classList.remove("hidden");
  document.body.style.overflow = "hidden";

  if (window.location.hash !== "#login") {
    window.location.hash = "#login";
  }
  setTimeout(() => tabLogin && tabLogin.click(), 20);
}

// Открыть модалку Sign Up
function openSignupModal() {
  console.log("openSignupModal()");
  const mainModal = document.getElementById("mainModal");
  const tabSignup = document.querySelector(".tab-signup");
  mainModal.classList.remove("hidden");
  document.body.style.overflow = "hidden";

  if (window.location.hash !== "#signup") {
    window.location.hash = "#signup";
  }
  setTimeout(() => tabSignup && tabSignup.click(), 20);
}

// Попап об успешной регистрации → переход на Log In
function showRegistrationSuccessPopup() {
  if (document.getElementById("regSuccessPopup")) return;
  const successPopup = document.createElement("div");
  successPopup.id = "regSuccessPopup";
  successPopup.style.cssText =
    "position:fixed; top:0; left:0; width:100%; height:100%;" +
    "background:rgba(0,0,0,0.8); display:flex; justify-content:center;" +
    "align-items:center; z-index:11000;";
  successPopup.innerHTML = `
    <div style="
      background:#fff; color:#2A58CE; padding:32px; border-radius:16px;
      max-width:480px; width:90%; text-align:center; position:relative;
    ">
      <span id="closeRegSuccess" style="
        position:absolute; top:10px; right:10px; font-size:25px;
        cursor:pointer;
      ">&times;</span>
      <h2 style="font-size:26px; font-weight:700; margin-bottom:10px;">
        Registered successfully
      </h2>
      <p style="font-size:14px; color:#29375A;">
        We will let you know when we approve your account.
      </p>
    </div>
  `;
  document.body.appendChild(successPopup);

  function finalize() {
    const popup = document.getElementById("regSuccessPopup");
    if (popup) popup.remove();
    openLoginModal();
    const signupForm = document.getElementById("formSignup");
    if (signupForm) signupForm.reset();
  }
  document
    .getElementById("closeRegSuccess")
    .addEventListener("click", finalize);
  setTimeout(finalize, 5000);
}

document.addEventListener("DOMContentLoaded", () => {
  console.log("DOM ready, initializing forms…");

  const formLogin = document.querySelector(".form-login");
  const formSignup = document.getElementById("formSignup");
  const forgotForm = document.getElementById("forgotForm");
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const recInput = document.getElementById("recaptcha-token");

  // ===== Sign Up: кастомная валидация + reCAPTCHA =====
  if (formSignup) {
    formSignup.noValidate = true;

    // стили для social-contact
    const socialInput = formSignup.querySelector("#social-contact");
    if (socialInput) {
      socialInput.style.marginRight = "5px";
    }

    // правила для пароля
    const pw1 = formSignup.querySelector("#signup-password");
    const pw2 = formSignup.querySelector("#signup-password-confirmation");
    const pwPattern =
      /^(?=.{8,})(?:(?=.*\d)(?=.*[A-Za-z])|(?=.*[a-z])(?=.*[A-Z])).*$/;

    // универсальная проверка required полей
    Array.from(formSignup.querySelectorAll("input[required]")).forEach(
      (field) => {
        field.addEventListener("blur", () => {
          clearErrors(formSignup);
          const val =
            field.type === "checkbox" ? field.checked : field.value.trim();
          if (!val) {
            let msg = "This field is required";
            if (field.id === "signup-email") msg = "Please enter your email";
            else if (field.id === "signup-company")
              msg = "Please enter your company name";
            else if (field.id === "signup-fullname")
              msg = "Please enter your full name";
            else if (field.id === "social-contact")
              msg = "Please enter your contact";
            showError(field, msg);
            return;
          }
          if (field.id === "signup-email" && !emailRegex.test(val)) {
            showError(field, "Invalid email");
          }
        });
        field.addEventListener("input", () => {
          const wrap = field.closest(".input-group, .checkbox-group");
          wrap?.querySelectorAll(".error-message").forEach((el) => el.remove());
          field.style.border = "";
        });
      }
    );

    // social-contact специфичная проверка
    if (socialInput) {
      socialInput.addEventListener("blur", () => {
        clearErrors(formSignup);
        const val = socialInput.value.trim();
        if (!val) {
          showError(socialInput, "Please enter your contact");
          return;
        }
        const type =
          socialInput.closest(".social-group").querySelector(".social-toggle")
            .dataset.socialType || "telegram";
        if (type === "whatsapp" && !val.startsWith("+")) {
          showError(socialInput, "Phone must start with +");
        }
        if (type === "telegram" && !val.startsWith("@")) {
          showError(socialInput, "Telegram must start with @");
        }
      });
    }

    // password blur проверки
    pw1.addEventListener("blur", () => {
      if (pw1.value && !pwPattern.test(pw1.value)) {
        showError(pw1, "Use ≥8 chars: letters+digits or mixed case");
      }
    });
    pw2.addEventListener("blur", () => {
      if (pw1.value && pw2.value && pw1.value !== pw2.value) {
        showError(pw2, "Passwords do not match");
      }
    });

    // отправка Sign Up
    formSignup.addEventListener("submit", async (e) => {
      e.preventDefault();
      clearErrors(formSignup);

      const E = formSignup.querySelector("#signup-email");
      const C = formSignup.querySelector("#signup-company");
      const F = formSignup.querySelector("#signup-fullname");
      const contEl = socialInput;
      const terms = formSignup.querySelector("#terms");

      if (!E.value.trim() || !emailRegex.test(E.value.trim())) {
        return showError(
          E,
          !E.value.trim() ? "Please enter your email" : "Invalid email"
        );
      }
      if (!C.value.trim())
        return showError(C, "Please enter your company name");
      if (!F.value.trim()) return showError(F, "Please enter your full name");
      if (!pwPattern.test(pw1.value)) {
        return showError(pw1, "Use ≥8 chars: letters+digits or mixed case");
      }
      if (pw1.value !== pw2.value) {
        return showError(pw2, "Passwords do not match");
      }
      if (!contEl.value.trim())
        return showError(contEl, "Please enter your contact");
      if (!terms.checked) return showError(terms, "You must accept Terms");

      // reCAPTCHA
      const token = await getToken("sign_up");
      if (recInput) recInput.value = token;

      const partner_user = {
        email: E.value.trim(),
        contact_email: E.value.trim(),
        company_name: C.value.trim(),
        full_name: F.value.trim(),
        nickname: E.value.trim().split("@")[0],
        address: "",
        phone: contEl.value.trim(),
        password: pw1.value,
        password_confirmation: pw2.value,
        terms_accepted: true,
      };
      const payload = { partner_user, recaptcha_token: token };

      try {
        const res = await fetch(signUpUrl, {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify(payload),
        });
        const txt = await res.text();

        // [ADDED] — при успехе шлём пиксель с хешем email
        if (res.status === 201) {
          const emailVal = E.value.trim().toLowerCase();
          try {
            const hash = await sha256Hex(emailVal);
            const pixel =
              "https://pixel-us.convertagain.net/pixel/js?auth=jgnc6jr&event=regfinished&uid=" +
              encodeURIComponent(hash);
            firePixel(pixel);
          } catch (e) {
            console.warn("Email hash/pixel error:", e);
          }
          return showRegistrationSuccessPopup();
        }

        const err = (() => {
          try {
            return JSON.parse(txt);
          } catch {
            return { error: txt };
          }
        })();
        if (err.errors) {
          Object.entries(err.errors).forEach(([field, msgs]) => {
            const el =
              formSignup.querySelector(`[name="${field}"]`) || formSignup;
            showError(el, msgs[0]);
          });
        } else {
          showError(formSignup, err.error || "Registration error");
        }
      } catch {
        showError(formSignup, "Network error");
      }
    });
  }

  // ===== Log In =====
  if (formLogin) {
    const E = formLogin.querySelector("#login-email");
    const P = formLogin.querySelector("#login-password");
    const O = formLogin.querySelector("#login-two-factor");
    const submitBtn = formLogin.querySelector("button[type=submit]");

    // валидация email по blur
    E.addEventListener("blur", () => {
      clearErrors(formLogin);
      if (E.value.trim() && !emailRegex.test(E.value.trim())) {
        showError(submitBtn, "Invalid email");
      }
    });

    formLogin.addEventListener("submit", async (e) => {
      e.preventDefault();
      clearErrors(formLogin);

      const loginVal = E.value.trim();
      const passVal = P.value.trim();

      if (!loginVal) {
        return showError(submitBtn, "Please enter your email");
      }
      if (!emailRegex.test(loginVal)) {
        return showError(submitBtn, "Invalid email");
      }
      if (!passVal) {
        return showError(submitBtn, "Please enter your password");
      }

      // reCAPTCHA + отправка
      const token = await getToken("login");
      const payload = {
        partner_user: {
          email: loginVal,
          password: passVal,
          otp_attempt: O.value.trim() || false,
        },
        recaptcha_token: token,
      };

      try {
        const res = await fetch(signInUrl, {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify(payload),
        });
        const txt = await res.text();

        if (res.status === 401) {
          let errObj;
          try {
            errObj = JSON.parse(txt);
          } catch {
            errObj = { error: txt };
          }

          const rawMsg = (errObj.error || "").toLowerCase();
          if (rawMsg.includes("not verified")) {
            return showError(submitBtn, "Your account is not verified");
          }
          if (rawMsg.includes("authenticator")) {
            return showError(submitBtn, "Wrong authenticator code");
          }
          return showError(submitBtn, "Wrong login or password");
        }

        if (res.ok) {
          window.location = dashboardUrl;
          return;
        }

        // прочие ошибки
        showError(submitBtn, "Network error");
      } catch {
        showError(submitBtn, "Network error");
      }
    });
  }

  // ===== Forgot Password =====
  if (forgotForm) {
    const em = forgotForm.querySelector('input[name="forgot_email"]');
    em.addEventListener("blur", () => {
      clearErrors(forgotForm);
      if (em.value.trim() && !emailRegex.test(em.value.trim())) {
        showError(em, "Invalid email");
      }
    });
    forgotForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      clearErrors(forgotForm);
      if (!em.value.trim()) return showError(em, "Please enter your email");
      if (!emailRegex.test(em.value.trim()))
        return showError(em, "Invalid email");

      const token = await getToken("forgot_password");
      if (recInput) recInput.value = token;

      try {
        const res = await fetch(forgetPassUrl, {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            partner_user: { email: em.value.trim() },
            recaptcha_token: token,
          }),
        });
        alert(
          res.ok ? "Instructions sent." : "Error — please try again later."
        );
      } catch {
        alert("Network error");
      }
    });
  }

  // ===== Auto-open by URL/query or filename =====
  const params = new URLSearchParams(window.location.search);
  const tab = params.get("tab");
  const pathname = window.location.pathname;
  console.log("AUTO-OPEN check:", { tab, pathname });
  if (
    pathname.endsWith("/signup.html") ||
    tab === "signup" ||
    pathname === "/signup"
  ) {
    console.log("→ opening SIGNUP");
    openSignupModal();
  } else if (
    pathname.endsWith("/signin.html") ||
    tab === "login" ||
    pathname === "/login" ||
    pathname === "/signin"
  ) {
    console.log("→ opening LOGIN");
    openLoginModal();
  }
});

// Переключение «глаз» для пароля
function togglePasswordVisibility(inputId, btn) {
  const input = document.getElementById(inputId);
  const eye = btn.querySelector(".icon-eye");
  const eyeSlash = btn.querySelector(".icon-eye-slash");
  if (input.type === "password") {
    input.type = "text";
    eye.classList.add("hidden");
    eyeSlash.classList.remove("hidden");
  } else {
    input.type = "password";
    eye.classList.remove("hidden");
    eyeSlash.classList.add("hidden");
  }
}
