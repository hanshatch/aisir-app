<?php
require_once __DIR__ . '/config.php';

// Crear tabla si no existe
function ensure_table($pdo) {
    $pdo->exec("CREATE TABLE IF NOT EXISTS inspiracion_cuentas (
        id       INT AUTO_INCREMENT PRIMARY KEY,
        red      VARCHAR(50)  NOT NULL,
        username VARCHAR(100) NOT NULL,
        url      VARCHAR(255) DEFAULT '',
        notas    TEXT         DEFAULT '',
        activa   TINYINT(1)   NOT NULL DEFAULT 1,
        created_at TIMESTAMP  DEFAULT CURRENT_TIMESTAMP
    )");
}

$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? '';
$id     = isset($_GET['id']) ? (int)$_GET['id'] : null;

try {
    $pdo = db();
    ensure_table($pdo);

    // GET — listar cuentas
    if ($method === 'GET') {
        $cuentas = $pdo->query("SELECT * FROM inspiracion_cuentas ORDER BY created_at DESC")->fetchAll();
        foreach ($cuentas as &$c) $c['activa'] = (bool)$c['activa'];
        json_response(['cuentas' => $cuentas]);
    }

    // POST — agregar cuenta
    if ($method === 'POST' && !$id) {
        $body = json_decode(file_get_contents('php://input'), true);
        $stmt = $pdo->prepare("INSERT INTO inspiracion_cuentas (red, username, url, notas) VALUES (?, ?, ?, ?)");
        $stmt->execute([
            $body['red']      ?? 'instagram',
            $body['username'] ?? '',
            $body['url']      ?? '',
            $body['notas']    ?? '',
        ]);
        $nueva = $pdo->query("SELECT * FROM inspiracion_cuentas WHERE id = " . $pdo->lastInsertId())->fetch();
        $nueva['activa'] = (bool)$nueva['activa'];
        json_response($nueva, 201);
    }

    // POST toggle — activar/desactivar
    if ($method === 'POST' && $id && $action === 'toggle') {
        $pdo->exec("UPDATE inspiracion_cuentas SET activa = NOT activa WHERE id = $id");
        json_response(['ok' => true]);
    }

    // DELETE — eliminar cuenta
    if ($method === 'DELETE' && $id) {
        $pdo->exec("DELETE FROM inspiracion_cuentas WHERE id = $id");
        json_response(['ok' => true]);
    }

    json_response(['error' => 'Método no soportado'], 405);

} catch (Exception $e) {
    json_response(['error' => $e->getMessage()], 500);
}
