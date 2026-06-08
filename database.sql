SET NAMES utf8mb4;
CREATE DATABASE IF NOT EXISTS gestion_ets;
USE gestion_ets;

-- 1. Tabla: carrera
CREATE TABLE carrera (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL UNIQUE
);

-- 2. Tabla: edificio_salon
CREATE TABLE espacio (
    id INT AUTO_INCREMENT PRIMARY KEY,
    edificio VARCHAR(50) NOT NULL,
    salon VARCHAR(50) NOT NULL,
    UNIQUE(edificio, salon)
);

-- 3. Tabla: usuario (Administradores)
CREATE TABLE usuario (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    nombre_completo VARCHAR(100) NOT NULL
);

-- 4. Tabla: examen
CREATE TABLE examen (
    id INT AUTO_INCREMENT PRIMARY KEY,
    materia VARCHAR(100) NOT NULL,
    semestre INT NOT NULL,
    fecha DATE NOT NULL,
    hora TIME NOT NULL,
    turno ENUM('Matutino', 'Vespertino') NOT NULL,
    profesor VARCHAR(100) NOT NULL,
    carrera_id INT NOT NULL,
    espacio_id INT NOT NULL,
    FOREIGN KEY (carrera_id) REFERENCES carrera(id) ON DELETE CASCADE,
    FOREIGN KEY (espacio_id) REFERENCES espacio(id) ON DELETE CASCADE
);


-- Contraseña por defecto: password (Hasheada con BCRYPT)
INSERT INTO usuario (username, password_hash, nombre_completo) VALUES 
('admin', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Administrador General');

-- 1. Insertar Carreras Oficiales
INSERT INTO carrera (nombre) VALUES 
('Ingeniería en Sistemas Computacionales (Plan 2020)'),
('Ingeniería en Sistemas Computacionales (Plan 2009)'),
('Ingeniería en Inteligencia Artificial'),
('Licenciatura en Ciencia de Datos');

-- 2. Insertar Espacios (Aulas de ESCOM)
INSERT INTO espacio (edificio, salon) VALUES 
('Edificio 1', '1101'),
('Edificio 1', '1105'),
('Edificio 2', '2105'),
('Edificio 2', '2204'),
('Laboratorios', 'Pesados 1'),
('Laboratorios', 'Ligeros 3');

-- 3. Programar Exámenes de Prueba (Materias de ESCOM)
INSERT INTO examen (materia, semestre, fecha, hora, turno, profesor, carrera_id, espacio_id) VALUES 
-- ISC PLAN 2020 (carrera_id = 1)
('Cálculo', 1, '2026-06-18', '08:30:00', 'Matutino', 'Mtro. Jose Antonio', 1, 3),
('Álgebra Lineal', 1, '2026-06-19', '10:00:00', 'Matutino', 'Dra. Hernández', 1, 1),
('Cálculo Aplicado', 2, '2026-06-22', '15:00:00', 'Vespertino', 'Mtro. Leyva', 1, 2),
('Análisis Fundamental de Circuitos', 3, '2026-06-23', '08:30:00', 'Matutino', 'Ing. Martínez', 1, 5),
('Diseño de Sistemas Digitales', 4, '2026-06-24', '12:00:00', 'Matutino', 'Dr. VHDL', 1, 5),
('Tecnologías para el Desarrollo de Aplicaciones Web', 6, '2026-06-25', '08:30:00', 'Matutino', 'Ing. José Antonio Ortiz Ramírez', 1, 1),
('Arquitectura de Computadoras', 5, '2026-06-26', '16:00:00', 'Vespertino', 'Mtro. López', 1, 6),

-- ISC PLAN 2009 (carrera_id = 2)
('Matemáticas Discretas', 1, '2026-06-18', '10:00:00', 'Matutino', 'Dra. Sánchez', 2, 4),
('Algoritmia y Programación Estructurada', 1, '2026-06-19', '12:00:00', 'Matutino', 'Mtro. Gómez', 2, 6),
('Estructuras de Datos', 2, '2026-06-22', '15:00:00', 'Vespertino', 'Dra. López', 2, 2),
('Bases de Datos', 3, '2026-06-23', '10:00:00', 'Matutino', 'Ing. Ramírez', 2, 1),
('Ingeniería de Software', 4, '2026-06-24', '08:30:00', 'Matutino', 'Dr. Fernández', 2, 3),

-- INTELIGENCIA ARTIFICIAL (carrera_id = 3)
('Fundamentos de Inteligencia Artificial', 1, '2026-06-18', '14:00:00', 'Vespertino', 'Dra. Inteligencia', 3, 2),
('Machine Learning', 3, '2026-06-19', '10:30:00', 'Matutino', 'Dr. Turing', 3, 6),
('Redes Neuronales', 5, '2026-06-22', '16:00:00', 'Vespertino', 'Mtra. Silva', 3, 5),

-- CIENCIA DE DATOS (carrera_id = 4)
('Estadística Descriptiva', 1, '2026-06-18', '08:30:00', 'Matutino', 'Dr. Gauss', 4, 3),
('Minería de Datos', 4, '2026-06-20', '12:00:00', 'Matutino', 'Dra. Data', 4, 1),
('Procesamiento de Lenguaje Natural', 6, '2026-06-24', '15:30:00', 'Vespertino', 'Mtro. Chomsky', 4, 4);