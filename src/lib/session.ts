// Session utility functions
interface SessionData {
  userId: string;
  email: string;
  name: string;
}

const SESSION_KEY = "contactAppSession";

export function setSession(data: SessionData): void {
  if (typeof window !== "undefined") {
    localStorage.setItem(SESSION_KEY, JSON.stringify(data));
    window.dispatchEvent(new Event("sessionChange"));
  }
}

export function getSession(): SessionData | null {
  if (typeof window !== "undefined") {
    const session = localStorage.getItem(SESSION_KEY);
    return session ? JSON.parse(session) : null;
  }
  return null;
}

export function deleteSession(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem(SESSION_KEY);
    window.dispatchEvent(new Event("sessionChange"));
  }
}

export function isAuthenticated(): boolean {
  if (typeof window !== "undefined") {
    return localStorage.getItem(SESSION_KEY) !== null;
  }
  return false;
}
