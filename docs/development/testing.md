# Testing

Run JavaScript checks from the repository root:

```sh
npm run typecheck
npm run build
npm test
```
Run the Foundry suite after installing OpenZeppelin and forge-std:

```sh
cd contracts
forge install OpenZeppelin/openzeppelin-contracts --no-commit
forge install foundry-rs/forge-std --no-commit
forge test
```

The World ID, ENS, RPC, and Chainlink workflows require their respective
testnet registrations and credentials before end-to-end testing.
