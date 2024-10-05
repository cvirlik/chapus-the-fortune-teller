import { MongoClient } from 'mongodb';

const url = 'mongodb://localhost:27017';
const client = new MongoClient(url);

const dbName = 'luck-shnorble-base';

export async function connect() {
  await client.connect();
  console.log('Connected successfully to server');
  const db = client.db(dbName);
  const collection = db.collection<Check>('checks');

  return {collection};
}

export type Check = {
    id: number;
    luck: number;
    createdAt: Date;
}