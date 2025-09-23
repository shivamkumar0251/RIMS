
export function setCookie(name: string, value: string, expiresInSeconds: number): void {
  const date = new Date();
  date.setTime(date.getTime() + expiresInSeconds * 1000); // convert seconds → ms
  const expires = "expires=" + date.toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)};${expires};path=/`;
}

export function getCookie(name: string): string | null {
  const nameEQ = name + "=";
  const cookies = document.cookie.split(";");
  for (let cookie of cookies) {
    cookie = cookie.trim();
    if (cookie.startsWith(nameEQ)) {
      return decodeURIComponent(cookie.substring(nameEQ.length));
    }
  }
  return null;
}

export function deleteCookie(name: string): void {
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
}
