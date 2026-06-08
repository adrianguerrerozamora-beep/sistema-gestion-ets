<?php
session_start();
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(["success" => false, "message" => "No autorizado"]);
    exit;
}

require_once '../../config/database.php';

$id = isset($_POST['id']) ? $_POST['id'] : '';
$materia = trim($_POST['materia'] ?? '');
$semestre = trim($_POST['semestre'] ?? '');
$fecha = trim($_POST['fecha'] ?? '');
$hora = trim($_POST['hora'] ?? ''); // Aquí atrapamos la hora
$turno = trim($_POST['turno'] ?? '');
$profesor = trim($_POST['profesor'] ?? '');
$carrera_id = trim($_POST['carrera_id'] ?? '');
$espacio_id = trim($_POST['espacio_id'] ?? '');

// Validación para que no dejen la hora (ni nada) en blanco
if (empty($materia) || empty($semestre) || empty($fecha) || empty($hora) || empty($turno) || empty($profesor) || empty($carrera_id) || empty($espacio_id)) {
    echo json_encode(["success" => false, "message" => "Todos los campos (incluyendo la hora) son obligatorios."]);
    exit;
}

$database = new Database();
$db = $database->getConnection();

try {
    if (empty($id)) {
        // Inyectamos la hora en el nuevo registro
        $query = "INSERT INTO examen (materia, semestre, fecha, hora, turno, profesor, carrera_id, espacio_id) 
                  VALUES (:materia, :semestre, :fecha, :hora, :turno, :profesor, :carrera_id, :espacio_id)";
    } else {
        // Actualizamos la hora en un registro existente
        $query = "UPDATE examen 
                  SET materia = :materia, semestre = :semestre, fecha = :fecha, hora = :hora, turno = :turno, profesor = :profesor, carrera_id = :carrera_id, espacio_id = :espacio_id 
                  WHERE id = :id";
    }

    $stmt = $db->prepare($query);
    $stmt->bindParam(':materia', $materia);
    $stmt->bindParam(':semestre', $semestre);
    $stmt->bindParam(':fecha', $fecha);
    $stmt->bindParam(':hora', $hora);
    $stmt->bindParam(':turno', $turno);
    $stmt->bindParam(':profesor', $profesor);
    $stmt->bindParam(':carrera_id', $carrera_id);
    $stmt->bindParam(':espacio_id', $espacio_id);
    
    if (!empty($id)) {
        $stmt->bindParam(':id', $id);
    }

    if ($stmt->execute()) {
        echo json_encode(["success" => true, "message" => empty($id) ? "Examen registrado." : "Examen actualizado."]);
    } else {
        echo json_encode(["success" => false, "message" => "Error al guardar el examen."]);
    }
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Error de base de datos.", "error" => $e->getMessage()]);
}
?>