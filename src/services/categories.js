import { promises as fs } from 'fs';
import path from 'path';

const CATEGORIES_PATH = path.join(process.cwd(), 'data', 'categories.json');

const DEFAULTS = [
  { key: 'bathroom_deep_clean', label: 'Bathroom Deep Clean', icon: 'shower', sortOrder: 10 },
  { key: 'vent_cleaning', label: 'Vent Cleaning', icon: 'air', sortOrder: 20 },
  { key: 'general_cleaning', label: 'General Cleaning', icon: 'cleaning_services', sortOrder: 30 },
  { key: 'night_shift', label: 'Night Shift', icon: 'dark_mode', sortOrder: 40 },
  { key: 'overnight_maintenance', label: 'Overnight Maintenance', icon: 'engineering', sortOrder: 45 },
  { key: 'cockroach_spraying', label: 'Cockroach Spraying', icon: 'pest_control', sortOrder: 50 },
  { key: 'ac_check', label: 'AC Check', icon: 'ac_unit', sortOrder: 60 },
  { key: 'hardware_check', label: 'Hardware Check', icon: 'build', sortOrder: 70 },
  { key: 'supplies', label: 'Supplies', icon: 'inventory_2', sortOrder: 80 },
  { key: 'bed_frame_check', label: 'Bed Frame Check', icon: 'bed', sortOrder: 90 },
  { key: 'curtain_rod_check', label: 'Curtain Rod Check', icon: 'curtains', sortOrder: 100 },
  { key: 'other', label: 'Other', icon: 'more_horiz', sortOrder: 999 },
];

async function ensureDir() {
  const dir = path.dirname(CATEGORIES_PATH);
  await fs.mkdir(dir, { recursive: true });
}

export async function getCategories() {
  await ensureDir();
  try {
    const raw = await fs.readFile(CATEGORIES_PATH, 'utf-8');
    const data = JSON.parse(raw);
    if (Array.isArray(data) && data.length > 0) return data;
  } catch {}
  await writeCategories(DEFAULTS);
  return DEFAULTS;
}

async function writeCategories(categories) {
  await ensureDir();
  await fs.writeFile(CATEGORIES_PATH, JSON.stringify(categories, null, 2), 'utf-8');
}

export async function addCategory({ key, label, icon = 'build' }) {
  const cats = await getCategories();
  if (cats.find(c => c.key === key)) {
    throw new Error(`Category "${key}" already exists`);
  }
  const maxOrder = cats.reduce((max, c) => Math.max(max, c.sortOrder || 0), 0);
  const newCat = { key, label, icon, sortOrder: maxOrder + 1 };
  cats.push(newCat);
  await writeCategories(cats);
  return newCat;
}

export async function updateCategory(key, updates) {
  const cats = await getCategories();
  const idx = cats.findIndex(c => c.key === key);
  if (idx === -1) throw new Error(`Category "${key}" not found`);
  cats[idx] = { ...cats[idx], ...updates, key };
  await writeCategories(cats);
  return cats[idx];
}

export async function deleteCategory(key) {
  const cats = await getCategories();
  const defKeys = DEFAULTS.map(d => d.key);
  if (defKeys.includes(key)) {
    throw new Error('Cannot delete a default category');
  }
  const filtered = cats.filter(c => c.key !== key);
  await writeCategories(filtered);
  return { success: true };
}
