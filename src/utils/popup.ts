/**
 * Utility to open the Call Screen (DID) in a real browser popup window
 * Designed for dual-screen POS setups (main POS + customer/kitchen DID monitor).
 */

let activePopupWindow: Window | null = null;

export const getPopupWindowRef = (): Window | null => {
  if (activePopupWindow && !activePopupWindow.closed) {
    return activePopupWindow;
  }
  return null;
};

export const setPopupWindowRef = (w: Window | null) => {
  activePopupWindow = w;
};

export const openCallScreenPopup = (): boolean => {
  if (typeof window === 'undefined') return false;

  const url = `${window.location.origin}${window.location.pathname}?view=call-screen#call-screen`;
  const width = Math.min(1366, Math.floor(window.screen.width * 0.85));
  const height = Math.min(850, Math.floor(window.screen.height * 0.85));
  const left = Math.max(0, (window.screen.width - width) / 2);
  const top = Math.max(0, (window.screen.height - height) / 2);

  try {
    const popup = window.open(
      url,
      'KioPosCallScreenPopup',
      `width=${width},height=${height},top=${top},left=${left},status=no,menubar=no,toolbar=no,location=no,resizable=yes,scrollbars=yes`
    );

    if (!popup || popup.closed || typeof popup.closed === 'undefined') {
      // If blocked by browser popup blocker, fallback to _blank
      const fallback = window.open(url, '_blank');
      if (fallback) {
        activePopupWindow = fallback;
      }
      return !!fallback;
    }

    activePopupWindow = popup;
    popup.focus();
    return true;
  } catch (err) {
    console.warn('Failed to open popup, trying new tab fallback:', err);
    try {
      const fallback = window.open(url, '_blank');
      if (fallback) {
        activePopupWindow = fallback;
      }
      return true;
    } catch {
      return false;
    }
  }
};

export const openKioskPopup = (): boolean => {
  if (typeof window === 'undefined') return false;

  const url = `${window.location.origin}${window.location.pathname}?view=kiosk#kiosk`;
  const width = Math.min(1366, Math.floor(window.screen.width * 0.9));
  const height = Math.min(850, Math.floor(window.screen.height * 0.9));
  const left = Math.max(0, (window.screen.width - width) / 2);
  const top = Math.max(0, (window.screen.height - height) / 2);

  try {
    const popup = window.open(
      url,
      'KioPosCustomerKioskPopup',
      `width=${width},height=${height},top=${top},left=${left},status=no,menubar=no,toolbar=no,location=no,resizable=yes,scrollbars=yes`
    );

    if (!popup || popup.closed || typeof popup.closed === 'undefined') {
      const fallback = window.open(url, '_blank');
      if (fallback) {
        activePopupWindow = fallback;
      }
      return !!fallback;
    }

    activePopupWindow = popup;
    popup.focus();
    return true;
  } catch (err) {
    console.warn('Failed to open kiosk popup, trying new tab fallback:', err);
    try {
      const fallback = window.open(url, '_blank');
      if (fallback) {
        activePopupWindow = fallback;
      }
      return true;
    } catch {
      return false;
    }
  }
};
