import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const [developer, explorer] = await Promise.all([
    prisma.learningModeDefinition.upsert({ where: { mode: 'DEVELOPER' }, update: {}, create: { mode: 'DEVELOPER', title: 'Developer Mode' } }),
    prisma.learningModeDefinition.upsert({ where: { mode: 'EXPLORER' }, update: {}, create: { mode: 'EXPLORER', title: 'Everyday Explorer' } }),
  ]);
  await Promise.all([
    prisma.learningPath.upsert({ where: { slug: 'developer-curriculum' }, update: {}, create: { modeId: developer.id, slug: 'developer-curriculum', title: 'Ethereum Developer Curriculum' } }),
    prisma.learningPath.upsert({ where: { slug: 'explorer-curriculum' }, update: {}, create: { modeId: explorer.id, slug: 'explorer-curriculum', title: 'Everyday Explorer Curriculum' } }),
  ]);
  for (const [id, name, description, requirement, icon, color] of [
    ['first_victory', 'First Victory', 'Complete your first chapter.', 'Complete one master challenge.', 'spark', '#8eea91'],
    ['rising_explorer', 'Rising Explorer', 'Complete five chapters.', 'Complete five master challenges.', 'compass', '#70d7ff'],
    ['knowledge_champion', 'Knowledge Champion', 'Complete ten chapters.', 'Complete ten master challenges.', 'book', '#f4c95d'],
    ['ethereum_master', 'Ethereum Master', 'Complete the curriculum.', 'Complete all master challenges.', 'crown', '#d2a8ff'],
  ] as const) {
    await prisma.achievementDefinition.upsert({ where: { id }, update: {}, create: { id, name, description, requirement, icon, color } });
  }
}

main().finally(() => prisma.$disconnect());
