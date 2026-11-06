/**
 * Hook to ensure a valid session exists.
 * Creates a guest session on first load if no token exists.
 */
import { useEffect, useState } from 'react';
import { api, ApiError, getAuthToken, setAuthToken } from '../lib/api.ts';
import { clearProgress } from '../lib/storage.ts';

const studentIdKey = 'ethereum-explorer-student-id';

export function useSession() {
  const [isInitializing, setIsInitializing] = useState(true);
  const [hasSession, setHasSession] = useState(false);
  const [isFreshSession, setIsFreshSession] = useState(false);
  const [studentId, setStudentId] = useState<string | null>(() => localStorage.getItem(studentIdKey));
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function initialize() {
      if (import.meta.env.MODE === 'test') {
        setHasSession(true);
        setIsInitializing(false);
        return;
      }

      // Check if we already have a token
      const existingToken = getAuthToken();
      if (existingToken) {
        try {
          const session = await api.getSession();
          localStorage.setItem(studentIdKey, session.studentId);
          setStudentId(session.studentId);
          setHasSession(true);
          setIsInitializing(false);
          return;
        } catch (err) {
          if (!(err instanceof ApiError) || err.status !== 401) {
            console.error('Failed to validate session:', err);
            setError('Failed to validate session');
            setIsInitializing(false);
            return;
          }
          setAuthToken(null);
          localStorage.removeItem(studentIdKey);
          setStudentId(null);
          clearProgress();
          setIsFreshSession(true);
        }
      }

      // Create a guest session
      try {
        const username = `guest-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
        const result = await api.createStudent(username);
        setAuthToken(result.token);
        localStorage.setItem(studentIdKey, result.student.id);
        setStudentId(result.student.id);
        setHasSession(true);
        setIsFreshSession(true);
      } catch (err) {
        console.error('Failed to create session:', err);
        setError('Failed to initialize session');
      } finally {
        setIsInitializing(false);
      }
    }

    initialize();
  }, []);

  return { isInitializing, hasSession, studentId, isFreshSession, error };
}
