-- ============================================================
-- ENHANCED MOCK DATA — Disaster Management System
-- Run after 03_mock_data.sql
-- Adds: real coordinates, phones, family members, more records
-- ============================================================

-- Update shelter with real Bangladesh coordinates
UPDATE SHELTER
SET latitude = '24.8963', longitude = '91.8833', division = 'Sylhet', district = 'Sylhet'
WHERE shelter_id = 'S-001';

-- Add phone numbers for existing victims (VICTIM_PHONE — multivalued attribute)
INSERT INTO VICTIM_PHONE (victim_id, phone) VALUES ('VIC-001', '01711234567');
INSERT INTO VICTIM_PHONE (victim_id, phone) VALUES ('VIC-001', '01811234568');
INSERT INTO VICTIM_PHONE (victim_id, phone) VALUES ('VIC-002', '01911234569');

-- Add family members for existing victims (FAMILY_MEMBER — weak entity)
INSERT INTO FAMILY_MEMBER (victim_id, member_seq_no, name) VALUES ('VIC-001', 1, 'Ayesha Malek');
INSERT INTO FAMILY_MEMBER (victim_id, member_seq_no, name) VALUES ('VIC-001', 2, 'Rafi Malek');
INSERT INTO FAMILY_MEMBER (victim_id, member_seq_no, name) VALUES ('VIC-001', 3, 'Sadia Malek');
INSERT INTO FAMILY_MEMBER (victim_id, member_seq_no, name) VALUES ('VIC-002', 1, 'Karim Hossain');

-- Add more disaster events
INSERT INTO DISASTER_EVENT (disaster_name, disaster_type, division, district, start_date, end_date)
VALUES ('Dhaka Flash Flood 2024', 'Flood', 'Dhaka', 'Dhaka', TO_DATE('2024-07-10', 'YYYY-MM-DD'), TO_DATE('2024-07-15', 'YYYY-MM-DD'));

INSERT INTO DISASTER_EVENT (disaster_name, disaster_type, division, district, start_date, end_date)
VALUES ('Cox Bazar Cyclone 2024', 'Cyclone', 'Chittagong', 'Cox''s Bazar', TO_DATE('2024-06-01', 'YYYY-MM-DD'), NULL);

INSERT INTO DISASTER_EVENT (disaster_name, disaster_type, division, district, start_date, end_date)
VALUES ('Rangpur Drought 2024', 'Other', 'Rangpur', 'Rangpur', TO_DATE('2024-04-01', 'YYYY-MM-DD'), TO_DATE('2024-08-01', 'YYYY-MM-DD'));

-- Add more shelters with real Bangladesh coordinates
INSERT INTO SHELTER (shelter_id, shelter_name, current_status, contact_person_name, contact_person_phone, address_line, longitude, latitude, capacity, disaster_name)
VALUES ('S-002', 'Cox Bazar District School Shelter', 'Open', 'Headmaster Rahman', '01712000010', 'Main Road, Cox''s Bazar', '92.0019', '21.4272', 800, 'Cox Bazar Cyclone 2024');

INSERT INTO SHELTER (shelter_id, shelter_name, current_status, contact_person_name, contact_person_phone, address_line, longitude, latitude, capacity, disaster_name)
VALUES ('S-003', 'Dhaka Polytechnic Relief Camp', 'Open', 'Coordinator Karim', '01813000020', 'Tejgaon, Dhaka', '90.4023', '23.7715', 1200, 'Dhaka Flash Flood 2024');

INSERT INTO SHELTER (shelter_id, shelter_name, current_status, contact_person_name, contact_person_phone, address_line, longitude, latitude, capacity, disaster_name)
VALUES ('S-004', 'Chittagong Port Area Camp', 'Full', 'Supervisor Nayan', '01914000030', 'Port Road, Chittagong', '91.8318', '22.3475', 500, 'Cox Bazar Cyclone 2024');

-- Add more victims for new disasters
INSERT INTO VICTIM (victim_id, household_head_name, gender, nid_number, reported_date, last_known_location, missing_person, special_needs, disaster_name)
VALUES ('VIC-003', 'Mohammad Hasan', 'Male', '1111111111', TO_DATE('2024-07-11', 'YYYY-MM-DD'), 'Mirpur, Dhaka', 'N', NULL, 'Dhaka Flash Flood 2024');

INSERT INTO VICTIM (victim_id, household_head_name, gender, nid_number, reported_date, last_known_location, missing_person, special_needs, disaster_name)
VALUES ('VIC-004', 'Fatema Khanam', 'Female', '2222222222', TO_DATE('2024-07-12', 'YYYY-MM-DD'), 'Rayer Bazar, Dhaka', 'Y', 'Elderly', 'Dhaka Flash Flood 2024');

INSERT INTO VICTIM (victim_id, household_head_name, gender, nid_number, reported_date, last_known_location, missing_person, special_needs, disaster_name)
VALUES ('VIC-005', 'Kamal Uddin', 'Male', '3333333333', TO_DATE('2024-06-02', 'YYYY-MM-DD'), 'Teknaf, Cox''s Bazar', 'N', NULL, 'Cox Bazar Cyclone 2024');

INSERT INTO VICTIM (victim_id, household_head_name, gender, nid_number, reported_date, last_known_location, missing_person, special_needs, disaster_name)
VALUES ('VIC-006', 'Rokeya Begum', 'Female', '4444444444', TO_DATE('2024-06-03', 'YYYY-MM-DD'), 'Ukhiya, Cox''s Bazar', 'Y', 'Infant child', 'Cox Bazar Cyclone 2024');

-- Phone numbers for new victims
INSERT INTO VICTIM_PHONE (victim_id, phone) VALUES ('VIC-003', '01711100001');
INSERT INTO VICTIM_PHONE (victim_id, phone) VALUES ('VIC-004', '01811100002');
INSERT INTO VICTIM_PHONE (victim_id, phone) VALUES ('VIC-005', '01911100003');

-- Family members for new victims
INSERT INTO FAMILY_MEMBER (victim_id, member_seq_no, name) VALUES ('VIC-003', 1, 'Shirin Hasan');
INSERT INTO FAMILY_MEMBER (victim_id, member_seq_no, name) VALUES ('VIC-003', 2, 'Rahim Hasan');
INSERT INTO FAMILY_MEMBER (victim_id, member_seq_no, name) VALUES ('VIC-005', 1, 'Nasrin Uddin');

-- Add more personnel
INSERT INTO PERSONNEL (person_id, name, phone, designation, base_location, supervisor_id)
VALUES ('P-003', 'Dr. Nasrin Khanam', '01711000003', 'Medical Officer', 'Cox''s Bazar', 'P-001');
INSERT INTO PERSONNEL (person_id, name, phone, designation, base_location, supervisor_id)
VALUES ('P-004', 'Jamal Hossain', '01811000004', 'Field Coordinator', 'Dhaka', 'P-001');
INSERT INTO PERSONNEL (person_id, name, phone, designation, base_location, supervisor_id)
VALUES ('P-005', 'Sumon Ahmed', '01911000005', 'Logistics Officer', 'Sylhet', 'P-002');

-- ISA: Volunteer records
INSERT INTO VOLUNTEER (person_id, team) VALUES ('P-002', 'Search & Rescue');
INSERT INTO VOLUNTEER (person_id, team) VALUES ('P-004', 'Medical Assistance');

-- ISA: Medical Staff records
INSERT INTO MEDICAL_STAFF (person_id, specialization, since_date)
VALUES ('P-001', 'Emergency Medicine', TO_DATE('2020-01-01', 'YYYY-MM-DD'));
INSERT INTO MEDICAL_STAFF (person_id, specialization, since_date)
VALUES ('P-003', 'Pediatrics', TO_DATE('2022-06-01', 'YYYY-MM-DD'));

-- Personnel shelter deployment
INSERT INTO PERSONNEL_DEPLOYMENT (person_id, shelter_id, deployment_date)
VALUES ('P-002', 'S-001', TO_DATE('2024-05-16', 'YYYY-MM-DD'));
INSERT INTO PERSONNEL_DEPLOYMENT (person_id, shelter_id, deployment_date)
VALUES ('P-005', 'S-001', TO_DATE('2024-05-17', 'YYYY-MM-DD'));
INSERT INTO PERSONNEL_DEPLOYMENT (person_id, shelter_id, deployment_date)
VALUES ('P-003', 'S-002', TO_DATE('2024-06-02', 'YYYY-MM-DD'));
INSERT INTO PERSONNEL_DEPLOYMENT (person_id, shelter_id, deployment_date)
VALUES ('P-004', 'S-003', TO_DATE('2024-07-11', 'YYYY-MM-DD'));

-- More vehicles
INSERT INTO VEHICLE (vehicle_id, vehicle_type, registration_no, capacity, availability_status)
VALUES ('V-103', 'Ambulance', 'DHK-22-5566', 4, 'Available');
INSERT INTO VEHICLE (vehicle_id, vehicle_type, registration_no, capacity, availability_status)
VALUES ('V-104', 'Truck', 'CTG-33-7788', 8000, 'In Use');

-- More donations
INSERT INTO DONATION (donation_id, donor_name, donor_id, contact_info, donation_type, amount_or_value, donation_date, warehouse_id)
VALUES ('D-003', 'Red Crescent Bangladesh', 'ORG-02', 'redcrescent@bd.org', 'Medicine', 25000, TO_DATE('2024-06-05', 'YYYY-MM-DD'), 'W-001');
INSERT INTO DONATION (donation_id, donor_name, donor_id, contact_info, donation_type, amount_or_value, donation_date, warehouse_id)
VALUES ('D-004', 'Dutch-Bangla Bank', 'ORG-03', '01700000000', 'Cash', 200000, TO_DATE('2024-07-13', 'YYYY-MM-DD'), 'W-001');

-- Relief distributions
INSERT INTO DISTRIBUTION (distribution_id, warehouse_id, person_id, distribution_date, quantity)
VALUES ('DIST-001', 'W-002', 'P-002', TO_DATE('2024-05-20', 'YYYY-MM-DD'), 500);
INSERT INTO DISTRIBUTION (distribution_id, warehouse_id, person_id, distribution_date, quantity)
VALUES ('DIST-002', 'W-001', 'P-004', TO_DATE('2024-07-14', 'YYYY-MM-DD'), 1200);
INSERT INTO DISTRIBUTION (distribution_id, warehouse_id, person_id, distribution_date, quantity)
VALUES ('DIST-003', 'W-001', 'P-003', TO_DATE('2024-06-10', 'YYYY-MM-DD'), 300);

-- Link vehicles to distributions (aggregation)
INSERT INTO VEHICLE_DISTRIBUTION (vehicle_id, distribution_id) VALUES ('V-101', 'DIST-001');
INSERT INTO VEHICLE_DISTRIBUTION (vehicle_id, distribution_id) VALUES ('V-104', 'DIST-002');
INSERT INTO VEHICLE_DISTRIBUTION (vehicle_id, distribution_id) VALUES ('V-103', 'DIST-003');

-- Victim shelter stays for new victims
INSERT INTO VICTIM_SHELTER_STAY (victim_id, shelter_id, checkin_date, checkout_date)
VALUES ('VIC-003', 'S-003', TO_DATE('2024-07-11', 'YYYY-MM-DD'), NULL);
INSERT INTO VICTIM_SHELTER_STAY (victim_id, shelter_id, checkin_date, checkout_date)
VALUES ('VIC-005', 'S-002', TO_DATE('2024-06-02', 'YYYY-MM-DD'), NULL);

COMMIT;
