import { PrismaClient, Role, ProductType, PricingModel, CommissionModel, TeamMemberRole, AgreementStatus, OrderStatus, CommissionStatus, LedgerEntryType } from "@prisma/client";
import bcrypt from "bcryptjs";
import { generateAgreementChecksum } from "../src/lib/commission";
import { generateReferralCode } from "../src/lib/attribution";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding OpenSource Database with Realistic Demo Data...");

  // Clean existing demo data
  await prisma.financialLedger.deleteMany();
  await prisma.commissionEntry.deleteMany();
  await prisma.attributionRecord.deleteMany();
  await prisma.order.deleteMany();
  await prisma.dealRegistration.deleteMany();
  await prisma.referralLink.deleteMany();
  await prisma.campaign.deleteMany();
  await prisma.agreementAcceptance.deleteMany();
  await prisma.commercialAgreement.deleteMany();
  await prisma.opportunityApplication.deleteMany();
  await prisma.opportunity.deleteMany();
  await prisma.teamTask.deleteMany();
  await prisma.teamDiscussionComment.deleteMany();
  await prisma.teamDiscussion.deleteMany();
  await prisma.teamMember.deleteMany();
  await prisma.teamInvitation.deleteMany();
  await prisma.teamApplication.deleteMany();
  await prisma.team.deleteMany();
  await prisma.review.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.dispute.deleteMany();
  await prisma.supportTicket.deleteMany();
  await prisma.product.deleteMany();
  await prisma.organization.deleteMany();
  await prisma.professionalProfile.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash("Password123!", 10);

  // 1. Create Users
  const admin = await prisma.user.create({
    data: {
      email: "admin@opensource.platform",
      passwordHash,
      name: "Platform Administrator",
      role: Role.ADMIN,
      emailVerified: true,
      avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    },
  });

  const sarahOwner = await prisma.user.create({
    data: {
      email: "sarah.chen@cloudscale.io",
      passwordHash,
      name: "Sarah Chen",
      role: Role.USER,
      emailVerified: true,
      avatarUrl: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80",
      profile: {
        create: {
          headline: "Founder & CTO at CloudScale Technologies",
          bio: "Building high-throughput observability infrastructure. Partnering with elite technical marketing teams to expand global developer adoption.",
          skills: ["SaaS Architecture", "Developer Marketing", "API Ecosystems", "Go-To-Market"],
          languages: ["English", "Mandarin"],
          timezone: "America/Los_Angeles",
          country: "United States",
          collaborationsCount: 14,
          isVerified: true,
        },
      },
    },
  });

  const marcusOwner = await prisma.user.create({
    data: {
      email: "marcus.vance@synthvoice.ai",
      passwordHash,
      name: "Marcus Vance",
      role: Role.USER,
      emailVerified: true,
      avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
      profile: {
        create: {
          headline: "Product Lead at SynthVoice AI Studio",
          bio: "Pioneering generative audio synthesis for creative teams. Looking for content-driven growth teams and B2B affiliate networks.",
          skills: ["Generative AI", "Audio Engineering", "PLG Strategy"],
          languages: ["English"],
          timezone: "America/New_York",
          country: "United States",
          collaborationsCount: 8,
          isVerified: true,
        },
      },
    },
  });

  const elenaStrategist = await prisma.user.create({
    data: {
      email: "elena.rostova@hypergrowth.syndicate",
      passwordHash,
      name: "Elena Rostova",
      role: Role.USER,
      emailVerified: true,
      avatarUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
      profile: {
        create: {
          headline: "Growth Architect & Team Syndicate Lead",
          bio: "Specializing in multi-channel developer acquisition, positioning, and conversion funnel optimization. Lead of HyperGrowth Syndicate.",
          skills: ["Growth Strategy", "Conversion Funnels", "Technical SEO", "B2B SaaS Sales"],
          languages: ["English", "German"],
          timezone: "Europe/Berlin",
          country: "Germany",
          availability: "Full-time (30-40 hrs/wk)",
          collaborationsCount: 22,
          verifiedSalesCents: BigInt(48500000), // $485,000 verified sales
          averageRating: 4.95,
          isVerified: true,
        },
      },
    },
  });

  const alexCloser = await prisma.user.create({
    data: {
      email: "alex.rivers@hyperconversions.io",
      passwordHash,
      name: "Alex Rivers",
      role: Role.USER,
      emailVerified: true,
      avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
      profile: {
        create: {
          headline: "Enterprise B2B Closer & Outbound Strategist",
          bio: "Over 8 years orchestrating outbound sales motions for mid-market and enterprise developer tooling. Closed over $3M in ARR.",
          skills: ["B2B Outbound", "Deal Registration", "Account Executive", "Cold Email Architecture"],
          languages: ["English"],
          timezone: "America/Chicago",
          country: "United States",
          availability: "Part-time (15-25 hrs/wk)",
          collaborationsCount: 17,
          verifiedSalesCents: BigInt(32000000), // $320,000 verified sales
          averageRating: 4.9,
          isVerified: true,
        },
      },
    },
  });

  const mayaMarketer = await prisma.user.create({
    data: {
      email: "maya.patel@creativestack.design",
      passwordHash,
      name: "Maya Patel",
      role: Role.USER,
      emailVerified: true,
      avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
      profile: {
        create: {
          headline: "Technical Content Creator & Community Growth Specialist",
          bio: "Crafting viral technical tutorials, developer guides, and high-converting video demonstrations.",
          skills: ["Content Marketing", "Developer Relations", "Video Production", "Copywriting"],
          languages: ["English", "Hindi"],
          timezone: "Europe/London",
          country: "United Kingdom",
          availability: "Part-time (20 hrs/wk)",
          collaborationsCount: 19,
          verifiedSalesCents: BigInt(19400000), // $194,000 verified sales
          averageRating: 4.98,
          isVerified: true,
        },
      },
    },
  });

  // 2. Products
  const cloudScaleProduct = await prisma.product.create({
    data: {
      ownerId: sarahOwner.id,
      name: "CloudScale Metrics Engine",
      slug: "cloudscale-metrics-engine",
      shortDesc: "Real-time high-cardinality observability & distributed metrics for Kubernetes workloads.",
      description: "CloudScale provides cloud-native development teams with instant, cost-effective metric aggregation and anomaly detection. Zero configuration agent installation with automatic telemetry parsing.",
      category: "Developer Tools",
      tags: ["DevOps", "Kubernetes", "Monitoring", "APM", "Observability"],
      productType: ProductType.DEVELOPER_TOOLS,
      priceCents: 19900, // $199.00 / month
      currency: "USD",
      pricingModel: PricingModel.SUBSCRIPTION_MONTHLY,
      commissionModel: CommissionModel.TEAM_POOL,
      commissionRateBps: 2500, // 25.00% gross commission pool
      attributionWindowDays: 60,
      recurringDurationMonths: 12,
      isVerified: true,
      images: [
        "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?w=800&auto=format&fit=crop&q=80",
      ],
      websiteUrl: "https://cloudscale-demo.io",
      targetAudience: "Engineering leads, VP of Platform, DevOps architects",
    },
  });

  const synthVoiceProduct = await prisma.product.create({
    data: {
      ownerId: marcusOwner.id,
      name: "SynthVoice AI Studio",
      slug: "synthvoice-ai-studio",
      shortDesc: "Next-generation hyper-realistic voice generation and localization for global media teams.",
      description: "Clone voices across 75+ languages with emotion modeling, cadence adjustment, and real-time studio audio mastering.",
      category: "AI Tools",
      tags: ["Generative AI", "Voice", "Audio", "Localization", "Podcasting"],
      productType: ProductType.AI_TOOLS,
      priceCents: 49900, // $499.00
      currency: "USD",
      pricingModel: PricingModel.ONE_TIME,
      commissionModel: CommissionModel.TEAM_POOL,
      commissionRateBps: 3000, // 30.00% gross commission pool
      attributionWindowDays: 45,
      isVerified: true,
      images: [
        "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=800&auto=format&fit=crop&q=80",
      ],
      websiteUrl: "https://synthvoice-demo.ai",
      targetAudience: "Content creators, game studios, commercial advertisers, audiobook publishers",
    },
  });

  const dataVaultProduct = await prisma.product.create({
    data: {
      ownerId: sarahOwner.id,
      name: "DataPulse Compliance Vault",
      slug: "datapulse-compliance-vault",
      shortDesc: "Automated SOC 2 and GDPR compliance readiness platform for high-growth tech startups.",
      description: "Continuous compliance monitoring, audit evidence collection, and automated vendor risk scoring in one pane of glass.",
      category: "SaaS & Software",
      tags: ["Security", "Compliance", "SOC 2", "GDPR", "Governance"],
      productType: ProductType.SAAS,
      priceCents: 89000, // $890.00 / mo
      currency: "USD",
      pricingModel: PricingModel.SUBSCRIPTION_MONTHLY,
      commissionModel: CommissionModel.TEAM_POOL,
      commissionRateBps: 2000, // 20.00%
      attributionWindowDays: 90,
      recurringDurationMonths: 6,
      isVerified: true,
      images: [
        "https://images.unsplash.com/photo-1563986768609-322da13575f3?w=800&auto=format&fit=crop&q=80",
      ],
      websiteUrl: "https://datapulse-demo.security",
      targetAudience: "Security directors, Founders, Compliance officers",
    },
  });

  // 3. Collaborative Growth Team
  const syndicateTeam = await prisma.team.create({
    data: {
      name: "HyperGrowth Syndicate",
      slug: "hypergrowth-syndicate",
      description: "An elite cross-functional commercial growth collective uniting B2B outbound closers, conversion copywriters, and developer advocates.",
      leaderId: elenaStrategist.id,
      industryFocus: "Developer Tools & Enterprise SaaS",
      skills: ["Outbound B2B", "Technical Copywriting", "SEO Authority", "Pipeline Generation"],
      visibility: "PUBLIC",
      status: "ACTIVE",
      logoUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200&auto=format&fit=crop&q=80",
    },
  });

  // Team Members & Commission Allocation
  // Total allocation must equal 10,000 bps (100.00%)
  await prisma.teamMember.createMany({
    data: [
      {
        teamId: syndicateTeam.id,
        userId: elenaStrategist.id,
        role: TeamMemberRole.LEADER,
        allocationBps: 4000, // 40.00%
        status: "ACTIVE",
      },
      {
        teamId: syndicateTeam.id,
        userId: alexCloser.id,
        role: TeamMemberRole.SALES_REP,
        allocationBps: 3500, // 35.00%
        status: "ACTIVE",
      },
      {
        teamId: syndicateTeam.id,
        userId: mayaMarketer.id,
        role: TeamMemberRole.MARKETER,
        allocationBps: 2500, // 25.00%
        status: "ACTIVE",
      },
    ],
  });

  // 4. Commercial Agreement
  const allocationRules = [
    { userId: elenaStrategist.id, memberRole: "LEADER", allocationBps: 4000 },
    { userId: alexCloser.id, memberRole: "SALES_REP", allocationBps: 3500 },
    { userId: mayaMarketer.id, memberRole: "MARKETER", allocationBps: 2500 },
  ];

  const termsText = "CloudScale Technologies agrees to provide 25% gross commission pool for all verified subscriptions generated by HyperGrowth Syndicate, distributed according to the accepted member allocation rules.";

  const agreementChecksum = generateAgreementChecksum({
    productId: cloudScaleProduct.id,
    teamId: syndicateTeam.id,
    agreementVersion: 1,
    commissionModel: CommissionModel.TEAM_POOL,
    commissionPoolBps: 2500,
    allocationRulesJson: allocationRules,
    termsText,
  });

  const agreement = await prisma.commercialAgreement.create({
    data: {
      productId: cloudScaleProduct.id,
      teamId: syndicateTeam.id,
      agreementVersion: 1,
      commissionModel: CommissionModel.TEAM_POOL,
      commissionPoolBps: 2500, // 25% pool
      allocationRulesJson: allocationRules,
      refundChargebackPolicy: "30-day proportional clawback on verified customer cancellations or chargebacks.",
      recurringDurationMonths: 12,
      attributionWindowDays: 60,
      termsText,
      checksum: agreementChecksum,
      status: AgreementStatus.ACTIVE,
    },
  });

  // Record tamper-evident acceptances by all parties
  await prisma.agreementAcceptance.createMany({
    data: [
      {
        agreementId: agreement.id,
        userId: sarahOwner.id,
        checksum: agreementChecksum,
        ipAddress: "192.0.2.45",
        userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)",
      },
      {
        agreementId: agreement.id,
        userId: elenaStrategist.id,
        checksum: agreementChecksum,
        ipAddress: "198.51.100.12",
        userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
      },
      {
        agreementId: agreement.id,
        userId: alexCloser.id,
        checksum: agreementChecksum,
        ipAddress: "203.0.113.89",
        userAgent: "Mozilla/5.0 (X11; Linux x86_64)",
      },
      {
        agreementId: agreement.id,
        userId: mayaMarketer.id,
        checksum: agreementChecksum,
        ipAddress: "198.51.100.44",
        userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)",
      },
    ],
  });

  // 5. Active Campaign & Referral Links
  const campaign = await prisma.campaign.create({
    data: {
      agreementId: agreement.id,
      teamId: syndicateTeam.id,
      name: "Q4 Developer Acquisition Sprint",
      targetRevenueCents: BigInt(5000000), // $50,000 target
      status: "ACTIVE",
    },
  });

  const referralCode = generateReferralCode("SCALE");
  const referralLink = await prisma.referralLink.create({
    data: {
      productId: cloudScaleProduct.id,
      userId: elenaStrategist.id,
      teamId: syndicateTeam.id,
      campaignId: campaign.id,
      code: referralCode,
      targetUrl: `http://localhost:3000/products/${cloudScaleProduct.slug}?ref=${referralCode}`,
      clickCount: 1420,
    },
  });

  // 6. Verified Sample Orders & Integer Commissions
  // Order 1: Monthly subscription for $199.00 (19,900 cents)
  // 25% pool = 4,975 cents ($49.75)
  // Elena (40%): 1,990 cents gross, 5% fee (99 cents), net: 1,891 cents ($18.91)
  // Alex (35%): 1,741 cents gross, 5% fee (87 cents), net: 1,654 cents ($16.54)
  // Maya (25%): 1,244 cents gross, 5% fee (62 cents), net: 1,182 cents ($11.82)
  const order1 = await prisma.order.create({
    data: {
      orderNumber: "ORD-849102",
      productId: cloudScaleProduct.id,
      referralLinkId: referralLink.id,
      customerEmail: "dev-lead@fintechsystems.com",
      customerName: "David Sterling",
      grossAmountCents: 19900,
      currency: "USD",
      status: OrderStatus.COMPLETED,
      externalProviderRef: "ch_pi_3N9xK2OpenSourceMock1",
      attributionRecord: {
        create: {
          method: "LAST_TOUCH_LINK",
          referralCode,
          evidenceData: { ip: "203.0.113.19", userAgent: "Chrome/124.0" },
        },
      },
    },
  });

  const payoutDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days maturation

  const comm1Elena = await prisma.commissionEntry.create({
    data: {
      orderId: order1.id,
      agreementId: agreement.id,
      userId: elenaStrategist.id,
      teamId: syndicateTeam.id,
      calculationBasisCents: 19900,
      rateBps: 2500,
      memberShareBps: 4000,
      grossCommissionCents: 1990,
      platformFeeCents: 99,
      netCommissionCents: 1891,
      currency: "USD",
      status: CommissionStatus.CONFIRMED,
      eligiblePayoutDate: payoutDate,
    },
  });

  await prisma.financialLedger.create({
    data: {
      entryType: LedgerEntryType.COMMISSION_EARNED,
      referenceId: comm1Elena.id,
      userId: elenaStrategist.id,
      commissionEntryId: comm1Elena.id,
      amountCents: 1891,
      currency: "USD",
      balanceAfterCents: 1891,
      idempotencyKey: `comm_${comm1Elena.id}_initial`,
      description: `Commission earned for Order #${order1.orderNumber} (Elena Rostova - 40%)`,
    },
  });

  const comm1Alex = await prisma.commissionEntry.create({
    data: {
      orderId: order1.id,
      agreementId: agreement.id,
      userId: alexCloser.id,
      teamId: syndicateTeam.id,
      calculationBasisCents: 19900,
      rateBps: 2500,
      memberShareBps: 3500,
      grossCommissionCents: 1741,
      platformFeeCents: 87,
      netCommissionCents: 1654,
      currency: "USD",
      status: CommissionStatus.CONFIRMED,
      eligiblePayoutDate: payoutDate,
    },
  });

  await prisma.financialLedger.create({
    data: {
      entryType: LedgerEntryType.COMMISSION_EARNED,
      referenceId: comm1Alex.id,
      userId: alexCloser.id,
      commissionEntryId: comm1Alex.id,
      amountCents: 1654,
      currency: "USD",
      balanceAfterCents: 1654,
      idempotencyKey: `comm_${comm1Alex.id}_initial`,
      description: `Commission earned for Order #${order1.orderNumber} (Alex Rivers - 35%)`,
    },
  });

  const comm1Maya = await prisma.commissionEntry.create({
    data: {
      orderId: order1.id,
      agreementId: agreement.id,
      userId: mayaMarketer.id,
      teamId: syndicateTeam.id,
      calculationBasisCents: 19900,
      rateBps: 2500,
      memberShareBps: 2500,
      grossCommissionCents: 1244,
      platformFeeCents: 62,
      netCommissionCents: 1182,
      currency: "USD",
      status: CommissionStatus.CONFIRMED,
      eligiblePayoutDate: payoutDate,
    },
  });

  await prisma.financialLedger.create({
    data: {
      entryType: LedgerEntryType.COMMISSION_EARNED,
      referenceId: comm1Maya.id,
      userId: mayaMarketer.id,
      commissionEntryId: comm1Maya.id,
      amountCents: 1182,
      currency: "USD",
      balanceAfterCents: 1182,
      idempotencyKey: `comm_${comm1Maya.id}_initial`,
      description: `Commission earned for Order #${order1.orderNumber} (Maya Patel - 25%)`,
    },
  });

  // 7. Team Tasks & Workspace
  await prisma.teamTask.createMany({
    data: [
      {
        teamId: syndicateTeam.id,
        creatorId: elenaStrategist.id,
        assigneeId: mayaMarketer.id,
        title: "Publish deep-dive benchmarking article vs Datadog",
        description: "Focus on cardinality limits and CloudScale's 80% cost reduction on high-volume metrics.",
        priority: "HIGH",
        status: "IN_PROGRESS",
      },
      {
        teamId: syndicateTeam.id,
        creatorId: elenaStrategist.id,
        assigneeId: alexCloser.id,
        title: "Follow up with 15 registered engineering directors",
        description: "Offer customized staging POC and review distributed tracing benchmarks.",
        priority: "URGENT",
        status: "TODO",
      },
      {
        teamId: syndicateTeam.id,
        creatorId: elenaStrategist.id,
        assigneeId: elenaStrategist.id,
        title: "Audit weekly attribution link CTR and funnel dropoff",
        description: "Inspect query parameters and check conversion rate on landing page variant B.",
        priority: "MEDIUM",
        status: "DONE",
      },
    ],
  });

  // Team Discussion
  const discussion = await prisma.teamDiscussion.create({
    data: {
      teamId: syndicateTeam.id,
      authorId: elenaStrategist.id,
      title: "Sprint Objective: Surpassing 50 Active Accounts this Month",
      content: "Team, we are seeing tremendous interest from Kubernetes engineering leads. Let's make sure all demo requests are followed up within 2 hours.",
      isPinned: true,
    },
  });

  await prisma.teamDiscussionComment.create({
    data: {
      discussionId: discussion.id,
      authorId: alexCloser.id,
      content: "On it! I have 4 staging demos scheduled for this Thursday with high-intent teams.",
    },
  });

  // 8. Notifications
  await prisma.notification.createMany({
    data: [
      {
        userId: elenaStrategist.id,
        title: "Commission Credited ($18.91)",
        message: "Order #ORD-849102 verified via referral code SCALE-A1B2.",
        type: "COMMISSION",
        linkUrl: "/dashboard/payouts",
      },
      {
        userId: sarahOwner.id,
        title: "New Verified Order Recorded",
        message: "Order #ORD-849102 was generated by HyperGrowth Syndicate.",
        type: "SALE",
        linkUrl: "/dashboard/owner",
      },
    ],
  });

  // 9. Legitimate Reviews from Completed Collaborations
  await prisma.review.create({
    data: {
      authorId: sarahOwner.id,
      targetTeamId: syndicateTeam.id,
      rating: 5,
      title: "Phenomenal growth execution and transparent communication",
      comment: "HyperGrowth Syndicate took our metrics engine from 12 pilot accounts to over 60 paying developer teams in 90 days. Revenue sharing was seamless and accurate.",
      isVerifiedCollaboration: true,
    },
  });

  console.log("✅ Seed completed successfully with realistic demo data!");
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
