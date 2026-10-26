import crypto from "crypto";
import { db } from "./db";

/**
 * Generate a unique and clean referral tracking code
 */
export function generateReferralCode(prefix = "REF"): string {
  const randomBytes = crypto.randomBytes(4).toString("hex").toUpperCase();
  return `${prefix}-${randomBytes}`;
}

/**
 * Validates whether an attribution window has expired
 */
export function isAttributionWindowValid(referralCreatedAt: Date, windowDays: number): boolean {
  const expiryTime = new Date(referralCreatedAt.getTime() + windowDays * 24 * 60 * 60 * 1000);
  return new Date() <= expiryTime;
}

/**
 * Resolve an incoming order to its attributed referral link or deal registration
 */
export async function resolveAttribution(params: {
  referralCode?: string;
  leadEmail?: string;
  productId: string;
}) {
  const { referralCode, leadEmail, productId } = params;

  // 1. Check direct referral code
  if (referralCode) {
    const link = await db.referralLink.findUnique({
      where: { code: referralCode },
      include: {
        product: true,
        user: true,
        team: {
          include: {
            members: {
              where: { status: "ACTIVE" },
            },
          },
        },
      },
    });

    if (link && link.productId === productId) {
      return {
        type: "REFERRAL_LINK" as const,
        referralLink: link,
        userId: link.userId,
        teamId: link.teamId,
      };
    }
  }

  // 2. Check approved B2B deal registration by customer email
  if (leadEmail) {
    const deal = await db.dealRegistration.findFirst({
      where: {
        productId,
        leadEmail: leadEmail.toLowerCase(),
        status: "APPROVED",
      },
      include: {
        team: {
          include: {
            members: {
              where: { status: "ACTIVE" },
            },
          },
        },
      },
    });

    if (deal) {
      return {
        type: "DEAL_REGISTRATION" as const,
        dealRegistration: deal,
        userId: deal.userId,
        teamId: deal.teamId,
      };
    }
  }

  return null;
}
