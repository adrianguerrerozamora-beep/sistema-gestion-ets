<?php
session_start();
if (!isset($_SESSION['user_id'])) exit;
require_once '../../config/database.php';
$db = (new Database())->getConnection();

$edificio = trim($_POST['edificio'] ?? '');
$salon = trim($_POST['salon'] ?? '');
if ($edificio && $salon) {
    $stmt = $db->prepare("INSERT INTO espacio (edificio, salon) VALUES (?, ?)");
    echo json_encode(["success" => $stmt->execute([$edificio, $salon])]);
}
?>