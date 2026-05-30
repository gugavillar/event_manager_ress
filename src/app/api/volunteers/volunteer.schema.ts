import { validateEmail, validatePhone, validateUF } from 'validations-br'
import { z } from 'zod'

import { MAX_FIELD_LENGTH, ShirtsAPI } from '@/constants'

export const volunteerSchemaRoute = z.object({
	address: z.object({
		city: z.string().trim().min(3),
		neighborhood: z.string().trim().min(3).max(MAX_FIELD_LENGTH),
		number: z.string().trim().min(1),
		state: z
			.string()
			.trim()
			.max(2)
			.refine((value) => validateUF(value)),
		street: z.string().trim().min(3).max(MAX_FIELD_LENGTH),
	}),
	birthdate: z.iso.datetime({ precision: 3 }),
	called: z.string().trim().min(1).max(MAX_FIELD_LENGTH),
	cell: z.string().trim().nullable().optional(),
	community: z.string().trim().min(3).max(MAX_FIELD_LENGTH),
	email: z
		.email()
		.trim()
		.refine((value) => validateEmail(value)),
	health: z.string().trim().nullable().optional(),
	name: z.string().trim().min(3).max(MAX_FIELD_LENGTH),
	phone: z
		.string()
		.trim()
		.refine((value) => validatePhone(value)),
	relative: z.string().trim().min(3).max(MAX_FIELD_LENGTH),
	relativePhone: z
		.string()
		.trim()
		.refine((value) => validatePhone(value)),
	servedLastEvent: z.string().trim().nullable().optional(),
	shirtSize: z
		.enum([ShirtsAPI.P, ShirtsAPI.M, ShirtsAPI.G, ShirtsAPI.GG, ShirtsAPI.XG, ShirtsAPI.XGG, ShirtsAPI.SPECIAL])
		.optional(),
	withShirt: z.boolean(),
})

export type VolunteerSchemaRouteType = z.infer<typeof volunteerSchemaRoute>
