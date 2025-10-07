import { PrismaClient } from '@prisma/client';

const db = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Enable WAL mode for better concurrency (using queryRaw for SQLite)
  await db.$queryRaw`PRAGMA journal_mode = WAL;`;

  // Create synthients
  const synthients = await db.synthient.createMany({
    data: [
      { name: 'OCEAN-Alpha' },
      { name: 'OCEAN-Beta' }
    ]
  });
  console.log(`✅ Created ${synthients.count} synthients`);

  // Create a sample proposal
  const p = await db.proposal.create({
    data: {
      title: "Adopt CI-only evidence writer",
      body: "CI writes /public/status/version.json and /public/evidence/verify/<sha>/"
    }
  });
  console.log(`✅ Created proposal: ${p.title}`);

  // Create an approval vote
  await db.vote.create({
    data: {
      proposalId: p.id,
      voter: "CTO",
      decision: "approve",
      reason: "Meets verification gate requirements"
    }
  });
  console.log('✅ Created approval vote');

  console.log('🎉 Seed complete!');
}

main()
  .then(async () => {
    await db.$disconnect();
    process.exit(0);
  })
  .catch(async (e) => {
    console.error('❌ Seed failed:', e);
    await db.$disconnect();
    process.exit(1);
  });

