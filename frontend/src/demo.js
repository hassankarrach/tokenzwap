// Presentation-only floating-point balances. Never used for contract accounting.
export const initialPool = {
  a: 12500,
  b: 25000,
  supply: Math.sqrt(12500 * 25000),
  lp: 100,
  walletA: 1000,
  walletB: 2000,
};
export const initialListings = [
  {
    key: "seed-3",
    id: 3,
    name: "Emerald fragment",
    price: 50,
    token: "a",
    seller: false,
    color: "#72f6bf",
    glow: "#02cc8944",
  },
  {
    key: "seed-7",
    id: 7,
    name: "Violet geometry",
    price: 80,
    token: "b",
    seller: false,
    color: "#ad89f5",
    glow: "#9a56dd44",
  },
  {
    key: "seed-9",
    id: 9,
    name: "Liquid horizon",
    price: 120,
    token: "a",
    seller: true,
    color: "#9bddc4",
    glow: "#10d8ab44",
  },
];
export const symbols = { a: "CLUB42", b: "SWAP42", lp: "TZLP" };
export const fmt = (n, d = 2) =>
  n.toLocaleString("en-US", {
    minimumFractionDigits: d,
    maximumFractionDigits: d,
  });
export function quote(pool, amount, reverse) {
  const input = reverse ? pool.b : pool.a,
    output = reverse ? pool.a : pool.b;
  return amount > 0 ? (output * amount * 99) / (input * 100 + amount * 99) : 0;
}
