import { useEffect, useState } from "react";
import { UnleashClient } from "unleash-proxy-client";

let unleashInstance: UnleashClient | null = null;

export function initUnleash(config: { url: string; clientKey: string; appName?: string }) {
  if (unleashInstance || typeof window === "undefined") return unleashInstance;

  unleashInstance = new UnleashClient({
    url: config.url,
    clientKey: config.clientKey,
    appName: config.appName || "cekwajar-web",
    refreshInterval: 30000,
  });

  unleashInstance.start();
  return unleashInstance;
}

export function useFlag(flagName: string, defaultValue = false): boolean {
  const [isEnabled, setIsEnabled] = useState(defaultValue);

  useEffect(() => {
    if (typeof window === "undefined") return;

    if (!unleashInstance) {
      const UNLEASH_URL = process.env.NEXT_PUBLIC_UNLEASH_PROXY_URL;
      const UNLEASH_KEY = process.env.NEXT_PUBLIC_UNLEASH_PROXY_CLIENT_KEY;

      if (!UNLEASH_URL || !UNLEASH_KEY) {
        queueMicrotask(() => setIsEnabled(defaultValue));
        return;
      }

      unleashInstance = initUnleash({ url: UNLEASH_URL, clientKey: UNLEASH_KEY });
    }

    queueMicrotask(() => setIsEnabled(unleashInstance!.isEnabled(flagName)));

    const handler = () => {
      queueMicrotask(() => setIsEnabled(unleashInstance!.isEnabled(flagName)));
    };

    unleashInstance!.on("update", handler);
    return () => {
      unleashInstance?.off("update", handler);
    };
  }, [flagName, defaultValue]);

  return isEnabled;
}

export { unleashInstance };