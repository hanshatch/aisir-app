<?php
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-cache');

$file = __DIR__ . '/flujos.json';

if (!file_exists($file)) {
    http_response_code(404);
    echo json_encode(['error' => 'flujos.json not found']);
    exit;
}

echo file_get_contents($file);
