CREATE DATABASE IF NOT EXISTS fondation_delon
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

CREATE TABLE analytics (
    id INT NOT NULL AUTO_INCREMENT,
    influencer_name VARCHAR(150) NOT NULL,
    image_path VARCHAR(255) DEFAULT NULL,
    sector VARCHAR(100) DEFAULT NULL,
    status VARCHAR(50) DEFAULT NULL,
    total_votes INT DEFAULT 0,
    created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (id),
    UNIQUE KEY uniq_influencer_name (influencer_name)
);

CREATE TABLE analytics_votes (
    id INT NOT NULL AUTO_INCREMENT,
    influencer_id INT NOT NULL,
    participant_id INT NOT NULL,
    voted_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    created_at DATETIME NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (id),
    KEY idx_influencer_id (influencer_id),
    KEY idx_participant_id (participant_id)
);

CREATE TABLE contact (
    id INT NOT NULL AUTO_INCREMENT,
    name VARCHAR(120) NOT NULL,
    email VARCHAR(150) NOT NULL,
    subject VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (id)
);

CREATE TABLE newsletter (
    id INT UNSIGNED NOT NULL AUTO_INCREMENT,
    prenom VARCHAR(100) NOT NULL,
    nom VARCHAR(100) NOT NULL,
    email VARCHAR(190) NOT NULL,
    pays VARCHAR(100) NOT NULL,
    date_inscription DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (id),
    UNIQUE KEY uniq_email (email)
);

CREATE TABLE stepper_donations (
    id INT NOT NULL AUTO_INCREMENT,
    participant_id INT NOT NULL,
    payment_method VARCHAR(50) NOT NULL,
    created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (id),
    KEY idx_participant_id (participant_id)
);

CREATE TABLE stepper_donations (
    id INT UNSIGNED NOT NULL AUTO_INCREMENT,
    participant_id INT UNSIGNED NOT NULL,
    payment_method VARCHAR(50) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (id),
    KEY idx_participant_id (participant_id),

    CONSTRAINT fk_stepper_participant
        FOREIGN KEY (participant_id) REFERENCES participants(id)
        ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE stepper_invitations (
    id INT NOT NULL AUTO_INCREMENT,
    participant_id INT NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    social_network VARCHAR(50) NOT NULL,
    social_profile VARCHAR(255) NOT NULL,

    PRIMARY KEY (id),
    KEY idx_participant_id (participant_id)
);

CREATE TABLE stepper_participants (
    id INT NOT NULL AUTO_INCREMENT,
    last_name VARCHAR(100) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    social_network VARCHAR(50) DEFAULT NULL,
    social_profile VARCHAR(255) DEFAULT NULL,
    created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (id),
    UNIQUE KEY uniq_email (email)
);

