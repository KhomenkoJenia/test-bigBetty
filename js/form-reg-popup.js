document.addEventListener("DOMContentLoaded", () => {
  // Подключите CryptoJS (например, через CDN) перед этим скриптом:
  // <script src="https://cdnjs.cloudflare.com/ajax/libs/crypto-js/4.1.1/crypto-js.min.js"></script>

  // URL-ы API
  const signInUrl = "https://affiliates.bigbetty.io/api/client/partner/sign_in";
  const signUpUrl = "https://affiliates.bigbetty.io/api/client/partner";
  const forgetPassUrl =
    "https://affiliates.bigbetty.io/api/client/partner/password";
  const dashboardUrl = "https://affiliates.bigbetty.io/partner/dashboard";
  // Сообщения для ошибок
  const simple_email_placeholder = "Your e-mail";
  const invalid_email_placeholder = "Enter e-mail, please";
  const wrong_email_or_pass = "E-mail or password is incorrect";
  const simple_password_placeholder = "Password";
  const invalid_password_placeholder = "Password is required";
  const wrong_two_factor_key = "Two Factor Key is incorrect";
  const empty_company_name = "Company name can't be empty";
  const wrong_forget_pass_placeholder = "Unknown email address";

  // Функция вычисления хэша (SHA-256) с использованием CryptoJS
  /*function computeHash(str) {
  return CryptoJS.SHA256(str).toString(CryptoJS.enc.Hex);
}*/

  // Функция показа основной модалки (Log In / Sign Up)
  function showMainModal(mode) {
    const mainModal = document.getElementById("mainModal");
    const tabLogin = document.getElementById("tabLogin");
    const tabSignup = document.getElementById("tabSignup");
    const formLogin = document.getElementById("formLogin");
    const formSignup = document.getElementById("formSignup");

    mainModal.classList.remove("hidden");
    document.body.style.overflow = "hidden";
    if (mode === "login") {
      tabLogin.classList.add("active");
      tabSignup.classList.remove("active");
      formLogin.classList.add("active");
      formSignup.classList.remove("active");
    } else if (mode === "signup") {
      tabSignup.classList.add("active");
      tabLogin.classList.remove("active");
      formSignup.classList.add("active");
      formLogin.classList.remove("active");
      // Отслеживание старта регистрации (regstarted)
      let regStartedScript = document.createElement("script");
      regStartedScript.src =
        "https://pixel-us.convertagain.net/pixel/js?auth=pqecrpk&event=regstarted";
      regStartedScript.async = true;
      document.body.appendChild(regStartedScript);
    }
  }

  function showRegistrationSuccessPopup() {
    let successPopup = document.getElementById("regSuccessPopup");
    if (!successPopup) {
      successPopup = document.createElement("div");
      successPopup.id = "regSuccessPopup";
      successPopup.style.cssText =
        "position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.8); display:flex; justify-content:center; align-items:center; z-index:11000;";
      successPopup.innerHTML = `
      <div style="background:#fff; color:#2A58CE; padding:32px; border-radius:16px; max-width:480px; width:90%; text-align:center; position:relative;">
        <span id="closeRegSuccess" style="position:absolute; top:10px; right:10px; font-size:25px; cursor:pointer;">&times;</span>
        <h2 style="font-size:26px; font-weight:700; margin-bottom:10px;">Registered successfully</h2>
        <p style="font-size:12px; color:#29375A;">We will let you know when we approve your account.</p>
      </div>
    `;
      document.body.appendChild(successPopup);
      document
        .getElementById("closeRegSuccess")
        .addEventListener("click", function () {
          successPopup.remove();
          showMainModal("login");
          document.getElementById("formSignup").reset();
        });
      setTimeout(function () {
        if (document.body.contains(successPopup)) {
          successPopup.remove();
          showMainModal("login");
          document.getElementById("formSignup").reset();
        }
      }, 5000);
    }
  }

  function showResetSuccessPopup(email) {
    let resetPopup = document.getElementById("resetSuccessPopup");
    if (!resetPopup) {
      resetPopup = document.createElement("div");
      resetPopup.id = "resetSuccessPopup";
      resetPopup.style.cssText =
        "position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.8); display:flex; justify-content:center; align-items:center; z-index:11000;";
      resetPopup.innerHTML = `
      <div style="background:#fff; color:#2A58CE; padding:32px; border-radius:16px; max-width:480px; width:90%; text-align:center; position:relative;">
        <span id="closeResetSuccess" style="position:absolute; top:10px; right:10px; font-size:25px; cursor:pointer;">&times;</span>
        <h2 style="font-size:26px; font-weight:700; margin-bottom:10px;">Reset Instructions Sent</h2>
        <p style="font-size:12px; color:#29375A;">Reset password instructions have been sent to ${email}.</p>
      </div>
    `;
      document.body.appendChild(resetPopup);
      document
        .getElementById("closeResetSuccess")
        .addEventListener("click", function () {
          resetPopup.remove();
        });
      setTimeout(function () {
        if (document.body.contains(resetPopup)) {
          resetPopup.remove();
        }
      }, 5000);
    }
  }

  // Глобальная функция для вставки пикселя с параметрами uid, partner_email и hash
  function insertVerifiedPixel() {
    let pixelUrl =
      "https://pixel-us.convertagain.net/pixel/js?auth=jgnc6jr&event=regfinished";

    if (hashedEmail) {
      pixelUrl += "&email=" + encodeURIComponent(hashedEmail);
    }

    const script = document.createElement("script");
    script.src = pixelUrl;
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);
    console.log("Pixel inserted with hashed email:", hashedEmail);
  }

  // Функция отображения ошибки под полем
  function showError(inputEl, message) {
    let group = inputEl.closest(".input-group");
    if (group) {
      let existing = group.querySelector(".error-message");
      if (existing) {
        existing.textContent = message;
      } else {
        let errorMsg = document.createElement("div");
        errorMsg.className = "error-message";
        errorMsg.textContent = message;
        group.appendChild(errorMsg);
      }
    } else {
      let errorMsg = inputEl.parentNode.querySelector(".error-message");
      if (errorMsg) {
        errorMsg.textContent = message;
      } else {
        errorMsg = document.createElement("div");
        errorMsg.className = "error-message";
        errorMsg.textContent = message;
        inputEl.parentNode.insertBefore(errorMsg, inputEl.nextSibling);
      }
    }
  }

  function clearError(inputEl) {
    let group = inputEl.closest(".input-group");
    if (group) {
      let existing = group.querySelector(".error-message");
      if (existing) existing.remove();
    } else {
      let sibling = inputEl.nextElementSibling;
      if (sibling && sibling.classList.contains("error-message")) {
        sibling.remove();
      }
    }
  }

  // Обработка событий после загрузки документа
  document.addEventListener("DOMContentLoaded", function () {
    // Если подключена библиотека jQuery Inputmask, применяем маску для поля телефона
    if (typeof $.fn.inputmask !== "undefined") {
      $("#signup-phone").inputmask({
        regex: "^\\+?[0-9\\s\\-().]{7,15}$",
        placeholder: "",
        showMaskOnHover: false,
        showMaskOnFocus: true,
      });
    } else {
      console.warn("Inputmask is not loaded.");
    }

    // Элементы модальных окон и форм
    const mainModal = document.getElementById("mainModal");
    const closeMainModal = document.getElementById("closeMainModal");
    const tabLogin = document.getElementById("tabLogin");
    const tabSignup = document.getElementById("tabSignup");
    const formLogin = document.getElementById("formLogin");
    const formSignup = document.getElementById("formSignup");
    const openSignIn = document.getElementById("openSignIn");
    const openSignUp = document.getElementById("openSignUp");
    const switchToSignup = document.getElementById("switchToSignup");
    const switchToLogin = document.getElementById("switchToLogin");
    const forgotLink = document.getElementById("forgotLink");

    // Элементы попапа сброса пароля
    const forgotOverlay = document.getElementById("forgotOverlay");
    const closeForgot = document.getElementById("closeForgot");
    const forgotForm = document.getElementById("forgotForm");
    const forgotMessage = document.getElementById("forgotMessage");

    if (openSignIn) {
      openSignIn.addEventListener("click", function () {
        showMainModal("login");
      });
    }
    if (openSignUp) {
      openSignUp.addEventListener("click", function () {
        showMainModal("signup");
      });
    }
    tabLogin.addEventListener("click", function () {
      showMainModal("login");
    });
    tabSignup.addEventListener("click", function () {
      showMainModal("signup");
    });
    if (switchToSignup) {
      switchToSignup.addEventListener("click", function (e) {
        e.preventDefault();
        showMainModal("signup");
      });
    }
    if (switchToLogin) {
      switchToLogin.addEventListener("click", function (e) {
        e.preventDefault();
        showMainModal("login");
      });
    }
    if (closeMainModal) {
      closeMainModal.addEventListener("click", function () {
        mainModal.classList.add("hidden");
        document.body.style.overflow = "auto";
      });
    }
    forgotLink.addEventListener("click", function (e) {
      e.preventDefault();
      mainModal.classList.add("hidden");
      forgotOverlay.classList.remove("hidden");
      document.body.style.overflow = "hidden";
    });
    closeForgot.addEventListener("click", function () {
      forgotOverlay.classList.add("hidden");
      document.body.style.overflow = "auto";
      if (forgotMessage) forgotMessage.textContent = "";
    });
    forgotForm.addEventListener("submit", function (e) {
      e.preventDefault();
      const email = forgotForm
        .querySelector('input[name="forgot_email"]')
        .value.trim();
      if (!email) {
        const emailInput = forgotForm.querySelector(
          'input[name="forgot_email"]'
        );
        emailInput.classList.add("invalid");
        emailInput.setAttribute("placeholder", "Enter your email, please");
        if (forgotMessage) {
          forgotMessage.textContent = "Please enter your email.";
          forgotMessage.style.color = "red";
        }
        return;
      }
      const requestData = { partner_user: { email: email } };
      console.log("Sending reset instructions for:", email);
      $("#preloader").removeClass("hide").addClass("active");
      fetch(forgetPassUrl, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestData),
      })
        .then(async (response) => {
          const text = await response.text();
          console.log("Server response:", text);
          if (response.ok) {
            showResetSuccessPopup(email);
            setTimeout(function () {
              forgotOverlay.classList.add("hidden");
              document.body.style.overflow = "auto";
              if (forgotMessage) forgotMessage.textContent = "";
            }, 5000);
          } else {
            if (forgotMessage) {
              forgotMessage.textContent = "Error: " + text;
              forgotMessage.style.color = "red";
            } else {
              alert("Error: " + text);
            }
          }
        })
        .catch((err) => {
          if (forgotMessage) {
            forgotMessage.textContent = "Request error: " + err;
            forgotMessage.style.color = "red";
          } else {
            alert("Request error: " + err);
          }
        })
        .finally(function () {
          setTimeout(function () {
            $("#preloader").addClass("hide").removeClass("active");
          }, 2000);
        });
    });

    // Валидация "на лету" для формы логина
    const loginEmail = document.getElementById("login-email");
    if (loginEmail) {
      loginEmail.addEventListener("input", function () {
        clearError(this);
        if (this.value.trim().length < 3) {
          showError(this, "Email is too short.");
        }
      });
    }
    const loginPassword = document.getElementById("login-password");
    if (loginPassword) {
      loginPassword.addEventListener("input", function () {
        clearError(this);
        if (this.value.trim().length > 0 && this.value.trim().length < 6) {
          showError(this, "Password must be at least 6 characters.");
        }
      });
    }
    // Валидация для формы регистрации
    const signupEmail = document.getElementById("signup-email");
    if (signupEmail) {
      signupEmail.addEventListener("input", function () {
        clearError(this);
        if (this.value.trim().length < 3) {
          showError(this, "Email is too short.");
        }
      });
    }
    const signupPassword = document.getElementById("signup-password");
    if (signupPassword) {
      signupPassword.addEventListener("input", function () {
        clearError(this);
        if (this.value.trim().length > 0 && this.value.trim().length < 6) {
          showError(this, "Password must be at least 6 characters.");
        }
      });
    }
    const signupPasswordConfirm = document.getElementById(
      "signup-password-confirmation"
    );
    if (signupPasswordConfirm && signupPassword) {
      signupPasswordConfirm.addEventListener("input", function () {
        clearError(this);
        if (this.value.trim() !== signupPassword.value.trim()) {
          showError(this, "Passwords do not match.");
        }
      });
    }

    // Ограничение ввода в поле телефона до 15 символов
    const phoneInput = document.getElementById("signup-phone");
    if (phoneInput) {
      phoneInput.addEventListener("input", function () {
        if (this.value.length > 15) {
          this.value = this.value.slice(0, 15);
        }
      });
    }
  });

  // Обработка формы Log In
  document.getElementById("formLogin").addEventListener("submit", function (e) {
    e.preventDefault();
    this.querySelectorAll(".error-message").forEach(function (el) {
      el.remove();
    });
    const emailInput = this.querySelector('input[name="email"]');
    const passwordInput = this.querySelector('input[name="password"]');
    const twoFactorInput = this.querySelector('input[name="two-factor"]');
    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();
    const twoFactor = twoFactorInput.value.trim();

    emailInput.classList.remove("invalid");
    passwordInput.classList.remove("invalid");
    twoFactorInput.classList.remove("invalid");

    if (!email || !password) {
      if (!email) {
        emailInput.classList.add("invalid");
        emailInput.setAttribute("placeholder", invalid_email_placeholder);
        showError(emailInput, "Please enter your e-mail.");
      }
      if (!password) {
        passwordInput.classList.add("invalid");
        passwordInput.setAttribute("placeholder", invalid_password_placeholder);
        showError(passwordInput, "Please enter your password.");
      }
      return false;
    }

    const loginData = {
      partner_user: {
        email: email,
        password: password,
        otp_attempt: twoFactor || false,
      },
    };

    $("#preloader").removeClass("hide").addClass("active");
    fetch(signInUrl, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(loginData),
      credentials: "include",
    })
      .then(async (response) => {
        if (response.ok) {
          const data = await response.json();
          console.log("Login successful:", data);
          window.location.href = dashboardUrl;
        } else {
          let message = "";
          let errorData = {};
          try {
            errorData = await response.json();
          } catch (e) {
            const errorText = await response.text();
            errorData.error = errorText;
          }
          if (errorData.verified === false) {
            message =
              "Your account is not verified. Please check your email and complete verification.";
          } else if (errorData.error) {
            const errorStr = errorData.error.toLowerCase();
            if (errorStr.includes("password")) {
              message = "Incorrect password. Please try again.";
            } else if (errorStr.includes("email")) {
              message = "Invalid email address. Please check your email.";
            } else {
              message = errorData.error;
            }
          } else {
            message = "Invalid credentials. Please check your details.";
          }
          let errorMsg = document.createElement("div");
          errorMsg.className = "error-message";
          errorMsg.style.cssText = "margin-top:10px;";
          errorMsg.textContent = message;
          this.appendChild(errorMsg);
        }
      })
      .catch((err) => {
        alert("Request error: " + err);
      })
      .finally(() => {
        setTimeout(function () {
          $("#preloader").addClass("hide").removeClass("active");
        }, 2000);
      });
  });

  // Обработка формы Sign Up
  $(document).ready(function () {
    $("#formSignup").on("submit", function (event) {
      event.preventDefault();
      var $form = $(this);
      $form.find("input").removeClass("invalid");
      $form.find(".error-message").remove();

      var email = ($form.find('input[name="email"]').val() || "").trim();
      var password = ($form.find('input[name="password"]').val() || "").trim();
      var passwordConfirmation = (
        $form.find('input[name="password_confirmation"]').val() || ""
      ).trim();
      var companyName = (
        $form.find('input[name="company_name"]').val() || ""
      ).trim();
      var nickname = ($form.find('input[name="nickname"]').val() || "").trim();
      var fullName = ($form.find('input[name="full_name"]').val() || "").trim();
      var address = ($form.find('input[name="address"]').val() || "").trim();
      var phone = ($form.find('input[name="phone"]').val() || "").trim();
      var newsletter = $form.find('input[name="newsletter"]').prop("checked");
      var terms = $form.find('input[name="terms"]').prop("checked");

      var valid = true;
      if (!email) {
        $form
          .find('input[name="email"]')
          .addClass("invalid")
          .attr("placeholder", invalid_email_placeholder)
          .after(
            '<div class="error-message" style="color:red; font-size:12px;">Please enter your e-mail.</div>'
          );
        valid = false;
      }
      if (!password) {
        $form
          .find('input[name="password"]')
          .addClass("invalid")
          .attr("placeholder", invalid_password_placeholder)
          .after(
            '<div class="error-message" style="color:red; font-size:12px;">Please enter a password.</div>'
          );
        valid = false;
      }
      if (password.length < 6) {
        $form
          .find('input[name="password"]')
          .addClass("invalid")
          .val("")
          .after(
            '<div class="error-message" style="color:red; font-size:12px;">Password must be at least 6 characters.</div>'
          );
        valid = false;
      }
      if (password !== passwordConfirmation) {
        $form
          .find('input[name="password_confirmation"]')
          .addClass("invalid")
          .val("")
          .after(
            '<div class="error-message" style="color:red; font-size:12px;">Passwords do not match.</div>'
          );
        valid = false;
      }
      if (!terms) {
        $form
          .find('input[name="terms"]')
          .closest(".checkbox-group")
          .addClass("invalid")
          .after(
            '<div class="error-message" style="color:red; font-size:12px;">You must accept the Terms and Conditions.</div>'
          );
        valid = false;
      }
      if (!companyName) {
        $form
          .find('input[name="company_name"]')
          .addClass("invalid")
          .after(
            '<div class="error-message" style="color:red; font-size:12px;">Company name is required.</div>'
          );
        valid = false;
      }
      if (!nickname) {
        $form
          .find('input[name="nickname"]')
          .addClass("invalid")
          .after(
            '<div class="error-message" style="color:red; font-size:12px;">Nickname is required.</div>'
          );
        valid = false;
      }
      if (!fullName) {
        $form
          .find('input[name="full_name"]')
          .addClass("invalid")
          .after(
            '<div class="error-message" style="color:red; font-size:12px;">Full name is required.</div>'
          );
        valid = false;
      }
      if (!address) {
        $form
          .find('input[name="address"]')
          .addClass("invalid")
          .after(
            '<div class="error-message" style="color:red; font-size:12px;">Address is required.</div>'
          );
        valid = false;
      }
      if (!phone) {
        $form
          .find('input[name="phone"]')
          .addClass("invalid")
          .after(
            '<div class="error-message" style="color:red; font-size:12px;">Phone is required.</div>'
          );
        valid = false;
      }
      if (!valid) {
        return false;
      }

      var userData = {
        email: email,
        password: password,
        password_confirmation: password,
        company_name: companyName,
        nickname: nickname,
        full_name: fullName,
        address: address,
        phone: phone,
        receive_newsletter: newsletter,
        terms_accepted: terms,
      };
      var data = { partner_user: userData };

      $("#preloader").removeClass("hide").addClass("active");

      // Вычисляем хэш от email и передаём параметры в URL пикселя
      $.ajax({
        url: signUpUrl,
        method: "POST",
        contentType: "application/json; charset: utf-8",
        dataType: "json",
        data: JSON.stringify(data),
        xhrFields: { withCredentials: true },
        success: function (response, textStatus, xhr) {
          console.log("Response:", response);
          if (xhr.status === 201) {
            const extID = response.partner_user?.id;
            if (extID) {
              if (!window.AU) window.AU = {};
              window.AU.acl = {
                Visit: "1&extID=" + extID,
                Registration: "2&extID=" + extID,
              };
              window.callAction("Registration");
            } else {
              console.warn("extID not found in response");
            }

            console.log("Sign up successful:", response);
            var email = $form.find('input[name="email"]').val().trim();

            /*var pixelUrl = "https://pixel-us.convertagain.net/pixel/js?auth=jgnc6jr&event=regfinished";
    if (email) {
      var hash = computeHash(email);
      pixelUrl += "&uid=" + encodeURIComponent(hash);
    }*/
            var pixelUrl =
              "https://pixel-us.convertagain.net/pixel/js?auth=jgnc6jr&event=regfinished";

            var regFinishedScript = document.createElement("script");
            regFinishedScript.src = pixelUrl;
            regFinishedScript.async = true;
            regFinishedScript.defer = true;
            document.body.appendChild(regFinishedScript);

            showRegistrationSuccessPopup();
          }
        },
        error: function (jqXHR, textStatus, errorThrown) {
          console.error("Sign up failed:", textStatus, errorThrown);
          let resp;
          try {
            resp = JSON.parse(jqXHR.responseText);
          } catch (e) {
            resp = {};
          }
          if (resp.errors) {
            if (resp.errors.email) {
              $form
                .find('input[name="email"]')
                .addClass("invalid")
                .after(
                  '<div class="error-message" style="color:red; font-size:12px;">' +
                    resp.errors.email[0] +
                    "</div>"
                );
            }
            if (resp.errors.password) {
              $form
                .find('input[name="password"]')
                .addClass("invalid")
                .after(
                  '<div class="error-message" style="color:red; font-size:12px;">' +
                    resp.errors.password[0] +
                    "</div>"
                );
            }
          } else {
            $form.append(
              '<div class="error-message" style="margin-top:10px;">Registration failed. Please review your details and try again.</div>'
            );
          }
          console.log("Response text:", jqXHR.responseText);
        },
        complete: function () {
          setTimeout(function () {
            $("#preloader").addClass("hide").removeClass("active");
          }, 2000);
        },
      });
    });
  });

  // Очистка ошибок при клике на поля
  $(
    "#login-email, #login-password, #signup-email, #signup-password, #forgot-email, #login-two-factor, #signup-company-name"
  ).on("click", function () {
    $(this).removeClass("invalid");
    $(this).next(".error-message").remove();
  });
  $("#agreement").on("change", function () {
    $("#register-agreement-wrapper")
      .find(".visual-checkbox")
      .removeClass("invalid");
    $("#register-agreement-wrapper")
      .find(".agreement-label")
      .removeClass("invalid-text");
  });

  // Функция для переключения видимости пароля
  function togglePasswordVisibility(inputId, buttonElement) {
    const oldInput = document.getElementById(inputId);
    if (!oldInput) return;
    const newInput = document.createElement("input");
    newInput.id = oldInput.id;
    newInput.name = oldInput.name;
    newInput.placeholder = oldInput.placeholder;
    newInput.required = oldInput.required;
    newInput.value = oldInput.value;
    newInput.className = oldInput.className;
    if (oldInput.hasAttribute("pattern")) {
      newInput.setAttribute("pattern", oldInput.getAttribute("pattern"));
    }
    if (oldInput.hasAttribute("title")) {
      newInput.setAttribute("title", oldInput.getAttribute("title"));
    }
    if (oldInput.type === "password") {
      newInput.type = "text";
      buttonElement.innerHTML = `<img src="./img/eye.png" alt="Hide" width="24" height="24">`;
    } else {
      newInput.type = "password";
      buttonElement.innerHTML = `<img src="./img/eye-off.svg" alt="Show" width="24" height="24">`;
    }

    oldInput.parentNode.replaceChild(newInput, oldInput);
  }

  document.addEventListener("DOMContentLoaded", function () {
    const phoneInput = document.getElementById("signup-phone");
    if (phoneInput) {
      phoneInput.addEventListener("input", function () {
        if (this.value.length > 15) {
          this.value = this.value.slice(0, 15);
        }
      });
    }
  });
});
