// DEMO DATA ONLY. Replaced by database values when Supabase is connected.

export type Segment = "New" | "Returning" | "Frequent" | "Inactive";

export type PurchaseRow = {
  receiptNo: string;
  date: string;
  totalCents: number;
  backpayCents: number;
};

export type DemoCustomer = {
  id: string;
  name: string;
  phone: string;
  registered: boolean;
  firstDaysAgo: number;
  lastDaysAgo: number;
  purchases: number;
  totalSpendCents: number;
  backpayEarnedCents: number;
  backpayRedeemedCents: number;
  backpayBalanceCents: number;
  goldDropEntries: number;
  returniPricesUsed: number;
  segment: Segment;
  history: PurchaseRow[];
};

// A fixed "today" so the demo looks the same on the server and in the browser
const DEMO_NOW = Date.parse("2026-11-25T08:00:00.000Z");
const DAY = 86_400_000;
export const isoDaysAgo = (n: number) => new Date(DEMO_NOW - n * DAY).toISOString();

// New = first purchase in the last 30 days. Inactive = no purchase in 30+ days.
// Frequent = 10+ purchases. Returning = everyone else.
export function segmentOf(
  purchases: number,
  firstDaysAgo: number,
  lastDaysAgo: number
): Segment {
  if (lastDaysAgo > 30) return "Inactive";
  if (firstDaysAgo <= 30) return "New";
  if (purchases >= 10) return "Frequent";
  return "Returning";
}

const RATE_PCT = 5; // demo merchant BackPay rate

// name, phone, registered, purchases, spend (cents), redeemed, expired,
// RETURNi Prices used, first purchase (days ago), last purchase (days ago)
type Row = [string, string, boolean, number, number, number, number, number, number, number];

const ROWS: Row[] = [
  ["Anesu Hove", "+263771234567", true, 12, 8650, 0, 12, 0, 190, 2],
  ["Tendai Moyo", "+263779876543", true, 8, 5230, 50, 1, 1, 140, 1],
  ["Precious Chikwanha", "+263775551234", true, 15, 11000, 150, 0, 2, 260, 3],
  ["Joseph Makoni", "+263774449876", false, 6, 3420, 0, 51, 0, 20, 7],
  ["Sharon Ncube", "+263772223333", true, 9, 6175, 0, 8, 0, 120, 4],
  ["Tatenda Chuma", "+263770000006", true, 3, 1450, 0, 0, 0, 45, 12],
  ["Rudo Chigumba", "+263770000007", true, 22, 15800, 300, 40, 3, 400, 1],
  ["Farai Dube", "+263770000008", false, 2, 640, 0, 0, 0, 9, 5],
  ["Nyasha Sibanda", "+263770000009", true, 1, 900, 0, 0, 0, 6, 6],
  ["Tafadzwa Ncube", "+263770000010", true, 5, 2975, 0, 20, 0, 150, 41],
  ["Chipo Mutasa", "+263770000011", true, 14, 9120, 100, 15, 1, 300, 9],
  ["Kudzai Banda", "+263770000012", false, 4, 1880, 0, 10, 0, 90, 38],
  ["Blessing Phiri", "+263770000013", true, 11, 7340, 0, 30, 0, 210, 16],
  ["Rutendo Zulu", "+263770000014", true, 2, 1100, 0, 0, 0, 14, 10],
  ["Takudzwa Mhlanga", "+263770000015", false, 7, 4210, 0, 25, 1, 175, 22],
  ["Memory Khumalo", "+263770000016", true, 18, 12450, 200, 35, 2, 330, 2],
  ["Simba Nyoni", "+263770000017", true, 3, 1560, 0, 60, 0, 200, 65],
  ["Lindiwe Tshuma", "+263770000018", true, 10, 6890, 50, 10, 1, 160, 8],
  ["Tinashe Gumbo", "+263770000019", false, 1, 450, 0, 0, 0, 3, 3],
  ["Vimbai Marufu", "+263770000020", true, 6, 3790, 0, 12, 0, 100, 19],
  ["Ngoni Chuma", "+263770000021", true, 9, 5640, 0, 18, 0, 130, 48],
  ["Thabo Ndlovu", "+263770000022", true, 13, 8760, 150, 22, 2, 280, 6],
  ["Rumbidzai Sithole", "+263770000023", false, 2, 830, 0, 0, 0, 25, 11],
  ["Munashe Mapfumo", "+263770000024", true, 4, 2240, 0, 0, 0, 80, 27],
];

function build(row: Row, i: number): DemoCustomer {
  const [name, phone, registered, purchases, spend, redeemed, expired, prices, firstAgo, lastAgo] = row;
  const earned = Math.floor((spend * RATE_PCT) / 100);
  const span = Math.max(0, firstAgo - lastAgo);
  const gap = Math.max(1, Math.floor(span / Math.max(1, purchases - 1)));
  const avg = Math.floor(spend / purchases);

  const history: PurchaseRow[] = Array.from(
    { length: Math.min(5, purchases) },
    (_, k) => {
      const total = Math.max(50, avg + ((k % 3) - 1) * Math.floor(avg / 10));
      return {
        receiptNo: `R-${String(1000 + i * 10 + k).padStart(6, "0")}`,
        date: isoDaysAgo(Math.min(firstAgo, lastAgo + k * gap)),
        totalCents: total,
        backpayCents: Math.floor((total * RATE_PCT) / 100),
      };
    }
  );

  return {
    id: `c${i + 1}`,
    name,
    phone,
    registered,
    firstDaysAgo: firstAgo,
    lastDaysAgo: lastAgo,
    purchases,
    totalSpendCents: spend,
    backpayEarnedCents: earned,
    backpayRedeemedCents: redeemed,
    backpayBalanceCents: earned - redeemed - expired,
    goldDropEntries: purchases,
    returniPricesUsed: prices,
    segment: segmentOf(purchases, firstAgo, lastAgo),
    history,
  };
}

export const CUSTOMERS: DemoCustomer[] = ROWS.map(build);