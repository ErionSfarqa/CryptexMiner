export function isDevQaModeEnabled() {
  return process.env.NODE_ENV === "development" || process.env.NEXT_PUBLIC_QA_MODE === "true";
}

