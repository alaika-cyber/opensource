import { createHash } from "crypto";

export interface MemberAllocationRule {
  userId: string;
  memberRole: string;
  allocationBps: number; // e.g. 5000 = 50.00% of the commission pool
}

export interface CalculateCommissionParams {
  grossSaleCents: number;
  commissionPoolBps: number; // e.g. 2000 = 20.00% of gross sale
  memberAllocations: MemberAllocationRule[];
  platformFeeBps?: number;   // default 500 = 5.00% of contributor commission
}

export interface MemberCommissionResult {
  userId: string;
  memberRole: string;
  allocationBps: number;
  grossCommissionCents: number;
  platformFeeCents: number;
  netCommissionCents: number;
}

export interface CommissionCalculationOutput {
  totalCommissionPoolCents: number;
  totalPlatformFeeCents: number;
  totalNetCommissionCents: number;
  memberDistributions: MemberCommissionResult[];
}

/**
 * Validates that member allocation basis points sum exactly to 100.00% (10,000 bps)
 * of the team's agreed commission pool.
 */
export function validateAllocationRules(rules: MemberAllocationRule[]): { valid: boolean; sumBps: number; error?: string } {
  if (!rules || rules.length === 0) {
    return { valid: false, sumBps: 0, error: "At least one member allocation rule is required." };
  }

  const sumBps = rules.reduce((acc, rule) => acc + rule.allocationBps, 0);

  if (sumBps !== 10000) {
    return {
      valid: false,
      sumBps,
      error: `Member allocations must sum exactly to 100.00% (10,000 basis points). Current total: ${(sumBps / 100).toFixed(2)}% (${sumBps} bps).`,
    };
  }

  for (const rule of rules) {
    if (rule.allocationBps <= 0) {
      return {
        valid: false,
        sumBps,
        error: `Member allocation for ${rule.userId} must be greater than 0 bps.`,
      };
    }
  }

  return { valid: true, sumBps };
}

/**
 * Deterministic integer minor-unit commission calculation.
 *
 * Mathematical formula (all integer arithmetic with explicit minor unit rounding):
 * 1. Total Commission Pool = Math.floor((Gross Sale Cents * Pool Bps) / 10,000)
 * 2. Member Gross Share = Math.floor((Total Commission Pool * Member Allocation Bps) / 10,000)
 * 3. Platform Fee = Math.floor((Member Gross Share * Platform Fee Bps) / 10,000)
 * 4. Member Net Commission = Member Gross Share - Platform Fee
 * 5. Deterministic remainder distribution: Any integer truncation difference
 *    is attributed to the first allocated member to maintain penny-perfect reconciliation.
 */
export function calculateCommissions(params: CalculateCommissionParams): CommissionCalculationOutput {
  const {
    grossSaleCents,
    commissionPoolBps,
    memberAllocations,
    platformFeeBps = 500, // 5.00%
  } = params;

  if (grossSaleCents <= 0) {
    throw new Error("Gross sale amount must be greater than zero.");
  }

  const validation = validateAllocationRules(memberAllocations);
  if (!validation.valid) {
    throw new Error(validation.error);
  }

  // 1. Total Commission Pool in integer cents
  const totalCommissionPoolCents = Math.floor((grossSaleCents * commissionPoolBps) / 10000);

  let allocatedGrossSum = 0;
  let totalPlatformFeeCents = 0;
  let totalNetCommissionCents = 0;

  const memberDistributions: MemberCommissionResult[] = [];

  for (let i = 0; i < memberAllocations.length; i++) {
    const member = memberAllocations[i];
    let memberGross = Math.floor((totalCommissionPoolCents * member.allocationBps) / 10000);

    // If this is the last member, allocate any rounding delta to preserve exact pool total
    if (i === memberAllocations.length - 1) {
      const remainder = totalCommissionPoolCents - (allocatedGrossSum + memberGross);
      memberGross += remainder;
    }

    allocatedGrossSum += memberGross;

    // Platform fee (e.g. 5% of contributor gross commission)
    const platformFeeCents = Math.floor((memberGross * platformFeeBps) / 10000);
    const netCommissionCents = memberGross - platformFeeCents;

    totalPlatformFeeCents += platformFeeCents;
    totalNetCommissionCents += netCommissionCents;

    memberDistributions.push({
      userId: member.userId,
      memberRole: member.memberRole,
      allocationBps: member.allocationBps,
      grossCommissionCents: memberGross,
      platformFeeCents,
      netCommissionCents,
    });
  }

  return {
    totalCommissionPoolCents,
    totalPlatformFeeCents,
    totalNetCommissionCents,
    memberDistributions,
  };
}

/**
 * Generate a SHA-256 cryptographic checksum for commercial agreements.
 * Provides tamper-evident verification that agreement terms, commission pool,
 * and allocation rules have not been altered after acceptance.
 */
export function generateAgreementChecksum(data: {
  productId: string;
  teamId?: string | null;
  agreementVersion: number;
  commissionModel: string;
  commissionPoolBps: number;
  allocationRulesJson: unknown;
  termsText: string;
}): string {
  const serialized = JSON.stringify({
    productId: data.productId,
    teamId: data.teamId || null,
    version: data.agreementVersion,
    model: data.commissionModel,
    poolBps: data.commissionPoolBps,
    rules: data.allocationRulesJson,
    terms: data.termsText.trim(),
  });

  return createHash("sha256").update(serialized).digest("hex");
}
