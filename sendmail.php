<?php
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $name = $_POST['name'] ?? 'No Name';
    $email = $_POST['email'] ?? 'no-reply@example.com';
    $message = $_POST['message'] ?? '';
    $file = $_FILES['file'] ?? null;

    $to = "affiliates@bigbetty.io";  // Замените на ваш реальный email
    $subject = "New message from $name";
    $boundary = md5(rand(0, 1000));

    $headers = "From: BigBetty.io <affiliates@bigbetty.io>\r\n";
    $headers .= "Reply-To: $email\r\n";
    $headers .= "Return-Path: info@yourdomain.com\r\n";
    $headers .= "MIME-Version: 1.0\r\n";
    $headers .= "Content-Type: multipart/mixed; boundary=\"$boundary\"\r\n";

    // Только HTML версия сообщения
    $body = "--$boundary\r\n";
    $body .= "Content-Type: text/html; charset=utf-8\r\n";
    $body .= "Content-Transfer-Encoding: base64\r\n\r\n";
    $body .= chunk_split(base64_encode("<html><body><strong>Name:</strong> $name<br><strong>Email:</strong> $email<br><strong>Message:</strong><br>$message<br></body></html>"));

    // Обработка вложения
    if ($file && $file['error'] == 0) {
        $file_content = file_get_contents($file['tmp_name']);
        $encoded_file = chunk_split(base64_encode($file_content));
        $body .= "--$boundary\r\n";
        $body .= "Content-Type: {$file['type']}; name=\"{$file['name']}\"\r\n";
        $body .= "Content-Disposition: attachment; filename=\"{$file['name']}\"\r\n";
        $body .= "Content-Transfer-Encoding: base64\r\n\r\n";
        $body .= $encoded_file;
    }

    $body .= "--$boundary--";

    if (mail($to, $subject, $body, $headers)) {
        echo "Thank you for your application, dear!\nOur lovely managers will contact you within 24 hours.";
    } else {
        echo "Error sending message.";
    }
} else {
    echo "Invalid request";
}
?>
