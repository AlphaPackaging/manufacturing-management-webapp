"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

const WARNING_MS = 20_000;
const LOGOUT_MS = 10_000;
const ACTIVITY_EVENTS: (keyof WindowEventMap)[] = [
  "mousemove",
  "mousedown",
  "keydown",
  "touchstart",
  "scroll",
  "pointerdown",
];

export function IdleTimeout() {
  const router = useRouter();
  const warningTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const logoutTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const loggedOutRef = useRef(false);

  const [showWarning, setShowWarning] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(LOGOUT_MS / 1000);

  const clearAllTimers = useCallback(() => {
    if (warningTimerRef.current) clearTimeout(warningTimerRef.current);
    if (logoutTimerRef.current) clearTimeout(logoutTimerRef.current);
    if (countdownRef.current) clearInterval(countdownRef.current);
  }, []);

  const handleLogout = useCallback(async () => {
    if (loggedOutRef.current) return;
    loggedOutRef.current = true;
    clearAllTimers();

    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  }, [router, clearAllTimers]);

  const startLogoutCountdown = useCallback(() => {
    setSecondsLeft(LOGOUT_MS / 1000);
    setShowWarning(true);

    logoutTimerRef.current = setTimeout(handleLogout, LOGOUT_MS);

    const start = Date.now();
    countdownRef.current = setInterval(() => {
      const elapsed = Date.now() - start;
      const remaining = Math.ceil((LOGOUT_MS - elapsed) / 1000);
      setSecondsLeft(Math.max(remaining, 0));
    }, 500);
  }, [handleLogout]);

  const resetTimer = useCallback(() => {
    if (loggedOutRef.current) return;
    clearAllTimers();
    setShowWarning(false);
    warningTimerRef.current = setTimeout(startLogoutCountdown, WARNING_MS);
  }, [clearAllTimers, startLogoutCountdown]);

  const handleStay = useCallback(() => {
    resetTimer();
  }, [resetTimer]);

  useEffect(() => {
    resetTimer();

    for (const event of ACTIVITY_EVENTS) {
      window.addEventListener(event, resetTimer, { passive: true });
    }

    return () => {
      clearAllTimers();
      for (const event of ACTIVITY_EVENTS) {
        window.removeEventListener(event, resetTimer);
      }
    };
  }, [resetTimer, clearAllTimers]);

  return (
    <Dialog open={showWarning} onOpenChange={() => {}}>
      <DialogContent
        className="sm:max-w-sm"
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>Are you still there?</DialogTitle>
          <DialogDescription>
            You&apos;ve been inactive. You&apos;ll be logged out automatically
            for security.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button onClick={handleStay}>
            Yes, I&apos;m here ({secondsLeft}s)
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
