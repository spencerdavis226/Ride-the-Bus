import { APP_UPDATE_RELOAD_KEY } from './storageKeys';

const APP_VERSION_FILE = 'app-version.json';
const BACKGROUND_REFRESH_DELAY_MS = 2 * 60 * 1000;
const CHECK_THROTTLE_MS = 30 * 1000;
const SERVICE_WORKER_SETTLE_MS = 1200;

type AppVersion = {
  buildId: string;
};

type ReloadStorage = Pick<Storage, 'getItem' | 'removeItem' | 'setItem'>;

export type AppUpdateCheckStatus =
  | 'current'
  | 'unavailable'
  | 'reloadAlreadyAttempted'
  | 'reloadTriggered';

export type AppUpdateCheckResult = {
  buildId?: string;
  status: AppUpdateCheckStatus;
};

type AppUpdateCheckOptions = {
  currentBuildId?: string;
  fetchVersion?: typeof fetch;
  reload?: () => void;
  storage?: ReloadStorage | null;
  updateServiceWorker?: () => Promise<void> | void;
  versionUrl?: string;
};

type AppUpdateMonitorOptions = AppUpdateCheckOptions & {
  backgroundRefreshDelayMs?: number;
  checkThrottleMs?: number;
  documentRef?: Document;
  now?: () => number;
  windowRef?: Window;
};

export async function checkForAppUpdate(options: AppUpdateCheckOptions = {}): Promise<AppUpdateCheckResult> {
  const currentBuildId = options.currentBuildId ?? getCurrentBuildId();
  const storage = options.storage === undefined ? getSessionStorage() : options.storage;

  clearCompletedReloadAttempt(storage, currentBuildId);

  const latestVersion = await fetchLatestVersion(options);
  if (!latestVersion) {
    return { status: 'unavailable' };
  }

  if (latestVersion.buildId === currentBuildId) {
    return { buildId: latestVersion.buildId, status: 'current' };
  }

  if (getReloadAttempt(storage) === latestVersion.buildId) {
    return { buildId: latestVersion.buildId, status: 'reloadAlreadyAttempted' };
  }

  setReloadAttempt(storage, latestVersion.buildId);
  await Promise.resolve((options.updateServiceWorker ?? updateServiceWorker)()).catch(() => undefined);
  (options.reload ?? reloadPage)();

  return { buildId: latestVersion.buildId, status: 'reloadTriggered' };
}

export function startAppUpdateMonitor(options: AppUpdateMonitorOptions = {}) {
  const windowRef = options.windowRef ?? (typeof window === 'undefined' ? undefined : window);
  const documentRef = options.documentRef ?? (typeof document === 'undefined' ? undefined : document);

  if (!windowRef || !documentRef) {
    return () => {};
  }

  if (import.meta.env.DEV && !options.versionUrl) {
    return () => {};
  }

  const now = options.now ?? (() => Date.now());
  const backgroundRefreshDelayMs = options.backgroundRefreshDelayMs ?? BACKGROUND_REFRESH_DELAY_MS;
  const checkThrottleMs = options.checkThrottleMs ?? CHECK_THROTTLE_MS;

  let hiddenAt: number | null = documentRef.visibilityState === 'hidden' ? now() : null;
  let lastCheckAt = 0;
  let checkInFlight = false;

  const runCheck = (force = false) => {
    const checkedAt = now();
    if (!force && checkedAt - lastCheckAt < checkThrottleMs) {
      return;
    }

    lastCheckAt = checkedAt;
    if (checkInFlight) {
      return;
    }

    checkInFlight = true;
    void checkForAppUpdate(options).finally(() => {
      checkInFlight = false;
    });
  };

  const onVisibilityChange = () => {
    if (documentRef.visibilityState === 'hidden') {
      hiddenAt = now();
      return;
    }

    const hiddenLongEnough = hiddenAt !== null && now() - hiddenAt >= backgroundRefreshDelayMs;
    hiddenAt = null;
    if (hiddenLongEnough) {
      runCheck(true);
    }
  };

  const onPageShow = (event: PageTransitionEvent) => {
    runCheck(event.persisted);
  };

  const startupTimer = windowRef.setTimeout(() => runCheck(true), 1000);

  documentRef.addEventListener('visibilitychange', onVisibilityChange);
  windowRef.addEventListener('pageshow', onPageShow);

  return () => {
    windowRef.clearTimeout(startupTimer);
    documentRef.removeEventListener('visibilitychange', onVisibilityChange);
    windowRef.removeEventListener('pageshow', onPageShow);
  };
}

function getCurrentBuildId() {
  return __APP_BUILD_ID__;
}

async function fetchLatestVersion(options: AppUpdateCheckOptions): Promise<AppVersion | null> {
  const fetchVersion = options.fetchVersion ?? (typeof fetch === 'undefined' ? undefined : fetch.bind(globalThis));
  if (!fetchVersion) {
    return null;
  }

  try {
    const response = await fetchVersion(options.versionUrl ?? getAppVersionUrl(), {
      cache: 'no-store',
      headers: {
        Accept: 'application/json'
      }
    });

    if (!response.ok) {
      return null;
    }

    const data: unknown = await response.json();
    if (!isAppVersion(data)) {
      return null;
    }

    return data;
  } catch {
    return null;
  }
}

function getAppVersionUrl() {
  return new URL(APP_VERSION_FILE, new URL(import.meta.env.BASE_URL, window.location.origin)).toString();
}

function isAppVersion(data: unknown): data is AppVersion {
  return typeof data === 'object'
    && data !== null
    && 'buildId' in data
    && typeof data.buildId === 'string'
    && data.buildId.length > 0;
}

async function updateServiceWorker() {
  if (!('serviceWorker' in navigator)) {
    return;
  }

  const registration = await navigator.serviceWorker
    .getRegistration(import.meta.env.BASE_URL)
    .catch(() => undefined);

  if (!registration) {
    return;
  }

  const controllerChange = new Promise<void>((resolve) => {
    const timeout = window.setTimeout(resolve, SERVICE_WORKER_SETTLE_MS);
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      window.clearTimeout(timeout);
      resolve();
    }, { once: true });
  });

  await registration.update().catch(() => undefined);
  await controllerChange;
}

function reloadPage() {
  window.location.reload();
}

function getSessionStorage(): ReloadStorage | null {
  try {
    return window.sessionStorage;
  } catch {
    return null;
  }
}

function getReloadAttempt(storage: ReloadStorage | null) {
  try {
    return storage?.getItem(APP_UPDATE_RELOAD_KEY) ?? null;
  } catch {
    return null;
  }
}

function setReloadAttempt(storage: ReloadStorage | null, buildId: string) {
  try {
    storage?.setItem(APP_UPDATE_RELOAD_KEY, buildId);
  } catch {
    // A failed guard should not block a refresh on locked-down browsers.
  }
}

function clearCompletedReloadAttempt(storage: ReloadStorage | null, currentBuildId: string) {
  if (getReloadAttempt(storage) !== currentBuildId) {
    return;
  }

  try {
    storage?.removeItem(APP_UPDATE_RELOAD_KEY);
  } catch {
    // Best effort cleanup only.
  }
}
