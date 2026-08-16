import { Router } from 'express';
import { query } from '../config/db';

const router = Router();

// GET /api/warehouses — All warehouses
router.get('/', async (req, res) => {
  try {
    const rows = await query(`
      SELECT
        W.warehouse_id,
        W.warehouse_name,
        W.location,
        W.capacity,
        W.manager_name,
        W.status,
        COUNT(D.donation_id) AS total_donations_stored,
        SUM(D.amount_or_value) AS total_donation_value
      FROM WAREHOUSE W
      LEFT JOIN DONATION D ON W.warehouse_id = D.warehouse_id
      GROUP BY W.warehouse_id, W.warehouse_name, W.location, W.capacity, W.manager_name, W.status
      ORDER BY W.warehouse_name
    `);
    res.json({ data: rows });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch warehouses' });
  }
});

// POST /api/warehouses — Create warehouse
router.post('/', async (req, res) => {
  const { warehouse_id, warehouse_name, location, capacity, manager_name, status } = req.body;
  if (!warehouse_id || !warehouse_name || !location || !capacity) {
    return res.status(422).json({ error: 'Missing required fields' });
  }
  try {
    await query(
      `INSERT INTO WAREHOUSE (warehouse_id, warehouse_name, location, capacity, manager_name, status)
       VALUES (:warehouse_id, :warehouse_name, :location, :capacity, :manager_name, :status)`,
      [warehouse_id, warehouse_name, location, capacity, manager_name, status || 'Active']
    );
    res.status(201).json({ message: 'Warehouse created', warehouse_id });
  } catch (err: any) {
    if (err.errorNum === 1) return res.status(409).json({ error: 'Warehouse ID already exists' });
    res.status(500).json({ error: 'Failed to create warehouse' });
  }
});

export default router;
