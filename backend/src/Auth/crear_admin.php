<?php
session_start();

// EL CADENERO: Tiene que ir HASTA ARRIBA. Si no hay sesión, muere el proceso y no muestra el HTML.
if (!isset($_SESSION['user_id'])) {
    die("<div style='font-family: Arial; text-align: center; margin-top: 100px;'>
            <h1 style='color: red;'>⚠️ ACCESO DENEGADO</h1>
            <p>Solo los administradores autenticados pueden crear nuevas cuentas.</p>
            <a href='../../../frontend/admin.html'>Ir al Login</a>
         </div>");
}

require_once '../../config/database.php';
$mensaje = "";

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $nombre = trim($_POST['nombre_completo']);
    $username = trim($_POST['username']);
    $password = trim($_POST['password']);
    
    // Encriptar la contraseña
    $password_encriptada = password_hash($password, PASSWORD_DEFAULT);

    $database = new Database();
    $db = $database->getConnection();

    try {
        $query = "INSERT INTO usuario (nombre_completo, username, password_hash) VALUES (:nombre, :username, :password)";
        $stmt = $db->prepare($query);
        $stmt->bindParam(':nombre', $nombre);
        $stmt->bindParam(':username', $username);
        $stmt->bindParam(':password', $password_encriptada);

        if ($stmt->execute()) {
            $mensaje = "<div style='color: green; font-weight: bold; padding: 10px; border: 1px solid green; margin-bottom: 15px;'>¡Administrador '$nombre' creado con éxito!</div>";
        }
    } catch (PDOException $e) {
        $mensaje = "<div style='color: red; padding: 10px; border: 1px solid red; margin-bottom: 15px;'>Error: El usuario ya existe o hay un problema con la base de datos.</div>";
    }
}
?>

<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Crear Administrador</title>
    <style>
        body { font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 50px; }
        .caja { background: white; padding: 30px; border-radius: 8px; max-width: 400px; margin: auto; box-shadow: 0 4px 8px rgba(0,0,0,0.1); }
        input { width: 100%; padding: 10px; margin: 10px 0; box-sizing: border-box; }
        button { width: 100%; padding: 10px; background-color: #0d6efd; color: white; border: none; border-radius: 4px; cursor: pointer; }
    </style>
</head>
<body>
    <div class="caja">
        <h2 style="text-align: center; color: #333;">Dar de alta Administrador</h2>
        <?php echo $mensaje; ?>
        <form method="POST">
            <label>Nombre Completo:</label>
            <input type="text" name="nombre_completo" required placeholder="Ej. Ing. Juan Pérez">
            
            <label>Correo Institucional (Usuario):</label>
            <input type="text" name="username" required placeholder="admin@escom.ipn.mx">
            
            <label>Contraseña Temporal:</label>
            <input type="password" name="password" required placeholder="Mínimo 6 caracteres">
            
            <button type="submit">Generar Acceso Seguro</button>
        </form>
    </div>
</body>
</html>