type InstallEligibilityInput = {
  userAgent: string;
  vendor?: string;
  platform?: string;
  maxTouchPoints?: number;
  standalone?: boolean;
  displayModeStandalone?: boolean;
};

const nonSafariIOSBrowsers = /\b(CriOS|FxiOS|EdgiOS|OPiOS|DuckDuckGo|Brave|Chrome|Chromium)\b/i;

export function canSuggestIOSHomeScreenInstall({
  displayModeStandalone = false,
  maxTouchPoints = 0,
  platform = '',
  standalone = false,
  userAgent,
  vendor = '',
}: InstallEligibilityInput): boolean {
  if (standalone || displayModeStandalone) return false;

  const isiPhoneOrIPad = /\b(iPad|iPhone|iPod)\b/i.test(userAgent);
  const isIPadDesktopMode = platform === 'MacIntel' && maxTouchPoints > 1 && /\bSafari\b/i.test(userAgent);
  const isIOS = isiPhoneOrIPad || isIPadDesktopMode;
  const isAppleSafari =
    /\bSafari\b/i.test(userAgent) &&
    !nonSafariIOSBrowsers.test(userAgent) &&
    (vendor === '' || /\bApple\b/i.test(vendor));

  return isIOS && isAppleSafari;
}
