-- DISASTER MANAGEMENT SYSTEM
-- Oracle SQL Schema

-- Table: DISASTER_EVENT
CREATE TABLE DISASTER_EVENT (
    disaster_name   VARCHAR2(200)   PRIMARY KEY,
    disaster_type   VARCHAR2(100)   NOT NULL,
    division        VARCHAR2(100)   NOT NULL,
    district        VARCHAR2(100)   NOT NULL,
    start_date      DATE            NOT NULL,
    end_date        DATE
);

-- Table: WAREHOUSE
CREATE TABLE WAREHOUSE (
    warehouse_id    VARCHAR2(50)    PRIMARY KEY,
    warehouse_name  VARCHAR2(200)   NOT NULL,
    location        VARCHAR2(255)   NOT NULL,
    capacity        NUMBER          NOT NULL,
    manager_name    VARCHAR2(100),
    status          VARCHAR2(50)    NOT NULL
);

-- Table: VEHICLE
CREATE TABLE VEHICLE (
    vehicle_id              VARCHAR2(50)    PRIMARY KEY,
    vehicle_type            VARCHAR2(100)   NOT NULL,
    registration_no         VARCHAR2(50)    UNIQUE NOT NULL,
    capacity                NUMBER,
    availability_status     VARCHAR2(50)    NOT NULL
);

-- Table: PERSONNEL
CREATE TABLE PERSONNEL (
    person_id       VARCHAR2(50)    PRIMARY KEY,
    name            VARCHAR2(200)   NOT NULL,
    phone           VARCHAR2(20),
    designation     VARCHAR2(100),
    base_location   VARCHAR2(200),
    supervisor_id   VARCHAR2(50),
    FOREIGN KEY (supervisor_id) REFERENCES PERSONNEL(person_id)
);

-- Table: SHELTER
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

-- Table: VICTIM
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

-- Table: DONATION
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

-- Table: VICTIM_PHONE
CREATE TABLE VICTIM_PHONE (
    victim_id   VARCHAR2(50)    NOT NULL,
    phone       VARCHAR2(20)    NOT NULL,
    PRIMARY KEY (victim_id, phone),
    FOREIGN KEY (victim_id) REFERENCES VICTIM(victim_id)
);

-- Table: FAMILY_MEMBER
CREATE TABLE FAMILY_MEMBER (
    victim_id       VARCHAR2(50)    NOT NULL,
    member_seq_no   NUMBER          NOT NULL,
    name            VARCHAR2(200)   NOT NULL,
    PRIMARY KEY (victim_id, member_seq_no),
    FOREIGN KEY (victim_id) REFERENCES VICTIM(victim_id)
);

-- Table: VOLUNTEER
CREATE TABLE VOLUNTEER (
    person_id   VARCHAR2(50)    PRIMARY KEY,
    team        VARCHAR2(100),
    FOREIGN KEY (person_id) REFERENCES PERSONNEL(person_id)
);

-- Table: MEDICAL_STAFF
CREATE TABLE MEDICAL_STAFF (
    person_id       VARCHAR2(50)    PRIMARY KEY,
    specialization  VARCHAR2(100),
    since_date      DATE,
    FOREIGN KEY (person_id) REFERENCES PERSONNEL(person_id)
);

-- Table: VICTIM_SHELTER_STAY
CREATE TABLE VICTIM_SHELTER_STAY (
    victim_id       VARCHAR2(50)    NOT NULL,
    shelter_id      VARCHAR2(50)    NOT NULL,
    checkin_date    DATE            NOT NULL,
    checkout_date   DATE,
    PRIMARY KEY (victim_id, shelter_id, checkin_date),
    FOREIGN KEY (victim_id) REFERENCES VICTIM(victim_id),
    FOREIGN KEY (shelter_id) REFERENCES SHELTER(shelter_id)
);

-- Table: DISTRIBUTION
CREATE TABLE DISTRIBUTION (
    distribution_id     VARCHAR2(50)    PRIMARY KEY,
    warehouse_id        VARCHAR2(50)    NOT NULL,
    person_id           VARCHAR2(50)    NOT NULL,
    distribution_date   DATE            NOT NULL,
    quantity            NUMBER          NOT NULL,
    FOREIGN KEY (warehouse_id) REFERENCES WAREHOUSE(warehouse_id),
    FOREIGN KEY (person_id) REFERENCES PERSONNEL(person_id)
);

-- Table: VEHICLE_DISTRIBUTION
CREATE TABLE VEHICLE_DISTRIBUTION (
    vehicle_id          VARCHAR2(50)    NOT NULL,
    distribution_id     VARCHAR2(50)    NOT NULL,
    PRIMARY KEY (vehicle_id, distribution_id),
    FOREIGN KEY (vehicle_id) REFERENCES VEHICLE(vehicle_id),
    FOREIGN KEY (distribution_id) REFERENCES DISTRIBUTION(distribution_id)
);

-- Table: PERSONNEL_DEPLOYMENT
CREATE TABLE PERSONNEL_DEPLOYMENT (
    person_id           VARCHAR2(50)    NOT NULL,
    shelter_id          VARCHAR2(50)    NOT NULL,
    deployment_date     DATE            NOT NULL,
    PRIMARY KEY (person_id, shelter_id),
    FOREIGN KEY (person_id) REFERENCES PERSONNEL(person_id),
    FOREIGN KEY (shelter_id) REFERENCES SHELTER(shelter_id)
);

-- Table: PERSONNEL_STATIONED
CREATE TABLE PERSONNEL_STATIONED (
    person_id       VARCHAR2(50)    NOT NULL,
    warehouse_id    VARCHAR2(50)    NOT NULL,
    PRIMARY KEY (person_id, warehouse_id),
    FOREIGN KEY (person_id) REFERENCES PERSONNEL(person_id),
    FOREIGN KEY (warehouse_id) REFERENCES WAREHOUSE(warehouse_id)
);
