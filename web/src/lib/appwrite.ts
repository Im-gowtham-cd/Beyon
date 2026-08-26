import { Client, Account, Databases, Storage } from "appwrite";

const client = new Client()
    .setEndpoint("https://sgp.cloud.appwrite.io/v1")
    .setProject("6a8ebc22001ff0f8a815");

const account = new Account(client);
const databases = new Databases(client);
const storage = new Storage(client);

// Ping Appwrite backend to verify connection on import
try {
    client.ping();
} catch {
    // Silent fail — ping is best-effort
}

export { client, account, databases, storage };
