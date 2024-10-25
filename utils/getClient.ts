import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function getClientById(clientId: number
): Promise<string | { ApiKey: string | null; AppKey: string | null } | null> {
    try {
        // Fetch Client API keys from DB
        console.log(`Fetching encrypted APP API & API KEY from DB for client id: ${clientId}`);

        const client = await prisma.client.findUnique({
            where: { id: clientId }, 
            select: {
                ApiKey: true,
                AppKey: true,
            },
        });

        if (!client) {
            console.warn(`Client with id ${clientId} not found.`);
            return `Client with id ${clientId} not found.`;
        }

        return client;
    } catch (error) {
        console.error('Error fetching client API keys:', error);
        throw new Error('Failed to fetch client API keys.');
    } finally {
        await prisma.$disconnect();
    }
}
