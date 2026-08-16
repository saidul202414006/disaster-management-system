import { Router, Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { query } from '../config/db';
import { sendOTPEmail, generateOTP } from '../utils/mailer';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'dms_jwt_secret_2024_bangladesh';
const OTP_EXPIRY_MINUTES = 10;

// Helper: add minutes to current date
function addMinutes(mins: number): Date {
  return new Date(Date.now() + mins * 60 * 1000);
}

// Helper: format date for Oracle
function oracleDate(d: Date): string {
  return d.toISOString().slice(0, 19).replace('T', ' ');
}

// ─────────────────────────────────────────────
// ADMIN REGISTER
// ─────────────────────────────────────────────
router.post('/admin/register', async (req: Request, res: Response) => {
  const { full_name, email, password, phone } = req.body;
  if (!full_name || !email || !password) {
    return res.status(422).json({ error: 'Name, email, and password are required.' });
  }

  try {
    // Check if email already exists
    const existing = await query<any>(
      `SELECT user_id FROM APP_USER WHERE email = :email`,
      [email]
    );
    if (existing.length > 0) {
      return res.status(409).json({ error: 'An account with this email already exists.' });
    }

    const password_hash = await bcrypt.hash(password, 12);
    const otp = generateOTP();
    const user_id = `USR-${Date.now()}`;
    const expiry = addMinutes(OTP_EXPIRY_MINUTES);

    await query(
      `INSERT INTO APP_USER (user_id, email, password_hash, full_name, phone, role, is_verified, otp_code, otp_expiry, created_at)
       VALUES (:user_id, :email, :password_hash, :full_name, :phone, 'admin', 'N', :otp_code,
         SYSDATE + (:expiry_mins / 1440), SYSDATE)`,
      [user_id, email, password_hash, full_name, phone || null, otp, OTP_EXPIRY_MINUTES]
    );

    // Send OTP email
    try {
      await sendOTPEmail(email, otp, full_name);
    } catch (mailErr) {
      console.error('[Mailer] OTP email failed:', mailErr);
      // Still succeed — user can re-request OTP
    }

    res.status(201).json({ message: 'Registration successful. Check your email for the OTP.', email });
  } catch (err: any) {
    console.error('[Auth] Admin register error:', err);
    res.status(500).json({ error: 'Registration failed. Please try again.' });
  }
});

// ─────────────────────────────────────────────
// ADMIN VERIFY OTP
// ─────────────────────────────────────────────
router.post('/admin/verify', async (req: Request, res: Response) => {
  const { email, otp } = req.body;
  if (!email || !otp) return res.status(422).json({ error: 'Email and OTP are required.' });

  try {
    const users = await query<any>(
      `SELECT user_id, otp_code, CASE WHEN otp_expiry < SYSDATE THEN 1 ELSE 0 END AS is_expired, is_verified FROM APP_USER WHERE email = :email AND role = 'admin'`,
      [email]
    );
    if (users.length === 0) return res.status(404).json({ error: 'Account not found.' });

    const user = users[0];
    if (user.IS_VERIFIED === 'Y') return res.status(400).json({ error: 'Account already verified.' });
    if (user.OTP_CODE !== otp.trim()) return res.status(400).json({ error: 'Invalid OTP code.' });
    if (user.IS_EXPIRED === 1) {
      return res.status(400).json({ error: 'OTP has expired. Please register again to get a new code.' });
    }

    await query(
      `UPDATE APP_USER SET is_verified = 'Y', otp_code = NULL, otp_expiry = NULL WHERE email = :email`,
      [email]
    );

    res.json({ message: 'Email verified successfully. You can now log in.' });
  } catch (err) {
    console.error('[Auth] Admin verify error:', err);
    res.status(500).json({ error: 'Verification failed.' });
  }
});

// ─────────────────────────────────────────────
// ADMIN LOGIN
// ─────────────────────────────────────────────
router.post('/admin/login', async (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(422).json({ error: 'Email and password are required.' });

  try {
    const users = await query<any>(
      `SELECT user_id, email, password_hash, full_name, role, is_verified FROM APP_USER WHERE email = :email AND role = 'admin'`,
      [email]
    );
    if (users.length === 0) return res.status(401).json({ error: 'Invalid email or password.' });

    const user = users[0];
    if (user.IS_VERIFIED !== 'Y') {
      return res.status(403).json({ error: 'Account not verified. Please check your email for the OTP.' });
    }

    const passwordMatch = await bcrypt.compare(password, user.PASSWORD_HASH);
    if (!passwordMatch) return res.status(401).json({ error: 'Invalid email or password.' });

    const token = jwt.sign(
      { user_id: user.USER_ID, email: user.EMAIL, role: user.ROLE, name: user.FULL_NAME },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.cookie('dms_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({
      data: { user_id: user.USER_ID, email: user.EMAIL, role: user.ROLE, name: user.FULL_NAME, token }
    });
  } catch (err) {
    console.error('[Auth] Admin login error:', err);
    res.status(500).json({ error: 'Login failed.' });
  }
});

// ─────────────────────────────────────────────
// VICTIM REGISTER
// ─────────────────────────────────────────────
router.post('/victim/register', async (req: Request, res: Response) => {
  const { full_name, email, password, phone, nid_number } = req.body;
  if (!full_name || !email || !password) {
    return res.status(422).json({ error: 'Name, email, and password are required.' });
  }

  try {
    const existing = await query<any>(`SELECT user_id FROM APP_USER WHERE email = :email`, [email]);
    if (existing.length > 0) return res.status(409).json({ error: 'Account already exists with this email.' });

    const password_hash = await bcrypt.hash(password, 12);
    const otp = generateOTP();
    const user_id = `USR-V-${Date.now()}`;
    const expiry = addMinutes(OTP_EXPIRY_MINUTES);

    // Try to find linked victim by NID
    let victim_id: string | null = null;
    if (nid_number) {
      const victims = await query<any>(`SELECT victim_id FROM VICTIM WHERE nid_number = :nid`, [nid_number]);
      if (victims.length > 0) victim_id = victims[0].VICTIM_ID;
    }

    await query(
      `INSERT INTO APP_USER (user_id, email, password_hash, full_name, phone, role, is_verified, otp_code, otp_expiry, victim_id, created_at)
       VALUES (:user_id, :email, :password_hash, :full_name, :phone, 'victim', 'N', :otp_code,
         SYSDATE + (:expiry_mins / 1440), :victim_id, SYSDATE)`,
      [user_id, email, password_hash, full_name, phone || null, otp, OTP_EXPIRY_MINUTES, victim_id]
    );

    try {
      await sendOTPEmail(email, otp, full_name);
    } catch (mailErr) {
      console.error('[Mailer] OTP email failed:', mailErr);
    }

    res.status(201).json({ message: 'Registration successful. Check your email for the OTP.', email, victim_linked: !!victim_id });
  } catch (err) {
    console.error('[Auth] Victim register error:', err);
    res.status(500).json({ error: 'Registration failed.' });
  }
});

// ─────────────────────────────────────────────
// VICTIM VERIFY OTP
// ─────────────────────────────────────────────
router.post('/victim/verify', async (req: Request, res: Response) => {
  const { email, otp } = req.body;
  if (!email || !otp) return res.status(422).json({ error: 'Email and OTP required.' });

  try {
    const users = await query<any>(
      `SELECT user_id, otp_code, CASE WHEN otp_expiry < SYSDATE THEN 1 ELSE 0 END AS is_expired, is_verified FROM APP_USER WHERE email = :email AND role = 'victim'`,
      [email]
    );
    if (users.length === 0) return res.status(404).json({ error: 'Account not found.' });

    const user = users[0];
    if (user.IS_VERIFIED === 'Y') return res.status(400).json({ error: 'Already verified.' });
    if (user.OTP_CODE !== otp.trim()) return res.status(400).json({ error: 'Invalid OTP.' });
    if (user.IS_EXPIRED === 1) {
      return res.status(400).json({ error: 'OTP expired.' });
    }

    await query(`UPDATE APP_USER SET is_verified = 'Y', otp_code = NULL, otp_expiry = NULL WHERE email = :email`, [email]);
    res.json({ message: 'Email verified. You can now log in.' });
  } catch (err) {
    res.status(500).json({ error: 'Verification failed.' });
  }
});

// ─────────────────────────────────────────────
// VICTIM LOGIN
// ─────────────────────────────────────────────
router.post('/victim/login', async (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(422).json({ error: 'Email and password required.' });

  try {
    const users = await query<any>(
      `SELECT user_id, email, password_hash, full_name, role, is_verified, victim_id FROM APP_USER WHERE email = :email AND role = 'victim'`,
      [email]
    );
    if (users.length === 0) return res.status(401).json({ error: 'Invalid email or password.' });

    const user = users[0];
    if (user.IS_VERIFIED !== 'Y') return res.status(403).json({ error: 'Account not verified. Please check your email.' });

    const passwordMatch = await bcrypt.compare(password, user.PASSWORD_HASH);
    if (!passwordMatch) return res.status(401).json({ error: 'Invalid email or password.' });

    const token = jwt.sign(
      { user_id: user.USER_ID, email: user.EMAIL, role: user.ROLE, name: user.FULL_NAME, victim_id: user.VICTIM_ID },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.cookie('dms_token', token, { httpOnly: true, secure: false, sameSite: 'lax', maxAge: 7 * 24 * 60 * 60 * 1000 });
    res.json({ data: { user_id: user.USER_ID, email: user.EMAIL, role: user.ROLE, name: user.FULL_NAME, victim_id: user.VICTIM_ID, token } });
  } catch (err) {
    res.status(500).json({ error: 'Login failed.' });
  }
});

// ─────────────────────────────────────────────
// ME (verify current session)
// ─────────────────────────────────────────────
router.get('/me', (req: Request, res: Response) => {
  const token = req.cookies?.dms_token || req.headers.authorization?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'Not authenticated.' });

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    res.json({ data: { user_id: decoded.user_id, email: decoded.email, role: decoded.role, name: decoded.name, victim_id: decoded.victim_id } });
  } catch {
    res.status(401).json({ error: 'Session expired. Please log in again.' });
  }
});

// ─────────────────────────────────────────────
// LOGOUT
// ─────────────────────────────────────────────
router.post('/logout', (_req: Request, res: Response) => {
  res.clearCookie('dms_token');
  res.json({ message: 'Logged out successfully.' });
});

export default router;
