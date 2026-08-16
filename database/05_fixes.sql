-- Fix shelter coordinates and volunteer team name
UPDATE SHELTER SET latitude='24.8963', longitude='91.8833' WHERE shelter_id='S-001';
UPDATE VOLUNTEER SET team='Search and Rescue' WHERE person_id='P-002' AND team='Search exit';
COMMIT;
EXIT;
