<?php
session_start();
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

// Verificamos si existe la memoria del usuario
if (isset($_SESSION['user_id'])) {
    echo json_encode([
        "success" => true,
        "user" => [
            "id" => $_SESSION['user_id'],
            "nombre_completo" => $_SESSION['nombre_completo'] ?? 'Administrador'
        ]
    ]);
} else {
    // Si no hay sesión, mandamos un código 401 (No Autorizado)
    http_response_code(401);
    echo json_encode(["success" => false, "message" => "No hay sesión activa."]);
}
?>