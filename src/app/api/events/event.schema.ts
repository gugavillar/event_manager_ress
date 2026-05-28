import { z } from 'zod'

import { GenderTypeAPI, MAX_CURRENCY_VALUE, MAX_FIELD_LENGTH, MIN_CURRENCY_VALUE } from '@/constants'

export const eventSchemaRoute = z.object({
	finalDate: z.iso.datetime({ precision: 3 }),
	gender: z.enum([GenderTypeAPI.MALE, GenderTypeAPI.FEMALE, GenderTypeAPI.BOTH]),
	initialDate: z.iso.datetime({ precision: 3 }),
	maxAge: z.string().transform((value) => Number(value)),
	minAge: z.string().transform((value) => Number(value)),
	name: z.string().trim().min(3).max(MAX_FIELD_LENGTH),
	participantPrice: z.coerce.number().min(MIN_CURRENCY_VALUE).max(MAX_CURRENCY_VALUE),
	volunteerPrice: z.coerce.number().min(MIN_CURRENCY_VALUE).max(MAX_CURRENCY_VALUE),
	volunteerPriceWithShirt: z.coerce.number().min(MIN_CURRENCY_VALUE).max(MAX_CURRENCY_VALUE),
})

export type EventSchemaRouteType = z.infer<typeof eventSchemaRoute>
