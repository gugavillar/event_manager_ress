import { z } from 'zod'

import {
	MAX_CURRENCY_VALUE,
	MIN_CURRENCY_VALUE,
	PaymentTypeAPI,
	TransactionAmountType,
	TransactionsType,
} from '@/constants'
import { prisma } from '@/lib/prisma'

export type CreateParticipantPaymentArgs = {
	paymentType: (typeof PaymentTypeAPI)['CARD' | 'CASH' | 'PIX' | 'DONATION']
	paymentValue: number
	paymentReceived?: number
	eventId: string
	participantId: string
}

export const createParticipantPayment = async (values: CreateParticipantPaymentArgs) => {
	try {
		z.object({
			eventId: z.uuid(),
			participantId: z.uuid(),
			paymentReceived: z.number().optional(),
			paymentType: z.enum([PaymentTypeAPI.CARD, PaymentTypeAPI.CASH, PaymentTypeAPI.PIX, PaymentTypeAPI.DONATION]),
			paymentValue: z.coerce.number().min(MIN_CURRENCY_VALUE).max(MAX_CURRENCY_VALUE),
		}).parse({ ...values })

		return await prisma.$transaction(async (tx) => {
			const payment = await tx.participantPayment.create({
				data: {
					...values,
				},
			})

			if ([PaymentTypeAPI.DONATION].includes(values.paymentType)) {
				return
			}

			const participant = await tx.participant.findUnique({
				where: {
					id: values.participantId,
				},
			})

			await tx.transactions.create({
				data: {
					amount: values.paymentType === PaymentTypeAPI.CARD ? (values.paymentReceived as number) : values.paymentValue,
					amountType:
						values.paymentType === PaymentTypeAPI.CASH ? TransactionAmountType.CASH : TransactionAmountType.ACCOUNT,
					date: new Date(),
					description: `Pagamento ficha - ${participant?.name}`,
					eventId: values.eventId,
					participantPaymentId: payment.id,
					type: TransactionsType.INCOME,
				},
			})
		})
	} catch (error) {
		console.error('@createParticipantPayment error:', error)
		throw Error
	}
}
