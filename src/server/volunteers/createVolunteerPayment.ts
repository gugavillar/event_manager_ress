import { z } from 'zod'

import {
	MAX_CURRENCY_VALUE,
	MIN_CURRENCY_VALUE,
	PaymentTypeAPI,
	TransactionAmountType,
	TransactionsType,
} from '@/constants'
import { prisma } from '@/lib/prisma'

export type CreateVolunteerPaymentArgs = {
	paymentType: (typeof PaymentTypeAPI)['CARD' | 'CASH' | 'PIX' | 'DONATION']
	paymentValue: number
	eventId: string
	volunteerId: string
	paymentReceived?: number
}

export const createVolunteerPayment = async (values: CreateVolunteerPaymentArgs) => {
	try {
		z.object({
			eventId: z.uuid(),
			paymentReceived: z.number().optional(),
			paymentType: z.enum([PaymentTypeAPI.CARD, PaymentTypeAPI.CASH, PaymentTypeAPI.PIX, PaymentTypeAPI.DONATION]),
			paymentValue: z.coerce.number().min(MIN_CURRENCY_VALUE).max(MAX_CURRENCY_VALUE),
			volunteerId: z.uuid(),
		}).parse({ ...values })

		return await prisma.$transaction(async (tx) => {
			const payment = await tx.volunteerPayment.create({
				data: {
					...values,
				},
			})

			if ([PaymentTypeAPI.DONATION].includes(values.paymentType)) {
				return
			}

			const volunteer = await tx.volunteer.findUnique({
				where: {
					id: values.volunteerId,
				},
			})

			await tx.transactions.create({
				data: {
					amount: values.paymentType === PaymentTypeAPI.CARD ? (values.paymentReceived as number) : values.paymentValue,
					amountType:
						values.paymentType === PaymentTypeAPI.CASH ? TransactionAmountType.CASH : TransactionAmountType.ACCOUNT,
					date: new Date(),
					description: `Pagamento ficha - ${volunteer?.name}`,
					eventId: values.eventId,
					type: TransactionsType.INCOME,
					volunteerPaymentId: payment.id,
				},
			})
		})
	} catch (error) {
		console.error('@createVolunteerPayment error:', error)
		throw Error
	}
}
