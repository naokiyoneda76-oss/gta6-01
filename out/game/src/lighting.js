export const LIGHTING = new URLSearchParams(location.search).get('lighting') === '1';

export function shade(hex, factor) {
  const value = Number.parseInt(hex.slice(1), 16);
  const red = Math.floor((value >> 16) * factor);
  const green = Math.floor(((value >> 8) & 255) * factor);
  const blue = Math.floor((value & 255) * factor);
  return `rgb(${red},${green},${blue})`;
}
