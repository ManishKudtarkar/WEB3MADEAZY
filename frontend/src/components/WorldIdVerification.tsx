import { useCallback, useEffect, useState } from 'react';
import { IDKitRequestWidget, proofOfHuman, type IDKitErrorCodes, type IDKitResult, type RpContext } from '@worldcoin/idkit';
import { api, getAuthToken } from '../lib/api.ts';

type Props = {
  sessionReady: boolean;
  onVerified: () => void;
  onStatusLoaded: (verified: boolean) => void;
  onError: (message: string) => void;
  onReady: (open: () => void) => void;
};

const env = import.meta.env;
const configuredAppId = env.VITE_WORLD_ID_APP_ID;
const appId = configuredAppId?.startsWith('app_') ? configuredAppId as `app_${string}` : undefined;
const action = env.VITE_WORLD_ID_ACTION || 'complete-master-challenge';

export function WorldIdVerification({ sessionReady, onVerified, onStatusLoaded, onError, onReady }: Props) {
  const [signal, setSignal] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [rpContext, setRpContext] = useState<RpContext | null>(null);

  useEffect(() => {
    if (!sessionReady || !getAuthToken()) return;
    void api.getWorldIdStatus()
      .then(status => {
        onStatusLoaded(true);
        if (status.verified) onVerified();
      })
      .catch(err => {
        onStatusLoaded(true);
        console.error('Failed to load World ID status:', err);
      });
  }, [sessionReady, onStatusLoaded, onVerified]);
  
  const openWidget = useCallback(() => {
    if (!appId) {
      onError('World ID app not configured. Set VITE_WORLD_ID_APP_ID in .env.local');
      return;
    }
    if (!getAuthToken()) {
      onError('Please log in before verifying with World ID');
      return;
    }
    void api.getWorldIdRpContext()
      .then(context => {
        setSignal(context.signal);
        setRpContext(context);
        setOpen(true);
      })
      .catch(err => {
        onError(err instanceof Error ? err.message : 'Unable to prepare World ID verification');
      });
  }, [appId, onError]);
  
  useEffect(() => {
    onReady(openWidget);
  }, [onReady, openWidget]);

  const handleSuccess = useCallback(async (result: IDKitResult) => {
    if (isVerifying) return; // Prevent double submission
    
    setIsVerifying(true);
    setOpen(false);
    
    try {
      await api.verifyWorldId({
        result: result as unknown as Record<string, unknown>,
        action,
        signal: signal!,
      });
      
      onVerified();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Verification failed';
      onError(message);
    } finally {
      setIsVerifying(false);
    }
  }, [action, signal, onVerified, onError, isVerifying]);

  const handleError = useCallback((code: IDKitErrorCodes) => {
    setOpen(false);
    setIsVerifying(false);
    onError(`World ID verification did not complete (${code})`);
  }, [onError]);

  if (!appId || !rpContext) {
    return null;
  }

  return (
    <>
      {isVerifying && (
        <div className="world-id-verifying" role="status" aria-live="polite">
          Verifying your identity...
        </div>
      )}
      <IDKitRequestWidget
        open={open}
        onOpenChange={setOpen}
        app_id={appId}
        action={action}
        rp_context={rpContext}
        allow_legacy_proofs={false}
        preset={proofOfHuman({ signal: signal! })}
        onSuccess={handleSuccess}
        onError={handleError}
      />
    </>
  );
}
