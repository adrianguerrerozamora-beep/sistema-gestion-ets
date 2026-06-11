<?php
session_start();
if (!isset($_SESSION['user_id'])) exit;
require_once '../../config/database.php';
$db = (new Database())->getConnection();

try {
    $stmt = $db->prepare("DELETE FROM carrera WHERE id = ?");
    $stmt->execute([$_POST['id']]);
    echo json_encode(["success" => true]);
} catch (PDOException $e) {
    echo json_encode(["success" => false, "message" => "No se puede borrar porque hay exámenes asignados a esta carrera."]);
}
?>