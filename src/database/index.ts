import { Client, Databases, Query } from "node-appwrite";

export class DB {
    private client: Client;
    private database_id: string = "";

    constructor(api_secret: string, project_id: string, database_id: string) {
        this.client = new Client()
            .setEndpoint('https://cloud.appwrite.io/v1')
            .setProject(project_id)
            .setKey(api_secret)
        this.database_id = database_id
    }

    async collection(search: string): Promise<string> {
        const databases = new Databases(this.client)
        const result = await databases.listCollections(this.database_id, [], search)
        if (result.total === 0) {
            throw new Error(`Collection ${search} not found`)
        }
        if (result.total > 1) {
            throw new Error(`Multiple collections found for ${search}`)
        }
        return result.collections[0].$id
    }

    async findDocuments(collection_id: string, queries: string[], offset: number, limit: number): Promise<any> {
        const databases = new Databases(this.client)
        return await databases.listDocuments(
            this.database_id,
            collection_id,
            [
                ...queries,
                Query.limit(limit),
                Query.offset(offset)
            ]
        )
    }

    async getDocument(collection_id: string, document_id: string): Promise<any> {
        const databases = new Databases(this.client)
        return await databases.getDocument(this.database_id, collection_id, document_id)
    }
}
