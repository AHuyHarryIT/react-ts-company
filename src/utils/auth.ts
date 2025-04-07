import { authCheck } from '@services/AuthService';
import { redirect } from '@tanstack/react-router';

// Protect all routes except login
export const authGuard = async () => {
  try {
    await authCheck();
    return;
  } catch {
    // Redirect to login if not authenticated
    throw redirect({ to: '/', replace: true });
  }
};

// Prevent logged-in users from seeing /login
export const guestOnly = async () => {
  try {
    await authCheck();
    throw redirect({ to: '/admin', replace: true });
  } catch {
    // Not logged in — allow to continue
    return;
  }
};
