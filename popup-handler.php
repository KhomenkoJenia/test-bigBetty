<?php
if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    echo json_encode(["status" => "error", "message" => "Invalid request"]);
    exit;
}

// Получаем данные из формы
$name        = trim($_POST['name']        ?? 'No Name');
$contact     = trim($_POST['contact']     ?? 'No Contact');
$companyName = trim($_POST['companyName'] ?? 'Not provided');
$companyDesc = trim($_POST['companyDesc'] ?? 'Not provided');

// Кому отправляем
$to = "team@stars-partners.com, 1@stars-partners.com";

// Тема письма
$subject  = "New Meeting Request from {$name}";
$boundary = md5(uniqid(mt_rand(), true));

// Заголовки
$headers  = "From: Stars Partners <team@stars-partners.com>\r\n";
$headers .= "Reply-To: {$contact}\r\n";
$headers .= "MIME-Version: 1.0\r\n";
$headers .= "Content-Type: multipart/alternative; boundary=\"{$boundary}\"\r\n";

// Составляем текстовую часть
$body  = "--{$boundary}\r\n";
$body .= "Content-Type: text/plain; charset=utf-8\r\n";
$body .= "Content-Transfer-Encoding: 7bit\r\n\r\n";
$body .= "You have received a new meeting request:\n\n";
$body .= "Name: {$name}\n";
$body .= "Contact: {$contact}\n";
if ($companyName)  $body .= "Company Name: {$companyName}\n";
if ($companyDesc)  $body .= "Company Description: {$companyDesc}\n";
$body .= "\r\n";

// Составляем HTML-часть
$body .= "--{$boundary}\r\n";
$body .= "Content-Type: text/html; charset=utf-8\r\n";
$body .= "Content-Transfer-Encoding: base64\r\n\r\n";

$html  = "<html><body>";
$html .= "<p><strong>Name:</strong> {$name}</p>";
$html .= "<p><strong>Contact:</strong> {$contact}</p>";
if ($companyName)  $html .= "<p><strong>Company Name:</strong> {$companyName}</p>";
if ($companyDesc)  $html .= "<p><strong>Company Description:</strong> {$companyDesc}</p>";
$html .= "</body></html>";

$body .= chunk_split(base64_encode($html));
$body .= "--{$boundary}--";

// Флаг envelope-sender
$envelope = "-fteam@stars-partners.com";

// Отправка письма
if (mail($to, $subject, $body, $headers, $envelope)) {
    echo json_encode(["status" => "success", "message" => "Thank you! Our manager will contact you soon."]);
} else {
    echo json_encode(["status" => "error", "message" => "Error sending message."]);
}
