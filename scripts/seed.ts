import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '../src/infra/database/schema';
import { eq } from 'drizzle-orm';
import 'dotenv/config';

async function main() {
    const databaseUrl = process.env.DATABASE_URL;

    if (!databaseUrl) {
        throw new Error('DATABASE_URL is not defined in environment variables');
    }

    const client = postgres(databaseUrl);
    const db = drizzle(client, { schema });

    console.log('🌱 Seeding database...');

    // 1. Create Categories
    console.log('Creating categories...');
    await db.insert(schema.categories).values([
        { name: 'Português', description: 'Aulas de Português' },
        { name: 'Matemática', description: 'Aulas de Matemática' },
        // Add more if needed, ensuring we have enough for the demo
    ]).onConflictDoNothing();

    const allCategories = await db.select().from(schema.categories);

    // 2. Create Users (Professor & Student)
    console.log('Creating users...');

    // Professor
    await db.insert(schema.users).values({
        name: 'Carlos Professor',
        email: 'professor@blogaulas.com',
        passwordHash: 'hashed_secret_password',
        role: 'PROFESSOR',
    }).onConflictDoNothing();

    const professor = await db.query.users.findFirst({
        where: eq(schema.users.email, 'professor@blogaulas.com')
    });

    // Student
    await db.insert(schema.users).values({
        name: 'João Aluno',
        email: 'aluno@blogaulas.com',
        passwordHash: 'hashed_secret_password',
        role: 'ALUNO',
    }).onConflictDoNothing();

    const student = await db.query.users.findFirst({
        where: eq(schema.users.email, 'aluno@blogaulas.com')
    });

    if (!professor || !student) {
        throw new Error('Failed to create/find users');
    }

    // 3. Create Posts & Comments
    console.log('Creating posts and comments...');

    for (const category of allCategories) {
        // Check if post already exists to avoid duplicates if seed runs twice (simple check by title)
        const existingPost = await db.query.posts.findFirst({
            where: eq(schema.posts.title, `Introdução a ${category.name}`)
        });

        let postId = existingPost?.id;

        if (!existingPost) {
            const [post] = await db.insert(schema.posts).values({
                title: `Introdução a ${category.name}`,
                content: `Conteúdo introdutório sobre ${category.name}. Nesta aula vamos aprender os conceitos básicos.`,
                authorId: professor.id,
                categoryId: category.id,
            }).returning();
            postId = post.id;
        }

        if (postId) {
            // Create Comment
            // Check duplicate comment
            const existingComment = await db.query.comments.findFirst({
                where: eq(schema.comments.postId, postId)
            });

            if (!existingComment) {
                await db.insert(schema.comments).values({
                    content: `Professor, tenho uma dúvida sobre ${category.name}!`,
                    authorId: student.id,
                    postId: postId,
                });
            }
        }
    }

    console.log(`✅ Seed completed! ensured logic for ${allCategories.length} categories.`);
    await client.end();
}

main().catch((err) => {
    console.error('❌ Seed failed!');
    console.error(err);
    process.exit(1);
});
