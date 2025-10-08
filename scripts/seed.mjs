import { PrismaClient } from '@prisma/client';

const db = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Enable WAL mode for better concurrency (using queryRaw for SQLite)
  

  // Create synthients
  const synthient1 = await db.synthient.create({
    data: { id: 'synthient-1', name: 'OCEAN-Alpha' }
  });
  const synthient2 = await db.synthient.create({
    data: { id: 'synthient-2', name: 'OCEAN-Beta' }
  });
  console.log(`✅ Created 2 synthients`);

  // Create a sample proposal
  const p = await db.proposal.create({
    data: {
      id: 'proposal-1',
      title: "Adopt CI-only evidence writer",
      body: "CI writes /public/status/version.json and /public/evidence/verify/<sha>/"
    }
  });
  console.log(`✅ Created proposal: ${p.title}`);

  // Create an approval vote
  await db.vote.create({
    data: {
      id: 'vote-1',
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

