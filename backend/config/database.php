<?php
class Database {
    private $host;
    private $db_name;
    private $username;
    private $password;
    public $conn;

    public function __construct() {
        // Apuntamos a los nombres de tu entorno Docker
        $this->host = getenv('DB_HOST') ?: 'db';
        $this->db_name = getenv('DB_NAME') ?: 'gestion_ets';
        $this->username = getenv('DB_USER') ?: 'ets_user';
        $this->password = getenv('DB_PASSWORD') ?: 'ets_secure_password';
    }

    public function getConnection() {
        $this->conn = null;
        try {
            $opciones = array(
                PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8mb4",
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_EMULATE_PREPARES => false
            );

            $this->conn = new PDO(
                "mysql:host=" . $this->host . ";dbname=" . $this->db_name . ";charset=utf8mb4",
                $this->username,
                $this->password,
                $opciones
            );
        } catch(PDOException $exception) {
            error_log("Error de conexión: " . $exception->getMessage());
            http_response_code(500);
            echo json_encode(["error" => "No se pudo establecer conexión con el servidor de datos."]);
            exit;
        }
        return $this->conn;
    }
}
?>