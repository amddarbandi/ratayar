// ═══════════════════════════════════════════
// Subnet math — IPv4 + IPv6
// Pure functions, no dependencies.
// ═══════════════════════════════════════════

// ───────────────────────────────────────────
// IPv4
// ───────────────────────────────────────────

export interface IPv4Result {
  ip: string;
  cidr: number;
  mask: string;
  wildcard: string;
  network: string;
  broadcast: string;
  firstUsable: string;
  lastUsable: string;
  totalAddresses: number;
  usableHosts: number;
  ipClass: string;
  ipType: string;
  ipBinary: string;
  maskBinary: string;
  networkBinary: string;
  broadcastBinary: string;
  ipHex: string;
  ipInteger: number;
  reverseDns: string;
  networkInteger: number;
  broadcastInteger: number;
  cidrNotation: string;
}

export interface IPv4Validation {
  ok: boolean;
  error?: string;
}

export function validateIPv4(ip: string): IPv4Validation {
  const parts = ip.trim().split('.');
  if (parts.length !== 4) return { ok: false, error: 'باید ۴ بخش داشته باشد' };
  for (const p of parts) {
    if (!/^\d{1,3}$/.test(p)) return { ok: false, error: 'فقط اعداد ۰-۲۵۵' };
    const n = parseInt(p, 10);
    if (n < 0 || n > 255) return { ok: false, error: 'هر بخش ۰ تا ۲۵۵' };
  }
  return { ok: true };
}

function ipv4ToInt(ip: string): number {
  const parts = ip.split('.').map((p) => parseInt(p, 10));
  return ((parts[0] << 24) | (parts[1] << 16) | (parts[2] << 8) | parts[3]) >>> 0;
}

function intToIPv4(n: number): string {
  return [
    (n >>> 24) & 255,
    (n >>> 16) & 255,
    (n >>> 8) & 255,
    n & 255,
  ].join('.');
}

function ipv4ToBinary(ip: string): string {
  return ip
    .split('.')
    .map((p) => parseInt(p, 10).toString(2).padStart(8, '0'))
    .join('.');
}

function intToBinary(n: number): string {
  return intToIPv4(n)
    .split('.')
    .map((p) => parseInt(p, 10).toString(2).padStart(8, '0'))
    .join('.');
}

function cidrToMaskInt(cidr: number): number {
  if (cidr === 0) return 0;
  return (0xffffffff << (32 - cidr)) >>> 0;
}

function maskToCIDR(mask: string): number {
  const n = ipv4ToInt(mask);
  let count = 0;
  for (let i = 31; i >= 0; i--) {
    if ((n >>> i) & 1) count++;
    else break;
  }
  return count;
}

function classifyIPv4Class(ip: string): string {
  const first = parseInt(ip.split('.')[0], 10);
  if (first >= 1 && first <= 126) return 'A';
  if (first === 127) return 'Loopback';
  if (first >= 128 && first <= 191) return 'B';
  if (first >= 192 && first <= 223) return 'C';
  if (first >= 224 && first <= 239) return 'D (Multicast)';
  if (first >= 240 && first <= 255) return 'E (Reserved)';
  return 'نامشخص';
}

function classifyIPv4Type(ip: string): string {
  const n = ipv4ToInt(ip);
  const first = parseInt(ip.split('.')[0], 10);
  const second = parseInt(ip.split('.')[1], 10);

  if (first === 10) return 'خصوصی (Private – RFC1918)';
  if (first === 172 && second >= 16 && second <= 31) return 'خصوصی (Private – RFC1918)';
  if (first === 192 && second === 168) return 'خصوصی (Private – RFC1918)';
  if (first === 127) return 'Loopback';
  if (first === 169 && second === 254) return 'APIPA (Link-local)';
  if (first === 0) return 'Reserved';
  if (first >= 224 && first <= 239) return 'Multicast';
  if (first >= 240) return 'Reserved (Class E)';
  if (first === 100 && second >= 64 && second <= 127) return 'CGNAT (RFC6598)';
  if (first === 192 && second === 0 && parseInt(ip.split('.')[2], 10) === 2) return 'TEST-NET-1';
  if (first === 198 && second === 51 && parseInt(ip.split('.')[2], 10) === 100) return 'TEST-NET-2';
  if (first === 203 && second === 0 && parseInt(ip.split('.')[2], 10) === 113) return 'TEST-NET-3';
  return 'عمومی (Public)';
}

export function calcIPv4(ipInput: string, cidrInput: number | string): IPv4Result {
  let ip = ipInput.trim();
  let cidr: number;

  // If cidrInput looks like a mask, convert
  if (typeof cidrInput === 'string' && cidrInput.includes('.')) {
    cidr = maskToCIDR(cidrInput);
  } else {
    cidr = typeof cidrInput === 'string' ? parseInt(cidrInput, 10) : cidrInput;
  }

  cidr = Math.max(0, Math.min(32, cidr));

  const ipInt = ipv4ToInt(ip);
  const maskInt = cidrToMaskInt(cidr);
  const wildcardInt = (~maskInt) >>> 0;
  const networkInt = (ipInt & maskInt) >>> 0;
  const broadcastInt = (networkInt | wildcardInt) >>> 0;
  const totalAddresses = Math.pow(2, 32 - cidr);
  const usableHosts = cidr >= 31 ? (cidr === 32 ? 1 : 2) : totalAddresses - 2;

  const firstUsableInt = cidr >= 31 ? networkInt : networkInt + 1;
  const lastUsableInt = cidr >= 31 ? broadcastInt : broadcastInt - 1;

  return {
    ip,
    cidr,
    mask: intToIPv4(maskInt),
    wildcard: intToIPv4(wildcardInt),
    network: intToIPv4(networkInt),
    broadcast: intToIPv4(broadcastInt),
    firstUsable: intToIPv4(firstUsableInt),
    lastUsable: intToIPv4(lastUsableInt),
    totalAddresses,
    usableHosts,
    ipClass: classifyIPv4Class(ip),
    ipType: classifyIPv4Type(ip),
    ipBinary: ipv4ToBinary(ip),
    maskBinary: intToBinary(maskInt),
    networkBinary: intToBinary(networkInt),
    broadcastBinary: intToBinary(broadcastInt),
    ipHex: '0x' + ipInt.toString(16).padStart(8, '0').toUpperCase(),
    ipInteger: ipInt,
    reverseDns: ip.split('.').reverse().join('.') + '.in-addr.arpa',
    networkInteger: networkInt,
    broadcastInteger: broadcastInt,
    cidrNotation: `${intToIPv4(networkInt)}/${cidr}`,
  };
}

// ───────────────────────────────────────────
// IPv6
// ───────────────────────────────────────────

export interface IPv6Result {
  input: string;
  prefix: number;
  expanded: string;
  compressed: string;
  network: string;
  firstAddress: string;
  lastAddress: string;
  totalAddresses: string; // BigInt as string (2^(128-prefix))
  addressType: string;
  scope: string;
  interfaceId: string;
  prefixPart: string;
  subnetId: string;
  binaryGroups: string[];
  reverseDns: string;
  isGlobal: boolean;
}

export interface IPv6Validation {
  ok: boolean;
  error?: string;
}

export function validateIPv6(input: string): IPv6Validation {
  const s = input.trim();
  if (!s.includes(':')) return { ok: false, error: 'باید حداقل دو بخش با : داشته باشد' };
  // split off prefix
  const [addr] = s.split('/');
  // handle :: expansion
  const doubles = (addr.match(/::/g) || []).length;
  if (doubles > 1) return { ok: false, error: 'فقط یک :: مجاز است' };
  const groups = addr.split(':').filter((g) => g !== '');
  if (doubles === 0 && groups.length !== 8) {
    return { ok: false, error: 'باید دقیقاً ۸ گروه داشته باشد' };
  }
  if (doubles === 1 && groups.length > 7) {
    return { ok: false, error: 'بیش از حد گروه' };
  }
  for (const g of groups) {
    if (!/^[0-9a-fA-F]{1,4}$/.test(g)) {
      return { ok: false, error: `گروه نامعتبر: ${g}` };
    }
  }
  return { ok: true };
}

function expandIPv6(input: string): string {
  let addr = input.trim();
  if (addr.includes('/')) addr = addr.split('/')[0];

  // expand ::
  if (addr.includes('::')) {
    const [left, right] = addr.split('::');
    const leftGroups = left ? left.split(':') : [];
    const rightGroups = right ? right.split(':') : [];
    const missing = 8 - leftGroups.length - rightGroups.length;
    const middle = Array(missing).fill('0000');
    const all = [...leftGroups, ...middle, ...rightGroups];
    addr = all.join(':');
  }
  // pad each group to 4
  return addr
    .split(':')
    .map((g) => g.padStart(4, '0'))
    .join(':');
}

function compressIPv6(expanded: string): string {
  // remove leading zeros in each group
  const groups = expanded.split(':').map((g) => g.replace(/^0+/, '') || '0');
  // find longest run of "0" groups (>=2)
  let bestStart = -1;
  let bestLen = 0;
  let curStart = -1;
  let curLen = 0;
  for (let i = 0; i < groups.length; i++) {
    if (groups[i] === '0') {
      if (curStart === -1) curStart = i;
      curLen++;
      if (curLen > bestLen) {
        bestLen = curLen;
        bestStart = curStart;
      }
    } else {
      curStart = -1;
      curLen = 0;
    }
  }
  if (bestLen < 2) return groups.join(':');
  const left = groups.slice(0, bestStart).join(':');
  const right = groups.slice(bestStart + bestLen).join(':');
  return `${left}::${right}`;
}

function classifyIPv6(expanded: string): { type: string; scope: string } {
  const first = expanded.split(':')[0];
  const firstInt = parseInt(first, 16);
  const allZero = expanded === '0000:0000:0000:0000:0000:0000:0000:0000';
  const loopback = expanded === '0000:0000:0000:0000:0000:0000:0000:0001';
  const allOnes = expanded === 'ffff:ffff:ffff:ffff:ffff:ffff:ffff:ffff';

  if (allZero) return { type: 'Unspecified (::)', scope: 'Reserved' };
  if (loopback) return { type: 'Loopback (::1)', scope: 'Host' };
  if (allOnes) return { type: 'Broadcast (deprecated)', scope: 'Reserved' };

  // fc00::/7 — ULA (fc / fd)
  if ((firstInt & 0xfe00) === 0xfc00) return { type: 'ULA (Unique Local)', scope: 'Private' };
  // fe80::/10 — Link-Local
  if ((firstInt & 0xffc0) === 0xfe80) return { type: 'Link-Local', scope: 'Link' };
  // ff00::/8 — Multicast
  if ((firstInt & 0xff00) === 0xff00) return { type: 'Multicast', scope: 'Various' };
  // 2001:db8::/32 — Documentation
  if (first.startsWith('2001') && expanded.split(':')[1] === '0db8') {
    return { type: 'Documentation (RFC3849)', scope: 'Reserved' };
  }
  // 2001::/32 — Teredo
  if (expanded.startsWith('2001:0000')) return { type: 'Teredo tunneling', scope: 'Global' };
  // 2002::/16 — 6to4
  if (first === '2002') return { type: '6to4', scope: 'Global' };
  // 2000::/3 — Global Unicast
  if ((firstInt & 0xe000) === 0x2000) return { type: 'Global Unicast', scope: 'Global' };

  return { type: 'Reserved / Unknown', scope: 'Reserved' };
}

function bigPow2(n: number): bigint {
  return 1n << BigInt(n);
}

export function calcIPv6(input: string): IPv6Result {
  const s = input.trim();
  const prefix = s.includes('/') ? parseInt(s.split('/')[1], 10) : 64;
  const addr = s.split('/')[0];

  const expanded = expandIPv6(addr);
  const compressed = compressIPv6(expanded);
  const { type, scope } = classifyIPv6(expanded);

  const groups = expanded.split(':');
  const interfaceId = groups.slice(4).join(':');

  // Network prefix: zero out host bits
  const hostBits = 128 - prefix;
  const prefixPart = groups.slice(0, 4).join(':');
  const subnetId = prefix > 48 ? groups[2] + ':' + groups[3] : '';

  // Calculate first and last address as BigInt
  const fullInt = expanded.split(':').reduce(
    (acc, g) => (acc << 16n) + BigInt(parseInt(g, 16)),
    0n,
  );
  const hostMask = bigPow2(hostBits);
  const networkInt = (fullInt / hostMask) * hostMask;
  const lastInt = networkInt + hostMask - 1n;

  function intToIPv6String(n: bigint): string {
    const parts: string[] = [];
    for (let i = 7; i >= 0; i--) {
      const part = (n >> BigInt(i * 16)) & 0xffffn;
      parts.push(part.toString(16).padStart(4, '0'));
    }
    return parts.join(':');
  }

  const network = intToIPv6String(networkInt);
  const first = intToIPv6String(networkInt);
  const last = intToIPv6String(lastInt);

  // Reverse DNS
  const nibbles = expanded.replace(/:/g, '').split('').reverse();
  const reverseDns = nibbles.join('.') + '.ip6.arpa';

  return {
    input: addr,
    prefix,
    expanded,
    compressed,
    network,
    firstAddress: first,
    lastAddress: last,
    totalAddresses: bigPow2(hostBits).toString(),
    addressType: type,
    scope,
    interfaceId,
    prefixPart,
    subnetId,
    binaryGroups: groups,
    reverseDns,
    isGlobal: type === 'Global Unicast',
  };
}

// ───────────────────────────────────────────
// Formatting helpers
// ───────────────────────────────────────────

export function formatBigNumber(n: number | string): string {
  const bi = typeof n === 'string' ? BigInt(n) : BigInt(n);
  // Group in 3s for readability
  const s = bi.toString();
  const out: string[] = [];
  for (let i = s.length; i > 0; i -= 3) {
    out.unshift(s.slice(Math.max(0, i - 3), i));
  }
  return out.join(',');
}

export function parseCIDROrMask(input: string): number | null {
  const s = input.trim();
  if (!s) return null;
  if (s.includes('.')) {
    // mask
    const n = ipv4ToInt(s);
    let count = 0;
    for (let i = 31; i >= 0; i--) {
      if ((n >>> i) & 1) count++;
      else break;
    }
    return count;
  }
  const n = parseInt(s, 10);
  if (isNaN(n) || n < 0 || n > 32) return null;
  return n;
}
