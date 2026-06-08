<?php
session_start();
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

if (!isset($_SESSION['user_id']) || $_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(401);
    echo json_encode(["success" => false, "message" => "No autorizado"]);
    exit;
}

require_once '../../config/database.php';

$id = isset($_POST['id']) ? trim($_POST['id']) : '';

if (empty($id)) {
    echo json_encode(["success" => false, "message" => "ID no proporcionado."]);
    exit;
}

$database = new Database();
$db = $database->getConnection();

try {
    $query = "DELETE FROM examen WHERE id = :id";
    $stmt = $db->prepare($query);
    $stmt->bindParam(':id', $id);
    
    if ($stmt->execute()) {
        echo json_encode(["success" => true, "message" => "Examen eliminado."]);
    } else {
        echo json_encode(["success" => false, "message" => "No se pudo eliminar el examen."]);
    }
} catch (PDOException $e) {
    echo json_encode(["success" => false, "message" => "Error en la base de datos."]);
}
?>