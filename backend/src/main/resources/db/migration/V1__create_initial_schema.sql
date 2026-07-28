CREATE TABLE IF NOT EXISTS types_bus (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    libelle VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS utilisateurs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    nom VARCHAR(100) NOT NULL,
    prenom VARCHAR(100) NOT NULL,
    matricule VARCHAR(50) NOT NULL UNIQUE,
    telephone VARCHAR(30),
    email VARCHAR(150) NOT NULL UNIQUE,
    login VARCHAR(100) NOT NULL UNIQUE,
    mot_de_passe VARCHAR(255) NOT NULL,
    role ENUM('ADMINISTRATEUR','SUPERVISEUR','NETTOYEUR') NOT NULL,
    actif BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS bus (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    numero_bus VARCHAR(50) NOT NULL UNIQUE,
    type_bus_id BIGINT NOT NULL,
    actif BOOLEAN NOT NULL DEFAULT TRUE,
    CONSTRAINT fk_bus_type FOREIGN KEY(type_bus_id) REFERENCES types_bus(id),
    INDEX idx_bus_type(type_bus_id)
);

CREATE TABLE IF NOT EXISTS types_nettoyage (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    libelle VARCHAR(100) NOT NULL UNIQUE,
    description TEXT
);

CREATE TABLE IF NOT EXISTS nettoyages (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    bus_id BIGINT NOT NULL,
    type_nettoyage_id BIGINT NOT NULL,
    nettoyeur_id BIGINT NOT NULL,
    superviseur_id BIGINT NULL,
    date_nettoyage DATE NOT NULL,
    heure_debut DATETIME NULL,
    heure_fin DATETIME NULL,
    duree INT NULL,
    remarque_nettoyeur TEXT,
    remarque_superviseur TEXT,
    statut ENUM('EN_ATTENTE','VALIDE','REFUSE') NOT NULL,
    date_validation DATETIME NULL,
    CONSTRAINT fk_n_bus FOREIGN KEY(bus_id) REFERENCES bus(id),
    CONSTRAINT fk_n_type FOREIGN KEY(type_nettoyage_id) REFERENCES types_nettoyage(id),
    CONSTRAINT fk_n_nettoyeur FOREIGN KEY(nettoyeur_id) REFERENCES utilisateurs(id),
    CONSTRAINT fk_n_superviseur FOREIGN KEY(superviseur_id) REFERENCES utilisateurs(id),
    INDEX idx_n_date(date_nettoyage),
    INDEX idx_n_statut(statut),
    INDEX idx_n_bus(bus_id)
);
