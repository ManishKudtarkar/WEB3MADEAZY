# MASTER BUILD PROMPT — ETHEREUM EXPLORER
## Build a Complete Web3 Educational Platform From Scratch

### YOUR ROLE

You are an expert software engineering team consisting of:

- Senior React.js and TypeScript engineer
- Senior Node.js backend architect
- PostgreSQL database architect
- Ethereum smart contract engineer
- Web3 integration specialist
- AWS cloud and DevOps engineer
- UI/UX product designer
- Application security engineer
- Educational curriculum designer
- Quality assurance engineer

Your task is to build **Ethereum Explorer**, a complete, production-structured, hackathon-ready Web3 educational application from scratch.

This is a greenfield implementation. Do not preserve or depend on the previous application's source code.

However, the educational philosophy and curriculum requirements described below must be preserved.

Build real, working features rather than disconnected demonstrations.

**Product tagline: Learn Web3. Earn on-chain. Own your journey.**

---

# PART 1 — PRODUCT VISION

## 1.1 What Is Ethereum Explorer?

Ethereum Explorer is an interactive educational platform that makes Ethereum accessible to two distinct audiences:

1. Developers who want to transition from Web2 to Web3.
2. Ordinary internet users who want to understand and safely use Web3 applications.

The platform teaches through stories, analogies, interactive simulations, practical examples, and assessments.

Students earn ERC-20 learning tokens after successfully completing a chapter's final Master Challenge.

World ID helps prevent duplicate rewards from multiple wallets belonging to the same verified human.

ENSv2 provides persistent, human-readable learning identities.

Chainlink CRE connects verified educational achievements to authorized on-chain rewards.

The student dashboard tracks learning progress, tokens earned, and off-chain achievement badges.

## 1.2 Core Philosophy

Our primary goal is education and accessibility, not token speculation.

Follow these principles:

- Teach before introducing complicated terminology.
- Show why a technology exists before explaining its implementation.
- Connect abstract concepts to familiar real-world experiences.
- Allow everyone to learn without connecting a wallet.
- Make simulations interactive and educational.
- Explain the limitations of simplified simulations.
- Use blockchain only where it provides meaningful functionality.
- Protect learners from common Web3 security mistakes.
- Make the interface approachable, responsive, and accessible.

---

# PART 2 — TECHNOLOGY STACK

Use the following technology stack unless a documented incompatibility requires an alternative.

## Frontend

- React.js
- TypeScript
- Vite
- Tailwind CSS
- React Router
- TanStack Query for server state
- Zustand only where useful for local application state
- React Hook Form and Zod for forms and validation
- Wagmi and Viem for Ethereum interactions
- An accessible drag-and-drop solution such as dnd-kit
- Lucide icons
- Framer Motion or Motion for purposeful animations
- Recharts for dashboard analytics when appropriate

## Backend

- Node.js with TypeScript
- Express.js
- REST APIs
- Zod for request validation
- Prisma ORM
- PostgreSQL
- Structured logging
- OpenAPI documentation
- Secure authentication and authorization
- Vitest or Jest with Supertest

## Database

- Amazon RDS for PostgreSQL
- Prisma migrations
- Relational data modeling
- Transactional writes
- Database uniqueness constraints
- Appropriate indexes and connection pooling

## Blockchain

- Solidity
- Foundry for contract development and testing
- OpenZeppelin contracts
- ERC-20 learning reward token
- Ethereum Sepolia
- World ID IDKit
- ENSv2
- Chainlink CRE
- Viem for blockchain reads and writes

## Infrastructure

- AWS S3
- Amazon CloudFront
- Amazon ECS Fargate
- Amazon ECR
- Amazon RDS PostgreSQL
- AWS Secrets Manager
- Amazon CloudWatch
- AWS Certificate Manager
- Route 53 when a custom domain is available
- Terraform for infrastructure as code
- GitHub Actions for CI/CD

Use S3 and CloudFront for the React frontend.

Use ECS Fargate for the containerized Node.js backend, exposed through an Application Load Balancer.

Keep the RDS database in private subnets and restrict network access.

Use HTTPS for all production-facing services.

Do not use MongoDB, Firebase, or Supabase as the primary database.

---

# PART 3 — STRICT MONOREPO STRUCTURE

The project must have a clean, understandable folder structure.

All frontend implementation belongs in `frontend/`.

All backend implementation belongs in `backend/`.

All smart contracts belong in `contracts/`.

All Chainlink CRE implementation belongs in `chainlink/`.

All infrastructure configuration belongs in `infrastructure/`.

Shared types and validation schemas belong in `packages/`.

Do not mix unrelated responsibilities.

Use the following structure as the architectural foundation:

```text
ethereum-explorer/
│
├── frontend/
│   ├── public/
│   │   ├── images/
│   │   ├── icons/
│   │   └── illustrations/
│   │
│   ├── src/
│   │   ├── app/
│   │   │   ├── App.tsx
│   │   │   ├── router/
│   │   │   ├── providers/
│   │   │   └── layouts/
│   │   │
│   │   ├── pages/
│   │   │   ├── Home/
│   │   │   ├── Developer/
│   │   │   ├── Explorer/
│   │   │   ├── Dashboard/
│   │   │   ├── Profile/
│   │   │   ├── Rewards/
│   │   │   ├── Learn/
│   │   │   └── NotFound/
│   │   │
│   │   ├── features/
│   │   │   ├── auth/
│   │   │   ├── curriculum/
│   │   │   ├── lessons/
│   │   │   ├── simulations/
│   │   │   ├── assessments/
│   │   │   ├── master-challenge/
│   │   │   ├── progress/
│   │   │   ├── world-id/
│   │   │   ├── ens/
│   │   │   ├── wallet/
│   │   │   ├── rewards/
│   │   │   ├── achievements/
│   │   │   └── dashboard/
│   │   │
│   │   ├── components/
│   │   │   ├── ui/
│   │   │   ├── layout/
│   │   │   ├── navigation/
│   │   │   └── feedback/
│   │   │
│   │   ├── content/
│   │   │   ├── developer/
│   │   │   └── explorer/
│   │   │
│   │   ├── hooks/
│   │   ├── services/
│   │   ├── lib/
│   │   ├── types/
│   │   ├── styles/
│   │   └── tests/
│   │
│   ├── Dockerfile
│   ├── package.json
│   ├── vite.config.ts
│   ├── tsconfig.json
│   └── .env.example
│
├── backend/
│   ├── src/
│   │   ├── app.ts
│   │   ├── server.ts
│   │   │
│   │   ├── config/
│   │   ├── database/
│   │   ├── middleware/
│   │   ├── common/
│   │   │
│   │   ├── modules/
│   │   │   ├── auth/
│   │   │   ├── students/
│   │   │   ├── curriculum/
│   │   │   ├── chapters/
│   │   │   ├── lessons/
│   │   │   ├── progress/
│   │   │   ├── assessments/
│   │   │   ├── master-challenge/
│   │   │   ├── world-id/
│   │   │   ├── ens/
│   │   │   ├── wallets/
│   │   │   ├── rewards/
│   │   │   ├── achievements/
│   │   │   └── dashboard/
│   │   │
│   │   ├── integrations/
│   │   │   ├── ethereum/
│   │   │   ├── chainlink/
│   │   │   └── aws/
│   │   │
│   │   ├── jobs/
│   │   ├── events/
│   │   ├── utils/
│   │   └── tests/
│   │
│   ├── prisma/
│   │   ├── schema.prisma
│   │   ├── migrations/
│   │   └── seed.ts
│   │
│   ├── Dockerfile
│   ├── package.json
│   ├── tsconfig.json
│   └── .env.example
│
├── contracts/
│   ├── src/
│   │   ├── LearningToken.sol
│   │   └── RewardReceiver.sol
│   ├── script/
│   ├── test/
│   ├── deployments/
│   ├── foundry.toml
│   └── README.md
│
├── chainlink/
│   ├── workflows/
│   │   └── learning-rewards/
│   ├── config/
│   ├── simulations/
│   ├── tests/
│   └── README.md
│
├── packages/
│   └── shared/
│       ├── src/
│       │   ├── schemas/
│       │   ├── types/
│       │   └── constants/
│       └── package.json
│
├── infrastructure/
│   ├── terraform/
│   │   ├── modules/
│   │   │   ├── networking/
│   │   │   ├── frontend/
│   │   │   ├── backend/
│   │   │   ├── database/
│   │   │   ├── security/
│   │   │   └── monitoring/
│   │   └── environments/
│   │       ├── development/
│   │       └── production/
│   │
│   ├── docker/
│   └── scripts/
│
├── docs/
│   ├── architecture/
│   ├── api/
│   ├── curriculum/
│   ├── security/
│   ├── deployment/
│   ├── integrations/
│   └── hackathon/
│
├── .github/
│   └── workflows/
│
├── .env.example
├── .gitignore
├── .prettierrc
├── eslint.config.js
├── docker-compose.yml
├── package.json
├── package-lock.json
└── README.md
```

This is the intended organization, not a requirement to generate empty directories or placeholder files.

Create files only when their functionality is implemented.

Within each backend module, use a consistent structure:

```text
module-name/
├── module.routes.ts
├── module.controller.ts
├── module.service.ts
├── module.repository.ts
├── module.schema.ts
├── module.types.ts
└── module.test.ts
```

Use controllers for HTTP handling, services for business logic, and repositories for database operations.

Do not put business logic directly inside route definitions.

Do not place database queries inside React components.

Do not create a single enormous file containing unrelated application logic.

Use npm workspaces for the JavaScript and TypeScript packages. Keep Foundry and CRE tooling in their respective directories with their required configuration.

---

# PART 4 — DEVELOPER MODE

## 4.1 Purpose

Developer Mode teaches developers how Ethereum works, starting from familiar Web2 systems.

This is not a collection of unrelated tutorials.

**It must be a connected educational story.**

Every major concept should introduce a problem or limitation that motivates the next topic.

Example:

A traditional application uses a centralized database.

The learner explores what happens when one company controls the records.

The next lesson introduces shared records and the challenges of keeping multiple copies consistent.

That leads into cryptographic verification, blockchain structures, consensus, Ethereum transactions, execution, and smart contracts.

Do not incorrectly claim that blockchain solves every Web2 limitation. Explain tradeoffs, limitations, and cases where centralized systems remain appropriate.

## 4.2 Curriculum

Recreate and expand the original curriculum structure:

| World | Topic |
|---|---|
| 00 | The Web2 World |
| 01 | Shared Records |
| 02 | Blockchain Foundations |
| 03 | Inside an Ethereum Node |
| 04 | Accounts and Wallets |
| 05 | Execution and Transaction Pools |
| 06 | Ethereum Virtual Machine |
| 07 | Gas and Fees |
| 08 | Proof of Stake |
| 09 | Complete Transaction Journey |
| 10 | Building with Ethereum |
| 11 | Beyond Layer One |
| 12 | How Ethereum Got Here |
| 13 | A Protocol That Evolves |

Use the original 24-lesson curriculum as the minimum initial content scope, distributed appropriately across these worlds.

Each world may contain multiple chapters.

Create meaningful chapter titles, learning objectives, prerequisites, simulations, and progression links.

Every chapter should lead naturally to the next.

## 4.3 Two Navigation Experiences

Developer Mode must support:

**Story Mode**

A guided, connected curriculum.

Each chapter introduces the next problem or question.

Provide Previous Chapter, Continue Learning, and Next Chapter navigation.

**Topic Explorer**

Allows learners to open individual developer topics directly.

Provide search, categories, prerequisites, related lessons, and recommended next topics.

Topic Explorer is part of Developer Mode. It must not be confused with the separate nontechnical Explorer Mode.

## 4.4 Eight-Stage Teaching Experience

Every Developer Mode chapter follows these eight stages:

### Stage 1 — The Idea

Explain the concept in simple English.

Introduce the problem and why it matters.

### Stage 2 — A Familiar Example

Use an analogy involving something familiar, such as a shop, office, bank, shared notebook, or application.

Explain where the analogy differs from the real technology.

### Stage 3 — How It Works

Explain the technical mechanism step by step.

Introduce technical terms alongside their meanings.

### Stage 4 — Before You Try

Prepare the student for the experiment.

Explain controls, expected behavior, and what to observe.

Ask the learner to make a prediction.

### Stage 5 — Guided Experiment

Provide a working interactive simulation.

Allow students to change inputs and observe state changes.

For every experiment, explain:

- What to change
- What should happen
- Why it happens
- What the observation teaches

### Stage 6 — Explain the Result

Compare the experiment's outcome with the learner's prediction.

Explain the mechanism and its limitations.

### Stage 7 — Check Understanding

Present five multiple-choice questions.

Each question has four options.

Allow unlimited retries with educational feedback.

Require all five to be answered correctly before unlocking the Master Challenge.

### Stage 8 — Go Deeper and Mastery

Provide optional deeper technical explanations, code examples, original references, assumptions, and failure cases.

Then offer the final Master Challenge.

The Master Challenge is a distinct, protected assessment within the final stage, not a replacement for the deeper educational content.

Preserve the conceptual sequence: understand the idea, explore it, observe results, practice, and demonstrate mastery.

## 4.5 Interactive Simulations

Create working simulations for important concepts, including:

- Centralized records
- Shared databases
- Hashing
- Digital signatures
- Linked blocks
- Peer-to-peer communication
- Ethereum accounts
- Transaction nonces
- Transaction pools
- EVM execution
- Gas calculations
- Proof of Stake
- Transaction confirmation
- Smart contract interactions
- Oracle freshness and aggregation
- Rollups
- ERC-20 token behavior

These are educational simulations, not actual mainnet transactions.

Keep simulation logic separate from UI rendering.

Every simulation must be deterministic, testable, and clear about its simplifications.

Do not use AI-generated executable React code.

---

# PART 5 — EVERYDAY EXPLORER MODE

## 5.1 Target Audience

Explorer Mode is for ordinary internet users.

They may have no programming experience.

They may never have heard of Web2, APIs, RPC, or Solidity.

Do not teach them as if they are developers.

The purpose is to help them understand the technologies and safety considerations involved in using Web3 applications.

## 5.2 Teaching Style

Use:

- Everyday English
- Short explanations
- Familiar situations
- Real-world examples
- Friendly illustrations
- Simple interactive demonstrations
- Practical safety guidance

Avoid code examples, developer jargon, and unnecessary protocol internals.

Do not begin by comparing Web2 with Web3.

Start with questions people actually ask.

## 5.3 Explorer Curriculum

Create the following beginner-friendly chapters:

1. What Is Blockchain?
2. What Is Ethereum?
3. What Is a Crypto Wallet?
4. Public Addresses and Private Keys
5. How Do You Send a Transaction?
6. What Are Gas Fees?
7. Why Do Transactions Take Time?
8. What Are Tokens?
9. What Are NFTs?
10. What Are Smart Contracts?
11. What Are Decentralized Apps?
12. What Is ENS?
13. How Can Wallets Be Scammed or Compromised?
14. How to Use Web3 Applications Safely
15. Understanding Ownership and Tokenization

Use relatable examples.

For instance, when teaching wallets, compare a public address to a destination where someone can send something, while carefully explaining why private keys are different from ordinary passwords.

When teaching gas fees, explain that blockchain operations use shared network resources.

When teaching transactions, demonstrate how a request is authorized, submitted, processed, and confirmed.

Include warnings against sharing recovery phrases or approving unfamiliar transactions.

## 5.4 Explorer Chapter Structure

Each chapter should include:

1. A simple introduction.
2. An everyday analogy.
3. A visual explanation.
4. A real-world use case.
5. An interactive example where useful.
6. Five retryable MCQs.
7. One final Master Challenge.

Use the same assessment and reward infrastructure as Developer Mode.

Do not force the Developer Mode eight-stage presentation into Explorer Mode.

Both modes share backend functionality, but their teaching interfaces should be tailored to their audiences.

---

# PART 6 — ASSESSMENT SYSTEM

## 6.1 Practice Questions

Every chapter must include five MCQs.

Requirements:

- Four options per question.
- Unlimited retries.
- Immediate feedback.
- Explanations after incorrect attempts.
- Persistent progress.
- Server-recorded completion for reward prerequisites.
- Master Challenge unlocks after all five questions are completed.

## 6.2 Master Challenge

Every chapter has one Master Challenge.

Requirements:

- One question.
- Four answer choices.
- Drag-and-drop answer interaction.
- Accessible keyboard and touch alternative.
- Exactly one submitted attempt per verified human per chapter.
- Correct submission grants reward eligibility.
- Incorrect submission permanently removes that chapter's reward eligibility.
- No retries after a committed submission.
- The learner can continue studying regardless of the result.

Design the question to test the central concept, not trivial memorization.

Do not use client-side answer validation as the source of truth.

## 6.3 Critical Security Rules

The Master Challenge must require a persistent verified learner identity before the attempt begins.

Use World ID verification before the first protected Master Challenge.

Do not require wallet connection at this stage.

The backend must:

- Authenticate the learner.
- Check World ID verification status.
- Check practice-question completion.
- Check whether an attempt already exists.
- Issue a short-lived challenge session.
- Prevent multiple simultaneous submissions.
- Record the result atomically.
- Enforce one attempt through database constraints.
- Reject replayed or expired submissions.

Never deliver the correct answer to the browser before submission.

For single-attempt challenges, protect against answer discovery through public APIs or static curriculum files.

Do not rely on client-side storage to enforce attempts.

Implement a clear policy for interrupted submissions and network failures.

Once a submission is committed, it cannot be retried.

---

# PART 7 — STUDENT AUTHENTICATION AND IDENTITY

Separate these concepts:

**Application account:** Authenticated student profile and learning records.

**World ID identity:** Privacy-preserving verification of unique-human eligibility.

**ENS identity:** Human-readable Web3 learning name.

**Wallet:** Blockchain address used to receive rewards and authorize on-chain actions.

These are related but not interchangeable.

Allow anonymous browsing and practice.

Before the protected Master Challenge, establish a persistent student account and verify uniqueness through World ID.

Support secure account recovery without enabling users to create additional reward identities.

Do not assume that an ENS name proves human uniqueness.

Do not assume that a wallet signature proves a person is unique.

---

# PART 8 — WORLD ID INTEGRATION

## 8.1 Problem

A person can create many wallet addresses.

Without human-level uniqueness, that person could repeatedly claim learning rewards.

## 8.2 Goal

One verified human should have one reward-eligible learning identity.

The same person may link multiple wallets, but cannot earn the same chapter reward repeatedly.

## 8.3 Implementation

Use the official World ID IDKit and a suitable unique-human credential.

Prefer Proof of Human when supported and sufficient.

Verify the exact SDK and protocol capabilities against the current documentation.

Implement:

- Official verification UI.
- Secure backend verification.
- Application-scoped uniqueness enforcement where supported.
- Persistent association with an internal student ID.
- Duplicate identity rejection or secure account recovery.
- Successful and unsuccessful verification flows.
- Clear privacy notices.
- No unnecessary personal data collection.

Do not confuse proof of humanity with uniqueness enforcement. Confirm the supported nullifier or equivalent identity-binding mechanism.

A learner should not need a new World ID verification for every chapter unless the chosen protocol requires it.

World ID is not used merely for login. It protects the irreversible Master Challenge and reward entitlement.

Official resources:

https://docs.world.org/world-id/idkit/integrate

https://docs.world.org/world-id/idkit/credentials

https://docs.world.org/world-id/idkit/verification-flows

Implement the World ID prize's required successful and unsuccessful demonstrations.

Include an integration debrief.

---

# PART 9 — ENSv2 LEARNING IDENTITY

## 9.1 Goal

Give students persistent, human-readable learning identities.

Example:

`alex.platform-parent.eth`

The actual parent name must be configured based on availability.

## 9.2 Requirements

We do not currently own a parent ENS name.

Provide the setup process for a supported ENSv2 parent namespace on Sepolia.

Use genuine ENSv2 functionality.

Implement:

- Hierarchical student subnames.
- Custom subname registry.
- Permissioned resolver.
- Appropriate enhanced access control.
- Student identity profile references.
- Authorized wallet linking.
- Wallet changes without losing progress.
- Secure permissions for record updates.

Do not use ENS as the sole database identifier.

The internal student ID remains stable.

Do not publish World ID nullifiers or private identity data in public ENS records.

Use the ENSv2 registry and resolver contracts supported by the target network.

Verify current deployments and interfaces before writing integration code.

If a required ENSv2 feature is unavailable on Sepolia, document the limitation and provide a genuine supported development path rather than silently substituting a different protocol.

---

# PART 10 — ERC-20 REWARD SYSTEM

## 10.1 Reward Model

Only ERC-20 tokens are issued on-chain.

Do not create ERC-721 or ERC-1155 achievement contracts.

Use a fixed, configurable learning reward per chapter.

For the initial testnet implementation, default to 10 learning tokens per successful chapter unless changed through trusted configuration.

Do not promise monetary value.

## 10.2 Reward Eligibility

A student becomes eligible when:

- They have a verified learning identity.
- They complete the five practice MCQs.
- They pass the one-attempt Master Challenge.
- They have not already received that chapter's reward.

The student may connect a wallet after becoming eligible.

## 10.3 Smart Contracts

Implement:

`LearningToken.sol`

A standard ERC-20 token with restricted minting.

`RewardReceiver.sol`

A contract that accepts authorized CRE reward instructions and enforces unique claims.

Use established OpenZeppelin components.

The receiver must verify the authorized report source and relevant workflow identity.

Protect against:

- Unauthorized minting
- Duplicate chapter claims
- Replay attacks
- Repeated reports
- Wrong-chain execution
- Incorrect reward amounts
- Unauthorized contract configuration changes

Do not store sensitive World ID identifiers on-chain.

Use a privacy-preserving claim commitment or equivalent scheme, with explicit domain separation and security analysis.

Avoid placing a directly linkable global human identifier on-chain.

---

# PART 11 — CHAINLINK CRE WORKFLOW

## 11.1 Purpose

Chainlink CRE connects verified off-chain educational results with authorized on-chain ERC-20 issuance.

This must be a meaningful orchestration workflow, not a decorative integration.

## 11.2 Workflow

1. Student passes Master Challenge.
2. Backend records verified reward eligibility.
3. Student connects a wallet.
4. Backend verifies wallet ownership.
5. Student requests the reward.
6. Backend creates authenticated, short-lived reward evidence.
7. CRE retrieves and validates the evidence.
8. CRE verifies claim conditions.
9. CRE generates an authenticated report.
10. The supported Chainlink forwarder delivers the report.
11. The receiver contract validates the report and claim.
12. The ERC-20 token is minted.
13. Backend reconciles the confirmed blockchain event.
14. Dashboard updates the earned-token total.

Use a supported CRE trigger and workflow model.

Do not assume the backend can directly trigger CRE through an arbitrary HTTP request.

Include the necessary signing, replay protection, workflow authorization, and on-chain verification.

Implement a successful CRE CLI simulation.

If practical, deploy a working testnet workflow.

Official resources:

https://docs.chain.link/cre

https://github.com/smartcontractkit/cre-templates/

Target the Best Workflow with CRE prize.

Do not implement CCIP unless a genuine cross-chain use case is introduced.

---

# PART 12 — STUDENT DASHBOARD

Create a dedicated, polished Student Dashboard.

## 12.1 Dashboard Overview

Display:

- Student name and avatar
- ENS learning identity
- Linked wallet
- Current learning path
- Total chapters completed
- Chapters in progress
- Master Challenges passed
- Master Challenges failed
- Total ERC-20 tokens earned
- Unclaimed rewards
- Badges unlocked
- Recent learning activity

Use visually appealing cards, charts, progress indicators, and animations.

## 12.2 Learning Roadmap

Show separate progress for:

- Developer Mode
- Explorer Mode

Display chapter states:

- Not started
- In progress
- Practice completed
- Master Challenge available
- Master Challenge passed
- Master Challenge failed
- Reward eligible
- Reward claimed

Provide Continue Learning and Next Recommended Chapter actions.

## 12.3 Reward History

Show:

- Chapter title
- Learning mode
- Token amount
- Claim status
- Wallet recipient
- Transaction hash
- Date earned
- Date claimed

Distinguish between total tokens earned through the platform and the current balance of any connected wallet.

Only confirmed on-chain rewards count toward successfully claimed tokens.

---

# PART 13 — OFF-CHAIN ACHIEVEMENT BADGES

Achievement badges are visual application rewards stored in PostgreSQL.

They are not NFTs.

They do not require blockchain transactions.

Implement four initial badges.

## Badge 1 — First Victory

Unlocked after successfully claiming the first chapter reward.

Description: Every expert was once a beginner.

## Badge 2 — Rising Explorer

Unlocked after claiming rewards from three different chapters.

Description: Your Web3 journey is taking shape.

## Badge 3 — Knowledge Champion

Unlocked after claiming rewards from five different chapters.

Description: Five victories. Your knowledge is growing.

## Badge 4 — Ethereum Master

Unlocked after successfully claiming rewards for every chapter in one configured learning path.

Description: You've mastered an entire learning journey.

Use configurable learning-path versions so adding new chapters does not unexpectedly revoke previously earned badges.

## Badge Rules

- Store badges in PostgreSQL.
- Unlock automatically through backend logic.
- Use confirmed reward claims as the source of truth.
- Prevent duplicate badge awards.
- Preserve achievements when wallets change.
- Show locked and unlocked states.
- Display badge descriptions and requirements.
- Use distinct illustrations and visual treatments.
- Show an achievement celebration when a badge unlocks.

Do not create NFT contracts for badges.

---

# PART 14 — DATABASE DESIGN

Use PostgreSQL on Amazon RDS.

Create normalized relational models for:

- Student
- StudentSession
- HumanVerification
- LinkedWallet
- ENSIdentity
- LearningMode
- LearningPath
- CurriculumWorld
- Chapter
- LessonStage
- PracticeQuestion
- PracticeProgress
- MasterChallenge
- MasterAttempt
- ChapterProgress
- RewardEligibility
- RewardClaim
- BlockchainTransaction
- AchievementDefinition
- StudentAchievement
- WorkflowExecution
- AuditLog

## Database Requirements

Use:

- Primary keys
- Foreign keys
- Unique constraints
- Indexes
- Transactions
- Explicit status enums
- Created and updated timestamps
- Appropriate deletion policies

Critical uniqueness constraints must prevent:

- Multiple active reward identities for one supported verified-human identifier.
- More than one committed Master Challenge attempt per learner and chapter.
- More than one reward entitlement per learner and chapter.
- More than one successful reward claim per learner and chapter.
- Duplicate achievement unlocks.

Do not store correct Master Challenge answers in publicly accessible frontend bundles.

Protect verification identifiers through appropriate server-side privacy and security controls.

Use Prisma migrations and seed scripts.

Seed real educational content rather than placeholder lessons.

---

# PART 15 — BACKEND API

Implement a versioned REST API under `/api/v1`.

Organize routes by domain.

Suggested endpoints:

```text
/api/v1/auth
/api/v1/students
/api/v1/curriculum
/api/v1/chapters
/api/v1/lessons
/api/v1/progress
/api/v1/assessments
/api/v1/master-challenges
/api/v1/world-id
/api/v1/ens
/api/v1/wallets
/api/v1/rewards
/api/v1/achievements
/api/v1/dashboard
```

Implement appropriate GET, POST, PATCH, and other HTTP methods.

Use consistent response and error formats.

Implement:

- Request validation
- Authentication
- Authorization
- Rate limiting
- Idempotency
- Structured logging
- Centralized error handling
- Health and readiness endpoints
- OpenAPI documentation

Do not expose sensitive administrative or integration endpoints publicly without authorization.

---

# PART 16 — FRONTEND UI/UX

## 16.1 Visual Direction

Create a modern educational platform with:

- Dark-first visual design
- Carefully chosen green accents
- Clear typography
- Comfortable spacing
- Responsive layouts
- Subtle motion
- Interactive diagrams
- Accessible controls
- Consistent navigation

Take inspiration from the clarity of modern developer documentation and the engagement of interactive learning platforms.

Do not directly copy another product's branding or interface.

## 16.2 Main Pages

Build:

1. Landing Page
2. Mode Selection
3. Developer Curriculum
4. Developer Story Mode
5. Developer Topic Explorer
6. Explorer Mode Curriculum
7. Lesson Player
8. Practice Assessment
9. Master Challenge
10. World ID Verification
11. Wallet Connection
12. Student Dashboard
13. Student Profile
14. ENS Identity Management
15. Reward History
16. Achievements
17. Settings

## 16.3 Lesson Player

Include:

- Chapter navigation
- Eight-stage developer learning flow
- Interactive simulations
- Progress indicators
- Previous and Next controls
- Experiment reset
- Expandable experiments
- Optional deeper reading
- Helpful explanations
- Keyboard navigation
- Responsive layouts

Support Ctrl/Cmd + K topic search.

Include reduced-motion and larger-text preferences.

---

# PART 17 — REMOVE ALL CREATE MY LAB FUNCTIONALITY

Do not implement Create My Lab.

Do not implement:

- AI-generated lessons
- Groq lesson generation
- AI lesson prompts
- Generated React experiments
- Runtime JSX compilation
- Dynamic generated-code execution
- AI lab saving
- AI lab revision
- AI lab follow-up generation
- Generated experiment iframes
- AI lab-specific API routes

Do not add Groq, OpenAI, Gemini, or other model API integrations merely to recreate this feature.

All educational lessons must come from curated, structured curriculum content.

Interactive simulations must be implemented as maintained application code.

No Create My Lab navigation, UI, database tables, API endpoints, environment variables, or dependencies should exist in the final project.

---

# PART 18 — AWS DEPLOYMENT ARCHITECTURE

The application must be designed for independent frontend and backend deployment.

## 18.1 Frontend

Deploy the React application using:

- Amazon S3
- CloudFront
- HTTPS
- SPA route fallback
- Cache-control policies
- Environment-specific API configuration

Frontend deployment must not require running a Node.js web server.

## 18.2 Backend

Deploy Node.js using:

- Docker
- Amazon ECR
- Amazon ECS Fargate
- Application Load Balancer
- Health checks
- CloudWatch logs
- AWS Secrets Manager

The backend must be stateless.

Do not depend on local filesystem storage or in-memory state for persistent sessions, attempts, or reward claims.

## 18.3 Database

Use Amazon RDS PostgreSQL.

Requirements:

- Private networking
- Restricted security groups
- Encrypted storage
- Automated backups
- Appropriate connection pooling
- Secure credentials
- Migration strategy
- Database monitoring

## 18.4 Infrastructure as Code

Use Terraform.

Create reusable infrastructure modules.

Support development and production environments.

Do not hardcode credentials or account-specific identifiers.

Provide estimated infrastructure requirements and explain which resources may incur costs.

## 18.5 CI/CD

Implement GitHub Actions workflows for:

- Frontend linting and tests
- Backend linting and tests
- Smart contract tests
- Build verification
- Frontend deployment
- Backend Docker image build and deployment
- Database migration execution

Use secure AWS authentication, preferably OIDC-based roles.

Do not store long-lived AWS credentials in the repository.

---

# PART 19 — LOCAL DEVELOPMENT

Provide a simple local development experience.

The project must run without AWS deployment.

Use Docker Compose for local PostgreSQL.

Provide commands equivalent to:

```bash
npm install
docker compose up -d
npm run db:migrate
npm run db:seed
npm run dev
```

The root development command should start frontend and backend development processes.

Provide environment templates for:

- Root workspace
- Frontend
- Backend
- Smart contracts
- Chainlink workflow

Do not include real secrets.

Mock or simulate unavailable external integrations in clearly labeled development modes.

Never present mocked identity proofs or simulated token transactions as production-verified outcomes.

---

# PART 20 — TESTING AND QUALITY

Implement automated tests at multiple levels.

## Frontend Tests

Test:

- Navigation
- Curriculum rendering
- Lesson stages
- Practice MCQs
- Master Challenge interaction
- Dashboard
- Badge rendering
- Wallet states
- Loading and error states

## Backend Tests

Test:

- Authentication
- Progress persistence
- World ID validation handling
- Master Challenge uniqueness
- Concurrent submissions
- Reward eligibility
- Wallet linking
- Badge unlocking
- Duplicate claim prevention
- Database transaction rollback

## Smart Contract Tests

Test:

- ERC-20 permissions
- Authorized minting
- Unauthorized minting rejection
- Duplicate claim rejection
- Replay protection
- Incorrect report rejection
- Correct reward amounts

## Integration Tests

Test:

- Successful student learning journey
- Failed Master Challenge
- Cancelled World ID verification
- Duplicate-wallet reward attempt
- ENS identity continuity
- CRE successful simulation
- CRE failure behavior
- Blockchain transaction reconciliation

## End-to-End Tests

Use Playwright for critical browser flows.

Include responsive viewport coverage.

No tests should depend on hardcoded fake success responses while claiming to validate real external integration behavior.

---

# PART 21 — ETHGLOBAL PARTNER PRIZE ALIGNMENT

## World ID — Best Use of IDKit

Problem solved:

Prevent reward farming through multiple wallets.

Trust moment:

Before the irreversible Master Challenge and reward entitlement.

Demonstrate:

- Successful verification
- Backend validation
- Protected action
- Cancelled or invalid verification
- Duplicate-human attempt prevention

Document the credential choice and why it provides sufficient assurance.

## ENSv2

Problem solved:

Learning identity fragmentation when wallets change.

Demonstrate:

- Student subname creation
- Registry and resolver integration
- Controlled record permissions
- Wallet changes
- Preserved learning profile

ENSv2 must be central to student identity management.

## Chainlink CRE

Problem solved:

Smart contracts cannot independently observe off-chain learning completion.

Demonstrate:

- Backend evidence
- CRE workflow execution
- Successful CLI simulation
- Authenticated report delivery
- On-chain state change
- ERC-20 minting
- Failure and replay protection

Do not introduce unnecessary cross-chain features solely to target additional prizes.

---

# PART 22 — SECURITY REQUIREMENTS

Security is mandatory.

Implement:

- Secure session handling
- CSRF protection where applicable
- CORS restrictions
- Rate limiting
- Input validation
- Secure password handling if passwords are supported
- Wallet signature verification
- World ID server-side verification
- Strict authorization
- Database uniqueness constraints
- Transactional assessment submissions
- Replay protection
- Restricted smart contract minting
- Secret management
- Audit logging
- Appropriate HTTP security headers

Do not store private keys or wallet recovery phrases.

Do not expose backend secrets to React.

Do not treat ENS names as proof of ownership without resolving and validating the relevant authorization.

Do not treat a successful frontend response as evidence that tokens were minted.

Use confirmed blockchain events for final reward reconciliation.

---

# PART 23 — IMPLEMENTATION PHASES

Implement in this order.

## Phase 1 — Foundation

- Initialize monorepo.
- Configure frontend and backend.
- Configure PostgreSQL and Prisma.
- Establish shared schemas.
- Implement design system.
- Configure local development and tests.

## Phase 2 — Educational Platform

- Implement Developer Mode.
- Build the 14 curriculum worlds.
- Create 24 meaningful lessons.
- Implement eight-stage teaching.
- Build interactive simulations.
- Implement Story Mode and Topic Explorer.
- Build Everyday Explorer Mode.

## Phase 3 — Assessments and Accounts

- Implement persistent student accounts.
- Implement practice MCQs.
- Implement Master Challenges.
- Enforce one-attempt rules.
- Implement progress persistence.

## Phase 4 — World ID

- Implement IDKit.
- Validate identity on backend.
- Enforce human-level uniqueness.
- Implement failure paths.

## Phase 5 — ENSv2

- Configure Sepolia namespace.
- Implement subnames.
- Implement registry and resolver.
- Implement permissions and wallet linking.

## Phase 6 — Smart Contracts

- Implement ERC-20 token.
- Implement reward receiver.
- Test and prepare deployment scripts.

## Phase 7 — Chainlink CRE

- Build reward workflow.
- Connect authenticated backend evidence.
- Implement report handling.
- Simulate workflow.
- Integrate token minting.

## Phase 8 — Dashboard and Achievements

- Implement student profile.
- Build progress dashboard.
- Implement token tracking.
- Implement four off-chain badges.
- Build reward history.

## Phase 9 — AWS Deployment

- Containerize backend.
- Configure Terraform.
- Configure S3 and CloudFront.
- Configure ECS and RDS.
- Implement CI/CD.
- Document deployment.

## Phase 10 — Final Integration

- Test full user journeys.
- Fix integration defects.
- Validate security boundaries.
- Prepare hackathon demonstration.
- Complete documentation.

At each phase, run relevant tests and verify functionality before proceeding.

---

# PART 24 — REQUIRED DOCUMENTATION

Create clear documentation under `docs/`.

Include:

- Product overview
- System architecture
- Folder structure
- Frontend architecture
- Backend architecture
- Database schema
- API documentation
- Curriculum structure
- World ID integration
- ENSv2 integration
- Chainlink CRE integration
- Smart contract architecture
- Security assumptions
- Local development
- AWS deployment
- Environment variables
- Testing guide
- ETHGlobal demonstration guide

The root README must clearly explain how to install, run, test, build, and deploy the project.

Include architecture diagrams and the end-to-end reward flow.

---

# PART 25 — DEFINITION OF DONE

The project is complete only when:

1. Developer Mode works with its connected curriculum and interactive simulations.
2. Everyday Explorer Mode works with nontechnical explanations.
3. Both modes support five retryable MCQs and a one-attempt Master Challenge.
4. World ID protects unique-human reward eligibility.
5. ENSv2 provides functional student identity capabilities.
6. ERC-20 learning rewards work on Sepolia.
7. Chainlink CRE performs meaningful reward orchestration.
8. The student dashboard displays real progress and reward data.
9. Four off-chain achievement badges unlock correctly.
10. The backend uses PostgreSQL and Prisma.
11. Frontend, backend, contracts, and Chainlink code are cleanly separated.
12. The application runs locally.
13. The AWS deployment configuration is complete and documented.
14. Automated tests pass.
15. Successful and unsuccessful reward journeys are demonstrated.
16. No Create My Lab functionality remains.
17. No fake implementation is presented as a completed real integration.

Do not claim a feature is complete when it still requires unimplemented code, external configuration, or an unverified deployment.

---

# FINAL EXECUTION INSTRUCTIONS

You are building this application from scratch.

Follow the specified architecture.

Prioritize correctness, security, maintainability, and a polished user experience.

Do not generate empty placeholder modules merely to satisfy the directory tree.

Do not replace working requirements with static mockups.

Do not invent external SDK functions, contract deployments, or network capabilities.

Consult current official documentation for World ID, ENSv2, Chainlink CRE, AWS, and Ethereum integrations.

When external credentials, registration, testnet funds, or deployment approval are required, identify the exact action I must perform.

Continue implementing independent functionality while those external prerequisites remain pending.

For every phase:

1. Implement the actual code.
2. Explain the files created or modified.
3. Run relevant checks.
4. Report what works.
5. Identify remaining dependencies or blockers.
6. Proceed to the next phase when ready.

If context or execution limits prevent completing the entire application in one run, preserve a clear implementation status document so another coding session can continue without rebuilding completed work.

**The final goal is not just another Ethereum tutorial website.**

We are building a complete learning ecosystem where:

- Developers understand how Ethereum works.
- Ordinary users learn how to interact with Web3 safely.
- Students demonstrate genuine understanding.
- Unique humans receive fair learning rewards.
- ENSv2 preserves learning identities across wallets.
- Chainlink CRE connects learning achievements to Ethereum.
- Students can track their progress, rewards, and achievements in one dashboard.

Build Ethereum Explorer as a coherent, functional, secure, AWS-deployable product suitable for an ETHGlobal hackathon demonstration.
