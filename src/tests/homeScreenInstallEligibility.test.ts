import { describe, expect, it } from 'vitest';
import { canSuggestIOSHomeScreenInstall } from '../components/setup/homeScreenInstallEligibility';

const safariIPhone =
  'Mozilla/5.0 (iPhone; CPU iPhone OS 17_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.6 Mobile/15E148 Safari/604.1';
const chromeIPhone =
  'Mozilla/5.0 (iPhone; CPU iPhone OS 17_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/125.0.6422.80 Mobile/15E148 Safari/604.1';
const safariMac =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_5) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Safari/605.1.15';

describe('canSuggestIOSHomeScreenInstall', () => {
  it('allows iPhone Safari when the app is running in browser mode', () => {
    expect(
      canSuggestIOSHomeScreenInstall({
        userAgent: safariIPhone,
        vendor: 'Apple Computer, Inc.',
        platform: 'iPhone',
      })
    ).toBe(true);
  });

  it('allows iPad Safari desktop mode', () => {
    expect(
      canSuggestIOSHomeScreenInstall({
        userAgent: safariMac,
        vendor: 'Apple Computer, Inc.',
        platform: 'MacIntel',
        maxTouchPoints: 5,
      })
    ).toBe(true);
  });

  it('blocks iOS browsers that are not Safari', () => {
    expect(
      canSuggestIOSHomeScreenInstall({
        userAgent: chromeIPhone,
        vendor: 'Google Inc.',
        platform: 'iPhone',
      })
    ).toBe(false);
  });

  it('blocks standalone launches', () => {
    expect(
      canSuggestIOSHomeScreenInstall({
        userAgent: safariIPhone,
        vendor: 'Apple Computer, Inc.',
        platform: 'iPhone',
        standalone: true,
      })
    ).toBe(false);
  });

  it('blocks non-touch desktop Safari', () => {
    expect(
      canSuggestIOSHomeScreenInstall({
        userAgent: safariMac,
        vendor: 'Apple Computer, Inc.',
        platform: 'MacIntel',
        maxTouchPoints: 0,
      })
    ).toBe(false);
  });
});
