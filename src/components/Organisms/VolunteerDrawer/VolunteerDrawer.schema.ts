import { validateEmail, validatePhone, validateUF } from 'validations-br'
import { z } from 'zod'

import { MAX_FIELD_LENGTH, validatePhonesNotEquals } from '@/constants'
import { validateBirthdate } from '@/formatters'

export const VolunteerSchema = z
	.object({
		address: z.object({
			city: z.string().trim().min(3, 'Campo obrigatório'),
			neighborhood: z
				.string()
				.trim()
				.min(3, 'Campo obrigatório')
				.max(MAX_FIELD_LENGTH, { error: `Tamanho máximo de ${MAX_FIELD_LENGTH} caracteres` }),
			number: z.string().trim().min(1, 'Campo obrigatório'),
			state: z
				.string({ error: 'Campo obrigatório' })
				.max(2)
				.refine((value) => validateUF(value), {
					error: 'Campo obrigatório',
				}),
			street: z
				.string()
				.trim()
				.min(3, 'Campo obrigatório')
				.max(MAX_FIELD_LENGTH, { error: `Tamanho máximo de ${MAX_FIELD_LENGTH} caracteres` }),
		}),
		birthdate: z
			.string({ error: 'Campo obrigatório' })
			.trim()
			.refine((value) => (/^\d{2}\/\d{2}\/\d{4}/g.test(value) ? validateBirthdate(value) : false), {
				error: 'Data inválida',
			}),
		called: z
			.string({ error: 'Campo obrigatório' })
			.trim()
			.min(1, 'Campo obrigatório')
			.max(MAX_FIELD_LENGTH, { error: `Tamanho máximo de ${MAX_FIELD_LENGTH} caracteres` }),
		cell: z.string().nullable().optional(),
		community: z
			.string()
			.trim()
			.min(1, 'Campo obrigatório')
			.max(MAX_FIELD_LENGTH, { error: `Tamanho máximo de ${MAX_FIELD_LENGTH} caracteres` }),
		email: z
			.email({ error: 'Email inválido' })
			.trim()
			.refine((value) => validateEmail(value), { error: 'Email inválido' }),
		eventId: z.string().trim().min(1, 'Campo obrigatório'),
		hasCell: z
			.union([
				z.enum(['Yes', 'No'], {
					error: 'Campo obrigatório',
				}),
				z.string(),
			])
			.refine((value) => ['Yes', 'No'].includes(value), {
				message: 'Campo obrigatório',
			}),
		hasHealth: z
			.union([
				z.enum(['Yes', 'No'], {
					error: 'Campo obrigatório',
				}),
				z.string(),
			])
			.refine((value) => ['Yes', 'No'].includes(value), {
				error: 'Campo obrigatório',
			}),
		hasServed: z
			.union([
				z.enum(['Yes', 'No'], {
					error: 'Campo obrigatório',
				}),
				z.string(),
			])
			.refine((value) => ['Yes', 'No'].includes(value), {
				error: 'Campo obrigatório',
			}),
		health: z.string().nullable().optional(),
		name: z
			.string()
			.trim()
			.min(3, 'Campo obrigatório')
			.max(MAX_FIELD_LENGTH, { error: `Tamanho máximo de ${MAX_FIELD_LENGTH} caracteres` }),
		phone: z
			.string({ error: 'Campo obrigatório' })
			.trim()
			.refine((value) => (!value || value.length < 15 ? false : validatePhone(value)), { error: 'Telefone inválido' }),
		relative: z
			.string()
			.trim()
			.min(1, 'Campo obrigatório')
			.max(MAX_FIELD_LENGTH, { error: `Tamanho máximo de ${MAX_FIELD_LENGTH} caracteres` }),
		relativePhone: z
			.string({ error: 'Campo obrigatório' })
			.trim()
			.refine((value) => (!value || value.length < 15 ? false : validatePhone(value)), { error: 'Telefone inválido' }),
		servedLastEvent: z.string().nullable().optional(),
		shirtSize: z.string().nullable().optional(),
		withShirt: z
			.union([
				z.enum(['Yes', 'No'], {
					error: 'Campo obrigatório',
				}),
				z.string(),
			])
			.refine((value) => ['Yes', 'No'].includes(value), {
				error: 'Campo obrigatório',
			}),
	})
	.superRefine((data, ctx) => {
		if (data.hasCell === 'Yes' && !data.cell?.trim()) {
			return ctx.addIssue({
				code: 'custom',
				message: 'Campo obrigatório',
				path: ['cell'],
			})
		}
		if (data.hasHealth === 'Yes' && !data.health?.trim()) {
			return ctx.addIssue({
				code: 'custom',
				message: 'Campo obrigatório',
				path: ['health'],
			})
		}
		if (data.withShirt === 'Yes' && !data.shirtSize) {
			ctx.addIssue({
				code: 'custom',
				message: 'Campo obrigatório',
				path: ['shirtSize'],
			})
		}
		if (data.hasServed === 'Yes' && !data.servedLastEvent?.trim()) {
			ctx.addIssue({
				code: 'custom',
				message: 'Campo obrigatório',
				path: ['servedLastEvent'],
			})
		}
		validatePhonesNotEquals(data.phone, [{ field: 'relativePhone', phone: data.relativePhone }], ctx)
	})

export type VolunteerType = z.infer<typeof VolunteerSchema>
