import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '../src/infra/database/schema';
import { eq } from 'drizzle-orm';
import 'dotenv/config';
import * as bcrypt from 'bcrypt';

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

    // Hash password '123456'
    const passwordHash = await bcrypt.hash('123456', 10);


    // Professor
    await db.insert(schema.users).values({
        name: 'Carlos Professor',
        email: 'professor@blogaulas.com',
        passwordHash,
        role: 'PROFESSOR',
    }).onConflictDoNothing();

    const professor = await db.query.users.findFirst({
        where: eq(schema.users.email, 'professor@blogaulas.com')
    });

    // Student
    await db.insert(schema.users).values({
        name: 'João Aluno',
        email: 'aluno@blogaulas.com',
        passwordHash,
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

    const postsToCreate = 20;

    for (let i = 1; i <= postsToCreate; i++) {
        const category = allCategories[i % allCategories.length];
        const title = `Post de Exemplo #${i} - ${category.name}`;

        const existingPost = await db.query.posts.findFirst({
            where: eq(schema.posts.title, title)
        });

        let postId = existingPost?.id;

        if (!existingPost) {
            const [post] = await db.insert(schema.posts).values({
                title: title,
                content: `Este é o conteúdo do post de exemplo número ${i}. Ele pertence à categoria ${category.name}. Lorem ipsum dolor sit amet, consectetur adipiscing elit.`,
                authorId: professor.id,
                categoryId: category.id,
            }).returning();
            postId = post.id;
        }

        if (postId) {
            // Create a couple of comments for some posts
            if (i % 2 === 0) {
                const commentContent = `Comentário interessante no post ${i}!`;
                const existingComment = await db.query.comments.findFirst({
                    where: eq(schema.comments.content, commentContent)
                });

                if (!existingComment) {
                    await db.insert(schema.comments).values({
                        content: commentContent,
                        authorId: student.id,
                        postId: postId,
                    });
                }
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
