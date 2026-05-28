/**
 * Hidden AI Content Moderation System
 *
 * Wildlife-only platform — detect, warn, and restrict non-animal uploads.
 * Normal users never see moderation internals.
 * Admin sees full surveillance dashboard.
 *
 * Warning ladder: 1 → 2 → 3 → 30-day upload ban (auto-lifts)
 */

import { db } from "./firebase";
import {
  doc, getDoc, setDoc, updateDoc, arrayUnion, serverTimestamp,
} from "firebase/firestore";

// ─── Keyword detection ────────────────────────────────────────────────────────

const WILDLIFE_KEYWORDS = [
  "animal","lion","tiger","bear","bird","fish","forest","wildlife","nature","jungle",
  "ocean","elephant","shark","whale","dolphin","eagle","snake","reptile","insect",
  "mammal","desert","mountain","sea","river","wild","park","zoo","habitat","safari",
  "wolf","cheetah","gorilla","crocodile","penguin","butterfly","deer","fox","rabbit",
  "frog","bat","hawk","falcon","buffalo","giraffe","zebra","rhino","hippo","leopard",
  "panda","koala","kangaroo","otter","seal","orca","squid","octopus","coral","reef",
  "savanna","rainforest","wetland","swamp","tundra","cave","nest","den","herd","flock",
  "migration","predator","prey","ecosystem","biodiversity","species","fauna","flora",
  "botanical","botanical","wilderness","sanctuary","national park","conservation",
];

const BLOCKED_KEYWORDS = [
  "fight","battle","war","gun","weapon","blood","gore","movie","film","cinema",
  "song","music","dance","concert","gaming","game","minecraft","fortnite","roblox",
  "adult","nude","sexy","tiktok dance","comedy","meme","funny video","prank",
];

/**
 * Check if content (caption + filename) is wildlife-appropriate.
 * Returns { allowed: boolean, reason: string | null }
 */
export function analyzeContent(caption = "", filename = "") {
  const text = `${caption} ${filename}`.toLowerCase();

  const hasBlocked = BLOCKED_KEYWORDS.some(k => text.includes(k));
  if (hasBlocked) {
    const blocked = BLOCKED_KEYWORDS.find(k => text.includes(k));
    return { allowed: false, reason: `Contains blocked content: "${blocked}"` };
  }

  const hasWildlife = WILDLIFE_KEYWORDS.some(k => text.includes(k));
  if (!hasWildlife && text.trim().length > 0) {
    return { allowed: false, reason: "No wildlife or nature keywords detected" };
  }

  return { allowed: true, reason: null };
}

// ─── Firestore moderation records ─────────────────────────────────────────────

const MODERATION_COL = "userModeration";
const BAN_DURATION_MS = 30 * 24 * 60 * 60 * 1000; // 30 days
const MAX_WARNINGS = 3;

export async function getModerationStatus(uid) {
  if (!uid) return { warnings: 0, bannedUntil: null, violations: [], permanentBan: false };
  try {
    const snap = await getDoc(doc(db, MODERATION_COL, uid));
    if (!snap.exists()) return { warnings: 0, bannedUntil: null, violations: [], permanentBan: false };
    return snap.data();
  } catch {
    return { warnings: 0, bannedUntil: null, violations: [], permanentBan: false };
  }
}

export function isCurrentlyBanned(status) {
  if (!status) return false;
  if (status.permanentBan) return true;
  if (!status.bannedUntil) return false;
  return Date.now() < status.bannedUntil;
}

export function getBanTimeLeft(status) {
  if (!status?.bannedUntil) return null;
  const ms = status.bannedUntil - Date.now();
  if (ms <= 0) return null;
  const days = Math.floor(ms / (1000 * 60 * 60 * 24));
  const hours = Math.floor((ms % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  return `${days}d ${hours}h`;
}

/**
 * Record a violation and auto-ban at 3 warnings.
 * Returns the updated status object.
 */
export async function recordViolation(uid, reason) {
  if (!uid) return null;
  try {
    const ref = doc(db, MODERATION_COL, uid);
    const snap = await getDoc(ref);
    const current = snap.exists() ? snap.data() : { warnings: 0, bannedUntil: null, violations: [], permanentBan: false };

    const newWarnings = (current.warnings || 0) + 1;
    const newViolation = { reason, date: Date.now() };
    const shouldBan = newWarnings >= MAX_WARNINGS;

    const update = {
      warnings: newWarnings,
      violations: arrayUnion(newViolation),
      lastViolation: Date.now(),
    };
    if (shouldBan) {
      update.bannedUntil = Date.now() + BAN_DURATION_MS;
      update.banReason = "3 policy violations";
    }

    await setDoc(ref, update, { merge: true });
    return { ...current, ...update, violations: [...(current.violations || []), newViolation] };
  } catch (e) {
    console.warn("Moderation record failed:", e.message);
    return null;
  }
}

// ─── Admin actions ─────────────────────────────────────────────────────────────

export async function adminRemoveWarning(uid) {
  const ref = doc(db, MODERATION_COL, uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) return;
  const w = Math.max(0, (snap.data().warnings || 1) - 1);
  await updateDoc(ref, { warnings: w, bannedUntil: null });
}

export async function adminRemoveBan(uid) {
  await setDoc(doc(db, MODERATION_COL, uid), { bannedUntil: null, warnings: 0 }, { merge: true });
}

export async function adminPermanentBan(uid) {
  await setDoc(doc(db, MODERATION_COL, uid), { permanentBan: true, bannedUntil: null }, { merge: true });
}

export async function adminClearAll(uid) {
  await setDoc(doc(db, MODERATION_COL, uid), { warnings: 0, bannedUntil: null, violations: [], permanentBan: false });
}

/**
 * Load all moderation records for admin dashboard.
 * Reads the whole collection (small — only violated users have docs).
 */
export async function adminLoadAllModerations() {
  try {
    const { collection, getDocs, orderBy, query } = await import("firebase/firestore");
    const q = query(collection(db, MODERATION_COL));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ uid: d.id, ...d.data() }));
  } catch {
    return [];
  }
}
