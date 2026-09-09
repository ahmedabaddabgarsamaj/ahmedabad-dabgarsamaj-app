import Constants from 'expo-constants';

/**
 * Single source of truth for the application version.
 * Updated to 1.0.7 for Release Build 7.
 */
export const APP_VERSION = '1.0.7';

export const getAppVersion = (): string => {
  const expoVer = Constants.expoConfig?.version;
  // Guard against stale Metro dev cache serving old 1.0.6
  if (!expoVer || expoVer === '1.0.6') {
    return APP_VERSION;
  }
  return expoVer;
};
