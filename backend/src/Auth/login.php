<?php
session_start();
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

require_once '../../config/database.php';

// Atrapamos 'username' o 'correo', lo que sea que mande tu JavaScript
$username = trim($_POST['username'] ?? $_POST['correo'] ?? '');
$password = trim($_POST['password'] ?? '');

if (empty($username) || empty($password)) {
    echo json_encode(["success" => false, "message" => "Por favor, ingresa el usuario y la contraseña."]);
    exit;
}

$database = new Database();
$db = $database->getConnection();

try {
    $query = "SELECT id, nombre_completo, password_hash FROM usuario WHERE username = :username LIMIT 1";
    $stmt = $db->prepare($query);
    $stmt->bindParam(':username', $username);
    $stmt->execute();

    if ($stmt->rowCount() > 0) {
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if (password_verify($password, $row['password_hash']) || $password === $row['password_hash']) {
            $_SESSION['user_id'] = $row['id'];
            $_SESSION['nombre_completo'] = $row['nombre_completo'];
            
            echo json_encode(["success" => true, "user" => ["nombre_completo" => $row['nombre_completo']]]);
        } else {
            echo json_encode(["success" => false, "message" => "Contraseña incorrecta."]);
        }
    } else {
        echo json_encode(["success" => false, "message" => "No existe un administrador con ese usuario."]);
    }
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Error interno del servidor."]);
}
?>