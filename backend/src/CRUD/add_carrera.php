<?php
session_start();
if (!isset($_SESSION['user_id'])) exit;
require_once '../../config/database.php';
$db = (new Database())->getConnection();

$nombre = trim($_POST['nombre'] ?? '');
if ($nombre) {
    $stmt = $db->prepare("INSERT INTO carrera (nombre) VALUES (?)");
    echo json_encode(["success" => $stmt->execute([$nombre])]);
}
?>