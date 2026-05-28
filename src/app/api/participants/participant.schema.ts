import { validateEmail, validatePhone, validateUF } from 'validations-br'
import { z } from 'zod'

import { CivilStatusAPI, MAX_FIELD_LENGTH } from '@/constants'

export const participantSchemaRoute = z.object({
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
	civilStatus: z.enum([CivilStatusAPI.DIVORCED, CivilStatusAPI.MARRIED, CivilStatusAPI.SINGLE, CivilStatusAPI.WIDOWED]),
	email: z
		.email()
		.trim()
		.refine((value) => validateEmail(value)),
	health: z.string().trim().nullable().optional(),
	host: z.string().trim().min(3).max(MAX_FIELD_LENGTH),
	hostPhone: z
		.string()
		.trim()
		.refine((value) => validatePhone(value)),
	name: z.string().trim().min(3).max(MAX_FIELD_LENGTH),
	phone: z
		.string()
		.trim()
		.refine((value) => validatePhone(value)),
	religion: z.string().trim().nullable().optional(),
	responsible: z.string().trim().min(3).max(MAX_FIELD_LENGTH),
	responsiblePhone: z
		.string()
		.trim()
		.refine((value) => validatePhone(value)),
})

export type ParticipantSchemaRouteType = z.infer<typeof participantSchemaRoute>
