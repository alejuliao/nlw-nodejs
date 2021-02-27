import request from 'supertest';
import { getConnection } from 'typeorm';
import { app } from '../app';

import createConnection from '../database';

describe("Users",()=>{
  beforeAll(async()=>{
    const connection = await createConnection();
    await connection.runMigrations();
  });
  afterAll(async()=> {
    const connection = getConnection();
    await connection.dropDatabase();
    await connection.close();
  })

  it("Should be able to create a new user", async()=>{
  const response = await request(app).post("/users").send({
    email: "Adelle_Gusikowski93@yahoo.com",
    name: "Jessie Kiehn"
  });
  expect(response.status).toBe(201);
  });

  it("shold not be able to create a user with exists email", async()=>{
    const response = await request(app).post("/users")
    .send({
      email: "Adelle_Gusikowski93@yahoo.com",
      name: "Jessie Kiehn"
    });
    expect(response.status).toBe(400);
    });
});
