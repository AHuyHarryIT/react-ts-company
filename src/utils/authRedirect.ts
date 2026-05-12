const LOGIN_PATH = '/login';
const FALLBACK_ORIGIN = 'http://localhost';
const LOGOUT_REDIRECT_KEY = 'auth_logout_redirecting';

export const getSafeAuthRedirect = (target?: string | null) => {
  if (!target) return undefined;

  try {
    const baseOrigin =
      typeof window !== 'undefined' ? window.location.origin : FALLBACK_ORIGIN;
    const url = new URL(target, baseOrigin);

    if (url.origin !== baseOrigin || url.pathname === LOGIN_PATH) {
      return undefined;
    }

    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return undefined;
  }
};

export const getLoginRedirectSearch = (target?: string | null) => {
  const redirect = getSafeAuthRedirect(target);
  return redirect ? { redirect } : undefined;
};

export const startLogoutRedirect = () => {
  sessionStorage.setItem(LOGOUT_REDIRECT_KEY, '1');
};

export const finishLogoutRedirect = () => {
  sessionStorage.removeItem(LOGOUT_REDIRECT_KEY);
};

export const isLogoutRedirecting = () => {
  return sessionStorage.getItem(LOGOUT_REDIRECT_KEY) === '1';
};
