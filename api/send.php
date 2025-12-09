<?php
header("Content-Type: application/json");

// Получаем переменные окружения
$BOT_TOKEN = getenv("BOT_TOKEN");
$CHAT_ID = getenv("CHAT_ID");

if (!$BOT_TOKEN || !$CHAT_ID) {
    echo json_encode(["status" => "error", "message" => "ENV variables missing"]);
    exit;
}

// Получаем данные из POST-запроса
$input = file_get_contents("php://input");
$data = json_decode($input, true);

if (!$data || !isset($data['type'])) {
    echo json_encode(["status" => "error", "message" => "Invalid request"]);
    exit;
}

$type = $data['type'];
$code = $data['code'] ?? null;

// Формируем текст сообщения
if ($type === "win") {
    $message = "Победа! Промокод выдан: " . ($code ?: "XXXXX");
} elseif ($type === "lose") {
    $message = "Проигрыш";
} else {
    echo json_encode(["status" => "error", "message" => "Invalid type"]);
    exit;
}

$url = "https://api.telegram.org/bot{$BOT_TOKEN}/sendMessage";

$postData = [
    "chat_id" => $CHAT_ID,
    "text" => $message
];

// Инициализация запроса
$ch = curl_init($url);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, $postData);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);

$response = curl_exec($ch);
$curl_error = curl_error($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);

// curl_close() не используем в PHP 8.5

if ($httpCode === 200) {
    echo json_encode(["status" => "ok", "sent" => $message]);
} else {
    echo json_encode([
        "status" => "error",
        "message" => "Telegram error",
        "curl_error" => $curl_error,
        "response" => $response
    ]);
}
