<?php
session_start();
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

// Destruimos todas las variables de sesión y la sesión en sí
session_unset();
session_destroy();

echo json_encode(["success" => true, "message" => "Sesión cerrada correctamente."]);
?>