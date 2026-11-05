# Ethereum Explorer

> **Learn Web3. Earn on-chain. Own your journey.**

Ethereum Explorer is a production-grade, full-stack Web3 educational platform designed for both transitioning Web2 developers and nontechnical internet users. The platform combines interactive pedagogical simulations with privacy-preserving identity verification (World ID) and direct ERC-20 reward minting on Sepolia.

---

## 1. System Architecture & End-to-End Flow

```
                                  [ Browser / Client ]
                                           │
                    ┌──────────────────────┴──────────────────────┐
                    │                                             │
         [ Everyday Explorer Mode ]                     [ Developer Mode ]
         • Nontechnical analogies                       • 14 Worlds / 24 Lessons
         • Safety-first foundations                     • 8-Stage interactive labs
         • Visual breakdowns                            • Deterministic Web2-to-Web3 sims
                    │                                             │
                    └──────────────────────┬──────────────────────┘
                                           │
                              [ 5 Practice MCQs (Unlimited) ]
                                           │
                                           ▼
                             [ World ID IDKit Verification ]
                               (Strict Sybil Nullifier Hash)
                                           │
                                           ▼
                            [ 1-Attempt Master Challenge ]
                              (Transactional Server Eval)
                                           │
                     ┌─────────────────────┴─────────────────────┐
                     ▼                                           ▼
              [ FAILED ATTEMPT ]                         [ PASSED ATTEMPT ]
         • Chapter reward forfeited                 • Reward eligibility locked
         • Study access retained                    • Student links Sepolia wallet
                                                                 │
                                                                 ▼
                                                     [ Sepolia Smart Contracts ]
                                                  • Backend validates eligibility
                                                  • Backend calls LearningToken.mint
                                                  • RewardReceiver remains deployed
                                                                 │
                                                                 ▼
                                                    [ Student Dashboard & Badges ]
                                                  • Off-chain badges (PostgreSQL)
                                                  • On-chain transaction reconciliation

```

---

## 2. Monorepo Structure

```text
ethereum-explorer/
├── frontend/                     # React 18, TypeScript, Vite, Tailwind CSS, Wagmi, Viem
│   ├── src/
│   │   ├── app/                  # Router, query providers, Web3 wrappers
│   │   ├── content/              # Curated Developer & Explorer curriculum files
│   │   ├── features/
│   │   │   ├── assessments/      # Practice MCQ components & state machines
│   │   │   ├── ens/              # ENSv2 resolution and subname management
│   │   │   ├── master-challenge/ # Drag-and-drop accessible challenge engine
│   │   │   ├── rewards/          # Claim flow & transaction tracking
│   │   │   ├── simulations/      # Deterministic state-machine simulations
│   │   │   └── world-id/         # IDKit widget integration & verification modals
│   │   └── pages/                # Story Mode, Topic Explorer, Dashboard, Profile
├── backend/                      # Node.js, Express, TypeScript, Prisma ORM, PostgreSQL
│   ├── src/
│   │   ├── config/               # Environment variable validation & secrets loader
│   │   ├── integrations/         # Ethereum (Viem), Chainlink CRE, AWS clients
│   │   ├── middleware/           # Auth, rate-limiting, error handling, session gating
│   │   └── modules/
│   │       ├── assessments/      # Server-side evaluation & answer masking
│   │       ├── master-challenge/ # Atomic single-attempt execution engine
│   │       ├── rewards/          # Short-lived signed evidence creation
│   │       └── world-id/         # Nullifier uniqueness & proof verification
│   └── prisma/                   # Schema, migrations, deterministic seeds
├── contracts/                    # Solidity 0.8.24, Foundry, OpenZeppelin v5
│   ├── src/
│   │   ├── LearningToken.sol     # ERC-20 token with restricted minter role
│   │   └── RewardReceiver.sol    # CRE report verifier, domain separator, mint handler
│   ├── script/                   # Foundry deployment scripts (Sepolia)
│   └── test/                     # Foundry unit & fuzz tests
├── packages/
│   └── shared/                   # Shared TypeScript interfaces, Zod schemas, constants
├── infrastructure/               # Terraform IaC (VPC, ECS Fargate, RDS PostgreSQL, S3/CloudFront)
└── docs/                         # Architecture, API specs, security threat model

```

---

## 3. Technology Stack

| Layer | Technologies |
| --- | --- |
| **Frontend** | React 18, TypeScript, Vite, Tailwind CSS, TanStack Query, Wagmi v2, Viem, `@dnd-kit`, Lucide, Framer Motion |
| **Backend** | Node.js, TypeScript, Express, Prisma ORM, Zod, Supertest, Vitest |
| **Database** | PostgreSQL 16 (AWS RDS / Docker Compose locally) |
| **Smart Contracts** | Solidity `^0.8.24`, Foundry, OpenZeppelin Contracts v5 (Sepolia testnet) |
| **Protocols & Oracles** | World ID (IDKit) |
| **Cloud Infrastructure** | AWS (S3, CloudFront, ECS Fargate, ALB, Route 53, Secrets Manager, CloudWatch), Terraform |

---

## 4. Key Architectural Features

### 4.1 Two Distinct Educational Tracks

* **Developer Mode:** A connected 14-world narrative (from centralized Web2 databases to P2P networks, cryptographic hashing, EVM state execution, gas mechanics, and consensus). Every chapter features an 8-stage learning pipeline: *The Idea*, *Familiar Analogy*, *How It Works*, *Before You Try*, *Guided Experiment*, *Explain the Result*, *5 Practice MCQs*, and *Deep Dive & Master Challenge*.
* **Everyday Explorer Mode:** Plain-English, zero-jargon walkthroughs covering foundational Web3 literacy: wallet mechanics, seed phrase safety, gas fees, approving contract permissions safely, detecting scams, and asset ownership.

### 4.2 Sybil-Resistant, Single-Attempt Master Challenges

* Before attempting a chapter's irreversible Master Challenge, the student must pass all 5 practice MCQs and verify human uniqueness via World ID.
* World ID nullifier hashes prevent the same individual from using multiple wallet addresses to re-claim chapter rewards.
* Answers are **never sent to the client bundle**. The submission is verified atomically inside a PostgreSQL transaction (`MasterAttempt`).
* **Strict Single-Attempt Rule:** A correct submission permanently records reward eligibility. An incorrect submission permanently marks that specific chapter's reward as forfeited (the user can still study and browse).

### 4.3 Direct On-Chain Reward Minting

* The backend verifies the student's session, wallet signature, chapter eligibility, and one-claim-per-chapter rule.
* The platform wallet calls `LearningToken.mint` directly on Sepolia and waits for one confirmation.
* The resulting transaction hash and block number are stored with the claim.
* `RewardReceiver.sol` is deployed for future use but is not part of the active claim path.

### 4.5 Off-Chain Achievement Badges (PostgreSQL)

Badges are kept off-chain to avoid unnecessary gas consumption and blockchain clutter:

1. **First Victory:** Claimed your first chapter reward.
2. **Rising Explorer:** Claimed rewards across 3 distinct chapters.
3. **Knowledge Champion:** Claimed rewards across 5 distinct chapters.
4. **Ethereum Master:** Completed all chapters in an entire curriculum track.

---

## 5. Local Development Setup

### Prerequisites

* Node.js `>= 20.x` and `npm >= 10.x`
* Docker Engine & Docker Compose
* Foundry (`forge`, `cast`, `anvil`)

### Step-by-Step Installation

1. **Clone the repository and install dependencies:**
```bash
git clone https://github.com/your-org/ethereum-explorer.git
cd ethereum-explorer
npm install

```


2. **Configure Environment Variables:**
Copy the example environment templates:
```bash
cp .env.example .env
cp frontend/.env.example frontend/.env
cp backend/.env.example backend/.env
cp contracts/.env.example contracts/.env

```


3. **Start the Local PostgreSQL Database:**
```bash
docker compose up -d postgres

```


4. **Run Database Migrations and Seed Curriculum:**
```bash
npm run db:migrate
npm run db:seed

```


5. **Compile Smart Contracts:**
```bash
cd contracts
forge install
forge build
forge test
cd ..

```


6. **Start Frontend & Backend Development Servers:**
```bash
npm run dev

```


* Frontend runs at: `http://localhost:5173`
* Backend API runs at: `http://localhost:4000/api/v1`
* Swagger / OpenAPI documentation: `http://localhost:4000/docs`



---

## 6. Testing

Run automated checks across all workspace layers:

```bash
# Run unit & integration tests across packages
npm run test

# Run backend integration tests with test database
npm run test:backend

# Run smart contract test suites (Foundry)
cd contracts && forge test -vvv && cd ..

# Run browser end-to-end tests (Playwright)
npm run test:e2e

```

---

## 7. AWS Deployment Overview

```
                      [ Route 53 / Custom Domain ]
                                   │
              ┌────────────────────┴────────────────────┐
              ▼                                         ▼
   [ CloudFront CDN + S3 ]                   [ Application Load Balancer ]
   • React Vite SPA Bundle                   • HTTPS termination (ACM)
   • Static Assets & Icons                   • Route: /api/v1/*
                                                        │
                                                        ▼
                                             [ AWS ECS Fargate ]
                                             • Node.js Backend Container
                                             • Private Subnet, Multi-AZ
                                                        │
                                                        ▼
                                             [ AWS RDS PostgreSQL ]
                                             • Private Subnet, Multi-AZ
                                             • Encrypted at rest (KMS)

```

The infrastructure is fully defined via Terraform in `infrastructure/terraform/`:

* **`modules/networking`**: VPC, private/public subnets, NAT gateways, security groups.
* **`modules/database`**: RDS PostgreSQL 16 instance with automated snapshots and read-replicas.
* **`modules/backend`**: ECS Fargate task definitions, service autoscaling, ALB target groups, CloudWatch logging.
* **`modules/frontend`**: S3 bucket with OAC (Origin Access Control) and CloudFront distribution with SPA custom error routing.
* **`modules/security`**: AWS Secrets Manager, IAM least-privilege roles, and AWS WAF rate-limiting rules.

Deploy using the automated GitHub Actions workflows located in `.github/workflows/deploy-production.yml`.

---

## 8. License

This project is licensed under the [MIT License](https://www.google.com/search?q=LICENSE). Built for the Ethereum developer ecosystem.