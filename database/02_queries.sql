-- ============================================================
-- DISASTER MANAGEMENT SYSTEM
-- SQL Queries File
-- Following instructor-taught query patterns and syntax
-- ============================================================

-- ============================================================
-- SECTION 1: BASIC SELECT QUERIES (Table-by-table)
-- ============================================================

-- Q1: All disaster events
SELECT *
FROM DISASTER_EVENT;

-- Q2: All shelters
SELECT *
FROM SHELTER;

-- Q3: All victims
SELECT *
FROM VICTIM;

-- Q4: Disasters filtered by type
SELECT *
FROM DISASTER_EVENT
WHERE disaster_type = 'Flood';

-- Q5: Victims who are missing
SELECT victim_id, household_head_name, last_known_location
FROM VICTIM
WHERE missing_person = 'Y';

-- Q6: Warehouses with limited capacity
SELECT *
FROM WAREHOUSE
WHERE capacity < 500;

-- Q7: Vehicles that are available
SELECT *
FROM VEHICLE
WHERE availability_status = 'Available';

-- Q8: Donations above a certain value
SELECT *
FROM DONATION
WHERE amount_or_value > 10000;

-- Q9: Personnel sorted by name
SELECT *
FROM PERSONNEL
ORDER BY name ASC;

-- Q10: Distinct disaster types
SELECT DISTINCT disaster_type
FROM DISASTER_EVENT;


-- ============================================================
-- SECTION 2: DERIVED ATTRIBUTE QUERIES
-- ============================================================

-- Q11: Disaster duration (duration_days = end_date - start_date)
SELECT
    disaster_name,
    start_date,
    end_date,
    (end_date - start_date) AS duration_days
FROM DISASTER_EVENT
WHERE end_date IS NOT NULL;

-- Q12: Shelter available_capacity (derived: capacity - current occupancy)
SELECT
    SH.shelter_id,
    SH.shelter_name,
    SH.capacity,
    COUNT(VSS.victim_id) AS current_occupancy,
    (SH.capacity - COUNT(VSS.victim_id)) AS available_capacity
FROM SHELTER SH
LEFT JOIN VICTIM_SHELTER_STAY VSS
    ON SH.shelter_id = VSS.shelter_id
    AND VSS.checkout_date IS NULL
GROUP BY
    SH.shelter_id,
    SH.shelter_name,
    SH.capacity;


-- ============================================================
-- SECTION 3: 1:N RELATIONSHIP JOIN QUERIES (2-table JOINs)
-- ============================================================

-- Q13: Victims and the disaster they are affected by (VICTIM JOIN DISASTER_EVENT)
SELECT
    V.victim_id,
    V.household_head_name,
    V.gender,
    D.disaster_name,
    D.disaster_type,
    D.division,
    D.district
FROM VICTIM V
JOIN DISASTER_EVENT D
    ON V.disaster_name = D.disaster_name;

-- Q14: Shelters and their associated disaster (SHELTER JOIN DISASTER_EVENT)
SELECT
    S.shelter_id,
    S.shelter_name,
    S.capacity,
    D.disaster_name,
    D.disaster_type
FROM SHELTER S
JOIN DISASTER_EVENT D
    ON S.disaster_name = D.disaster_name;

-- Q15: Donations and where they are stored (DONATION JOIN WAREHOUSE)
SELECT
    DON.donation_id,
    DON.donor_name,
    DON.donation_type,
    DON.amount_or_value,
    W.warehouse_name,
    W.location
FROM DONATION DON
JOIN WAREHOUSE W
    ON DON.warehouse_id = W.warehouse_id;

-- Q16: Family members and their victim household head (FAMILY_MEMBER JOIN VICTIM)
SELECT
    FM.victim_id,
    V.household_head_name,
    FM.member_seq_no,
    FM.name AS family_member_name
FROM FAMILY_MEMBER FM
JOIN VICTIM V
    ON FM.victim_id = V.victim_id;

-- Q17: Volunteer with their personnel info (VOLUNTEER JOIN PERSONNEL)
SELECT
    P.person_id,
    P.name,
    P.phone,
    P.designation,
    VOL.team
FROM VOLUNTEER VOL
JOIN PERSONNEL P
    ON VOL.person_id = P.person_id;

-- Q18: Medical staff with their personnel info (MEDICAL_STAFF JOIN PERSONNEL)
SELECT
    P.person_id,
    P.name,
    P.phone,
    MS.specialization,
    MS.since_date
FROM MEDICAL_STAFF MS
JOIN PERSONNEL P
    ON MS.person_id = P.person_id;


-- ============================================================
-- SECTION 4: SELF JOIN QUERY (PERSONNEL SUPERVISES PERSONNEL)
-- ============================================================

-- Q19: Personnel and their supervisors (Recursive Relationship)
SELECT
    E.person_id,
    E.name AS personnel_name,
    M.person_id AS supervisor_id,
    M.name AS supervisor_name
FROM PERSONNEL E
JOIN PERSONNEL M
    ON E.supervisor_id = M.person_id;

-- Q20: Personnel who have NO supervisor (top-level supervisors)
SELECT
    person_id,
    name,
    designation
FROM PERSONNEL
WHERE supervisor_id IS NULL;


-- ============================================================
-- SECTION 5: M:N RELATIONSHIP 3-TABLE JOIN QUERIES
-- ============================================================

-- Q21: Victims and shelters they stayed in (VICTIM -> VICTIM_SHELTER_STAY -> SHELTER)
SELECT
    V.victim_id,
    V.household_head_name,
    S.shelter_name,
    VSS.checkin_date,
    VSS.checkout_date
FROM VICTIM V
JOIN VICTIM_SHELTER_STAY VSS
    ON V.victim_id = VSS.victim_id
JOIN SHELTER S
    ON VSS.shelter_id = S.shelter_id;

-- Q22: Personnel deployed at shelters (PERSONNEL -> PERSONNEL_DEPLOYMENT -> SHELTER)
SELECT
    P.person_id,
    P.name AS personnel_name,
    S.shelter_name,
    PD.deployment_date
FROM PERSONNEL P
JOIN PERSONNEL_DEPLOYMENT PD
    ON P.person_id = PD.person_id
JOIN SHELTER S
    ON PD.shelter_id = S.shelter_id;

-- Q23: Personnel stationed at warehouses (PERSONNEL -> PERSONNEL_STATIONED -> WAREHOUSE)
SELECT
    P.person_id,
    P.name AS personnel_name,
    W.warehouse_name,
    W.location
FROM PERSONNEL P
JOIN PERSONNEL_STATIONED PS
    ON P.person_id = PS.person_id
JOIN WAREHOUSE W
    ON PS.warehouse_id = W.warehouse_id;

-- Q24: Distribution: who distributed what from which warehouse
-- (DISTRIBUTION -> WAREHOUSE + DISTRIBUTION -> PERSONNEL)
SELECT
    D.distribution_id,
    W.warehouse_name,
    P.name AS personnel_name,
    D.distribution_date,
    D.quantity
FROM DISTRIBUTION D
JOIN WAREHOUSE W
    ON D.warehouse_id = W.warehouse_id
JOIN PERSONNEL P
    ON D.person_id = P.person_id;

-- Q25: Vehicle used in which distribution (aggregation outer relation)
-- (VEHICLE -> VEHICLE_DISTRIBUTION -> DISTRIBUTION -> WAREHOUSE)
SELECT
    V.vehicle_id,
    V.vehicle_type,
    V.registration_no,
    W.warehouse_name,
    D.distribution_date,
    D.quantity
FROM VEHICLE V
JOIN VEHICLE_DISTRIBUTION VD
    ON V.vehicle_id = VD.vehicle_id
JOIN DISTRIBUTION D
    ON VD.distribution_id = D.distribution_id
JOIN WAREHOUSE W
    ON D.warehouse_id = W.warehouse_id;


-- ============================================================
-- SECTION 6: AGGREGATE FUNCTION QUERIES (COUNT, SUM, AVG, MAX, MIN)
-- ============================================================

-- Q26: Number of victims per disaster
SELECT
    D.disaster_name,
    D.disaster_type,
    COUNT(V.victim_id) AS total_victims
FROM DISASTER_EVENT D
LEFT JOIN VICTIM V
    ON D.disaster_name = V.disaster_name
GROUP BY
    D.disaster_name,
    D.disaster_type;

-- Q27: Total donation amount per warehouse
SELECT
    W.warehouse_id,
    W.warehouse_name,
    SUM(DON.amount_or_value) AS total_donations
FROM WAREHOUSE W
LEFT JOIN DONATION DON
    ON W.warehouse_id = DON.warehouse_id
GROUP BY
    W.warehouse_id,
    W.warehouse_name;

-- Q28: Average capacity of shelters per disaster
SELECT
    disaster_name,
    AVG(capacity) AS avg_shelter_capacity,
    MAX(capacity) AS max_capacity,
    MIN(capacity) AS min_capacity
FROM SHELTER
WHERE disaster_name IS NOT NULL
GROUP BY disaster_name;

-- Q29: Disasters with more than 100 victims (GROUP BY + HAVING)
SELECT
    D.disaster_name,
    COUNT(V.victim_id) AS total_victims
FROM DISASTER_EVENT D
JOIN VICTIM V
    ON D.disaster_name = V.disaster_name
GROUP BY D.disaster_name
HAVING COUNT(V.victim_id) > 100;

-- Q30: Personnel who have been deployed to more than 1 shelter
SELECT
    P.person_id,
    P.name,
    COUNT(PD.shelter_id) AS shelters_deployed
FROM PERSONNEL P
JOIN PERSONNEL_DEPLOYMENT PD
    ON P.person_id = PD.person_id
GROUP BY
    P.person_id,
    P.name
HAVING COUNT(PD.shelter_id) > 1;


-- ============================================================
-- SECTION 7: FILTER + JOIN + ORDER BY QUERIES
-- ============================================================

-- Q31: Active disasters only (no end_date yet)
SELECT *
FROM DISASTER_EVENT
WHERE end_date IS NULL
ORDER BY start_date DESC;

-- Q32: Missing victims with their contact phones
SELECT
    V.victim_id,
    V.household_head_name,
    V.last_known_location,
    VP.phone
FROM VICTIM V
JOIN VICTIM_PHONE VP
    ON V.victim_id = VP.victim_id
WHERE V.missing_person = 'Y';

-- Q33: Volunteers NOT yet deployed to any shelter
SELECT
    P.person_id,
    P.name,
    VOL.team
FROM VOLUNTEER VOL
JOIN PERSONNEL P
    ON VOL.person_id = P.person_id
WHERE P.person_id NOT IN (
    SELECT person_id FROM PERSONNEL_DEPLOYMENT
);

-- Q34: Shelters by division with their current disaster
SELECT
    S.shelter_id,
    S.shelter_name,
    S.capacity,
    D.division,
    D.district,
    D.disaster_type
FROM SHELTER S
JOIN DISASTER_EVENT D
    ON S.disaster_name = D.disaster_name
ORDER BY D.division, D.district;
