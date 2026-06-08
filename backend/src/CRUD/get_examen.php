<?php
session_start();
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    exit;
}

require_once '../../config/database.php';

$id = isset($_GET['id']) ? $_GET['id'] : '';

if (empty($id)) {
    echo json_encode(["error" => "ID no proporcionado"]);
    exit;
}

$database = new Database();
$db = $database->getConnection();

try {
    $stmt = $db->prepare("SELECT * FROM examen WHERE id = :id LIMIT 1");
    $stmt->execute([':id' => $id]);
    $examen = $stmt->fetch(PDO::FETCH_ASSOC);
    
    echo json_encode($examen);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["error" => "Error en la base de datos"]);
}
?>