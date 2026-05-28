import { z } from 'zod'

import { PaymentTypeAPI } from '@/constants'
import { currencyValue, removeCurrencyFormat } from '@/formatters'

import { paymentOptionsRadio } from './PaymentModal.utils'

export const PaymentModalSchema = (maxPaidValue: number, paidValue: number) =>
	z
		.object({
			paid: z.enum([paymentOptionsRadio(false)[0].value, paymentOptionsRadio(false)[1].value], {
				error: 'Campo obrigatório',
			}),
			paymentReceived: z.string().optional(),
			paymentType: z
				.union([
					z.enum([PaymentTypeAPI.CARD, PaymentTypeAPI.CASH, PaymentTypeAPI.PIX, PaymentTypeAPI.DONATION], {
						error: 'Campo obrigatório',
					}),
					z.string(),
				])
				.refine(
					(val) =>
						[PaymentTypeAPI.CARD, PaymentTypeAPI.CASH, PaymentTypeAPI.PIX, PaymentTypeAPI.DONATION].includes(
							val as PaymentTypeAPI
						),
					{
						error: 'Campo obrigatório',
					}
				),
			paymentValue: z.string().optional(),
		})
		.superRefine((data, ctx) => {
			if (data.paymentValue) {
				const totalPaid = Number(removeCurrencyFormat(data.paymentValue)) + paidValue
				const limitValue = maxPaidValue - paidValue
				if (totalPaid > maxPaidValue) {
					ctx.addIssue({
						code: 'custom',
						message: `O valor inserido excede o valor restante de ${currencyValue(limitValue)}`,
						path: ['paymentValue'],
					})
				}
			}
			if (
				data.paid === paymentOptionsRadio(false)[1].value &&
				(!data.paymentValue || data.paymentValue.trim() === '')
			) {
				ctx.addIssue({
					code: 'custom',
					message: 'Campo obrigatório',
					path: ['paymentValue'],
				})
			}
			if (data.paymentType === PaymentTypeAPI.CARD && (!data.paymentReceived || data?.paymentReceived.trim() === '')) {
				ctx.addIssue({
					code: 'custom',
					message: 'Campo obrigatório',
					path: ['paymentReceived'],
				})
			}
		})

export type PaymentModalType = z.infer<ReturnType<typeof PaymentModalSchema>>
