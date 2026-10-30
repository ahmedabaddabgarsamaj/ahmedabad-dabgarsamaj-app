import { Alert, Platform } from 'react-native';

export interface AlertButton {
  text?: string;
  onPress?: (value?: string) => void;
  style?: 'default' | 'cancel' | 'destructive';
}

/**
 * Universal Alert Polyfill for React Native Web.
 * 
 * In react-native-web, Alert.alert is an empty dummy function (NO-OP).
 * This polyfill enables full Alert dialog support on Web:
 * 1. Single-button alerts show a browser alert and trigger the button's onPress callback.
 * 2. Multi-button alerts show a browser confirmation dialog and trigger either the
 *    action callback (on OK) or cancel callback (on Cancel).
 */
export function initAlertPolyfill(): void {
  if (Platform.OS !== 'web' || typeof window === 'undefined') {
    return;
  }

  Alert.alert = (
    title: string,
    message?: string,
    buttons?: AlertButton[],
    _options?: any
  ): void => {
    const fullText = [title, message].filter(Boolean).join('\n\n');

    // Case 1: Information alert (0 or 1 button)
    if (!buttons || buttons.length <= 1) {
      window.alert(fullText);
      const singleButton = buttons && buttons[0];
      if (singleButton?.onPress) {
        setTimeout(() => {
          singleButton.onPress?.();
        }, 10);
      }
      return;
    }

    // Case 2: Confirmation alert (2 or more buttons)
    const cancelButton = buttons.find((b) => b.style === 'cancel');
    const actionButton =
      buttons.find((b) => b.style === 'destructive') ||
      buttons.find((b) => b.style === 'default') ||
      buttons.find((b) => b !== cancelButton) ||
      buttons[buttons.length - 1];

    const confirmed = window.confirm(fullText);
    setTimeout(() => {
      if (confirmed) {
        actionButton?.onPress?.();
      } else {
        cancelButton?.onPress?.();
      }
    }, 10);
  };
}

// Auto-initialize immediately when module is imported
initAlertPolyfill();

