-- ============================================================
-- DISASTER MANAGEMENT SYSTEM
-- Oracle SQL Schema
-- Based on Instructor-Approved ER Diagram
-- ============================================================
-- Conversion Rules Used (as taught by instructor):
--   Strong Entity  -> TABLE with PK (underlined attribute)
--   1:N Relationship -> FK on N-side
--   M:N Relationship -> New TABLE (Composite PK = both FKs)
--   Weak Entity    -> TABLE with Owner PK + Partial Key = Composite PK
--   Multivalued Attribute -> Separate TABLE (Owner PK + Value = Composite PK)
--   ISA (Specialization) -> Subclass TABLE inherits Superclass PK as FK
--   Aggregation    -> Inner M:N table + Outer relation connects to it
-- ============================================================

-- ============================================================
-- TABLE 1: DISASTER_EVENT
-- Type: Strong Entity
-- PK: disaster_name (underlined in ER diagram)
-- Note: duration_days is DERIVED (end_date - start_date), NOT stored
-- ============================================================
CREATE TABLE DISASTER_EVENT (
    disaster_name   VARCHAR2(200)   PRIMARY KEY,
    disaster_type   VARCHAR2(100)   NOT NULL,
    division        VARCHAR2(100)   NOT NULL,
    district        VARCHAR2(100)   NOT NULL,
    start_date      DATE            NOT NULL,
    end_date        DATE
);
-- Note: duration_days is derived -> calculated in queries as: end_date - start_date


-- ============================================================
-- TABLE 2: WAREHOUSE
-- Type: Strong Entity
-- PK: warehouse_id
-- ============================================================
CREATE TABLE WAREHOUSE (
    warehouse_id    VARCHAR2(50)    PRIMARY KEY,
    warehouse_name  VARCHAR2(200)   NOT NULL,
    location        VARCHAR2(255)   NOT NULL,
    capacity        NUMBER          NOT NULL,
    manager_name    VARCHAR2(100),
    status          VARCHAR2(50)    NOT NULL
);


-- ============================================================
-- TABLE 3: VEHICLE
-- Type: Strong Entity
-- PK: vehicle_id
-- ============================================================
CREATE TABLE VEHICLE (
    vehicle_id              VARCHAR2(50)    PRIMARY KEY,
    vehicle_type            VARCHAR2(100)   NOT NULL,
    registration_no         VARCHAR2(50)    UNIQUE NOT NULL,
    capacity                NUMBER,
    availability_status     VARCHAR2(50)    NOT NULL
);


-- ============================================================
-- TABLE 4: PERSONNEL
-- Type: Strong Entity (ISA Parent / Superclass)
-- PK: person_id
-- Special: Recursive SUPERVISES relationship (1:N self-reference)
--          supervisor_id is FK referencing PERSONNEL itself (Self Join)
-- ============================================================
CREATE TABLE PERSONNEL (
    person_id       VARCHAR2(50)    PRIMARY KEY,
    name            VARCHAR2(200)   NOT NULL,
    phone           VARCHAR2(20),
    designation     VARCHAR2(100),
    base_location   VARCHAR2(200),
    supervisor_id   VARCHAR2(50),
    FOREIGN KEY (supervisor_id) REFERENCES PERSONNEL(person_id)
);
-- Self Join for SUPERVISES:
-- SELECT E.name AS personnel, M.name AS supervisor
-- FROM PERSONNEL E
-- JOIN PERSONNEL M ON E.supervisor_id = M.person_id;


-- ============================================================
-- TABLE 5: SHELTER
-- Type: Strong Entity
-- PK: shelter_id
-- FK: disaster_name -> DISASTER_EVENT (1:N REQUIRES relationship)
-- Note: available_capacity is DERIVED (capacity - current_occupancy), NOT stored
-- Note: Location is COMPOSITE (address_line + longitude + latitude stored as 3 columns)
-- ============================================================
CREATE TABLE SHELTER (
    shelter_id              VARCHAR2(50)    PRIMARY KEY,
    shelter_name            VARCHAR2(200)   NOT NULL,
    current_status          VARCHAR2(50)    NOT NULL,
    contact_person_name     VARCHAR2(100),
    contact_person_phone    VARCHAR2(20),
    address_line            VARCHAR2(255),
    longitude               VARCHAR2(30),
    latitude                VARCHAR2(30),
    capacity                NUMBER          NOT NULL,
    disaster_name           VARCHAR2(200),
    FOREIGN KEY (disaster_name) REFERENCES DISASTER_EVENT(disaster_name)
);
-- Note: available_capacity calculated as:
-- SELECT shelter_id, capacity,
--        (SELECT COUNT(*) FROM VICTIM_SHELTER_STAY S WHERE S.shelter_id = SH.shelter_id AND S.checkout_date IS NULL) AS current_occupancy,
--        capacity - (SELECT COUNT(*) FROM VICTIM_SHELTER_STAY S WHERE S.shelter_id = SH.shelter_id AND S.checkout_date IS NULL) AS available_capacity
-- FROM SHELTER SH;


-- ============================================================
-- TABLE 6: VICTIM
-- Type: Strong Entity
-- PK: victim_id
-- FK: disaster_name -> DISASTER_EVENT (1:N AFFECTS relationship)
-- Note: contact_phone is MULTIVALUED -> separate VICTIM_PHONE table
-- ============================================================
CREATE TABLE VICTIM (
    victim_id               VARCHAR2(50)    PRIMARY KEY,
    household_head_name     VARCHAR2(200)   NOT NULL,
    gender                  VARCHAR2(20),
    nid_number              VARCHAR2(50)    UNIQUE,
    reported_date           DATE,
    last_known_location     VARCHAR2(255),
    missing_person          CHAR(1)         CHECK (missing_person IN ('Y', 'N')),
    special_needs           VARCHAR2(500),
    disaster_name           VARCHAR2(200)   NOT NULL,
    FOREIGN KEY (disaster_name) REFERENCES DISASTER_EVENT(disaster_name)
);


-- ============================================================
-- TABLE 7: DONATION
-- Type: Strong Entity
-- PK: donation_id
-- FK: warehouse_id -> WAREHOUSE (M:1 STORED IN relationship)
-- ============================================================
CREATE TABLE DONATION (
    donation_id     VARCHAR2(50)    PRIMARY KEY,
    donor_name      VARCHAR2(200)   NOT NULL,
    donor_id        VARCHAR2(50),
    contact_info    VARCHAR2(200),
    donation_type   VARCHAR2(100)   NOT NULL,
    amount_or_value NUMBER,
    donation_date   DATE            NOT NULL,
    warehouse_id    VARCHAR2(50)    NOT NULL,
    FOREIGN KEY (warehouse_id) REFERENCES WAREHOUSE(warehouse_id)
);


-- ============================================================
-- TABLE 8: VICTIM_PHONE (Multivalued Attribute Table)
-- Type: Separate table for VICTIM.contact_phone (Multivalued Attribute)
-- Composite PK: victim_id + phone
-- Rule: Multivalued -> Owner PK (FK) + Value = Composite PK
-- ============================================================
CREATE TABLE VICTIM_PHONE (
    victim_id   VARCHAR2(50)    NOT NULL,
    phone       VARCHAR2(20)    NOT NULL,
    PRIMARY KEY (victim_id, phone),
    FOREIGN KEY (victim_id) REFERENCES VICTIM(victim_id)
);


-- ============================================================
-- TABLE 9: FAMILY_MEMBER (Weak Entity)
-- Type: Weak Entity (Owner: VICTIM)
-- Composite PK: victim_id (FK from Owner) + member_seq_no (Partial Key)
-- Rule: Weak Entity -> Owner PK (FK) + Partial Key = Composite PK
-- Identifying Relationship: HAS MEMBER
-- ============================================================
CREATE TABLE FAMILY_MEMBER (
    victim_id       VARCHAR2(50)    NOT NULL,
    member_seq_no   NUMBER          NOT NULL,
    name            VARCHAR2(200)   NOT NULL,
    PRIMARY KEY (victim_id, member_seq_no),
    FOREIGN KEY (victim_id) REFERENCES VICTIM(victim_id)
);


-- ============================================================
-- TABLE 10: VOLUNTEER (ISA Sub-entity / Specialization)
-- Type: Subclass of PERSONNEL (ISA disjoint)
-- PK: person_id (same as PERSONNEL PK, inherited as FK)
-- Rule: Specialization -> Subclass table with Superclass PK as FK = PK
-- ============================================================
CREATE TABLE VOLUNTEER (
    person_id   VARCHAR2(50)    PRIMARY KEY,
    team        VARCHAR2(100),
    FOREIGN KEY (person_id) REFERENCES PERSONNEL(person_id)
);


-- ============================================================
-- TABLE 11: MEDICAL_STAFF (ISA Sub-entity / Specialization)
-- Type: Subclass of PERSONNEL (ISA disjoint)
-- PK: person_id (same as PERSONNEL PK, inherited as FK)
-- ============================================================
CREATE TABLE MEDICAL_STAFF (
    person_id       VARCHAR2(50)    PRIMARY KEY,
    specialization  VARCHAR2(100),
    since_date      DATE,
    FOREIGN KEY (person_id) REFERENCES PERSONNEL(person_id)
);


-- ============================================================
-- TABLE 12: VICTIM_SHELTER_STAY (M:N Relationship Table)
-- Type: Associative Table for VICTIM <-> SHELTER (RESIDES IN)
-- Composite PK: victim_id + shelter_id
-- Relationship Attributes: checkin_date, checkout_date
-- Rule: M:N -> New Table with Composite PK + FKs + Relationship Attributes
-- ============================================================
CREATE TABLE VICTIM_SHELTER_STAY (
    victim_id       VARCHAR2(50)    NOT NULL,
    shelter_id      VARCHAR2(50)    NOT NULL,
    checkin_date    DATE            NOT NULL,
    checkout_date   DATE,
    PRIMARY KEY (victim_id, shelter_id, checkin_date),
    FOREIGN KEY (victim_id) REFERENCES VICTIM(victim_id),
    FOREIGN KEY (shelter_id) REFERENCES SHELTER(shelter_id)
);
-- Note: current_occupancy (derived) computed by counting rows WHERE checkout_date IS NULL


-- ============================================================
-- TABLE 13: DISTRIBUTION (M:N Aggregation Table)
-- Type: Associative Table for WAREHOUSE <-> PERSONNEL (DISTRIBUTES)
-- This is the INNER Aggregation (the relationship that gets aggregated)
-- Composite PK: distribution_id (standalone PK for aggregation reference)
-- Rule: Aggregation -> Inner M:N becomes a table; Outer relation references it
-- ============================================================
CREATE TABLE DISTRIBUTION (
    distribution_id     VARCHAR2(50)    PRIMARY KEY,
    warehouse_id        VARCHAR2(50)    NOT NULL,
    person_id           VARCHAR2(50)    NOT NULL,
    distribution_date   DATE            NOT NULL,
    quantity            NUMBER          NOT NULL,
    FOREIGN KEY (warehouse_id) REFERENCES WAREHOUSE(warehouse_id),
    FOREIGN KEY (person_id) REFERENCES PERSONNEL(person_id)
);


-- ============================================================
-- TABLE 14: VEHICLE_DISTRIBUTION (Aggregation Outer Relation)
-- Type: VEHICLE connects to DISTRIBUTES Aggregation
-- Rule: Outer Relation references inner M:N table PK
-- Composite PK: vehicle_id + distribution_id
-- ============================================================
CREATE TABLE VEHICLE_DISTRIBUTION (
    vehicle_id          VARCHAR2(50)    NOT NULL,
    distribution_id     VARCHAR2(50)    NOT NULL,
    PRIMARY KEY (vehicle_id, distribution_id),
    FOREIGN KEY (vehicle_id) REFERENCES VEHICLE(vehicle_id),
    FOREIGN KEY (distribution_id) REFERENCES DISTRIBUTION(distribution_id)
);


-- ============================================================
-- TABLE 15: PERSONNEL_DEPLOYMENT (M:N Relationship Table)
-- Type: Associative Table for PERSONNEL <-> SHELTER (DEPLOYED AT)
-- Composite PK: person_id + shelter_id
-- Relationship Attribute: deployment_date
-- ============================================================
CREATE TABLE PERSONNEL_DEPLOYMENT (
    person_id           VARCHAR2(50)    NOT NULL,
    shelter_id          VARCHAR2(50)    NOT NULL,
    deployment_date     DATE            NOT NULL,
    PRIMARY KEY (person_id, shelter_id),
    FOREIGN KEY (person_id) REFERENCES PERSONNEL(person_id),
    FOREIGN KEY (shelter_id) REFERENCES SHELTER(shelter_id)
);


-- ============================================================
-- TABLE 16: PERSONNEL_STATIONED (M:N Relationship Table)
-- Type: Associative Table for PERSONNEL <-> WAREHOUSE (STATIONED AT)
-- Composite PK: person_id + warehouse_id
-- ============================================================
CREATE TABLE PERSONNEL_STATIONED (
    person_id       VARCHAR2(50)    NOT NULL,
    warehouse_id    VARCHAR2(50)    NOT NULL,
    PRIMARY KEY (person_id, warehouse_id),
    FOREIGN KEY (person_id) REFERENCES PERSONNEL(person_id),
    FOREIGN KEY (warehouse_id) REFERENCES WAREHOUSE(warehouse_id)
);
