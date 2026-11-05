# System architecture

The browser is a static Vite application deployed to S3 and CloudFront.
The backend is a stateless Node.js API deployed as a Docker image on ECS
Fargate behind an ALB. PostgreSQL on RDS stores accounts, curriculum
progress, assessments, identity links, reward entitlements, workflow
executions, and audit records.

The reward path is:

1. A verified student completes practice and the single-attempt challenge.
2. The API creates one database-constrained reward entitlement.
3. The student links and proves ownership of a wallet.
4. A short-lived evidence record is consumed by the Chainlink workflow.
5. `RewardReceiver` accepts one authorized report per privacy-preserving
   commitment and mints the ERC-20 token.
6. The API reconciles the confirmed event and updates the dashboard.

World ID nullifiers and other sensitive verification data remain off-chain.
