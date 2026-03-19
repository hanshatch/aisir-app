<?php
require_once __DIR__ . '/config.php';

$method = $_SERVER['REQUEST_METHOD'];
$id     = isset($_GET['id'])     ? (int)$_GET['id']     : null;
$estado = $_GET['estado']        ?? null;
$limit  = isset($_GET['limit'])  ? (int)$_GET['limit']  : 50;
$offset = isset($_GET['offset']) ? (int)$_GET['offset'] : 0;

try {
    $pdo = db();

    // GET — listar posts con datos de cuenta
    if ($method === 'GET' && !$id) {
        $where  = [];
        $params = [];

        if ($estado) {
            $where[]  = 'p.estado = ?';
            $params[] = $estado;
        }

        $sql = "
            SELECT
                p.id,
                p.cuenta_id,
                c.red,
                c.username,
                p.url_post,
                p.caption,
                p.likes,
                p.comentarios,
                p.compartidos,
                p.engagement_rate,
                p.fecha_post,
                p.analisis_hook,
                p.analisis_formato,
                p.analisis_tema,
                p.analisis_por_que,
                p.score,
                p.score_razon,
                p.texto_visual,
                p.estado,
                p.feedback_hans,
                p.vision_procesado,
                CASE
                    WHEN p.thumbnail_url IS NOT NULL AND p.thumbnail_url != ''
                    THEN CONCAT('/api/inspiracion_thumb.php?id=', p.id)
                    ELSE NULL
                END AS thumbnail_url
            FROM inspiracion_posts p
            JOIN inspiracion_cuentas c ON c.id = p.cuenta_id
        ";

        if ($where) $sql .= ' WHERE ' . implode(' AND ', $where);
        $sql .= ' ORDER BY p.fecha_post DESC LIMIT ' . $limit . ' OFFSET ' . $offset;

        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);
        $posts = $stmt->fetchAll();

        // Total count
        $countSql = "SELECT COUNT(*) FROM inspiracion_posts p";
        if ($where) $countSql .= ' WHERE ' . implode(' AND ', array_slice($params, 0, -2) ? $where : []);
        $total = (int)$pdo->query($countSql)->fetchColumn();

        foreach ($posts as &$p) {
            $p['likes']         = $p['likes']         !== null ? (int)$p['likes']         : null;
            $p['comentarios']   = $p['comentarios']   !== null ? (int)$p['comentarios']   : null;
            $p['compartidos']   = $p['compartidos']   !== null ? (int)$p['compartidos']   : null;
            $p['engagement_rate'] = $p['engagement_rate'] !== null ? (float)$p['engagement_rate'] : null;
            $p['vision_procesado'] = (bool)$p['vision_procesado'];
            $p['score'] = $p['score'] !== null ? (int)$p['score'] : null;
        }

        json_response(['posts' => $posts, 'total' => $total, 'limit' => $limit, 'offset' => $offset]);
    }

    // GET — post individual
    if ($method === 'GET' && $id) {
        $stmt = $pdo->prepare("
            SELECT p.*, c.red, c.username,
                CASE
                    WHEN p.thumbnail_url IS NOT NULL AND p.thumbnail_url != ''
                    THEN CONCAT('/api/inspiracion_thumb.php?id=', p.id)
                    ELSE NULL
                END AS thumbnail_url
            FROM inspiracion_posts p
            JOIN inspiracion_cuentas c ON c.id = p.cuenta_id
            WHERE p.id = ?
        ");
        $stmt->execute([$id]);
        $post = $stmt->fetch();
        if (!$post) json_response(['error' => 'Not found'], 404);
        json_response($post);
    }

    // POST — feedback de Hans (estado + nota)
    if ($method === 'POST' && $id) {
        $body   = json_decode(file_get_contents('php://input'), true);
        $estado = $body['estado']        ?? null;
        $nota   = $body['feedback_hans'] ?? null;

        $fields = [];
        $vals   = [];
        if ($estado) { $fields[] = 'estado = ?';        $vals[] = $estado; }
        if ($nota   !== null) { $fields[] = 'feedback_hans = ?'; $vals[] = $nota; }

        if ($fields) {
            $vals[] = $id;
            $pdo->prepare('UPDATE inspiracion_posts SET ' . implode(', ', $fields) . ' WHERE id = ?')
                ->execute($vals);
        }

        json_response(['ok' => true]);
    }

    json_response(['error' => 'Método no soportado'], 405);

} catch (Exception $e) {
    json_response(['error' => $e->getMessage()], 500);
}
