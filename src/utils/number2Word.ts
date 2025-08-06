export function convertNumberToWords(number: number | bigint): string {
  const numbersInWords = [
    'không',
    'một',
    'hai',
    'ba',
    'bốn',
    'năm',
    'sáu',
    'bảy',
    'tám',
    'chín'
  ];

  // Generate Vietnamese units dynamically for unlimited input
  function getUnit(index: number): string {
    // Vietnamese units repeat every 3: ['', 'nghìn', 'triệu', 'tỷ', 'nghìn tỷ', 'triệu tỷ', 'tỷ tỷ', ...]
    const baseUnits = ['', 'nghìn', 'triệu'];
    if (index === 0) return '';
    const group = Math.floor(index / 3);
    const mod = index % 3;
    let unit = baseUnits[mod];
    if (group === 0) return unit;
    // For group >= 1, append 'tỷ' the appropriate number of times
    unit += ' tỷ'.repeat(group);
    return unit.trim();
  }

  function ThreeDigitNumberToText(threeDigitNumber: bigint): string {
    const base100Unit = Number(threeDigitNumber / 100n);
    const base10Unit = Number((threeDigitNumber % 100n) / 10n);
    const lastDigit = Number(threeDigitNumber % 10n);
    let ketQua = '';

    if (base100Unit === 0 && base10Unit === 0 && lastDigit === 0) return '';

    if (base100Unit !== 0) {
      ketQua += numbersInWords[base100Unit] + ' trăm';
      if (base10Unit === 0 && lastDigit !== 0) ketQua += ' linh';
    }

    if (base10Unit !== 0 && base10Unit !== 1) {
      ketQua += ' ' + numbersInWords[base10Unit] + ' mươi';
      if (lastDigit === 1) ketQua += ' mốt';
      else if (lastDigit === 5) ketQua += ' lăm';
      else if (lastDigit !== 0) ketQua += ' ' + numbersInWords[lastDigit];
    } else if (base10Unit === 1) {
      ketQua += ' mười';
      if (lastDigit === 1) ketQua += ' một';
      else if (lastDigit === 5) ketQua += ' lăm';
      else if (lastDigit !== 0) ketQua += ' ' + numbersInWords[lastDigit];
    } else if (base10Unit === 0 && lastDigit !== 0) {
      ketQua += ' ' + numbersInWords[lastDigit];
    }

    return ketQua;
  }

  function NumberToCurrencyWords(input: number | bigint): string {
    let n = typeof input === 'bigint' ? input : BigInt(input);
    if (n === 0n) return 'không đồng';

    let i = 0;
    let soString = '';

    while (n > 0n) {
      const temp = n % 1000n;
      if (temp !== 0n) {
        const str = ThreeDigitNumberToText(temp);
        soString = str + ' ' + getUnit(i) + ' ' + soString;
      }
      n = n / 1000n;
      i++;
    }

    soString = soString.trim();
    soString = soString.charAt(0).toUpperCase() + soString.slice(1);
    return soString + ' đồng';
  }

  return NumberToCurrencyWords(number);
}
