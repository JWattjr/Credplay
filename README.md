# CredPlay

CredPlay is a World Cup social prediction and opinion market platform. It is structured as a **pnpm monorepo** consisting of a modern Next.js frontend and a modular NestJS backend.

Users can share normal social posts, create football prediction market posts with YES/NO resolution criteria, cast free sentiment votes, and anchor prediction creation plus seed liquidity on X Layer with USDT.

---

## Technical Stack

### Monorepo Structure

- **Package Manager:** `pnpm` with Workspaces
- **Frontend:** Next.js App Router, React 19, Tailwind CSS, Lucide Icons
- **Web3 Integration:** RainbowKit, Wagmi, Viem, X Layer USDT contract calls and reads
- **Backend:** NestJS 11, Dependency Injection, modular domain services
- **Database:** MongoDB via Mongoose
- **Validation & Security:** `class-validator`, `class-transformer`, JWT authentication

---

## Project Structure

```text
CredPlay/
├── contracts/                 # X Layer prediction contract and ABI
├── frontend/                  # Next.js application
│   ├── src/
│   │   ├── api/               # API clients
│   │   ├── app/               # Next.js App Router pages
│   │   ├── components/        # UI and domain components
│   │   ├── hooks/             # React hooks
│   │   └── lib/               # Shared helpers
├── backend/                   # NestJS application
│   ├── src/
│   │   ├── common/            # Filters, guards, interceptors
│   │   ├── modules/           # Auth, users, posts, markets, comments
│   │   ├── main.ts
│   │   └── seed.ts
├── package.json
├── pnpm-workspace.yaml
└── pnpm-lock.yaml
```

---

## Getting Started

### 1. Prerequisites

Install Node.js and `pnpm`. You will also need MongoDB running locally or a hosted MongoDB connection string.

### 2. Install Dependencies

```bash
pnpm install:all
```

### 3. Environment Variables

Create `frontend/.env.local` from:

```bash
cp frontend/.env.example frontend/.env.local
```

Create `backend/.env` from:

```bash
cp backend/.env.example backend/.env
```

Important X Layer variables:

```env
X_LAYER_RPC_URL=
X_LAYER_CHAIN_ID=
X_LAYER_USDT_ADDRESS=
X_LAYER_MARKET_CONTRACT_ADDRESS=
X_LAYER_MARKET_CREATION_FEE_USDT=2
X_LAYER_USDT_DECIMALS=6

NEXT_PUBLIC_X_LAYER_RPC_URL=
NEXT_PUBLIC_XLAYER_CHAIN_ID=
NEXT_PUBLIC_XLAYER_USDT_ADDRESS=
NEXT_PUBLIC_CREDPLAY_MARKET_CONTRACT_ADDRESS=
```

Never commit private keys or local `.env` files.

---

## Development Workflow

Run the apps in separate terminals:

```bash
pnpm dev:frontend
pnpm dev:backend
```

Seed local sports mock data:

```bash
pnpm --filter credplay-backend seed
```

---

## Core Product Rules & Features

- **World Cup Feed:** Normal sports posts plus prediction market cards.
- **Prediction Creation:** Prediction posts ask a measurable YES/NO football question with a deadline and resolution source.
- **Market Review:** CredPlay checks that each prediction has clear sports resolution criteria before paid creation.
- **Free Calls:** Users cast daily YES/NO sentiment calls to help markets qualify.
- **X Layer Creation:** Prediction creation is anchored by a verified X Layer contract event.
- **USDT Seed Liquidity:** Users approve USDT and call the X Layer market contract to seed YES/NO liquidity; the backend verifies the emitted event before updating the market.
- **Credibility:** Profiles show reputation, free-call history, and sports prediction signal.

---

## Verification

```bash
pnpm build:frontend
pnpm build:backend
pnpm --filter credplay-backend test
```
