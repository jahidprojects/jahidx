import type { VercelRequest, VercelResponse } from '@vercel/node';
import { adminDb } from './firebaseAdmin.js';
import { FieldValue } from 'firebase-admin/firestore';
import crypto from 'crypto';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const initData = req.headers['authorization']?.replace('Bearer ', '') || req.body?.initData;
  if (!initData) return res.status(401).json({ error: 'Unauthorized: No initData provided' });

  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  let user: any = null;

  if (!botToken) {
    if (process.env.NODE_ENV === 'production') {
       return res.status(500).json({ error: 'TELEGRAM_BOT_TOKEN not configured' });
    }
  } else {
    try {
      const urlParams = new URLSearchParams(initData);
      const hash = urlParams.get('hash');
      urlParams.delete('hash');

      const dataCheckString = Array.from(urlParams.entries())
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([key, value]) => `${key}=${value}`)
        .join('\n');

      const secretKey = crypto.createHmac('sha256', 'WebAppData').update(botToken).digest();
      const calculatedHash = crypto.createHmac('sha256', secretKey).update(dataCheckString).digest('hex');

      if (calculatedHash !== hash && process.env.NODE_ENV === 'production') {
        return res.status(403).json({ error: 'Forbidden: Invalid initData hash' });
      }

      const userJson = urlParams.get('user');
      if (userJson) {
        user = JSON.parse(userJson);
      }
    } catch (error) {
      return res.status(403).json({ error: 'Forbidden: Error parsing initData' });
    }
  }

  const { taskId, firebaseUid, duckReward = 50000, tonReward = 0 } = req.body;
  
  if (!firebaseUid) {
    return res.status(400).json({ error: 'Missing firebaseUid in payload' });
  }

  try {
    const userRef = adminDb.collection('users').doc(firebaseUid);
    const userSnap = await userRef.get();

    if (!userSnap.exists) {
      return res.status(404).json({ error: 'User not found in database' });
    }

    const userData = userSnap.data();
    
    // Security verification
    if (user && userData?.tgId && process.env.NODE_ENV === 'production') {
      if (userData.tgId.toString() !== user.id.toString()) {
        return res.status(403).json({ error: 'Identity Mismatch: Firebase User does not belong to this Telegram Identity.' });
      }
    }

    // Check if task already completed
    if (userData?.completedTasks?.includes(taskId)) {
       return res.status(400).json({ error: 'Task already completed' });
    }

    // Enforce logic
    await userRef.update({
      completedTasks: FieldValue.arrayUnion(taskId),
      [`taskCompletionTimes.${taskId}`]: FieldValue.serverTimestamp(),
      balance: FieldValue.increment(Math.floor(parseFloat(duckReward.toString()))),
      tonBalance: FieldValue.increment(parseFloat(tonReward.toString()))
    });

    return res.status(200).json({ ok: true, message: 'Reward granted securely via backend.' });
  } catch (err) {
    console.error('Task Backend Error:', err);
    return res.status(500).json({ error: 'Internal Server Error during task resolution' });
  }
}
