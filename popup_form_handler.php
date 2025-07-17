


<?php
if ($_SERVER["REQUEST_METHOD"] == "POST") {
  
    $name = htmlspecialchars(trim($_POST['name'] ?? 'No Name'));
    $email = filter_var(trim($_POST['email'] ?? ''), FILTER_VALIDATE_EMAIL);
    $company = htmlspecialchars(trim($_POST['company'] ?? ''));
    $contact = htmlspecialchars(trim($_POST['contact'] ?? ''));

   
    $subject = "New meeting request from $name";
    $body = "<strong>Name:</strong> $name<br>";
    $body .= "<strong>Email:</strong> " . ($email ?: 'not provided') . "<br>";
    $body .= "<strong>Company:</strong> $company<br>";
    $body .= "<strong>Contact:</strong> $contact<br>";


    $to = "affiliates@bigbetty.io";

  
    $headers = "From: BigBetty.io <no-reply@bigbetty.io>\r\n";

  
    if ($email && !preg_match('/@gmail\.com$/i', $email)) {
        $headers .= "Reply-To: $email\r\n";
    }

    $headers .= "MIME-Version: 1.0\r\n";
    $headers .= "Content-Type: text/html; charset=utf-8\r\n";

   
    $sent = mail($to, $subject, $body, $headers);

    if ($sent) {
        echo "Thank you for your request! Our manager will contact you soon.";
    } else {
        echo "Error sending message. Please try again later.";
    }
} else {
    echo "Invalid request.";
}
?>
