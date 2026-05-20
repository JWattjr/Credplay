# CredPlay X Layer Contract

`CredPlayPredictionMarket.sol` is the minimal on-chain anchor for the X Cup demo:

- `createPrediction(bytes32 marketKey)` charges the configured USDT creation fee and emits `PredictionCreated`.
- `seedPrediction(bytes32 marketKey, uint256 amount, bool yesSide)` escrows USDT seed liquidity and emits `PredictionSeeded`.
- `votePrediction(bytes32 marketKey, uint8 side)` records one on-chain vote per wallet and emits `PredictionVoted`.

Deploy on X Layer with:

1. `feeToken_`: X Layer USDT contract address.
2. `treasury_`: wallet receiving prediction creation fees.
3. `creationFee_`: `2 * 10 ** 6` for 2 USDT when the token has 6 decimals.

After deployment, set these backend/frontend env vars:

```bash
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

The backend verifies the emitted contract events by RPC before saving market creation or seed liquidity transactions.
