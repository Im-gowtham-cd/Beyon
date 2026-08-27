import { Client, Account, Databases, Storage } from "appwrite";

const client = new Client()
    .setEndpoint("https://sgp.cloud.appwrite.io/v1")
    .setProject("6a8f0bbf00106d9d9dc0");

const DATABASE_ID = "6a8f0bbf00106d9d9dc0";

const account = new Account(client);
const databases = new Databases(client);
const storage = new Storage(client);

// Ping Appwrite backend to verify connection on import
try {
    client.ping();
} catch {
    // Silent fail — ping is best-effort
}

export { client, account, databases, storage, DATABASE_ID };
