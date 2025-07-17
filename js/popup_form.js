document.addEventListener("DOMContentLoaded", function () {
  // Обработка формы в попапе
  document
    .getElementById("popupForm")
    .addEventListener("submit", function (event) {
      event.preventDefault(); // Предотвращаем стандартное поведение формы

      const form = event.target;
      const formData = new FormData(form);
      const statusMessage = form.querySelector(".statusMessage"); // Выбор по классу
      statusMessage.innerHTML =
        'Your message is on its way — please hold on a moment <div class="loader-form"></div> ';

      fetch("popup_form_handler.php", {
        method: "POST",
        body: formData,
      })
        .then((response) => response.text())
        .then((data) => {
          // Убираем "отправляется", показываем результат
          statusMessage.textContent = data;
          form.reset(); // Очистка формы после отправки
        })
        .catch((error) => {
          // Убираем "отправляется", показываем ошибку
          statusMessage.textContent = "Error while sending: " + error;
        });
    });
});
