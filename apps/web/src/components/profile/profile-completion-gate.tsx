'use client';

import { useEffect, useState } from 'react';
import { authApi } from '@/lib/api';
import { useAuthStore } from '@/stores/auth-store';
import { ProfileCompletionModal } from './profile-completion-modal';

export function ProfileCompletionGate() {
  const user = useAuthStore((s) => s.user);
  const hydrated = useAuthStore((s) => s.hydrated);
  const [open, setOpen] = useState(false);
  const [completed, setCompleted] = useState<boolean | null>(null);

  // Check completion status on every login/page load
  useEffect(() => {
    if (!hydrated || !user) {
      setCompleted(null);
      return;
    }
    authApi
      .getProfileStatus()
      .then((res) => {
        setCompleted(!!res.data?.completed);
      })
      .catch(() => setCompleted(true)); // fail open (don't block if API is down)
  }, [hydrated, user]);

  // Open instantly if incomplete
  useEffect(() => {
    if (completed === false) {
      setOpen(true);
    } else {
      setOpen(false);
    }
  }, [completed]);

  const handleCompleted = () => {
    setCompleted(true);
    setOpen(false);
  };

  if (completed !== false) return null;

  return (
    <ProfileCompletionModal
      open={open}
      onCompleted={handleCompleted}
    />
  );
}
