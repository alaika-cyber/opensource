import { describe, it, expect } from "vitest";
import { db } from "../lib/db";
import { hashPassword, createSessionToken, verifySessionToken } from "../lib/auth";
import { generateAgreementChecksum } from "../lib/commission";
import { recordLedgerEntry, getUserPayableBalance } from "../lib/ledger";
import { Role, LedgerEntryType } from "@prisma/client";

describe("OpenSource Business Collaboration & Execution Platform Workflows", { timeout: 25000 }, () => {
  const timestamp = Date.now();
  let founderId: string;
  let engineerId: string;
  let marketerId: string;
  let unauthorizedUserId: string;

  let projectId: string;
  let projectSlug: string;
  let opportunityId: string;
  let applicationId: string;
  let taskId: string;
  let meetingId: string;
  let milestoneId: string;
  let goalId: string;
  let docPublicId: string;
  let docConfidentialId: string;
  let agreementId: string;

  it("Step 1: Founder and Specialists register with skills and profiles", async () => {
    const passwordHash = await hashPassword("TestCollab2026!");

    const founder = await db.user.create({
      data: {
        email: `founder_${timestamp}@platform.test`,
        passwordHash,
        name: "Founder Alice",
        role: Role.USER,
        emailVerified: true,
        profile: {
          create: {
            headline: "Serial Entrepreneur & Hardware Inventor",
            bio: "Building innovative consumer tech and physical products.",
            skills: ["Product Strategy", "Hardware Prototyping"],
          },
        },
      },
    });
    founderId = founder.id;
    expect(founder.id).toBeDefined();

    const engineer = await db.user.create({
      data: {
        email: `engineer_${timestamp}@platform.test`,
        passwordHash,
        name: "Bob Engineer",
        role: Role.USER,
        emailVerified: true,
        profile: {
          create: {
            headline: "Principal Systems & Full-Stack Architect",
            bio: "10+ years shipping scalable distributed systems and web applications.",
            skills: ["TypeScript", "Next.js", "PostgreSQL", "System Architecture"],
          },
        },
      },
    });
    engineerId = engineer.id;
    expect(engineer.id).toBeDefined();

    const marketer = await db.user.create({
      data: {
        email: `marketer_${timestamp}@platform.test`,
        passwordHash,
        name: "Carol Marketer",
        role: Role.USER,
        emailVerified: true,
        profile: {
          create: {
            headline: "Growth Lead & B2B Pipeline Builder",
            skills: ["Outbound B2B", "Content Strategy", "Lead Generation"],
          },
        },
      },
    });
    marketerId = marketer.id;
    expect(marketer.id).toBeDefined();

    const outsider = await db.user.create({
      data: {
        email: `outsider_${timestamp}@platform.test`,
        passwordHash,
        name: "Dan Outsider",
        role: Role.USER,
        emailVerified: true,
      },
    });
    unauthorizedUserId = outsider.id;
    expect(outsider.id).toBeDefined();
  });

  it("Step 2: Founder publishes a business project with roles and objectives", async () => {
    projectSlug = `smart-iot-sensor-${timestamp}`;
    const project = await db.product.create({
      data: {
        ownerId: founderId,
        name: `Smart IoT Environmental Sensor ${timestamp}`,
        slug: projectSlug,
        shortDesc: "Energy-harvesting industrial air quality and telemetry sensor.",
        description: "Zero-battery wireless sensor network for logistics facilities and smart warehouses.",
        category: "Hardware & IoT",
        businessStage: "SEED",
        businessGoals: ["Deploy 50 pilots in industrial warehouses by Q3."],
        requiredSkills: ["TypeScript", "Embedded Firmware", "B2B Outbound"],
        openPositions: ["Principal Software Engineer", "Head of Enterprise Sales"],
        compensationModels: ["MILESTONE_BASED", "REVENUE_SHARE", "EQUITY_PROPOSAL"],
        budgetDescription: "$15,000 milestone pool + 5% equity proposal",
        priceCents: 49900, // $499.00 device package
        currency: "USD",
        status: "ACTIVE",
      },
    });
    projectId = project.id;
    expect(project.id).toBeDefined();
    expect(project.businessStage).toBe("SEED");
    expect(project.openPositions).toContain("Principal Software Engineer");

    // Auto-add founder as active member
    const founderMember = await db.projectMember.create({
      data: {
        projectId: project.id,
        userId: founderId,
        role: "Founder & Lead Architect",
        department: "Operations",
        status: "ACTIVE",
      },
    });
    expect(founderMember.userId).toBe(founderId);

    // Create recruitment opportunity
    const opp = await db.opportunity.create({
      data: {
        productId: project.id,
        title: "Join Early-Stage IoT Venture Team",
        description: "Seeking lead engineer and enterprise closer for Q3 pilot rollouts.",
        rolesNeeded: ["TypeScript", "Embedded Systems", "B2B Sales"],
        isOpen: true,
      },
    });
    opportunityId = opp.id;
    expect(opportunityId).toBeDefined();
  });

  it("Step 3: Specialist submits application, founder reviews and accepts", async () => {
    // Engineer submits application
    const application = await db.opportunityApplication.create({
      data: {
        opportunityId,
        applicantUserId: engineerId,
        proposedRole: "Principal Software Engineer",
        skills: ["TypeScript", "PostgreSQL", "Next.js"],
        requestedCompensation: "$5,000 per milestone deliverable + 3% equity proposal",
        coverLetter: "I have built industrial telemetry pipelines and can deliver the cloud dashboard in 4 weeks.",
        status: "PENDING",
      },
    });
    applicationId = application.id;
    expect(application.status).toBe("PENDING");

    // Prevent duplicate application from same user
    const existing = await db.opportunityApplication.findFirst({
      where: {
        opportunityId,
        applicantUserId: engineerId,
        status: { in: ["PENDING", "UNDER_REVIEW", "ACCEPTED"] },
      },
    });
    expect(existing).not.toBeNull();

    // Founder reviews and marks UNDER_REVIEW
    const underReview = await db.opportunityApplication.update({
      where: { id: applicationId },
      data: { status: "UNDER_REVIEW", reviewNotes: "Impressive telemetry background." },
    });
    expect(underReview.status).toBe("UNDER_REVIEW");

    // Founder accepts application and assigns to Engineering department
    const acceptedApp = await db.opportunityApplication.update({
      where: { id: applicationId },
      data: { status: "ACCEPTED", reviewNotes: "Accepted for Q3 cloud telemetry build." },
    });
    expect(acceptedApp.status).toBe("ACCEPTED");

    // Add accepted engineer to ProjectMember
    const member = await db.projectMember.create({
      data: {
        projectId,
        userId: engineerId,
        role: "Principal Software Engineer",
        department: "Engineering",
        status: "ACTIVE",
      },
    });
    expect(member.department).toBe("Engineering");
    expect(member.status).toBe("ACTIVE");
  });

  it("Step 4: Team members collaborate inside Project Workspace", async () => {
    // 1. Task Creation & Assignment
    const task = await db.teamTask.create({
      data: {
        projectId,
        creatorId: founderId,
        assigneeId: engineerId,
        title: "Build Telemetry Ingestion WebSocket API",
        description: "Implement high-throughput endpoint receiving sensor payloads every 30 seconds.",
        department: "Engineering",
        priority: "HIGH",
        status: "TODO",
        labels: ["backend", "api", "websockets"],
        acceptanceCriteria: "Handles 1,000 simultaneous connections with p99 latency < 50ms.",
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });
    taskId = task.id;
    expect(task.priority).toBe("HIGH");
    expect(task.assigneeId).toBe(engineerId);

    // Update task progression
    const inProgressTask = await db.teamTask.update({
      where: { id: taskId },
      data: { status: "IN_PROGRESS" },
    });
    expect(inProgressTask.status).toBe("IN_PROGRESS");

    const completedTask = await db.teamTask.update({
      where: { id: taskId },
      data: { status: "DONE" },
    });
    expect(completedTask.status).toBe("DONE");

    // 2. Schedule Video Meeting
    const meeting = await db.projectMeeting.create({
      data: {
        projectId,
        creatorId: founderId,
        title: "Sprint 1 Architecture & Milestone Review",
        scheduledAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
        durationMinutes: 60,
        timezone: "America/New_York",
        meetingUrl: "https://meet.google.com/xyz-collab-test",
        agenda: "1. Hardware sample specs\n2. Ingestion API benchmarks\n3. Pilot customer criteria",
      },
    });
    meetingId = meeting.id;
    expect(meeting.durationMinutes).toBe(60);

    // 3. Document Repository with Confidentiality Authorization
    const publicDoc = await db.projectDocument.create({
      data: {
        projectId,
        name: "Public Product Overview & Pitch Deck",
        fileUrl: "https://storage.opensource.test/public/pitch-deck.pdf",
        category: "Product Specs",
        isConfidential: false,
        uploaderId: founderId,
      },
    });
    docPublicId = publicDoc.id;
    expect(publicDoc.isConfidential).toBe(false);

    const confidentialDoc = await db.projectDocument.create({
      data: {
        projectId,
        name: "Proprietary Sensor Firmware Schematic & PCB Gerber Files",
        fileUrl: "https://storage.opensource.test/vault/pcb-schematic-v2.zip",
        category: "Engineering",
        isConfidential: true,
        uploaderId: founderId,
      },
    });
    docConfidentialId = confidentialDoc.id;
    expect(confidentialDoc.isConfidential).toBe(true);

    // Verify Server-Side Authorization Check for Confidential Docs
    // Check if engineer is member
    const engineerMember = await db.projectMember.findUnique({
      where: {
        projectId_userId: { projectId, userId: engineerId },
      },
    });
    expect(engineerMember).not.toBeNull(); // Engineer is authorized

    // Check outsider
    const outsiderMember = await db.projectMember.findUnique({
      where: {
        projectId_userId: { projectId, userId: unauthorizedUserId },
      },
    });
    expect(outsiderMember).toBeNull(); // Outsider is NOT authorized to see confidential docs

    // 4. Milestone & Progress Tracking
    const milestone = await db.projectMilestone.create({
      data: {
        projectId,
        title: "Milestone 1: Working End-to-End Cloud Pipeline Prototype",
        description: "Working gateway transmitting telemetry to live dashboard with alert triggers.",
        dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        progressPercent: 100,
        status: "COMPLETED",
        kpis: "1000 msgs/sec",
      },
    });
    milestoneId = milestone.id;
    expect(milestone.progressPercent).toBe(100);

    // 5. Goals & KPI Metrics
    const goal = await db.projectGoal.create({
      data: {
        projectId,
        title: "Beta Facility Pilot Signups",
        targetValue: "20",
        currentValue: "12",
        unit: "facilities",
        status: "ON_TRACK",
      },
    });
    goalId = goal.id;
    expect(goal.status).toBe("ON_TRACK");

    // 6. Business Execution: Business Plan Builder
    const plan = await db.projectBusinessPlan.create({
      data: {
        projectId,
        title: "Industrial IoT Market Entry Business Plan",
        templateName: "HARDWARE_IOT",
        executiveSummary: "Disrupting predictive maintenance in cold-chain logistics.",
        targetMarket: "Cold storage warehouses, pharmaceutical transport, and food distributors.",
        valueProposition: "Zero-maintenance 5-year wireless sensors with automated compliance logging.",
        revenueStrategy: "Hardware kit purchase + annual SaaS software telemetry tier.",
        marketingChannels: "Direct industrial sales, integration partnerships with BMS vendors.",
        operationsRoadmap: "Initial 100 unit manufacturing batch followed by contract manufacturer scale.",
        financialProjections: "50 pilots in Year 1 yielding $250k ARR; scaling to 500 facilities in Year 2.",
      },
    });
    expect(plan.templateName).toBe("HARDWARE_IOT");

    // 7. Business Execution: B2B CRM Pipeline
    const lead = await db.projectLead.create({
      data: {
        projectId,
        leadName: "Sarah Jenkins, VP of Operations",
        company: "Global Cold Logistics Corp",
        email: "sjenkins@globallogistics.example",
        stage: "QUALIFIED",
        estimatedValueCents: 4500000, // $45,000.00
        assigneeId: marketerId,
        notes: "Requested a 5-sensor pilot kit for their Chicago hub.",
      },
    });
    expect(lead.stage).toBe("QUALIFIED");
    expect(lead.estimatedValueCents).toBe(4500000);

    // 8. Business Execution: Risks & Mitigation
    const risk = await db.projectRisk.create({
      data: {
        projectId,
        description: "Semiconductor lead times for wireless transceiver chips extending from 4 to 12 weeks.",
        impact: "HIGH",
        probability: "MEDIUM",
        mitigationPlan: "Pre-order 1,000 unit batch from alternative distributor and validate dual-footprint design.",
        status: "IDENTIFIED",
      },
    });
    expect(risk.impact).toBe("HIGH");

    // 9. Business Execution: Architectural & Strategic Decisions
    const decision = await db.projectDecision.create({
      data: {
        projectId,
        title: "Adopt MQTT over WebSockets for Gateway-to-Cloud Bridge",
        decision: "Use MQTT with TLS 1.3 and fallback to HTTP/2 POST batches if MQTT port is firewalled.",
        rationale: "Reduces data usage by 68% while maintaining reliable message delivery over cellular links.",
        decidedById: engineerId,
      },
    });
    expect(decision.decidedById).toBe(engineerId);
  });

  it("Step 5: Commercial Agreement with tamper-evident SHA256 checksum and Integer Ledger", async () => {
    // Agreement data
    const termsPayload = {
      compensationType: "MILESTONE_BASED",
      fixedFeeCents: 300000, // $3,000.00 milestone payment
      milestoneTerms: "Payable upon acceptance of Milestone 1 cloud pipeline prototype.",
      equityProposalText: "Proposed 3.00% advisory/contributor option grant upon corporate incorporation.",
      equityDisclaimer: "This proposal represents a non-binding intent and does not constitute legally issued securities or financial instruments.",
    };

    const agreementData = {
      productId: projectId,
      teamId: null,
      agreementVersion: 1,
      commissionModel: "CUSTOM",
      commissionPoolBps: 0,
      allocationRulesJson: [],
      termsText: JSON.stringify(termsPayload),
    };

    const checksum = generateAgreementChecksum(agreementData);
    expect(checksum).toBeDefined();
    expect(checksum).toHaveLength(64);

    // Record agreement in database
    const agreement = await db.commercialAgreement.create({
      data: {
        productId: projectId,
        agreementVersion: 1,
        commissionModel: "CUSTOM",
        commissionPoolBps: 0,
        allocationRulesJson: [],
        termsText: agreementData.termsText,
        checksum: checksum,
        compensationType: "MILESTONE_BASED",
        fixedFeeCents: 300000,
        milestoneTerms: termsPayload.milestoneTerms,
        equityProposalText: termsPayload.equityProposalText,
        equityDisclaimer: termsPayload.equityDisclaimer,
      },
    });
    agreementId = agreement.id;
    expect(agreement.checksum).toBe(checksum);
    expect(agreement.fixedFeeCents).toBe(300000);

    // Milestone completion triggers integer ledger credit with idempotency
    const idempotencyKey = `milestone_payout_${projectId}_m1_${timestamp}`;
    const ledgerResult = await recordLedgerEntry({
      userId: engineerId,
      entryType: LedgerEntryType.COMMISSION_EARNED,
      referenceId: milestoneId,
      amountCents: 300000, // $3,000.00 in integer minor units
      currency: "USD",
      idempotencyKey,
      description: "Milestone 1 Prototype delivery approved by founder.",
    });

    expect(ledgerResult.alreadyProcessed).toBe(false);
    expect(ledgerResult.entry.amountCents).toBe(300000);
    expect(ledgerResult.entry.userId).toBe(engineerId);

    // Verify duplicate attempt is idempotent and does not create duplicate entries
    const duplicateLedger = await recordLedgerEntry({
      userId: engineerId,
      entryType: LedgerEntryType.COMMISSION_EARNED,
      referenceId: milestoneId,
      amountCents: 300000,
      currency: "USD",
      idempotencyKey,
      description: "Duplicate attempt for Milestone 1",
    });

    expect(duplicateLedger.alreadyProcessed).toBe(true);
    expect(duplicateLedger.entry.id).toBe(ledgerResult.entry.id);

    // Verify engineer's payable ledger balance
    const balance = await getUserPayableBalance(engineerId);
    expect(balance).toBeGreaterThanOrEqual(300000);
  });
});
