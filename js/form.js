function handleSubmit(event) {
  event.preventDefault(); // Предотвратить стандартную отправку формы
  const form = event.target;
  const formData = new FormData(form);
  const statusMessage = document.getElementById("statusMessage"); // Элемент для вывода сообщений

  statusMessage.innerHTML =
    'Your message is on its way — please hold on a moment <div class="loader-form"></div> ';

  fetch("sendmail.php", {
    method: "POST",
    body: formData,
  })
    .then((response) => response.text())
    .then((data) => {
      statusMessage.textContent = data;

      form.reset(); // Очистка формы после отправки
    })
    .catch((error) => {
      statusMessage.textContent = "Error while sending: " + error;
    });
}
