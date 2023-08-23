import { randomUUID } from 'node:crypto'
import { FastifyInstance } from 'fastify'
import { knex } from '../database'
import { z } from 'zod'

export async function transactionsRoutes(app: FastifyInstance) {
  app.get('/transaction', async () => {
    const transactions = await knex('transactions').select()

    return {
      total: 200,
      transactions,
    }
  })

  app.get('/transaction/:id', async (request) => {
    const getTransactionParamsSchema = z.object({
      id: z.string().uuid(),
    })

    const { id } = getTransactionParamsSchema.parse(request.params)

    const transaction = await knex('transactions').where('id', id).first()

    return { transaction }
  })

  app.get('/transaction/summary', async () => {
    const summary = await knex('transactions').sum({ amount: 'amount' }).first()
    const id = randomUUID()
    return { id, summary }
  })

  app.post('/transaction', async (request, response) => {
    const createTransactionBodySchema = z.object({
      title: z.string(),
      amount: z.number(),
      type: z.enum(['credito', 'debito']),
    })

    const { title, amount, type } = createTransactionBodySchema.parse(
      request.body,
    )

    let sessionId = request.cookies.sessionId

    if (!sessionId) {
      sessionId = randomUUID()

      response.cookie('sessionId', sessionId, {
        path: '/',
        maxAge: 1000 * 60 * 60 * 24, // 2 days
      })
    }

    await knex('transactions').insert({
      id: randomUUID(),
      title,
      amount: type === 'credito' ? amount : amount * -1,
      session_id: sessionId,
    })

    return response.status(201).send()
  })
}
