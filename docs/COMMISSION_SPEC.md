# Commission Calculation & Accounting Specification

## 1. Mathematical Formulas & Rounding Rules

All monetary transactions and commission splits are calculated strictly using integer minor units (e.g., USD cents). No IEEE-754 floating-point operations are performed in financial paths.

### Percentage Representation
Rates are expressed in **basis points (bps)**, where:
- `10,000 bps = 100.00%`
- `100 bps = 1.00%`
- `500 bps = 5.00%` (standard platform fee)
- `2,500 bps = 25.00%` (example team commission pool)

### Step 1: Gross Commission Pool
Given gross verified order sales in cents `S` and agreed pool basis points `P_bps`:
$$\text{PoolCents} = \left\lfloor \frac{S \times P_{\text{bps}}}{10,000} \right\rfloor$$

### Step 2: Member Gross Distribution
For member $i$ with agreed allocation $A_{i,\text{bps}}$:
$$\text{GrossMember}_i = \left\lfloor \frac{\text{PoolCents} \times A_{i,\text{bps}}}{10,000} \right\rfloor$$

### Step 3: Deterministic Truncation & Remainder Allocation
To prevent fractional penny loss, any integer truncation remainder delta:
$$\Delta = \text{PoolCents} - \sum_{i=1}^{n} \text{GrossMember}_i$$
is attributed deterministically to the final member $n$ of the allocation array:
$$\text{GrossMember}_n \leftarrow \text{GrossMember}_n + \Delta$$
This guarantees:
$$\sum_{i=1}^{n} \text{GrossMember}_i = \text{PoolCents}$$

### Step 4: Disclosed Platform Fee
For each member's gross commission:
$$\text{FeeMember}_i = \left\lfloor \frac{\text{GrossMember}_i \times \text{Fee}_{\text{bps}}}{10,000} \right\rfloor$$
$$\text{NetMember}_i = \text{GrossMember}_i - \text{FeeMember}_i$$

## 2. Allocation Validation
Prior to agreement activation or member split adjustment, the system strictly enforces:
$$\sum_{i=1}^{n} A_{i,\text{bps}} = 10,000$$
If the sum does not equal 10,000 basis points, the mutation is rejected with HTTP 400.

## 3. Refunds, Chargebacks, and Clawbacks
When an order is refunded:
1. The Order status is transitioned to `REFUNDED`.
2. Associated `CommissionEntry` records are transitioned to `REVERSED`.
3. An auditable negative debit entry (`REFUND_REVERSAL`) is recorded in `FinancialLedger` referencing the original transaction with unique idempotency key `refund_order_<orderId>_comm_<commId>`.
4. The contributor's payable balance is reduced accordingly.
