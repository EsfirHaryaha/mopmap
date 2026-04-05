"use client";

/* eslint-disable react-hooks/set-state-in-effect */

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function InstallButtons() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(
    null
  );
  const [showIosGuide, setShowIosGuide] = useState(false);
  const [isIos, setIsIos] = useState(false);
  const [installed, setInstalled] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    const ua = navigator.userAgent;

    const ios =
      /iPad|iPhone|iPod/.test(ua) ||
      (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
    setIsIos(ios);
    setInstalled(window.matchMedia("(display-mode: standalone)").matches);

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener("beforeinstallprompt", handler);
    window.addEventListener("appinstalled", () => {
      setInstalled(true);
      setDeferredPrompt(null);
    });

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  async function handleAndroidInstall() {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    setDeferredPrompt(null);
  }

  if (!mounted) {
    return (
      <div className="grid grid-cols-2 gap-3">
        <Button variant="outline" size="default" className="w-full text-xs">
          Scarica su iOS
        </Button>
        <Button variant="outline" size="default" className="w-full text-xs">
          Scarica su Android
        </Button>
      </div>
    );
  }

  if (installed) return null;

  return (
    <>
      <div className="grid grid-cols-2 gap-3">
        <Button
          variant="outline"
          size="default"
          className="w-full text-xs"
          onClick={() => {
            if (isIos) {
              setShowIosGuide(true);
            } else if (deferredPrompt) {
              handleAndroidInstall();
            }
          }}
        >
          Scarica su iOS
        </Button>
        <Button
          variant="outline"
          size="default"
          className="w-full text-xs"
          onClick={() => {
            if (deferredPrompt) {
              handleAndroidInstall();
            } else if (isIos) {
              setShowIosGuide(true);
            }
          }}
        >
          Scarica su Android
        </Button>
      </div>

      {showIosGuide && (
        <div className="rounded-xl bg-surface p-3 text-center text-xs text-text-muted">
          <p>
            Su Safari tocca{" "}
            <span className="inline-block rounded bg-surface-hover px-1 font-semibold">
              ⎙ Condividi
            </span>{" "}
            poi{" "}
            <span className="inline-block rounded bg-surface-hover px-1 font-semibold">
              Aggiungi alla Home
            </span>
          </p>
          <button
            onClick={() => setShowIosGuide(false)}
            className="mt-2 text-green-fresh underline"
          >
            Chiudi
          </button>
        </div>
      )}
    </>
  );
}
