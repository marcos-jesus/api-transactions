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

  it('Should be able to get a specific transaction', async () => {
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

      const transactionId = listTransactionsResponse.body.transactions[0].id

      const getTransactionResponse = await request(app.server)
      .get(`/transaction/${transactionId}`)
      .set('Cookie', cookies)
      .expect(200)

    expect(listTransactionsResponse.body.transactions).toEqual([
      expect.objectContaining({
        title: 'new Transaction',
        amount: 5000,
      }),
    ])

    expect(getTransactionResponse.body.transaction).toEqual(
      expect.objectContaining({
        title: 'new Transaction',
        amount: 5000,
      }),
    )
  })

  it('Should be able to list a summary transaction', async () => {
    const createTransactionResponse = await request(app.server)
      .post('/transaction')
      .send({
        title: 'new Transaction',
        amount: 5000,
        type: 'credito',
      })

      await request(app.server)
      .post('/transaction')
      .send({
        title: 'discord nitro',
        amount: 3000,
        type: 'credito',
      })

    const cookies = createTransactionResponse.headers['set-cookie']

    const listSummaryResponse = await request(app.server)
      .get('/transaction/summary')
      .set('Cookie', cookies)
    
    console.log("listSummaryResponse.body",listSummaryResponse.body.summary)
    expect(listSummaryResponse.body.summary).toEqual(
      expect.objectContaining({
        amount: 5000,
      }),
    )
  })


})
