<?php
session_start();
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

// Protección: Solo usuarios logueados pueden ver esto
if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(["success" => false, "message" => "No autorizado"]);
    exit;
}

require_once '../../config/database.php';
$database = new Database();
$db = $database->getConnection();

try {
    // 1. Contar el gran total de exámenes programados
    $stmtTotal = $db->query("SELECT COUNT(*) as total FROM examen");
    $totalExamenes = $stmtTotal->fetch(PDO::FETCH_ASSOC)['total'];

    // 2. Contar cuántos exámenes hay por cada carrera
    $queryCarreras = "
        SELECT c.nombre as carrera, COUNT(e.id) as cantidad
        FROM carrera c
        LEFT JOIN examen e ON c.id = e.carrera_id
        GROUP BY c.id, c.nombre
        HAVING cantidad > 0
        ORDER BY cantidad DESC
    ";
    $stmtCarreras = $db->query($queryCarreras);
    $porCarrera = $stmtCarreras->fetchAll(PDO::FETCH_ASSOC);

    // Enviar la respuesta en formato JSON al frontend
    echo json_encode([
        "success" => true,
        "total" => $totalExamenes,
        "por_carrera" => $porCarrera
    ]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Error al obtener estadísticas"]);
}
?>