CREATE TABLE bus_exclusions (
    id BIGSERIAL PRIMARY KEY,
    bus_id BIGINT NOT NULL UNIQUE,
    type VARCHAR(20) NOT NULL,
    CONSTRAINT fk_bus_exclusion_bus FOREIGN KEY (bus_id) REFERENCES bus(id),
    CONSTRAINT chk_bus_exclusion_type CHECK (type IN ('DORMANT', 'IMMOBILISE'))
);

CREATE INDEX idx_bus_exclusions_type ON bus_exclusions(type);
