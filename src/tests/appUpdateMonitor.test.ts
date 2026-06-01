import { beforeEach, describe, expect, it, vi } from 'vitest';
import { checkForAppUpdate } from '../app/appUpdateMonitor';
import { APP_UPDATE_RELOAD_KEY } from '../app/storageKeys';

class MemoryStorage {
  private readonly values = new Map<string, string>();

  getItem(key: string) {
    return this.values.get(key) ?? null;
  }

  removeItem(key: string) {
    this.values.delete(key);
  }

  setItem(key: string, value: string) {
    this.values.set(key, value);
  }
}

function jsonResponse(data: unknown) {
  return {
    ok: true,
    json: async () => data
  } as Response;
}

describe('app update monitor', () => {
  let storage: MemoryStorage;

  beforeEach(() => {
    storage = new MemoryStorage();
  });

  it('does nothing when the deployed build matches the current build', async () => {
    const fetchVersion = vi.fn(async () => jsonResponse({ buildId: 'current' }));
    const reload = vi.fn();
    const updateServiceWorker = vi.fn();

    const result = await checkForAppUpdate({
      currentBuildId: 'current',
      fetchVersion,
      reload,
      storage,
      updateServiceWorker,
      versionUrl: '/app-version.json'
    });

    expect(result).toEqual({ buildId: 'current', status: 'current' });
    expect(fetchVersion).toHaveBeenCalledWith('/app-version.json', {
      cache: 'no-store',
      headers: {
        Accept: 'application/json'
      }
    });
    expect(updateServiceWorker).not.toHaveBeenCalled();
    expect(reload).not.toHaveBeenCalled();
  });

  it('updates the service worker and reloads once when a newer build is available', async () => {
    const fetchVersion = vi.fn(async () => jsonResponse({ buildId: 'next' }));
    const reload = vi.fn();
    const updateServiceWorker = vi.fn();

    const result = await checkForAppUpdate({
      currentBuildId: 'current',
      fetchVersion,
      reload,
      storage,
      updateServiceWorker,
      versionUrl: '/app-version.json'
    });

    expect(result).toEqual({ buildId: 'next', status: 'reloadTriggered' });
    expect(storage.getItem(APP_UPDATE_RELOAD_KEY)).toBe('next');
    expect(updateServiceWorker).toHaveBeenCalledOnce();
    expect(reload).toHaveBeenCalledOnce();
  });

  it('does not reload repeatedly for the same newer build', async () => {
    storage.setItem(APP_UPDATE_RELOAD_KEY, 'next');

    const result = await checkForAppUpdate({
      currentBuildId: 'current',
      fetchVersion: vi.fn(async () => jsonResponse({ buildId: 'next' })),
      reload: vi.fn(),
      storage,
      updateServiceWorker: vi.fn(),
      versionUrl: '/app-version.json'
    });

    expect(result).toEqual({ buildId: 'next', status: 'reloadAlreadyAttempted' });
  });

  it('clears the reload guard after the refreshed build is running', async () => {
    storage.setItem(APP_UPDATE_RELOAD_KEY, 'next');

    const result = await checkForAppUpdate({
      currentBuildId: 'next',
      fetchVersion: vi.fn(async () => jsonResponse({ buildId: 'next' })),
      reload: vi.fn(),
      storage,
      updateServiceWorker: vi.fn(),
      versionUrl: '/app-version.json'
    });

    expect(result).toEqual({ buildId: 'next', status: 'current' });
    expect(storage.getItem(APP_UPDATE_RELOAD_KEY)).toBeNull();
  });
});
