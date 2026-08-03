CREATE TABLE notifications (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    destinataire_id BIGINT NOT NULL,
    nettoyage_id BIGINT NULL,
    message VARCHAR(500) NOT NULL,
    lue BOOLEAN NOT NULL DEFAULT FALSE,
    date_creation DATETIME NOT NULL,
    CONSTRAINT fk_notification_destinataire FOREIGN KEY (destinataire_id) REFERENCES utilisateurs(id),
    CONSTRAINT fk_notification_nettoyage FOREIGN KEY (nettoyage_id) REFERENCES nettoyages(id) ON DELETE CASCADE,
    INDEX idx_notification_destinataire_date (destinataire_id, date_creation),
    INDEX idx_notification_non_lue (destinataire_id, lue)
);
