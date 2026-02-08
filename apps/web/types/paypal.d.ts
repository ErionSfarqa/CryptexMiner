export {};

declare global {
  interface PayPalButtonStyle {
    layout?: "vertical" | "horizontal";
    color?: "gold" | "blue" | "silver" | "white" | "black";
    shape?: "rect" | "pill";
    label?: "paypal" | "checkout" | "pay" | "buynow" | "installment";
    tagline?: boolean;
    height?: number;
  }

  interface PayPalButtonsInstance {
    render: (target: HTMLElement) => Promise<void>;
    close?: () => void;
  }

  interface PayPalHostedButtonsInstance {
    render: (selector: string) => Promise<void> | void;
  }

  interface PayPalNamespace {
    Buttons?: (config: {
      createOrder: () => Promise<string>;
      onApprove: (data: { orderID: string }) => Promise<void>;
      onError: (error: unknown) => void;
      onCancel?: () => void;
      style?: PayPalButtonStyle;
    }) => PayPalButtonsInstance;
    HostedButtons?: (config: { hostedButtonId: string }) => PayPalHostedButtonsInstance;
  }

  interface Window {
    paypal?: PayPalNamespace;
  }
}

