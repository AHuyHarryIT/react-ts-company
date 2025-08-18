import dayjs from 'dayjs';

export function isBarcode(input: string): boolean {
  return /^\d+a\d{8}[12]\d+$/.test(input);
}

export function sliceBarcode(input: string) {
  const parts = input.split('a');

  const productId = parts[0];
  const date = dayjs(parts[1].slice(0, 8), 'DDMMYYYY');
  const shift = parts[1].slice(8, 9);
  const serial = parts[1].slice(9);

  return { productId, date, shift, serial };
}
