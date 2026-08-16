-- ============================================================
-- MOCK DATA FOR DISASTER MANAGEMENT SYSTEM
-- ============================================================

-- 1. DISASTER_EVENT
INSERT INTO DISASTER_EVENT (disaster_name, disaster_type, division, district, start_date, end_date) VALUES ('Sylhet Flood 2024', 'Flood', 'Sylhet', 'Sylhet', TO_DATE('2024-05-15', 'YYYY-MM-DD'), NULL);
INSERT INTO DISASTER_EVENT (disaster_name, disaster_type, division, district, start_date, end_date) VALUES ('Cyclone Remal', 'Cyclone', 'Barisal', 'Patuakhali', TO_DATE('2024-05-26', 'YYYY-MM-DD'), TO_DATE('2024-05-28', 'YYYY-MM-DD'));

-- 2. WAREHOUSE
INSERT INTO WAREHOUSE (warehouse_id, warehouse_name, location, capacity, manager_name, status) VALUES ('W-001', 'Central Relief Hub', 'Dhaka', 50000, 'Rahim Uddin', 'Active');
INSERT INTO WAREHOUSE (warehouse_id, warehouse_name, location, capacity, manager_name, status) VALUES ('W-002', 'Sylhet Zilla Parishad Store', 'Sylhet', 20000, 'Karim Ali', 'Active');

-- 3. VEHICLE
INSERT INTO VEHICLE (vehicle_id, vehicle_type, registration_no, capacity, availability_status) VALUES ('V-101', 'Truck', 'DHA-11-2233', 5000, 'Available');
INSERT INTO VEHICLE (vehicle_id, vehicle_type, registration_no, capacity, availability_status) VALUES ('V-102', 'Speedboat', 'SYL-00-1122', 15, 'Deployed');

-- 4. PERSONNEL
INSERT INTO PERSONNEL (person_id, name, phone, designation, base_location, supervisor_id) VALUES ('P-001', 'Dr. Shafiq', '01711000001', 'Chief Coordinator', 'Dhaka', NULL);
INSERT INTO PERSONNEL (person_id, name, phone, designation, base_location, supervisor_id) VALUES ('P-002', 'Rafiqul Islam', '01811000002', 'Field Supervisor', 'Sylhet', 'P-001');

-- 5. SHELTER
INSERT INTO SHELTER (shelter_id, shelter_name, current_status, contact_person_name, contact_person_phone, address_line, longitude, latitude, capacity, disaster_name) VALUES ('S-001', 'Sylhet Govt College Shelter', 'Open', 'Principal', '01911000003', 'Tilagor, Sylhet', '91.88', '24.90', 1000, 'Sylhet Flood 2024');

-- 6. VICTIM
INSERT INTO VICTIM (victim_id, household_head_name, gender, nid_number, reported_date, last_known_location, missing_person, special_needs, disaster_name) VALUES ('VIC-001', 'Abdul Malek', 'Male', '1234567890', TO_DATE('2024-05-16', 'YYYY-MM-DD'), 'Companiganj, Sylhet', 'N', 'Wheelchair', 'Sylhet Flood 2024');
INSERT INTO VICTIM (victim_id, household_head_name, gender, nid_number, reported_date, last_known_location, missing_person, special_needs, disaster_name) VALUES ('VIC-002', 'Salma Begum', 'Female', '9876543210', TO_DATE('2024-05-27', 'YYYY-MM-DD'), 'Kuakata', 'Y', NULL, 'Cyclone Remal');

-- 7. DONATION
INSERT INTO DONATION (donation_id, donor_name, donor_id, contact_info, donation_type, amount_or_value, donation_date, warehouse_id) VALUES ('D-001', 'BRAC', 'ORG-01', 'brac@example.com', 'Food Packets', 10000, TO_DATE('2024-05-18', 'YYYY-MM-DD'), 'W-002');
INSERT INTO DONATION (donation_id, donor_name, donor_id, contact_info, donation_type, amount_or_value, donation_date, warehouse_id) VALUES ('D-002', 'Anonymus', NULL, NULL, 'Cash', 50000, TO_DATE('2024-05-20', 'YYYY-MM-DD'), 'W-001');

-- 12. VICTIM_SHELTER_STAY
INSERT INTO VICTIM_SHELTER_STAY (victim_id, shelter_id, checkin_date, checkout_date) VALUES ('VIC-001', 'S-001', TO_DATE('2024-05-16', 'YYYY-MM-DD'), NULL);

COMMIT;
EXIT;
