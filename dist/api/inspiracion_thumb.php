<?php
require_once __DIR__ . '/config.php';

$id = isset($_GET['id']) ? (int)$_GET['id'] : null;
if (!$id) { http_response_code(400); exit; }

try {
    $pdo  = db();
    $stmt = $pdo->prepare('SELECT thumbnail_url FROM inspiracion_posts WHERE id = ?');
    $stmt->execute([$id]);
    $row  = $stmt->fetch();

    if (!$row || !$row['thumbnail_url']) { http_response_code(404); exit; }

    $path = $row['thumbnail_url'];

    // Solo permitir rutas dentro del directorio de trabajo esperado
    if (strpos($path, '..') !== false) { http_response_code(403); exit; }
    if (!file_exists($path))           { http_response_code(404); exit; }

    $ext  = strtolower(pathinfo($path, PATHINFO_EXTENSION));
    $mime = match($ext) {
        'jpg', 'jpeg' => 'image/jpeg',
        'png'         => 'image/png',
        'webp'        => 'image/webp',
        'mp4'         => 'video/mp4',
        default       => 'application/octet-stream',
    };

    header('Content-Type: ' . $mime);
    header('Cache-Control: public, max-age=86400');
    readfile($path);

} catch (Exception $e) {
    http_response_code(500);
}
