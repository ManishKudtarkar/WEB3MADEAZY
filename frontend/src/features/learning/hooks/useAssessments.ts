/**
 * Hook for practice and master challenge submissions.
 */
import { useState, useCallback } from 'react';
import { api, ApiError } from '../../../lib/api.ts';

export type AssessmentState = {
  isSubmitting: boolean;
  error: string | null;
};

export function useAssessments() {
  const [state, setState] = useState<AssessmentState>({
    isSubmitting: false,
    error: null,
  });

  const submitPractice = useCallback(async (
    lessonId: string,
    mode: 'developer' | 'explorer',
    questionIndex: number,
    selectedOption: number,
  ) => {
    setState({ isSubmitting: true, error: null });
    try {
      const result = await api.submitPractice({ lessonId, mode, questionIndex, selectedOption });
      setState({ isSubmitting: false, error: null });
      return result;
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Submission failed';
      setState({ isSubmitting: false, error: message });
      return null;
    }
  }, []);

  const submitMasterChallenge = useCallback(async (
    lessonId: string,
    mode: 'developer' | 'explorer',
    selectedOption: number,
    idempotencyKey: string,
  ) => {
    setState({ isSubmitting: true, error: null });
    try {
      const result = await api.submitMasterChallenge(
        { lessonId, mode, selectedOption, idempotencyKey },
        idempotencyKey,
      );
      setState({ isSubmitting: false, error: null });
      return result;
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Submission failed';
      setState({ isSubmitting: false, error: message });
      return null;
    }
  }, []);

  return { ...state, submitPractice, submitMasterChallenge };
}
