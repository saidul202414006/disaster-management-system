import { Router } from 'express';
import { query } from '../config/db';

const router = Router();

// GET /api/vehicles — All vehicles
router.get('/', async (req, res) => {
  try {
    const rows = await query(`
      SELECT vehicle_id, vehicle_type, registration_no, capacity, availability_status
      FROM VEHICLE
      ORDER BY vehicle_type
    `);
    res.json({ data: rows });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch vehicles' });
  }
});

// POST /api/vehicles — Add vehicle
router.post('/', async (req, res) => {
  const { vehicle_id, vehicle_type, registration_no, capacity, availability_status } = req.body;
  if (!vehicle_id || !vehicle_type || !registration_no) {
    return res.status(422).json({ error: 'Missing required fields' });
  }
  try {
    await query(
      `INSERT INTO VEHICLE (vehicle_id, vehicle_type, registration_no, capacity, availability_status)
       VALUES (:vehicle_id, :vehicle_type, :registration_no, :capacity, :availability_status)`,
      [vehicle_id, vehicle_type, registration_no, capacity, availability_status || 'Available']
    );
    res.status(201).json({ message: 'Vehicle added', vehicle_id });
  } catch (err: any) {
    if (err.errorNum === 1) return res.status(409).json({ error: 'Vehicle or registration already exists' });
    res.status(500).json({ error: 'Failed to add vehicle' });
  }
});

export default router;
