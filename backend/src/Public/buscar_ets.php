<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

require_once '../../config/database.php';

$database = new Database();
$db = $database->getConnection();

$carrera_id = isset($_GET['carrera_id']) ? $_GET['carrera_id'] : '';
$semestre = isset($_GET['semestre']) ? $_GET['semestre'] : '';
$materia = isset($_GET['materia']) ? $_GET['materia'] : '';

try {
    $query = "SELECT e.id, e.materia, e.semestre, e.fecha, e.hora, e.turno, e.profesor, 
                     c.nombre as carrera, 
                     esp.edificio, esp.salon
              FROM examen e
              LEFT JOIN carrera c ON e.carrera_id = c.id
              LEFT JOIN espacio esp ON e.espacio_id = esp.id
              WHERE 1=1";

    if (!empty($carrera_id)) {
        $query .= " AND e.carrera_id = :carrera_id";
    }
    if (!empty($semestre)) {
        $query .= " AND e.semestre = :semestre";
    }
    if (!empty($materia)) {
        $query .= " AND e.materia LIKE :materia";
    }

    $query .= " ORDER BY e.fecha ASC, e.hora ASC";

    $stmt = $db->prepare($query);

    if (!empty($carrera_id)) {
        $stmt->bindParam(':carrera_id', $carrera_id);
    }
    if (!empty($semestre)) {
        $stmt->bindParam(':semestre', $semestre);
    }
    if (!empty($materia)) {
        $materia_param = "%{$materia}%";
        $stmt->bindParam(':materia', $materia_param);
    }

    $stmt->execute();
    $examenes = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode($examenes);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["error" => "Error al buscar exámenes.", "detalle" => $e->getMessage()]);
}
?>