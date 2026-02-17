
const pythagoreanMap: Record<string, number> = {
  a: 1, j: 1, s: 1,
  b: 2, k: 2, t: 2,
  c: 3, l: 3, u: 3,
  d: 4, m: 4, v: 4,
  e: 5, n: 5, w: 5,
  f: 6, o: 6, x: 6,
  g: 7, p: 7, y: 7,
  h: 8, q: 8, z: 8,
  i: 9, r: 9
};

const reduce = (num: number, master: boolean = true): number => {
  if (master && (num === 11 || num === 22 || num === 33)) return num;
  while (num > 9) {
    if (master && (num === 11 || num === 22 || num === 33)) return num;
    num = num.toString().split('').reduce((acc, digit) => acc + parseInt(digit), 0);
  }
  return num;
};

export const calculateLifePath = (dob: string): number => {
  // DOB Format: YYYY-MM-DD
  const parts = dob.split('-');
  const year = reduce(parts[0].split('').reduce((a, b) => a + parseInt(b), 0), false);
  const month = reduce(parseInt(parts[1]), false);
  const day = reduce(parseInt(parts[2]), false);
  return reduce(year + month + day, true);
};

export const calculatePersonalYear = (dob: string): number => {
  const currentYear = new Date().getFullYear();
  const parts = dob.split('-');
  const month = reduce(parseInt(parts[1]), false);
  const day = reduce(parseInt(parts[2]), false);
  const yearSum = reduce(currentYear.toString().split('').reduce((a, b) => a + parseInt(b), 0), false);
  return reduce(month + day + yearSum, true);
};

export const calculateNameNumbers = (name: string) => {
  const cleanName = name.toLowerCase().replace(/[^a-z]/g, '');
  const expressionSum = cleanName.split('').reduce((acc, char) => acc + (pythagoreanMap[char] || 0), 0);
  
  const vowels = ['a', 'e', 'i', 'o', 'u'];
  const soulUrgeSum = cleanName.split('').filter(c => vowels.includes(c)).reduce((acc, char) => acc + (pythagoreanMap[char] || 0), 0);

  return {
    expression: reduce(expressionSum, true),
    soulUrge: reduce(soulUrgeSum, true)
  };
};
