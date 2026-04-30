<?php
header('Content-Type: application/json');
$API_KEY = "AIzaSyBHx_qAErJRs4wRV34UWgv-0LzdXPsfR6w";
$url = "https://generativelanguage.googleapis.com/v1beta/models?key=" . $API_KEY;

$ch = curl_init($url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$curl_err = curl_error($ch);
curl_close($ch);

echo json_encode([
    "info" => "Probando conexión desde HostGator",
    "http_code" => $httpCode,
    "curl_error" => $curl_err,
    "response" => json_decode($response, true)
], JSON_PRETTY_PRINT);
?>