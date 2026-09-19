/**
 * Dedicated Cross-Tab / Cross-Window Synchronization Bus
 * Keeps Main POS Window and Standalone Call Screen Popup in real-time sync.
 */

import { getPopupWindowRef } from './popup';

const CHANNEL_NAME = 'kio_pos_sync_channel';

let channelInstance: BroadcastChannel | null = null;

export const getSyncChannel = (): BroadcastChannel | null => {
  if (typeof window === 'undefined' || !('BroadcastChannel' in window)) {
    return null;
  }
  if (!channelInstance) {
    try {
      channelInstance = new BroadcastChannel(CHANNEL_NAME);
    } catch (err) {
      console.warn('BroadcastChannel not available:', err);
      channelInstance = null;
    }
  }
  return channelInstance;
};

export const broadcastSyncMessage = (data: any) => {
  // 1. BroadcastChannel (same browser partition)
  try {
    const ch = getSyncChannel();
    if (ch) {
      ch.postMessage(data);
    }
  } catch (err) {
    console.warn('Broadcast postMessage failed:', err);
  }

  // 2. Direct Window postMessage to popup window (crosses iframe & storage partitions!)
  try {
    const popup = getPopupWindowRef();
    if (popup && !popup.closed) {
      popup.postMessage(data, '*');
    }
  } catch (err) {
    console.warn('Direct popup postMessage failed:', err);
  }

  // 3. Direct Window postMessage to opener window (if running inside popup)
  try {
    if (typeof window !== 'undefined' && window.opener && !window.opener.closed) {
      window.opener.postMessage(data, '*');
    }
  } catch {}
};
