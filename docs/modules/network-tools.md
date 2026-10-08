# Frontend: Subnet Calculator (IP)

Paths:
- apps/web/src/lib/subnet.ts               — math
- apps/web/src/app/dashboard/network/page.tsx — UI
Status: done (CALC-011..017 first pass)

## Purpose

Full subnet calculator for IPv4 and IPv6, engineering/network theme,
all details. Homepage menu label: **IP**.

## IPv4 — outputs

Given IP + CIDR or mask:
- Network address, Broadcast address
- First / last usable host
- Total addresses, usable hosts
- Subnet mask, Wildcard mask, CIDR
- IP class (A/B/C/D/E/Loopback)
- IP type (Private/Public/Loopback/APIPA/Multicast/CGNAT/Reserved/Doc)
- Binary: IP, Mask, Network, Broadcast
- Hexadecimal, Integer
- Reverse DNS (in-addr.arpa)
- CIDR notation

CIDR presets: /8 /16 /24 /25 /30 /32

## IPv6 — outputs

Given IPv6 + prefix length:
- Full expanded form (8 x 4 hex)
- Compressed canonical form
- Network, first / last address of range
- Total addresses (2^(128-prefix))
- Address type (Global / ULA / Link-Local / Multicast / Loopback /
  Unspecified / Teredo / 6to4 / Documentation)
- Scope (Global / Private / Link / Host / Reserved)
- Prefix part, Subnet ID, Interface ID (64-bit halves)
- Binary groups (8 x 16-bit table with offsets)
- Reverse DNS (ip6.arpa)

Prefix presets: /32 /48 /56 /64 /96 /128

## Design

- Mode toggle: IPv4 (cyan-emerald) | IPv6 (purple-cyan)
- Big result cards with copy button (network, broadcast, expanded,
  compressed)
- Info cards: mask, classification, addresses, structure
- Binary display cards (green accents for network/broadcast)
- Row lists with mono for addresses
- Input validation with Persian error messages
- All RTL, dark glass, framer-motion on tab change and result entry

## Menus

Sidebar: 'IP' with Network icon (after 'بازار و قیمت‌ها')
Homepage navbar: 'IP'

## Not yet

- Subnet list generator (for /16 -> list of /24s)
- VLSM planner
- CIDR merge / summarization
- MAC address / OUI lookup
- Port checker, DNS lookup
