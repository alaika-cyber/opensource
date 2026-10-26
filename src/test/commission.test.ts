import { describe, it, expect } from "vitest";
import {
  calculateCommissions,
  validateAllocationRules,
  generateAgreementChecksum,
  MemberAllocationRule,
} from "../lib/commission";
import { isAttributionWindowValid } from "../lib/attribution";

describe("Commission Engine & Allocation Validation", () => {
  it("should validate that allocation basis points must sum exactly to 10,000 (100.00%)", () => {
    const validRules: MemberAllocationRule[] = [
      { userId: "user-1", memberRole: "STRATEGIST", allocationBps: 4000 },
      { userId: "user-2", memberRole: "SALES_REP", allocationBps: 3500 },
      { userId: "user-3", memberRole: "MARKETER", allocationBps: 2500 },
    ];

    const result = validateAllocationRules(validRules);
    expect(result.valid).toBe(true);
    expect(result.sumBps).toBe(10000);
  });

  it("should reject allocation rules that do not sum to 10,000 bps", () => {
    const invalidRules: MemberAllocationRule[] = [
      { userId: "user-1", memberRole: "STRATEGIST", allocationBps: 5000 },
      { userId: "user-2", memberRole: "SALES_REP", allocationBps: 4000 }, // sum = 9000
    ];

    const result = validateAllocationRules(invalidRules);
    expect(result.valid).toBe(false);
    expect(result.sumBps).toBe(9000);
    expect(result.error).toContain("must sum exactly to 100.00%");
  });

  it("should reject allocation rules with 0 or negative basis points", () => {
    const zeroRule: MemberAllocationRule[] = [
      { userId: "user-1", memberRole: "STRATEGIST", allocationBps: 10000 },
      { userId: "user-2", memberRole: "SALES_REP", allocationBps: 0 },
    ];

    const result = validateAllocationRules(zeroRule);
    expect(result.valid).toBe(false);
    expect(result.error).toContain("must be greater than 0 bps");
  });

  it("should calculate exact integer commission cents without floating-point errors", () => {
    // $1,000.00 sale (100,000 cents)
    // 20% pool (2,000 bps) = $200.00 (20,000 cents)
    // Member 1: 50% = $100.00 (10,000 cents)
    // Member 2: 50% = $100.00 (10,000 cents)
    // Platform fee: 5% (500 bps) of gross commission = $5.00 (500 cents)
    // Net commission per member: $95.00 (9,500 cents)
    const calculation = calculateCommissions({
      grossSaleCents: 100000,
      commissionPoolBps: 2000,
      platformFeeBps: 500,
      memberAllocations: [
        { userId: "user-1", memberRole: "STRATEGIST", allocationBps: 5000 },
        { userId: "user-2", memberRole: "SALES_REP", allocationBps: 5000 },
      ],
    });

    expect(calculation.totalCommissionPoolCents).toBe(20000);
    expect(calculation.totalPlatformFeeCents).toBe(1000);
    expect(calculation.totalNetCommissionCents).toBe(19000);

    expect(calculation.memberDistributions[0].grossCommissionCents).toBe(10000);
    expect(calculation.memberDistributions[0].platformFeeCents).toBe(500);
    expect(calculation.memberDistributions[0].netCommissionCents).toBe(9500);

    expect(calculation.memberDistributions[1].grossCommissionCents).toBe(10000);
    expect(calculation.memberDistributions[1].platformFeeCents).toBe(500);
    expect(calculation.memberDistributions[1].netCommissionCents).toBe(9500);
  });

  it("should handle odd amounts and integer penny rounding deterministically", () => {
    // $99.99 sale = 9,999 cents
    // 15% pool = 1,499.85 -> floor = 1,499 cents ($14.99)
    // 3 members: 33.34%, 33.33%, 33.33% = 3334, 3333, 3333 bps (sum = 10,000)
    const calculation = calculateCommissions({
      grossSaleCents: 9999,
      commissionPoolBps: 1500,
      platformFeeBps: 500,
      memberAllocations: [
        { userId: "user-1", memberRole: "LEADER", allocationBps: 3334 },
        { userId: "user-2", memberRole: "MARKETER", allocationBps: 3333 },
        { userId: "user-3", memberRole: "SALES_REP", allocationBps: 3333 },
      ],
    });

    expect(calculation.totalCommissionPoolCents).toBe(1499);

    const sumDistributedGross = calculation.memberDistributions.reduce(
      (sum, m) => sum + m.grossCommissionCents,
      0
    );
    // Guarantees penny-perfect reconciliation: sum of members must equal total commission pool
    expect(sumDistributedGross).toBe(calculation.totalCommissionPoolCents);
  });

  it("should generate deterministic SHA256 checksums for agreements", () => {
    const agreementA = {
      productId: "prod-123",
      teamId: "team-456",
      agreementVersion: 1,
      commissionModel: "TEAM_POOL",
      commissionPoolBps: 2000,
      allocationRulesJson: [{ userId: "user-1", allocationBps: 10000 }],
      termsText: "Standard terms and conditions.",
    };

    const checksum1 = generateAgreementChecksum(agreementA);
    const checksum2 = generateAgreementChecksum(agreementA);
    expect(checksum1).toBe(checksum2);
    expect(checksum1).toHaveLength(64);

    // Tampered terms must yield different checksum
    const tampered = { ...agreementA, termsText: "Tampered terms." };
    const checksumTampered = generateAgreementChecksum(tampered);
    expect(checksumTampered).not.toBe(checksum1);
  });
});

describe("Attribution Window Verification", () => {
  it("should confirm valid attribution within window", () => {
    const now = new Date();
    const createdTwoDaysAgo = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000);
    expect(isAttributionWindowValid(createdTwoDaysAgo, 30)).toBe(true);
  });

  it("should expire attribution outside window", () => {
    const now = new Date();
    const createdFortyDaysAgo = new Date(now.getTime() - 40 * 24 * 60 * 60 * 1000);
    expect(isAttributionWindowValid(createdFortyDaysAgo, 30)).toBe(false);
  });
});
