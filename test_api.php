<?php
/**
 * TEST DIRECTO - Para ver qué error da Google
 */

header('Content-Type: text/plain; charset=utf-8');

$API_KEY = "AIzaSyBHx_qAErJRs4wRV34UWgv-0LzdXPsfR6w";

$prompt = "Di 'Hola' en una palabra";

$payload = json_encode([
    'contents' => [['parts' => [['text' => $prompt]]]]
]);

$url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=$API_KEY";

$ch = curl_init($url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, $payload);
curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$error = curl_error($ch);
curl_close($ch);

echo "HTTP CODE: $httpCode\n";
echo "CURL ERROR: $error\n";
echo "RESPONSE:\n";
echo $response;
?>