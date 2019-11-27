export function getBackendUrl(): string {
  if (process.env.REACT_APP_BACKEND_URL) {
    return process.env.REACT_APP_BACKEND_URL;
  }
  if (process.env.NODE_ENV === "production") {
    return "";
  } else {
    return "http://localhost:4000";
  }
}
