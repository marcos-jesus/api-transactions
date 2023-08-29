/* eslint-disable prettier/prettier */
import { expect, describe, it, beforeAll, afterAll, beforeEach } from 'vitest'
import { execSync } from 'node:child_process'
import request from 'supertest'
import { app } from '../app'

describe('Should expected make requests', () => {
  beforeAll(async () => {
    await app.ready()
  })

  afterAll(async () => {
    await app.close()
  })

  beforeEach(() => {
    execSync("npm run knex migrate:rollback --all")
    execSync('npm run knex migrate:latest')

  })

  it('Should be created new transaction', async () => {
    await request(app.server)
      .post('/transaction')
      .send({
        title: 'new Transaction',
        amount: 5000,
        type: 'credito',
      })
      .expect(201)
  })

  it('Should be able to list all transactions', async () => {
    const createTransactionResponse = await request(app.server)
      .post('/transaction')
      .send({
        title: 'new Transaction',
        amount: 5000,
        type: 'credito',
      })

    const cookies = createTransactionResponse.headers['set-cookie']

    const listTransactionsResponse = await request(app.server)
      .get('/transaction')
      .set('Cookie', cookies)

    expect(listTransactionsResponse.body.transactions).toEqual([
      expect.objectContaining({
        title: 'new Transaction',
        amount: 5000,
      }),
    ])
  })
})
