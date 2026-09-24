import express from 'express';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { DatabaseSync } from 'node:sqlite';
import { createServer as createViteServer } from 'vite';

const app = express();
const PORT = 3000;

app.use(express.json());

// -------------------------------------------------------------
// Database Initialization (SQLite via node:sqlite)
// -------------------------------------------------------------
const dataDir = path.join(process.cwd(), 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'salon.db');
const db = new DatabaseSync(dbPath);

// Create Relational Schema
db.exec(`
  CREATE TABLE IF NOT EXISTS admin_users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    username TEXT UNIQUE,
    password_hash TEXT NOT NULL,
    name TEXT NOT NULL,
    role TEXT DEFAULT 'owner',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS services (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    price TEXT NOT NULL,
    duration TEXT NOT NULL,
    duration_minutes INTEGER NOT NULL DEFAULT 45,
    description TEXT,
    image TEXT,
    popular INTEGER DEFAULT 0,
    active INTEGER DEFAULT 1,
    online_booking_enabled INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS stylists (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    bio TEXT,
    specialties TEXT,
    image TEXT,
    active INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS working_hours (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    day_of_week INTEGER NOT NULL UNIQUE,
    day_name TEXT NOT NULL,
    is_open INTEGER DEFAULT 1,
    open_time TEXT DEFAULT '09:00',
    close_time TEXT DEFAULT '18:00',
    break_start TEXT DEFAULT '13:00',
    break_end TEXT DEFAULT '14:00'
  );

  CREATE TABLE IF NOT EXISTS blocked_times (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    stylist_id TEXT,
    date TEXT NOT NULL,
    start_time TEXT NOT NULL,
    end_time TEXT NOT NULL,
    reason TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS customers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    phone TEXT NOT NULL UNIQUE,
    email TEXT,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS appointments (
    id TEXT PRIMARY KEY,
    customer_id INTEGER NOT NULL REFERENCES customers(id),
    service_id TEXT NOT NULL REFERENCES services(id),
    stylist_id TEXT REFERENCES stylists(id),
    date TEXT NOT NULL,
    start_time TEXT NOT NULL,
    end_time TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'PENDING',
    customer_notes TEXT,
    internal_notes TEXT,
    cancellation_reason TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS gallery_items (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    service_name TEXT,
    image TEXT NOT NULL,
    description TEXT,
    active INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS offers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    price TEXT,
    image TEXT,
    active INTEGER DEFAULT 1,
    expiry_date TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS salon_settings (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    salon_name TEXT DEFAULT 'MJ Hair Salon',
    tagline TEXT DEFAULT 'Master Hair Styling & Dimensional Color in Round Rock, TX',
    owner_name TEXT DEFAULT 'Malvin Soto',
    experience_years INTEGER DEFAULT 20,
    bio TEXT,
    logo TEXT DEFAULT '/assets/real/mj_logo_square.jpeg',
    phone TEXT DEFAULT '+1 (346) 446-8870',
    phone_raw TEXT DEFAULT '+13464468870',
    whatsapp_number TEXT DEFAULT '13464468870',
    email TEXT DEFAULT 'Tijeraschris@gmail.com',
    address_street TEXT DEFAULT '2000 I-35 Frontage Rd, Suite B2',
    address_city TEXT DEFAULT 'Round Rock',
    address_state TEXT DEFAULT 'TX',
    address_zip TEXT DEFAULT '78681',
    google_maps_url TEXT DEFAULT 'https://www.google.com/maps/search/?api=1&query=2000+I-35+Frontage+Rd+Suite+B2+Round+Rock+TX+78681',
    instagram_url TEXT DEFAULT 'https://www.instagram.com/mj_hair_salon_/',
    booksy_url TEXT DEFAULT 'https://booksy.com/en-us/1655768_mj-hair-salon_hair-salon_37616_round-rock',
    min_booking_notice_hours INTEGER DEFAULT 2,
    max_advance_booking_days INTEGER DEFAULT 60,
    cancellation_enabled INTEGER DEFAULT 1,
    rescheduling_enabled INTEGER DEFAULT 1,
    slot_interval_minutes INTEGER DEFAULT 30,
    cancellation_policy TEXT DEFAULT 'Please provide at least 24 hours notice to reschedule or cancel your appointment.',
    timezone TEXT DEFAULT 'America/Chicago',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS sessions (
    token TEXT PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES admin_users(id),
    expires_at DATETIME NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS inquiries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT NOT NULL,
    message TEXT,
    preferred_service TEXT,
    status TEXT DEFAULT 'NEW',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS reviews (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    author TEXT NOT NULL,
    rating INTEGER DEFAULT 5,
    date TEXT,
    service TEXT,
    comment TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

// Safe migrations for Phase 3
try { db.exec("ALTER TABLE appointments ADD COLUMN reference_image TEXT"); } catch (e) {}
try { db.exec("ALTER TABLE appointments ADD COLUMN reference_title TEXT"); } catch (e) {}

// -------------------------------------------------------------
// Security & Authentication Helpers
// -------------------------------------------------------------
function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  return `${salt}:${hash}`;
}

function verifyPassword(password, stored) {
  if (!stored || !stored.includes(':')) return false;
  const [salt, originalHash] = stored.split(':');
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  return hash === originalHash;
}

function generateToken() {
  return crypto.randomBytes(32).toString('hex');
}

// -------------------------------------------------------------
// Seed Initial Data (Authentic MJ Hair Salon Catalog & Malvin Soto)
// -------------------------------------------------------------
function seedDatabase() {
  // 1. Seed Admin User
  const adminCount = db.prepare('SELECT COUNT(*) as count FROM admin_users').get().count;
  if (adminCount === 0) {
    const passwordHash = hashPassword('SalonOwner2026!');
    db.prepare(`
      INSERT INTO admin_users (email, username, password_hash, name, role)
      VALUES (?, ?, ?, ?, ?)
    `).run('malvin@mjhairsalon.com', 'admin', passwordHash, 'Malvin Soto', 'owner');
  }

  // 2. Seed Salon Settings
  const settingsCount = db.prepare('SELECT COUNT(*) as count FROM salon_settings').get().count;
  if (settingsCount === 0) {
    db.prepare(`
      INSERT INTO salon_settings (
        id, salon_name, tagline, owner_name, experience_years, bio, logo,
        phone, phone_raw, whatsapp_number, email, address_street, address_city,
        address_state, address_zip, google_maps_url, instagram_url, booksy_url,
        min_booking_notice_hours, max_advance_booking_days, cancellation_enabled,
        rescheduling_enabled, slot_interval_minutes, cancellation_policy, timezone
      ) VALUES (
        1, 'MJ Hair Salon', 'Master Hair Styling & Dimensional Color in Round Rock, TX',
        'Malvin Soto', 20,
        'Founded and led by master stylist Malvin Soto with over 20 years of experience in the hair industry, MJ Hair Salon is dedicated to helping clients feel confident, refreshed, and beautiful. Every service is tailored to enhance natural beauty and preserve hair health in a warm, welcoming boutique environment.',
        '/assets/real/mj_logo_square.jpeg', '+1 (346) 446-8870', '+13464468870',
        '13464468870', 'Tijeraschris@gmail.com', '2000 I-35 Frontage Rd, Suite B2',
        'Round Rock', 'TX', '78681',
        'https://www.google.com/maps/search/?api=1&query=2000+I-35+Frontage+Rd+Suite+B2+Round+Rock+TX+78681',
        'https://www.instagram.com/mj_hair_salon_/',
        'https://booksy.com/en-us/1655768_mj-hair-salon_hair-salon_37616_round-rock',
        2, 60, 1, 1, 30,
        'Please provide at least 24 hours notice to reschedule or cancel your appointment.',
        'America/Chicago'
      )
    `).run();
  }

  // 3. Seed Stylists
  const stylistCount = db.prepare('SELECT COUNT(*) as count FROM stylists').get().count;
  if (stylistCount === 0) {
    db.prepare(`
      INSERT INTO stylists (id, name, bio, specialties, image, active)
      VALUES (?, ?, ?, ?, ?, 1)
    `).run(
      'malvin-soto',
      'Malvin Soto',
      'Owner and Master Stylist with over 20 years of experience in precision hair cutting, dimensional balayage, silk press smoothing, and restorative organic treatments.',
      'Dimensional Balayage, Silk Press, Nanoplasty, Precision Haircuts',
      '/assets/real/malvin_work_wa.jpg'
    );
  }

  // 4. Seed Working Hours
  const hoursCount = db.prepare('SELECT COUNT(*) as count FROM working_hours').get().count;
  if (hoursCount === 0) {
    const days = [
      { day: 0, name: 'Sunday', isOpen: 0, open: '09:00', close: '18:00', bStart: '', bEnd: '' },
      { day: 1, name: 'Monday', isOpen: 1, open: '09:00', close: '18:00', bStart: '13:00', bEnd: '14:00' },
      { day: 2, name: 'Tuesday', isOpen: 1, open: '09:00', close: '18:00', bStart: '13:00', bEnd: '14:00' },
      { day: 3, name: 'Wednesday', isOpen: 1, open: '09:00', close: '18:00', bStart: '13:00', bEnd: '14:00' },
      { day: 4, name: 'Thursday', isOpen: 1, open: '09:00', close: '18:00', bStart: '13:00', bEnd: '14:00' },
      { day: 5, name: 'Friday', isOpen: 1, open: '09:00', close: '18:00', bStart: '13:00', bEnd: '14:00' },
      { day: 6, name: 'Saturday', isOpen: 1, open: '09:00', close: '18:00', bStart: '13:00', bEnd: '14:00' },
    ];
    const stmt = db.prepare(`
      INSERT INTO working_hours (day_of_week, day_name, is_open, open_time, close_time, break_start, break_end)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    for (const d of days) {
      stmt.run(d.day, d.name, d.isOpen, d.open, d.close, d.bStart, d.bEnd);
    }
  }

  // 5. Seed Authentic Services
  const servicesCount = db.prepare('SELECT COUNT(*) as count FROM services').get().count;
  if (servicesCount === 0) {
    const INITIAL_SERVICES = [
      {
        id: "female-haircut",
        name: "Female Haircut",
        category: "Haircuts & Styling",
        price: "$100.00",
        duration: "45 min",
        duration_minutes: 45,
        description: "Customized consultation, precision cleansing, master shear cut tailored to your face shape and hair texture, finished with a signature blowout.",
        image: "/assets/real/service_precision_bob.jpeg",
        popular: 1
      },
      {
        id: "short-cut",
        name: "Precision Short Cut",
        category: "Haircuts & Styling",
        price: "$100.00",
        duration: "30 min",
        duration_minutes: 30,
        description: "Expert short architectural cut with meticulous detailing, texturizing, and styling for effortless daily maintenance.",
        image: "/assets/real/service_haircut_layers.jpeg",
        popular: 0
      },
      {
        id: "silk-press-reg",
        name: "Silk Press (Signature)",
        category: "Haircuts & Styling",
        price: "$125.00",
        duration: "1 hr 15 min",
        duration_minutes: 75,
        description: "Deep clarifying wash, intense thermal moisture infusion, precision blowout, and delicate ceramic press for weightless body and glass-like shine.",
        image: "/assets/real/service_silk_press.jpeg",
        popular: 1
      },
      {
        id: "silk-press-short",
        name: "Silk Press Short Hair",
        category: "Haircuts & Styling",
        price: "$110.00",
        duration: "1 hr 15 min",
        duration_minutes: 75,
        description: "Specialized press for shorter natural lengths, restoring silkiness, movement, and sleek texture without chemical alterations.",
        image: "/assets/real/service_silk_press.jpeg",
        popular: 0
      },
      {
        id: "silk-press-med",
        name: "Silk Press Medium Hair",
        category: "Haircuts & Styling",
        price: "$135.00",
        duration: "1 hr 35 min",
        duration_minutes: 95,
        description: "Thermal conditioning treatment and silk press formulated for medium density and shoulder-length textures.",
        image: "/assets/real/service_silk_press.jpeg",
        popular: 0
      },
      {
        id: "silk-press-xl",
        name: "Silk Press Extra Large",
        category: "Haircuts & Styling",
        price: "$150.00",
        duration: "1 hr 45 min",
        duration_minutes: 105,
        description: "Comprehensive silk press for long, ultra-dense or thick textured hair requiring meticulous tension control and deep hydration.",
        image: "/assets/real/service_silk_press.jpeg",
        popular: 0
      },
      {
        id: "wash-style-short",
        name: "Wash and Style Short Hair",
        category: "Haircuts & Styling",
        price: "$60.00",
        duration: "40 min",
        duration_minutes: 40,
        description: "Rejuvenating shampoo, scalp massage, and custom blow-dry styling for shorter silhouettes.",
        image: "/assets/real/insp_gloss_treatment.jpeg",
        popular: 0
      },
      {
        id: "wash-style",
        name: "Wash and Style (Blowout)",
        category: "Haircuts & Styling",
        price: "$70.00+",
        duration: "45 min",
        duration_minutes: 45,
        description: "Luxury shampoo service, restorative conditioner, and voluminous round-brush styling with lasting bounce.",
        image: "/assets/real/insp_gloss_treatment.jpeg",
        popular: 0
      },
      {
        id: "wash-style-long",
        name: "Wash and Style Long Hair",
        category: "Haircuts & Styling",
        price: "$75.00",
        duration: "1 hr",
        duration_minutes: 60,
        description: "Specialized blowout for longer hair, incorporating thermal heat shielding and smooth polished ends.",
        image: "/assets/real/insp_gloss_treatment.jpeg",
        popular: 0
      },
      {
        id: "balayage",
        name: "Full Balayage",
        category: "Color & Blonding",
        price: "$350.00+",
        duration: "2 hr 45 min",
        duration_minutes: 165,
        description: "Signature hand-painted dimensional blonding tailored for seamless, lived-in grow-out. Includes custom toning and bond reinforcement.",
        image: "/assets/real/service_blonde_balayage.jpeg",
        popular: 1
      },
      {
        id: "partial-balayage",
        name: "Partial Balayage",
        category: "Color & Blonding",
        price: "$250.00",
        duration: "1 hr",
        duration_minutes: 60,
        description: "Face-framing and crown dimensional painting to refresh your sun-kissed brightness between full sessions.",
        image: "/assets/real/insp_lived_in_blonde.jpeg",
        popular: 0
      },
      {
        id: "partial-highlights",
        name: "Partial Highlights",
        category: "Color & Blonding",
        price: "$190.00+",
        duration: "1 hr 50 min",
        duration_minutes: 110,
        description: "Precision foil placement focused along the hairline and top canopy for clean contrast and vibrant brightness.",
        image: "/assets/real/service_warm_highlights.jpeg",
        popular: 0
      },
      {
        id: "accent-highlights",
        name: "Accent Highlights",
        category: "Color & Blonding",
        price: "$160.00+",
        duration: "45 min",
        duration_minutes: 45,
        description: "Strategic pop of lightness around the perimeter/moneypiece to illuminate facial features with low maintenance.",
        image: "/assets/real/insp_dimensional_highlights.jpeg",
        popular: 0
      },
      {
        id: "all-over-color",
        name: "All Over Single Process Color",
        category: "Color & Blonding",
        price: "$120.00+",
        duration: "1 hr",
        duration_minutes: 60,
        description: "Rich monochromatic root-to-tip hue delivery with high-shine pigments, full gray coverage, and cuticle conditioning.",
        image: "/assets/real/igora_royal_color.jpg",
        popular: 0
      },
      {
        id: "root-touchup",
        name: "Root Touch-Up",
        category: "Color & Blonding",
        price: "$120.00+",
        duration: "1 hr 30 min",
        duration_minutes: 90,
        description: "Precise new growth color matching, seamless blending, and gray coverage to maintain consistency between major appointments.",
        image: "/assets/real/service_color_melt.jpeg",
        popular: 0
      },
      {
        id: "gloss-toner",
        name: "Gloss or Toner",
        category: "Color & Blonding",
        price: "$100.00+",
        duration: "30 min",
        duration_minutes: 30,
        description: "Translucent demi-permanent gloss to eliminate brassiness, refresh faded color tone, and impart mirror-like brilliance.",
        image: "/assets/real/service_color_melt.jpeg",
        popular: 0
      },
      {
        id: "color-correction",
        name: "Color Correction",
        category: "Color & Blonding",
        price: "$120.00+",
        duration: "2 hr",
        duration_minutes: 120,
        description: "Specialized restorative color transformation. Prior consultation recommended to map structural integrity and target goals.",
        image: "/assets/real/insp_caramel_brunette.jpeg",
        popular: 0
      },
      {
        id: "nanoplasty",
        name: "Nanoplasty Treatment",
        category: "Treatments & Health",
        price: "Price upon consult",
        duration: "3 hrs",
        duration_minutes: 180,
        description: "Advanced nanotechnological organic treatment that reconfigures, deeply hydrates, and straightens hair fibers, maintaining smooth, frizz-free hair for up to 4 months.",
        image: "/assets/real/service_nanoplasty_smooth.jpeg",
        popular: 1
      },
      {
        id: "brazilian-straightening",
        name: "Brazilian Hair Straightening",
        category: "Treatments & Health",
        price: "$280.00+",
        duration: "4 hrs",
        duration_minutes: 240,
        description: "Long-lasting smoothing treatment that seals the cuticle, eliminates humidity-induced frizz, and dramatically cuts styling time.",
        image: "/assets/real/service_straightening_result.jpeg",
        popular: 1
      },
      {
        id: "olaplex-full",
        name: "Olaplex Full Bond Building Service",
        category: "Treatments & Health",
        price: "$100.00",
        duration: "40 min",
        duration_minutes: 40,
        description: "Two-step patented bond multiplier that repairs broken disulfide bonds caused by thermal, chemical, and mechanical damage.",
        image: "/assets/real/insp_gloss_treatment.jpeg",
        popular: 0
      },
      {
        id: "olaplex-add",
        name: "Olaplex Add-On to Color",
        category: "Treatments & Health",
        price: "$100.00",
        duration: "15 min",
        duration_minutes: 15,
        description: "Concentrated bond protector mixed directly into color or lightener formulations to prevent damage during processing.",
        image: "/assets/real/moroccanoil_pro.jpg",
        popular: 0
      },
      {
        id: "scalp-treatment",
        name: "Scalp Detox & Rejuvenation",
        category: "Treatments & Health",
        price: "$100.00",
        duration: "30 min",
        duration_minutes: 30,
        description: "Targeted scalp exfoliation, follicle purification, and nourishing serum infusion to foster optimal hair growth and relieve tightness.",
        image: "/assets/real/pivot_point_pro.jpg",
        popular: 0
      },
      {
        id: "consultation",
        name: "One-on-One Hair Consultation",
        category: "Special Occasions",
        price: "$60.00",
        duration: "30 min",
        duration_minutes: 30,
        description: "Dedicated diagnosis of hair texture, scalp health, color history, and custom treatment plan prior to significant transformations.",
        image: "/assets/real/booksy_biz_salon.jpeg",
        popular: 0
      }
    ];

    const stmt = db.prepare(`
      INSERT INTO services (id, name, category, price, duration, duration_minutes, description, image, popular, active, online_booking_enabled)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1, 1)
    `);
    for (const s of INITIAL_SERVICES) {
      stmt.run(s.id, s.name, s.category, s.price, s.duration, s.duration_minutes, s.description, s.image, s.popular);
    }
  }

  // 6. Seed Gallery Items
  const galleryCount = db.prepare('SELECT COUNT(*) as count FROM gallery_items').get().count;
  if (galleryCount === 0) {
    const INITIAL_GALLERY = [
      { id: "gal-1", title: "Signature Dimensional Blonde Balayage", category: "Hair Color", service_name: "Full Balayage", image: "/assets/real/service_blonde_balayage.jpeg", description: "Seamless hand-painted blonding with soft root shadow and radiant brightness." },
      { id: "gal-2", title: "Glass Finish Silk Press", category: "Styling", service_name: "Silk Press (Signature)", image: "/assets/real/service_silk_press.jpeg", description: "Healthy thermal infusion providing weightless movement and mirror shine on textured hair." },
      { id: "gal-3", title: "Warm Multidimensional Foil Highlights", category: "Hair Color", service_name: "Partial Highlights", image: "/assets/real/service_warm_highlights.jpeg", description: "Detailed foil placement creating natural depth, warmth, and sun-lit illumination." },
      { id: "gal-4", title: "Restorative Nanoplasty Smoothing", category: "Treatments", service_name: "Nanoplasty Treatment", image: "/assets/real/service_nanoplasty_smooth.jpeg", description: "Organic nanotech smoothing treatment delivering frizz control and lasting softness." },
      { id: "gal-5", title: "Lived-In Caramel Brunette Melt", category: "Hair Color", service_name: "Full Balayage", image: "/assets/real/insp_caramel_brunette.jpeg", description: "Rich dark brunette dimension with caramel undertones tailored for effortless grow-out." },
      { id: "gal-6", title: "Precision Textured Bob Cut", category: "Haircuts", service_name: "Female Haircut", image: "/assets/real/service_precision_bob.jpeg", description: "Architectural line cut with interior weight removal for effortless styling." },
      { id: "gal-7", title: "Lived-In Dimensional Foil Work", category: "Hair Color", service_name: "Accent Highlights", image: "/assets/real/insp_dimensional_highlights.jpeg", description: "Illuminating face-framing brightness and blended dimension." },
      { id: "gal-8", title: "Brazilian Straightening & Frizz Shield", category: "Treatments", service_name: "Brazilian Hair Straightening", image: "/assets/real/service_straightening_result.jpeg", description: "Cuticle alignment and thermal seal shielding against Central Texas humidity." },
      { id: "gal-9", title: "Precision Layering & Face Frame", category: "Haircuts", service_name: "Female Haircut", image: "/assets/real/service_haircut_layers.jpeg", description: "Custom shear texturizing with tailored face-framing layers." },
      { id: "gal-10", title: "Lived-In Blonde Refresh", category: "Hair Color", service_name: "Partial Balayage", image: "/assets/real/insp_lived_in_blonde.jpeg", description: "Lived-in root melt and refreshed blonde highlights." },
      { id: "gal-11", title: "Gloss Color Melt & Tone Balance", category: "Hair Color", service_name: "Gloss or Toner", image: "/assets/real/service_color_melt.jpeg", description: "Demi-permanent gloss eliminating brass and adding luminous reflection." },
      { id: "gal-12", title: "MJ Hair Salon Round Rock Studio", category: "Styling", service_name: "One-on-One Hair Consultation", image: "/assets/real/booksy_biz_salon.jpeg", description: "Private boutique salon setting in Round Rock, TX with personalized 1-on-1 care." }
    ];

    const stmt = db.prepare(`
      INSERT INTO gallery_items (id, title, category, service_name, image, description, active)
      VALUES (?, ?, ?, ?, ?, ?, 1)
    `);
    for (const g of INITIAL_GALLERY) {
      stmt.run(g.id, g.title, g.category, g.service_name, g.image, g.description);
    }
  }
}

seedDatabase();

// -------------------------------------------------------------
// Time & Scheduling Helper Functions
// -------------------------------------------------------------
function timeToMinutes(str) {
  if (!str) return 0;
  const [h, m] = str.split(':').map(Number);
  return (h || 0) * 60 + (m || 0);
}

function minutesToTime(mins) {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

function intervalsOverlap(s1, e1, s2, e2) {
  return s1 < e2 && e1 > s2;
}

function getSettings() {
  const row = db.prepare('SELECT * FROM salon_settings WHERE id = 1').get();
  return row || {};
}

// -------------------------------------------------------------
// Authentication Middleware
// -------------------------------------------------------------
function requireAdminAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, error: "Unauthorized. Please sign in to access the salon dashboard." });
  }

  const token = authHeader.split(' ')[1];
  const session = db.prepare(`
    SELECT s.*, u.id as user_id, u.email, u.name, u.role
    FROM sessions s
    JOIN admin_users u ON s.user_id = u.id
    WHERE s.token = ? AND datetime(s.expires_at) > datetime('now')
  `).get(token);

  if (!session) {
    return res.status(401).json({ success: false, error: "Session expired or invalid. Please sign in again." });
  }

  req.adminUser = {
    id: session.user_id,
    email: session.email,
    name: session.name,
    role: session.role
  };
  req.sessionToken = token;
  next();
}

// -------------------------------------------------------------
// Public Client Endpoints
// -------------------------------------------------------------

// 1. Salon Info & Settings
app.get('/api/salon', (req, res) => {
  const s = getSettings();
  const hoursRows = db.prepare('SELECT * FROM working_hours ORDER BY day_of_week ASC').all();
  
  const formattedHours = hoursRows.map(h => ({
    day: h.day_name,
    time: h.is_open ? `${h.open_time} – ${h.close_time}` : 'Closed',
    isOpen: Boolean(h.is_open)
  }));

  res.json({
    success: true,
    data: {
      name: s.salon_name,
      tagline: s.tagline,
      owner: s.owner_name,
      experienceYears: s.experience_years,
      bio: s.bio,
      logo: s.logo,
      icon: "/assets/real/mj_icon_512.png",
      interiorImage: "/assets/real/booksy_biz_salon.jpeg",
      heroImage: "/assets/real/service_blonde_balayage.jpeg",
      stylistImage: "/assets/real/malvin_work_wa.jpg",
      address: {
        street: s.address_street,
        city: s.address_city,
        state: s.address_state,
        zip: s.address_zip,
        full: `${s.address_street}, ${s.address_city}, ${s.address_state} ${s.address_zip}`,
        googleMapsEmbedUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3439.439818818804!2d-97.68114492383832!3d30.50830497469371!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8644d2719ef1bb33%3A0x8e8eb46a5996b539!2s2000%20Interstate%2035%20Frontage%20Rd%20suite%20b2%2C%20Round%20Rock%2C%20TX%2078681!5e0!3m2!1sen!2sus!4v1710000000000!5m2!1sen!2sus",
        directionsUrl: s.google_maps_url
      },
      contact: {
        phone: s.phone,
        phoneRaw: s.phone_raw,
        email: s.email,
        whatsappUrl: `https://wa.me/${s.whatsapp_number}?text=Hello%20MJ%20Hair%20Salon,%20I%20would%20like%20to%20inquire%20about%20booking%20an%20appointment.`,
        whatsappNumber: s.whatsapp_number,
        instagram: s.instagram_url,
        instagramHandle: "@mj_hair_salon_",
        booksyUrl: s.booksy_url
      },
      hours: formattedHours,
      bookingSettings: {
        minNoticeHours: s.min_booking_notice_hours,
        maxAdvanceDays: s.max_advance_booking_days,
        cancellationEnabled: Boolean(s.cancellation_enabled),
        reschedulingEnabled: Boolean(s.rescheduling_enabled),
        cancellationPolicy: s.cancellation_policy
      }
    }
  });
});

// 2. Active Services for Customer Booking
app.get('/api/services', (req, res) => {
  const { category, onlineOnly } = req.query;
  let sql = 'SELECT * FROM services WHERE active = 1';
  const params = [];

  if (onlineOnly === 'true') {
    sql += ' AND online_booking_enabled = 1';
  }

  if (category && category !== 'All') {
    sql += ' AND LOWER(category) = LOWER(?)';
    params.push(category);
  }

  sql += ' ORDER BY popular DESC, name ASC';
  const rows = db.prepare(sql).all(...params);

  // Format popular flag as boolean
  const formatted = rows.map(r => ({
    ...r,
    popular: Boolean(r.popular),
    active: Boolean(r.active),
    online_booking_enabled: Boolean(r.online_booking_enabled)
  }));

  res.json({ success: true, data: formatted });
});

// 3. Service Categories
app.get('/api/services/categories', (req, res) => {
  const rows = db.prepare('SELECT DISTINCT category FROM services WHERE active = 1').all();
  const categories = ['All', ...rows.map(r => r.category)];
  res.json({ success: true, data: categories });
});

// 4. Stylists for Customer Booking
app.get('/api/stylists', (req, res) => {
  const rows = db.prepare('SELECT id, name, bio, specialties, image FROM stylists WHERE active = 1').all();
  res.json({ success: true, data: rows });
});

// 5. Gallery Items
app.get('/api/gallery', (req, res) => {
  const { category } = req.query;
  let sql = 'SELECT * FROM gallery_items WHERE active = 1';
  const params = [];

  if (category && category !== 'All') {
    sql += ' AND LOWER(category) = LOWER(?)';
    params.push(category);
  }

  const rows = db.prepare(sql).all(...params);
  res.json({ success: true, data: rows });
});

// 6. Hair Inspiration
app.get('/api/inspiration', (req, res) => {
  const rows = db.prepare(`
    SELECT g.id, g.title, g.category, g.description, g.image,
           COALESCE(s.id, 'consultation') as serviceId,
           COALESCE(s.name, g.service_name, 'Hair Consultation') as serviceName
    FROM gallery_items g
    LEFT JOIN services s ON LOWER(g.service_name) = LOWER(s.name)
    WHERE g.active = 1
    LIMIT 8
  `).all();
  res.json({ success: true, data: rows });
});

// 7. Active Offers
app.get('/api/offers', (req, res) => {
  const today = new Date().toISOString().split('T')[0];
  const rows = db.prepare(`
    SELECT * FROM offers
    WHERE active = 1 AND (expiry_date IS NULL OR expiry_date >= ?)
    ORDER BY id DESC
  `).all(today);
  res.json({ success: true, data: rows });
});

// 8. Testimonials
app.get('/api/testimonials', (req, res) => {
  const s = getSettings();
  const reviews = db.prepare('SELECT * FROM reviews ORDER BY id DESC').all();
  res.json({
    success: true,
    data: reviews,
    booksyUrl: s.booksy_url,
    instagramProfile: s.instagram_url
  });
});

// -------------------------------------------------------------
// DYNAMIC AVAILABILITY GENERATION & DOUBLE-BOOKING PROTECTION
// -------------------------------------------------------------
app.get('/api/availability', (req, res) => {
  try {
    const { serviceId, date, stylistId } = req.query;

    if (!serviceId || !date) {
      return res.status(400).json({ success: false, error: "serviceId and date (YYYY-MM-DD) are required." });
    }

    // Validate date format YYYY-MM-DD
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return res.status(400).json({ success: false, error: "Invalid date format. Expected YYYY-MM-DD." });
    }

    // Load Service
    const service = db.prepare('SELECT * FROM services WHERE id = ?').get(serviceId);
    if (!service || !service.active) {
      return res.status(404).json({ success: false, error: "Service not found or inactive." });
    }

    const durationMinutes = Number(service.duration_minutes) || 45;
    const settings = getSettings();
    const slotInterval = Number(settings.slot_interval_minutes) || 30;
    const minNoticeHours = Number(settings.min_booking_notice_hours) || 2;
    const maxAdvanceDays = Number(settings.max_advance_booking_days) || 60;

    // Date range boundaries
    const now = new Date();
    const selectedDate = new Date(`${date}T00:00:00`);
    const todayStr = now.toISOString().split('T')[0];

    // Check if date is in the past
    if (date < todayStr) {
      return res.json({
        success: true,
        date,
        isClosed: true,
        reason: "Selected date is in the past.",
        slots: []
      });
    }

    // Check max advance booking
    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + maxAdvanceDays);
    const maxDateStr = maxDate.toISOString().split('T')[0];
    if (date > maxDateStr) {
      return res.json({
        success: true,
        date,
        isClosed: true,
        reason: `Appointments can only be booked up to ${maxAdvanceDays} days in advance.`,
        slots: []
      });
    }

    // Determine Day of Week (0 = Sun, 1 = Mon, ..., 6 = Sat)
    // Use UTC date parts to prevent timezone drift
    const [y, m, d] = date.split('-').map(Number);
    const dayOfWeek = new Date(y, m - 1, d).getDay();

    // Check Working Hours
    const workingDay = db.prepare('SELECT * FROM working_hours WHERE day_of_week = ?').get(dayOfWeek);
    if (!workingDay || !workingDay.is_open) {
      return res.json({
        success: true,
        date,
        isClosed: true,
        reason: "Salon is closed on this day.",
        slots: []
      });
    }

    const openMin = timeToMinutes(workingDay.open_time);
    const closeMin = timeToMinutes(workingDay.close_time);
    const breakStartMin = workingDay.break_start ? timeToMinutes(workingDay.break_start) : null;
    const breakEndMin = workingDay.break_end ? timeToMinutes(workingDay.break_end) : null;

    // Load Blocked Times for this date
    let blockedTimesSql = 'SELECT start_time, end_time, reason FROM blocked_times WHERE date = ?';
    const blockedParams = [date];
    if (stylistId) {
      blockedTimesSql += ' AND (stylist_id IS NULL OR stylist_id = ?)';
      blockedParams.push(stylistId);
    }
    const blockedTimes = db.prepare(blockedTimesSql).all(...blockedParams);

    // Load Existing Active Appointments for this date
    // PENDING and CONFIRMED hold the slot to prevent double-booking
    let apptSql = `
      SELECT start_time, end_time, status, stylist_id
      FROM appointments
      WHERE date = ? AND status IN ('PENDING', 'CONFIRMED')
    `;
    const apptParams = [date];
    if (stylistId) {
      apptSql += ' AND (stylist_id IS NULL OR stylist_id = ?)';
      apptParams.push(stylistId);
    }
    const existingAppts = db.prepare(apptSql).all(...apptParams);

    // Calculate current time buffer if booking for today
    let earliestAllowedMin = 0;
    if (date === todayStr) {
      // Local current minutes + notice buffer
      const currentHours = now.getHours();
      const currentMinutes = now.getMinutes();
      const currentTotalMinutes = currentHours * 60 + currentMinutes;
      earliestAllowedMin = currentTotalMinutes + (minNoticeHours * 60);
    }

    // Generate Slots
    const availableSlots = [];
    for (let slotStart = openMin; slotStart + durationMinutes <= closeMin; slotStart += slotInterval) {
      const slotEnd = slotStart + durationMinutes;

      // 1. Check if slot is in the past or violates notice for today
      if (date === todayStr && slotStart < earliestAllowedMin) {
        continue;
      }

      // 2. Check overlap with salon break/lunch
      if (breakStartMin !== null && breakEndMin !== null && breakStartMin < breakEndMin) {
        if (intervalsOverlap(slotStart, slotEnd, breakStartMin, breakEndMin)) {
          continue;
        }
      }

      // 3. Check overlap with Blocked Times
      let isBlocked = false;
      for (const b of blockedTimes) {
        const bStart = timeToMinutes(b.start_time);
        const bEnd = timeToMinutes(b.end_time);
        if (intervalsOverlap(slotStart, slotEnd, bStart, bEnd)) {
          isBlocked = true;
          break;
        }
      }
      if (isBlocked) continue;

      // 4. Check overlap with Existing Appointments
      let hasConflict = false;
      for (const appt of existingAppts) {
        const aStart = timeToMinutes(appt.start_time);
        const aEnd = timeToMinutes(appt.end_time);
        if (intervalsOverlap(slotStart, slotEnd, aStart, aEnd)) {
          hasConflict = true;
          break;
        }
      }
      if (hasConflict) continue;

      // Slot is available!
      availableSlots.push(minutesToTime(slotStart));
    }

    res.json({
      success: true,
      date,
      dayName: workingDay.day_name,
      service: {
        id: service.id,
        name: service.name,
        duration: service.duration,
        durationMinutes: durationMinutes,
        price: service.price
      },
      slots: availableSlots
    });
  } catch (err) {
    console.error("Availability calculation error:", err);
    res.status(500).json({ success: false, error: "Unable to calculate availability at this time." });
  }
});

// -------------------------------------------------------------
// Real Appointment Booking with Atomic Double-Booking Check
// -------------------------------------------------------------
app.post('/api/appointments', (req, res) => {
  try {
    const {
      serviceId,
      date,
      startTime,
      stylistId,
      customerName,
      customerPhone,
      customerEmail,
      customerNotes,
      referenceImage,
      referenceTitle
    } = req.body;

    // Validate Required Customer Fields
    if (!serviceId || !date || !startTime || !customerName || !customerPhone) {
      return res.status(400).json({
        success: false,
        error: "Service, date, time slot, full name, and phone number are all required."
      });
    }

    // Clean Phone String
    const cleanPhone = String(customerPhone).trim();
    const cleanName = String(customerName).trim();
    if (cleanPhone.length < 7) {
      return res.status(400).json({
        success: false,
        error: "Please provide a valid phone number so we can reach you regarding your appointment."
      });
    }

    // Verify Service Exists and is Active
    const service = db.prepare('SELECT * FROM services WHERE id = ? AND active = 1').get(serviceId);
    if (!service) {
      return res.status(404).json({ success: false, error: "The selected service is currently unavailable." });
    }

    const durationMinutes = Number(service.duration_minutes) || 45;
    const startMin = timeToMinutes(startTime);
    const endMin = startMin + durationMinutes;
    const endTime = minutesToTime(endMin);

    // ATOMIC TRANSACTION FOR DOUBLE-BOOKING PROTECTION
    db.exec('BEGIN IMMEDIATE');

    try {
      // 1. Verify working day and hours
      const [y, m, d] = date.split('-').map(Number);
      const dayOfWeek = new Date(y, m - 1, d).getDay();
      const workingDay = db.prepare('SELECT * FROM working_hours WHERE day_of_week = ?').get(dayOfWeek);

      if (!workingDay || !workingDay.is_open) {
        db.exec('ROLLBACK');
        return res.status(400).json({ success: false, error: "The salon is closed on the selected date." });
      }

      const openMin = timeToMinutes(workingDay.open_time);
      const closeMin = timeToMinutes(workingDay.close_time);
      if (startMin < openMin || endMin > closeMin) {
        db.exec('ROLLBACK');
        return res.status(400).json({ success: false, error: "The appointment duration extends outside salon operating hours." });
      }

      // Check break
      if (workingDay.break_start && workingDay.break_end) {
        const bStart = timeToMinutes(workingDay.break_start);
        const bEnd = timeToMinutes(workingDay.break_end);
        if (intervalsOverlap(startMin, endMin, bStart, bEnd)) {
          db.exec('ROLLBACK');
          return res.status(409).json({
            success: false,
            error: "This time slot is no longer available. Please choose another time."
          });
        }
      }

      // 2. Check Blocked Times conflict
      let blockedSql = 'SELECT * FROM blocked_times WHERE date = ?';
      const blockedParams = [date];
      if (stylistId) {
        blockedSql += ' AND (stylist_id IS NULL OR stylist_id = ?)';
        blockedParams.push(stylistId);
      }
      const blockedList = db.prepare(blockedSql).all(...blockedParams);
      for (const b of blockedList) {
        const bs = timeToMinutes(b.start_time);
        const be = timeToMinutes(b.end_time);
        if (intervalsOverlap(startMin, endMin, bs, be)) {
          db.exec('ROLLBACK');
          return res.status(409).json({
            success: false,
            error: "This time slot is no longer available. Please choose another time."
          });
        }
      }

      // 3. Check Existing Active Appointments Conflict (PENDING or CONFIRMED)
      let conflictSql = `
        SELECT id, start_time, end_time, status
        FROM appointments
        WHERE date = ? AND status IN ('PENDING', 'CONFIRMED')
      `;
      const conflictParams = [date];
      if (stylistId) {
        conflictSql += ' AND (stylist_id IS NULL OR stylist_id = ?)';
        conflictParams.push(stylistId);
      }
      const existingAppts = db.prepare(conflictSql).all(...conflictParams);

      for (const appt of existingAppts) {
        const as = timeToMinutes(appt.start_time);
        const ae = timeToMinutes(appt.end_time);
        if (intervalsOverlap(startMin, endMin, as, ae)) {
          db.exec('ROLLBACK');
          return res.status(409).json({
            success: false,
            error: "This time slot is no longer available. Please choose another time."
          });
        }
      }

      // 4. Find or Create Customer record (primary key by phone)
      let customer = db.prepare('SELECT * FROM customers WHERE phone = ?').get(cleanPhone);
      let customerId;
      if (customer) {
        customerId = customer.id;
        // Update name or email if provided
        db.prepare(`
          UPDATE customers
          SET name = ?, email = COALESCE(?, email), updated_at = CURRENT_TIMESTAMP
          WHERE id = ?
        `).run(cleanName, customerEmail || null, customerId);
      } else {
        const custResult = db.prepare(`
          INSERT INTO customers (name, phone, email, notes)
          VALUES (?, ?, ?, ?)
        `).run(cleanName, cleanPhone, customerEmail || '', '');
        customerId = custResult.lastInsertRowid;
      }

      // 5. Generate Human-Readable Appointment ID
      const randomDigits = Math.floor(1000 + Math.random() * 9000);
      const appointmentId = `MJ-${randomDigits}`;

      // 6. Insert Appointment with default status: PENDING
      db.prepare(`
        INSERT INTO appointments (
          id, customer_id, service_id, stylist_id, date, start_time, end_time,
          status, customer_notes, internal_notes, reference_image, reference_title
        ) VALUES (?, ?, ?, ?, ?, ?, ?, 'PENDING', ?, '', ?, ?)
      `).run(
        appointmentId,
        customerId,
        service.id,
        stylistId || 'malvin-soto',
        date,
        startTime,
        endTime,
        customerNotes || '',
        referenceImage || null,
        referenceTitle || null
      );

      db.exec('COMMIT');

      const settings = getSettings();
      let whatsappMsg = `Hello Malvin, I just booked an appointment request at MJ Hair Salon!\n\nAppointment ID: ${appointmentId}\nName: ${cleanName}\nService: ${service.name}\nDate: ${date}\nTime: ${startTime}\nDuration: ${service.duration}\nPrice: ${service.price}`;
      if (referenceTitle) {
        whatsappMsg += `\nReference Look: ${referenceTitle}`;
      }
      whatsappMsg += `\n\nPlease let me know when confirmed. Thank you!`;
      const whatsappDeepLink = `https://wa.me/${settings.whatsapp_number || '13464468870'}?text=${encodeURIComponent(whatsappMsg)}`;

      res.status(201).json({
        success: true,
        data: {
          appointmentId,
          status: "PENDING",
          customerName: cleanName,
          customerPhone: cleanPhone,
          service: {
            id: service.id,
            name: service.name,
            price: service.price,
            duration: service.duration
          },
          date,
          startTime,
          endTime,
          referenceImage: referenceImage || null,
          referenceTitle: referenceTitle || null,
          whatsappUrl: whatsappDeepLink
        },
        message: "Your appointment request has been received with status PENDING. Malvin will review and confirm your reservation."
      });
    } catch (txErr) {
      db.exec('ROLLBACK');
      throw txErr;
    }
  } catch (err) {
    console.error("Booking error:", err);
    res.status(500).json({ success: false, error: "An unexpected error occurred while booking. Please try again." });
  }
});

// -------------------------------------------------------------
// Customer Appointment Lookup
// -------------------------------------------------------------
app.post('/api/appointments/lookup', (req, res) => {
  try {
    const { appointmentId, phone } = req.body;
    if (!appointmentId || !phone) {
      return res.status(400).json({ success: false, error: "Please provide both Appointment ID and your phone number." });
    }

    const cleanId = String(appointmentId).trim().toUpperCase();
    const cleanPhone = String(phone).trim();

    const appt = db.prepare(`
      SELECT a.id, a.date, a.start_time, a.end_time, a.status, a.customer_notes, a.created_at,
             a.reference_image, a.reference_title,
             s.name as service_name, s.price as service_price, s.duration as service_duration,
             st.name as stylist_name,
             c.phone as customer_phone
      FROM appointments a
      JOIN services s ON a.service_id = s.id
      JOIN customers c ON a.customer_id = c.id
      LEFT JOIN stylists st ON a.stylist_id = st.id
      WHERE UPPER(a.id) = ?
    `).get(cleanId);

    if (!appt) {
      return res.status(404).json({ success: false, error: "No appointment found matching this ID and phone number." });
    }

    // Verify phone match (last 7 digits minimum check)
    const storedClean = appt.customer_phone.replace(/\D/g, '');
    const enteredClean = cleanPhone.replace(/\D/g, '');
    if (!storedClean.endsWith(enteredClean) && !enteredClean.endsWith(storedClean)) {
      return res.status(404).json({ success: false, error: "No appointment found matching this ID and phone number." });
    }

    const settings = getSettings();

    res.json({
      success: true,
      data: {
        id: appt.id,
        service: appt.service_name,
        price: appt.service_price,
        duration: appt.service_duration,
        stylist: appt.stylist_name || 'Malvin Soto',
        date: appt.date,
        startTime: appt.start_time,
        endTime: appt.end_time,
        status: appt.status,
        customerNotes: appt.customer_notes,
        referenceImage: appt.reference_image || null,
        referenceTitle: appt.reference_title || null,
        createdAt: appt.created_at,
        cancellationPolicy: settings.cancellation_policy,
        canCancel: Boolean(settings.cancellation_enabled && appt.status !== 'CANCELLED' && appt.status !== 'COMPLETED'),
        canReschedule: Boolean(settings.rescheduling_enabled && appt.status !== 'CANCELLED' && appt.status !== 'COMPLETED')
      }
    });
  } catch (err) {
    console.error("Lookup error:", err);
    res.status(500).json({ success: false, error: "Unable to retrieve appointment." });
  }
});

// Customer Request Cancellation
app.post('/api/appointments/cancel-request', (req, res) => {
  try {
    const { appointmentId, phone, reason } = req.body;
    if (!appointmentId || !phone) {
      return res.status(400).json({ success: false, error: "Appointment ID and phone number are required." });
    }

    const cleanId = String(appointmentId).trim().toUpperCase();
    const appt = db.prepare(`
      SELECT a.*, c.phone as customer_phone
      FROM appointments a
      JOIN customers c ON a.customer_id = c.id
      WHERE UPPER(a.id) = ?
    `).get(cleanId);

    if (!appt) {
      return res.status(404).json({ success: false, error: "Appointment not found." });
    }

    const storedClean = appt.customer_phone.replace(/\D/g, '');
    const enteredClean = String(phone).replace(/\D/g, '');
    if (!storedClean.endsWith(enteredClean) && !enteredClean.endsWith(storedClean)) {
      return res.status(403).json({ success: false, error: "Phone number verification failed." });
    }

    if (appt.status === 'CANCELLED') {
      return res.status(400).json({ success: false, error: "This appointment is already cancelled." });
    }

    // In accordance with policy, update status to CANCELLED or record request
    db.prepare(`
      UPDATE appointments
      SET status = 'CANCELLED',
          cancellation_reason = ?,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(reason || 'Cancelled by customer', appt.id);

    res.json({
      success: true,
      message: "Your appointment has been cancelled. We look forward to seeing you in the future."
    });
  } catch (err) {
    console.error("Cancel request error:", err);
    res.status(500).json({ success: false, error: "Unable to process cancellation request." });
  }
});

// -------------------------------------------------------------
// General Contact Inquiries
// -------------------------------------------------------------
app.post('/api/inquiries', (req, res) => {
  try {
    const { name, email, phone, message, preferred_service } = req.body;
    if (!name || !phone) {
      return res.status(400).json({ success: false, error: "Name and phone number are required." });
    }

    const stmt = db.prepare(`
      INSERT INTO inquiries (name, email, phone, message, preferred_service, status)
      VALUES (?, ?, ?, ?, ?, 'NEW')
    `);
    const result = stmt.run(name, email || '', phone, message || '', preferred_service || '');

    res.json({
      success: true,
      message: "Thank you for reaching out to MJ Hair Salon! We will respond promptly.",
      id: result.lastInsertRowid
    });
  } catch (err) {
    console.error("Inquiry error:", err);
    res.status(500).json({ success: false, error: "Internal server error." });
  }
});

// -------------------------------------------------------------
// ADMIN AUTHENTICATION
// -------------------------------------------------------------
app.post('/api/auth/login', (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ success: false, error: "Username/email and password are required." });
    }

    const cleanUser = String(username).trim().toLowerCase();
    const user = db.prepare(`
      SELECT * FROM admin_users
      WHERE LOWER(email) = ? OR LOWER(username) = ?
    `).get(cleanUser, cleanUser);

    if (!user || !verifyPassword(password, user.password_hash)) {
      return res.status(401).json({ success: false, error: "Invalid credentials. Please verify your login details." });
    }

    // Generate Session Token valid for 7 days
    const token = generateToken();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

    db.prepare(`
      INSERT INTO sessions (token, user_id, expires_at)
      VALUES (?, ?, ?)
    `).run(token, user.id, expiresAt);

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ success: false, error: "Server authentication error." });
  }
});

app.get('/api/auth/me', requireAdminAuth, (req, res) => {
  res.json({
    success: true,
    user: req.adminUser
  });
});

app.post('/api/auth/logout', requireAdminAuth, (req, res) => {
  db.prepare('DELETE FROM sessions WHERE token = ?').run(req.sessionToken);
  res.json({ success: true, message: "Signed out successfully." });
});

// -------------------------------------------------------------
// ADMIN DASHBOARD & METRICS
// -------------------------------------------------------------
app.get('/api/admin/dashboard', requireAdminAuth, (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];

    // Counts
    const todayCount = db.prepare(`SELECT COUNT(*) as c FROM appointments WHERE date = ?`).get(today).c;
    const pendingCount = db.prepare(`SELECT COUNT(*) as c FROM appointments WHERE status = 'PENDING'`).get().c;
    const confirmedCount = db.prepare(`SELECT COUNT(*) as c FROM appointments WHERE status = 'CONFIRMED'`).get().c;
    const completedCount = db.prepare(`SELECT COUNT(*) as c FROM appointments WHERE status = 'COMPLETED'`).get().c;
    const cancelledCount = db.prepare(`SELECT COUNT(*) as c FROM appointments WHERE status = 'CANCELLED'`).get().c;

    // Today's Appointments with details
    const todayAppointments = db.prepare(`
      SELECT a.id, a.date, a.start_time, a.end_time, a.status, a.customer_notes, a.internal_notes,
             a.reference_image, a.reference_title,
             c.name as customer_name, c.phone as customer_phone, c.email as customer_email,
             s.name as service_name, s.price as service_price, s.duration as service_duration,
             st.name as stylist_name
      FROM appointments a
      JOIN customers c ON a.customer_id = c.id
      JOIN services s ON a.service_id = s.id
      LEFT JOIN stylists st ON a.stylist_id = st.id
      WHERE a.date = ?
      ORDER BY a.start_time ASC
    `).all(today);

    // Upcoming appointments (next 7 days)
    const upcomingAppointments = db.prepare(`
      SELECT a.id, a.date, a.start_time, a.end_time, a.status, a.customer_notes,
             a.reference_image, a.reference_title,
             c.name as customer_name, c.phone as customer_phone,
             s.name as service_name, s.price as service_price,
             st.name as stylist_name
      FROM appointments a
      JOIN customers c ON a.customer_id = c.id
      JOIN services s ON a.service_id = s.id
      LEFT JOIN stylists st ON a.stylist_id = st.id
      WHERE a.date >= ? AND a.status IN ('PENDING', 'CONFIRMED')
      ORDER BY a.date ASC, a.start_time ASC
      LIMIT 15
    `).all(today);

    // Calculate revenue for completed appointments today
    let todayRevenue = 0;
    for (const appt of todayAppointments) {
      if (appt.status === 'COMPLETED' || appt.status === 'CONFIRMED') {
        const num = parseFloat(String(appt.service_price).replace(/[^0-9.]/g, '')) || 0;
        todayRevenue += num;
      }
    }

    res.json({
      success: true,
      stats: {
        todayCount,
        pendingCount,
        confirmedCount,
        completedCount,
        cancelledCount,
        todayRevenue: `$${todayRevenue.toFixed(2)}`
      },
      todayAppointments,
      upcomingAppointments
    });
  } catch (err) {
    console.error("Dashboard error:", err);
    res.status(500).json({ success: false, error: "Failed to load dashboard metrics." });
  }
});

// -------------------------------------------------------------
// ADMIN APPOINTMENTS CRUD & ACTIONS
// -------------------------------------------------------------
app.get('/api/admin/appointments', requireAdminAuth, (req, res) => {
  try {
    const { status, date, search } = req.query;
    let sql = `
      SELECT a.id, a.date, a.start_time, a.end_time, a.status, a.customer_notes, a.internal_notes, a.created_at,
             a.reference_image, a.reference_title,
             c.id as customer_id, c.name as customer_name, c.phone as customer_phone, c.email as customer_email,
             s.id as service_id, s.name as service_name, s.price as service_price, s.duration as service_duration,
             st.id as stylist_id, st.name as stylist_name
      FROM appointments a
      JOIN customers c ON a.customer_id = c.id
      JOIN services s ON a.service_id = s.id
      LEFT JOIN stylists st ON a.stylist_id = st.id
      WHERE 1=1
    `;
    const params = [];

    if (status && status !== 'ALL') {
      sql += ' AND a.status = ?';
      params.push(status);
    }
    if (date) {
      sql += ' AND a.date = ?';
      params.push(date);
    }
    if (search) {
      sql += ' AND (c.name LIKE ? OR c.phone LIKE ? OR a.id LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    sql += ' ORDER BY a.date DESC, a.start_time DESC LIMIT 100';
    const rows = db.prepare(sql).all(...params);

    res.json({ success: true, data: rows });
  } catch (err) {
    console.error("Fetch appointments error:", err);
    res.status(500).json({ success: false, error: "Failed to load appointments." });
  }
});

app.get('/api/admin/appointments/:id', requireAdminAuth, (req, res) => {
  const row = db.prepare(`
    SELECT a.*,
           c.name as customer_name, c.phone as customer_phone, c.email as customer_email,
           s.name as service_name, s.price as service_price, s.duration as service_duration, s.duration_minutes,
           st.name as stylist_name
    FROM appointments a
    JOIN customers c ON a.customer_id = c.id
    JOIN services s ON a.service_id = s.id
    LEFT JOIN stylists st ON a.stylist_id = st.id
    WHERE a.id = ?
  `).get(req.params.id);

  if (!row) {
    return res.status(404).json({ success: false, error: "Appointment not found." });
  }
  res.json({ success: true, data: row });
});

// Update Appointment Status (CONFIRMED, REJECTED, COMPLETED, NO_SHOW, CANCELLED)
app.patch('/api/admin/appointments/:id/status', requireAdminAuth, (req, res) => {
  try {
    const { status, internalNotes } = req.body;
    const allowed = ['PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED', 'REJECTED', 'NO_SHOW'];
    if (!allowed.includes(status)) {
      return res.status(400).json({ success: false, error: "Invalid status value." });
    }

    db.prepare(`
      UPDATE appointments
      SET status = ?,
          internal_notes = COALESCE(?, internal_notes),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(status, internalNotes || null, req.params.id);

    res.json({ success: true, message: `Appointment status updated to ${status}.` });
  } catch (err) {
    console.error("Update status error:", err);
    res.status(500).json({ success: false, error: "Failed to update appointment status." });
  }
});

// Reschedule Appointment (With Double-Booking Conflict Check)
app.post('/api/admin/appointments/:id/reschedule', requireAdminAuth, (req, res) => {
  try {
    const { newDate, newStartTime, stylistId } = req.body;
    if (!newDate || !newStartTime) {
      return res.status(400).json({ success: false, error: "New date and start time are required." });
    }

    const appt = db.prepare(`
      SELECT a.*, s.duration_minutes
      FROM appointments a
      JOIN services s ON a.service_id = s.id
      WHERE a.id = ?
    `).get(req.params.id);

    if (!appt) {
      return res.status(404).json({ success: false, error: "Appointment not found." });
    }

    const duration = Number(appt.duration_minutes) || 45;
    const startMin = timeToMinutes(newStartTime);
    const endMin = startMin + duration;
    const newEndTime = minutesToTime(endMin);

    db.exec('BEGIN IMMEDIATE');
    try {
      // Conflict check against other appointments (excluding this one)
      let conflictSql = `
        SELECT id, start_time, end_time
        FROM appointments
        WHERE date = ? AND id != ? AND status IN ('PENDING', 'CONFIRMED')
      `;
      const conflictParams = [newDate, appt.id];
      const targetStylist = stylistId || appt.stylist_id;
      if (targetStylist) {
        conflictSql += ' AND (stylist_id IS NULL OR stylist_id = ?)';
        conflictParams.push(targetStylist);
      }
      const existing = db.prepare(conflictSql).all(...conflictParams);

      for (const e of existing) {
        const es = timeToMinutes(e.start_time);
        const ee = timeToMinutes(e.end_time);
        if (intervalsOverlap(startMin, endMin, es, ee)) {
          db.exec('ROLLBACK');
          return res.status(409).json({
            success: false,
            error: "This time slot is no longer available. Please choose another time."
          });
        }
      }

      // Check blocked times
      const blocked = db.prepare('SELECT start_time, end_time FROM blocked_times WHERE date = ?').all(newDate);
      for (const b of blocked) {
        const bs = timeToMinutes(b.start_time);
        const be = timeToMinutes(b.end_time);
        if (intervalsOverlap(startMin, endMin, bs, be)) {
          db.exec('ROLLBACK');
          return res.status(409).json({
            success: false,
            error: "This time slot overlaps with a blocked period."
          });
        }
      }

      // Apply Reschedule
      db.prepare(`
        UPDATE appointments
        SET date = ?,
            start_time = ?,
            end_time = ?,
            stylist_id = COALESCE(?, stylist_id),
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).run(newDate, newStartTime, newEndTime, targetStylist, appt.id);

      db.exec('COMMIT');
      res.json({
        success: true,
        message: "Appointment successfully rescheduled.",
        data: { date: newDate, startTime: newStartTime, endTime: newEndTime }
      });
    } catch (txErr) {
      db.exec('ROLLBACK');
      throw txErr;
    }
  } catch (err) {
    console.error("Reschedule error:", err);
    res.status(500).json({ success: false, error: "Failed to reschedule appointment." });
  }
});

// Update internal notes
app.patch('/api/admin/appointments/:id/notes', requireAdminAuth, (req, res) => {
  try {
    const { internalNotes } = req.body;
    db.prepare(`
      UPDATE appointments
      SET internal_notes = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(internalNotes || '', req.params.id);
    res.json({ success: true, message: "Internal notes saved." });
  } catch (err) {
    res.status(500).json({ success: false, error: "Failed to update notes." });
  }
});

// -------------------------------------------------------------
// ADMIN CUSTOMERS MANAGEMENT
// -------------------------------------------------------------
app.get('/api/admin/customers', requireAdminAuth, (req, res) => {
  try {
    const { search } = req.query;
    let sql = `
      SELECT c.*,
             COUNT(a.id) as total_appointments,
             SUM(CASE WHEN a.status = 'COMPLETED' THEN 1 ELSE 0 END) as completed_appointments,
             SUM(CASE WHEN a.status = 'CANCELLED' THEN 1 ELSE 0 END) as cancelled_appointments,
             MAX(a.date) as last_appointment_date
      FROM customers c
      LEFT JOIN appointments a ON c.id = a.customer_id
      WHERE 1=1
    `;
    const params = [];

    if (search) {
      sql += ' AND (c.name LIKE ? OR c.phone LIKE ? OR c.email LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    sql += ' GROUP BY c.id ORDER BY last_appointment_date DESC NULLS LAST, c.created_at DESC';
    const rows = db.prepare(sql).all(...params);

    res.json({ success: true, data: rows });
  } catch (err) {
    console.error("Fetch customers error:", err);
    res.status(500).json({ success: false, error: "Failed to load customers." });
  }
});

app.get('/api/admin/customers/:id', requireAdminAuth, (req, res) => {
  try {
    const customer = db.prepare('SELECT * FROM customers WHERE id = ?').get(req.params.id);
    if (!customer) {
      return res.status(404).json({ success: false, error: "Customer not found." });
    }

    const appointments = db.prepare(`
      SELECT a.*, s.name as service_name, s.price as service_price, st.name as stylist_name
      FROM appointments a
      JOIN services s ON a.service_id = s.id
      LEFT JOIN stylists st ON a.stylist_id = st.id
      WHERE a.customer_id = ?
      ORDER BY a.date DESC, a.start_time DESC
    `).all(customer.id);

    res.json({
      success: true,
      data: {
        ...customer,
        appointments
      }
    });
  } catch (err) {
    console.error("Customer detail error:", err);
    res.status(500).json({ success: false, error: "Failed to load customer profile." });
  }
});

// -------------------------------------------------------------
// ADMIN SERVICES MANAGEMENT
// -------------------------------------------------------------
app.get('/api/admin/services', requireAdminAuth, (req, res) => {
  const rows = db.prepare('SELECT * FROM services ORDER BY category ASC, name ASC').all();
  res.json({ success: true, data: rows });
});

app.post('/api/admin/services', requireAdminAuth, (req, res) => {
  try {
    const { name, category, price, duration, durationMinutes, description, image, popular, onlineBookingEnabled } = req.body;
    if (!name || !price || !category) {
      return res.status(400).json({ success: false, error: "Name, price, and category are required." });
    }

    const id = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + '-' + Math.floor(100 + Math.random() * 900);
    const durMins = Number(durationMinutes) || 45;
    const durText = duration || `${durMins} min`;

    db.prepare(`
      INSERT INTO services (
        id, name, category, price, duration, duration_minutes,
        description, image, popular, active, online_booking_enabled
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?)
    `).run(
      id,
      name,
      category,
      price,
      durText,
      durMins,
      description || '',
      image || '/assets/real/service_precision_bob.jpeg',
      popular ? 1 : 0,
      onlineBookingEnabled !== false ? 1 : 0
    );

    res.status(201).json({ success: true, message: "Service created successfully.", id });
  } catch (err) {
    console.error("Create service error:", err);
    res.status(500).json({ success: false, error: "Failed to create service." });
  }
});

app.put('/api/admin/services/:id', requireAdminAuth, (req, res) => {
  try {
    const { name, category, price, duration, durationMinutes, description, image, popular, active, onlineBookingEnabled } = req.body;

    db.prepare(`
      UPDATE services
      SET name = COALESCE(?, name),
          category = COALESCE(?, category),
          price = COALESCE(?, price),
          duration = COALESCE(?, duration),
          duration_minutes = COALESCE(?, duration_minutes),
          description = COALESCE(?, description),
          image = COALESCE(?, image),
          popular = COALESCE(?, popular),
          active = COALESCE(?, active),
          online_booking_enabled = COALESCE(?, online_booking_enabled),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(
      name,
      category,
      price,
      duration,
      durationMinutes ? Number(durationMinutes) : null,
      description,
      image,
      popular !== undefined ? (popular ? 1 : 0) : null,
      active !== undefined ? (active ? 1 : 0) : null,
      onlineBookingEnabled !== undefined ? (onlineBookingEnabled ? 1 : 0) : null,
      req.params.id
    );

    res.json({ success: true, message: "Service updated successfully." });
  } catch (err) {
    console.error("Update service error:", err);
    res.status(500).json({ success: false, error: "Failed to update service." });
  }
});

app.patch('/api/admin/services/:id/toggle', requireAdminAuth, (req, res) => {
  try {
    const { field } = req.body; // 'active' or 'online_booking_enabled'
    if (field === 'online_booking_enabled') {
      db.prepare(`UPDATE services SET online_booking_enabled = CASE WHEN online_booking_enabled = 1 THEN 0 ELSE 1 END WHERE id = ?`).run(req.params.id);
    } else {
      db.prepare(`UPDATE services SET active = CASE WHEN active = 1 THEN 0 ELSE 1 END WHERE id = ?`).run(req.params.id);
    }
    res.json({ success: true, message: "Service state updated." });
  } catch (err) {
    res.status(500).json({ success: false, error: "Failed to toggle service state." });
  }
});

// -------------------------------------------------------------
// ADMIN STYLISTS MANAGEMENT
// -------------------------------------------------------------
app.get('/api/admin/stylists', requireAdminAuth, (req, res) => {
  const rows = db.prepare('SELECT * FROM stylists ORDER BY name ASC').all();
  res.json({ success: true, data: rows });
});

app.post('/api/admin/stylists', requireAdminAuth, (req, res) => {
  try {
    const { name, bio, specialties, image } = req.body;
    if (!name) {
      return res.status(400).json({ success: false, error: "Stylist name is required." });
    }
    const id = name.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Math.floor(100 + Math.random() * 900);

    db.prepare(`
      INSERT INTO stylists (id, name, bio, specialties, image, active)
      VALUES (?, ?, ?, ?, ?, 1)
    `).run(id, name, bio || '', specialties || '', image || '/assets/real/malvin_work_wa.jpg');

    res.status(201).json({ success: true, message: "Stylist added successfully.", id });
  } catch (err) {
    res.status(500).json({ success: false, error: "Failed to add stylist." });
  }
});

app.put('/api/admin/stylists/:id', requireAdminAuth, (req, res) => {
  try {
    const { name, bio, specialties, image, active } = req.body;
    db.prepare(`
      UPDATE stylists
      SET name = COALESCE(?, name),
          bio = COALESCE(?, bio),
          specialties = COALESCE(?, specialties),
          image = COALESCE(?, image),
          active = COALESCE(?, active),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(
      name,
      bio,
      specialties,
      image,
      active !== undefined ? (active ? 1 : 0) : null,
      req.params.id
    );

    res.json({ success: true, message: "Stylist updated successfully." });
  } catch (err) {
    res.status(500).json({ success: false, error: "Failed to update stylist." });
  }
});

// -------------------------------------------------------------
// ADMIN WORKING HOURS & BLOCKED TIMES
// -------------------------------------------------------------
app.get('/api/admin/working-hours', requireAdminAuth, (req, res) => {
  const rows = db.prepare('SELECT * FROM working_hours ORDER BY day_of_week ASC').all();
  res.json({ success: true, data: rows });
});

app.put('/api/admin/working-hours', requireAdminAuth, (req, res) => {
  try {
    const { hours } = req.body; // array of 7 days
    if (!Array.isArray(hours)) {
      return res.status(400).json({ success: false, error: "Hours array expected." });
    }

    const stmt = db.prepare(`
      UPDATE working_hours
      SET is_open = ?,
          open_time = ?,
          close_time = ?,
          break_start = ?,
          break_end = ?
      WHERE day_of_week = ?
    `);

    for (const h of hours) {
      stmt.run(
        h.is_open ? 1 : 0,
        h.open_time || '09:00',
        h.close_time || '18:00',
        h.break_start || '',
        h.break_end || '',
        h.day_of_week
      );
    }

    res.json({ success: true, message: "Working hours successfully updated." });
  } catch (err) {
    console.error("Hours update error:", err);
    res.status(500).json({ success: false, error: "Failed to update working hours." });
  }
});

app.get('/api/admin/blocked-times', requireAdminAuth, (req, res) => {
  const rows = db.prepare(`
    SELECT b.*, st.name as stylist_name
    FROM blocked_times b
    LEFT JOIN stylists st ON b.stylist_id = st.id
    ORDER BY b.date DESC, b.start_time ASC
  `).all();
  res.json({ success: true, data: rows });
});

app.post('/api/admin/blocked-times', requireAdminAuth, (req, res) => {
  try {
    const { date, startTime, endTime, reason, stylistId } = req.body;
    if (!date || !startTime || !endTime || !reason) {
      return res.status(400).json({ success: false, error: "Date, start time, end time, and reason are required." });
    }

    const result = db.prepare(`
      INSERT INTO blocked_times (date, start_time, end_time, reason, stylist_id)
      VALUES (?, ?, ?, ?, ?)
    `).run(date, startTime, endTime, reason, stylistId || null);

    res.status(201).json({ success: true, message: "Time blocked successfully.", id: result.lastInsertRowid });
  } catch (err) {
    console.error("Block time error:", err);
    res.status(500).json({ success: false, error: "Failed to block time." });
  }
});

app.delete('/api/admin/blocked-times/:id', requireAdminAuth, (req, res) => {
  db.prepare('DELETE FROM blocked_times WHERE id = ?').run(req.params.id);
  res.json({ success: true, message: "Blocked time removed." });
});

// -------------------------------------------------------------
// ADMIN INQUIRIES MANAGEMENT
// -------------------------------------------------------------
app.get('/api/admin/inquiries', requireAdminAuth, (req, res) => {
  const rows = db.prepare('SELECT * FROM inquiries ORDER BY created_at DESC').all();
  res.json({ success: true, data: rows });
});

app.patch('/api/admin/inquiries/:id/status', requireAdminAuth, (req, res) => {
  const { status } = req.body; // NEW, RESOLVED, ARCHIVED
  db.prepare('UPDATE inquiries SET status = ? WHERE id = ?').run(status || 'RESOLVED', req.params.id);
  res.json({ success: true, message: "Inquiry status updated." });
});

app.delete('/api/admin/inquiries/:id', requireAdminAuth, (req, res) => {
  db.prepare('DELETE FROM inquiries WHERE id = ?').run(req.params.id);
  res.json({ success: true, message: "Inquiry deleted." });
});

// -------------------------------------------------------------
// ADMIN GALLERY MANAGEMENT
// -------------------------------------------------------------
app.get('/api/admin/gallery', requireAdminAuth, (req, res) => {
  const rows = db.prepare('SELECT * FROM gallery_items ORDER BY created_at DESC').all();
  res.json({ success: true, data: rows });
});

app.post('/api/admin/gallery', requireAdminAuth, (req, res) => {
  try {
    const { title, category, serviceName, image, description } = req.body;
    if (!title || !category || !image) {
      return res.status(400).json({ success: false, error: "Title, category, and image URL are required." });
    }

    const id = 'gal-' + Math.floor(1000 + Math.random() * 9000);
    db.prepare(`
      INSERT INTO gallery_items (id, title, category, service_name, image, description, active)
      VALUES (?, ?, ?, ?, ?, ?, 1)
    `).run(id, title, category, serviceName || '', image, description || '');

    res.status(201).json({ success: true, message: "Gallery item added.", id });
  } catch (err) {
    res.status(500).json({ success: false, error: "Failed to add gallery item." });
  }
});

app.delete('/api/admin/gallery/:id', requireAdminAuth, (req, res) => {
  db.prepare('DELETE FROM gallery_items WHERE id = ?').run(req.params.id);
  res.json({ success: true, message: "Gallery item removed." });
});

// -------------------------------------------------------------
// ADMIN OFFERS MANAGEMENT
// -------------------------------------------------------------
app.get('/api/admin/offers', requireAdminAuth, (req, res) => {
  const rows = db.prepare('SELECT * FROM offers ORDER BY created_at DESC').all();
  res.json({ success: true, data: rows });
});

app.post('/api/admin/offers', requireAdminAuth, (req, res) => {
  try {
    const { title, description, price, image, expiryDate } = req.body;
    if (!title || !description) {
      return res.status(400).json({ success: false, error: "Title and description are required." });
    }

    const result = db.prepare(`
      INSERT INTO offers (title, description, price, image, expiry_date, active)
      VALUES (?, ?, ?, ?, ?, 1)
    `).run(title, description, price || '', image || '', expiryDate || null);

    res.status(201).json({ success: true, message: "Offer created successfully.", id: result.lastInsertRowid });
  } catch (err) {
    res.status(500).json({ success: false, error: "Failed to create offer." });
  }
});

app.delete('/api/admin/offers/:id', requireAdminAuth, (req, res) => {
  db.prepare('DELETE FROM offers WHERE id = ?').run(req.params.id);
  res.json({ success: true, message: "Offer deleted." });
});

// -------------------------------------------------------------
// ADMIN SALON SETTINGS
// -------------------------------------------------------------
app.get('/api/admin/settings', requireAdminAuth, (req, res) => {
  const s = getSettings();
  res.json({ success: true, data: s });
});

app.put('/api/admin/settings', requireAdminAuth, (req, res) => {
  try {
    const {
      salon_name, tagline, owner_name, experience_years, bio, logo,
      phone, phone_raw, whatsapp_number, email, address_street,
      address_city, address_state, address_zip, google_maps_url,
      instagram_url, booksy_url, min_booking_notice_hours,
      max_advance_booking_days, cancellation_enabled, rescheduling_enabled,
      slot_interval_minutes, cancellation_policy, timezone
    } = req.body;

    db.prepare(`
      UPDATE salon_settings
      SET salon_name = COALESCE(?, salon_name),
          tagline = COALESCE(?, tagline),
          owner_name = COALESCE(?, owner_name),
          experience_years = COALESCE(?, experience_years),
          bio = COALESCE(?, bio),
          logo = COALESCE(?, logo),
          phone = COALESCE(?, phone),
          phone_raw = COALESCE(?, phone_raw),
          whatsapp_number = COALESCE(?, whatsapp_number),
          email = COALESCE(?, email),
          address_street = COALESCE(?, address_street),
          address_city = COALESCE(?, address_city),
          address_state = COALESCE(?, address_state),
          address_zip = COALESCE(?, address_zip),
          google_maps_url = COALESCE(?, google_maps_url),
          instagram_url = COALESCE(?, instagram_url),
          booksy_url = COALESCE(?, booksy_url),
          min_booking_notice_hours = COALESCE(?, min_booking_notice_hours),
          max_advance_booking_days = COALESCE(?, max_advance_booking_days),
          cancellation_enabled = COALESCE(?, cancellation_enabled),
          rescheduling_enabled = COALESCE(?, rescheduling_enabled),
          slot_interval_minutes = COALESCE(?, slot_interval_minutes),
          cancellation_policy = COALESCE(?, cancellation_policy),
          timezone = COALESCE(?, timezone),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = 1
    `).run(
      salon_name, tagline, owner_name,
      experience_years ? Number(experience_years) : null,
      bio, logo, phone, phone_raw, whatsapp_number, email,
      address_street, address_city, address_state, address_zip,
      google_maps_url, instagram_url, booksy_url,
      min_booking_notice_hours ? Number(min_booking_notice_hours) : null,
      max_advance_booking_days ? Number(max_advance_booking_days) : null,
      cancellation_enabled !== undefined ? (cancellation_enabled ? 1 : 0) : null,
      rescheduling_enabled !== undefined ? (rescheduling_enabled ? 1 : 0) : null,
      slot_interval_minutes ? Number(slot_interval_minutes) : null,
      cancellation_policy, timezone
    );

    res.json({ success: true, message: "Salon settings updated successfully." });
  } catch (err) {
    console.error("Update settings error:", err);
    res.status(500).json({ success: false, error: "Failed to update salon settings." });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: "ok", salon: "MJ Hair Salon", phase: 3, timestamp: new Date().toISOString() });
});

// Vite middleware in dev or static files in production
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`MJ Hair Salon Phase 2 server active on http://0.0.0.0:${PORT}`);
  });
}

startServer();
