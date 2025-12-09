<?php
header('Content-Type: application/json');

$BOT_TOKEN = getenv("BOT_TOKEN");
$CHAT_ID = getenv("CHAT_ID");

// Получаем JSON из POST-запроса
$input = file_get_contents('php://input');
$data = json_decode($input, true);

// Проверяем наличие данных
if (!$data || !isset($data['type'])) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'Invalid request']);
    exit;
}

$type = $data['type'];
$message = '';

// Формируем сообщение в зависимости от типа
if ($type === 'win') {
    if (isset($data['code']) && !empty($data['code'])) {
        $message = "Победа! Промокод выдан: " . htmlspecialchars($data['code']);
    } else {
        $message = "Победа! Промокод выдан";
    }
} elseif ($type === 'lose') {
    $message = "Проигрыш";
} else {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'Invalid type']);
    exit;
}

// Формируем URL для отправки в Telegram
$text = urlencode($message);
$url = "https://api.telegram.org/bot{$BOT_TOKEN}/sendMessage?chat_id={$CHAT_ID}&text={$text}";

// Отправляем запрос в Telegram
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

// Проверяем результат
if ($httpCode === 200) {
    echo json_encode([
        'status' => 'ok',
        'sent' => $message
    ]);
} else {
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'message' => 'Failed to send message to Telegram'
    ]);
}
?>
