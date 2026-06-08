<?php
session_start();
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

require_once '../../config/database.php';

$database = new Database();
$db = $database->getConnection();

try {
    // Agregamos e.hora a la extracción de datos
    $query = "SELECT e.id, e.materia, e.semestre, e.fecha, e.hora, e.turno, e.profesor, 
                     c.nombre as carrera, 
                     esp.edificio, esp.salon,
                     e.carrera_id, e.espacio_id
              FROM examen e
              LEFT JOIN carrera c ON e.carrera_id = c.id
              LEFT JOIN espacio esp ON e.espacio_id = esp.id
              ORDER BY e.fecha ASC, e.hora ASC";
              
    $stmt = $db->prepare($query);
    $stmt->execute();
    
    $examenes = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode($examenes);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["error" => "Error al cargar los exámenes."]);
}
?>