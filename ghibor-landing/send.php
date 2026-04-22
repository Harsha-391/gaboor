<?php
/*
 * Ghubor — Email Mailer
 * ─────────────────────────────────────────────────────────────
 * SETUP:
 *
 *  1. Get a Gmail App Password:
 *       a. Go to myaccount.google.com → Security
 *       b. Turn on 2-Step Verification (if not already on)
 *       c. Search "App passwords" → create one → copy the 16-char code
 *       d. Paste it in GMAIL_APP_PASS below
 *
 *  2. Upload this file + the PHPMailer/ folder to your hosting
 *     (same folder as index.html). That's it — no Composer needed.
 *
 *  Requirements: PHP 7.4+, OpenSSL extension (on by default on most hosts)
 * ─────────────────────────────────────────────────────────────
 */

define('GMAIL_USER', 'sneezeconnect@gmail.com');
define('GMAIL_APP_PASS', 'nfbv igmx knlc riuo');       // ← paste your App Password here
define('MAIL_TO', 'sneezeconnect@gmail.com');
define('MAIL_FROM_NAME', 'Ghubor Website');

// ── Headers ──────────────────────────────────────────────────
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
  http_response_code(200);
  exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
  http_response_code(405);
  echo json_encode(['success' => false, 'error' => 'Method not allowed']);
  exit;
}

// ── Parse body (JSON or form-encoded) ────────────────────────
$raw = file_get_contents('php://input');
$data = json_decode($raw, true);
if (!is_array($data)) {
  $data = $_POST;
}

$name = trim($data['name'] ?? '');
$phone = trim($data['phone'] ?? '');
$emailIn = trim($data['email'] ?? '');
$message = trim($data['message'] ?? '');

// ── Validate ──────────────────────────────────────────────────
$errors = [];
if (strlen($name) < 2)
  $errors[] = 'Name is required';
if (!preg_match('/\d{7,}/', preg_replace('/\D/', '', $phone)))
  $errors[] = 'Valid phone required';
if (!filter_var($emailIn, FILTER_VALIDATE_EMAIL))
  $errors[] = 'Valid email required';
if (strlen($message) < 5)
  $errors[] = 'Message too short';

if ($errors) {
  http_response_code(400);
  echo json_encode(['success' => false, 'error' => implode(', ', $errors)]);
  exit;
}

// ── Sanitize ──────────────────────────────────────────────────
$name = htmlspecialchars($name, ENT_QUOTES, 'UTF-8');
$phone = htmlspecialchars($phone, ENT_QUOTES, 'UTF-8');
$message = nl2br(htmlspecialchars($message, ENT_QUOTES, 'UTF-8'));

// ── Load PHPMailer (no Composer — direct includes) ───────────
require_once __DIR__ . '/PHPMailer/Exception.php';
require_once __DIR__ . '/PHPMailer/PHPMailer.php';
require_once __DIR__ . '/PHPMailer/SMTP.php';

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\SMTP;
use PHPMailer\PHPMailer\Exception;

// ── Send ──────────────────────────────────────────────────────
$mail = new PHPMailer(true);

try {
  // SMTP via Gmail
  $mail->isSMTP();
  $mail->Host = 'smtp.gmail.com';
  $mail->SMTPAuth = true;
  $mail->Username = GMAIL_USER;
  $mail->Password = GMAIL_APP_PASS;
  $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
  $mail->Port = 587;
  $mail->CharSet = 'UTF-8';

  // Addresses
  $mail->setFrom(GMAIL_USER, MAIL_FROM_NAME);
  $mail->addAddress(MAIL_TO, 'Ghubor');
  $mail->addReplyTo($emailIn, $name);

  // Content
  $mail->isHTML(true);
  $mail->Subject = 'Ghubor — New Early Access Registration';
  $mail->Body = '
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#0a0908;font-family:monospace">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0908;padding:40px 0">
    <tr><td align="center">
      <table width="520" cellpadding="0" cellspacing="0" style="background:#0f0d0c;border:1px solid #2a2622;border-radius:4px;overflow:hidden">

        <!-- Header -->
        <tr>
          <td style="padding:28px 32px 24px;border-bottom:1px solid #1e1c1a">
            <p style="margin:0;font-size:9px;letter-spacing:5px;text-transform:uppercase;color:#5c5854">New Registration</p>
            <h1 style="margin:8px 0 0;font-size:22px;letter-spacing:3px;color:#e2dcd2;font-weight:400">Ghubor</h1>
          </td>
        </tr>

        <!-- Fields -->
        <tr>
          <td style="padding:28px 32px">
            <table width="100%" cellpadding="0" cellspacing="0">

              <tr>
                <td style="padding:0 0 20px;width:90px;vertical-align:top">
                  <span style="font-size:8px;letter-spacing:3px;text-transform:uppercase;color:#5c5854">Name</span>
                </td>
                <td style="padding:0 0 20px;vertical-align:top">
                  <span style="font-size:13px;color:#e2dcd2">' . $name . '</span>
                </td>
              </tr>

              <tr>
                <td style="padding:0 0 20px;vertical-align:top">
                  <span style="font-size:8px;letter-spacing:3px;text-transform:uppercase;color:#5c5854">Phone</span>
                </td>
                <td style="padding:0 0 20px;vertical-align:top">
                  <span style="font-size:13px;color:#e2dcd2">' . $phone . '</span>
                </td>
              </tr>

              <tr>
                <td style="padding:0 0 20px;vertical-align:top">
                  <span style="font-size:8px;letter-spacing:3px;text-transform:uppercase;color:#5c5854">Email</span>
                </td>
                <td style="padding:0 0 20px;vertical-align:top">
                  <a href="mailto:' . htmlspecialchars($emailIn) . '" style="font-size:13px;color:#a07848;text-decoration:none">' . htmlspecialchars($emailIn) . '</a>
                </td>
              </tr>

              <tr>
                <td style="padding:0;vertical-align:top">
                  <span style="font-size:8px;letter-spacing:3px;text-transform:uppercase;color:#5c5854">Message</span>
                </td>
                <td style="padding:0;vertical-align:top">
                  <span style="font-size:13px;color:#e2dcd2;line-height:1.8">' . $message . '</span>
                </td>
              </tr>

            </table>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="padding:16px 32px;border-top:1px solid #1e1c1a">
            <p style="margin:0;font-size:8px;letter-spacing:2px;text-transform:uppercase;color:#3a3834">© 2026 Ghubor Studios</p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>';

  // Plain text fallback
  $mail->AltBody = "GHUBOR — NEW EARLY ACCESS REGISTRATION\n\n"
    . "Name:    $name\n"
    . "Phone:   $phone\n"
    . "Email:   $emailIn\n"
    . "Message: " . strip_tags($message) . "\n\n"
    . "— Ghubor Website";

  $mail->send();
  echo json_encode(['success' => true]);

} catch (Exception $e) {
  http_response_code(500);
  echo json_encode([
    'success' => false,
    'error' => 'Mail error: ' . $mail->ErrorInfo
  ]);
}
