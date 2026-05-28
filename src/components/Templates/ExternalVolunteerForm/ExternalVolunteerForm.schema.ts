import { validateEmail, validatePhone, validateUF } from 'validations-br'
import { z } from 'zod'

import { MAX_FIELD_LENGTH, validatePhonesNotEquals } from '@/constants'
import { validateBirthdate } from '@/formatters'

export const ExternalVolunteerFormSchemaStepOne = z
	.object({
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
		cell: z.string().optional(),
		community: z
			.string()
			.trim()
			.min(3, 'Campo obrigatório')
			.max(MAX_FIELD_LENGTH, { error: `Tamanho máximo de ${MAX_FIELD_LENGTH} caracteres` }),
		email: z
			.email({ error: 'Email inválido' })
			.trim()
			.refine((value) => validateEmail(value), { error: 'Email inválido' }),
		hasCell: z
			.union([
				z.enum(['Yes', 'No'], {
					error: 'Campo obrigatório',
				}),
				z.string(),
			])
			.refine((value) => ['Yes', 'No'].includes(value), {
				error: 'Campo obrigatório',
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
		health: z.string().optional(),
		name: z
			.string()
			.trim()
			.min(3, 'Campo obrigatório')
			.max(MAX_FIELD_LENGTH, { error: `Tamanho máximo de ${MAX_FIELD_LENGTH} caracteres` }),
		phone: z
			.string({ error: 'Campo obrigatório' })
			.trim()
			.refine((value) => (!value || value.length < 15 ? false : validatePhone(value)), { error: 'Telefone inválido' }),
		pixModal: z.boolean().optional(),
		relative: z
			.string()
			.trim()
			.min(3, 'Campo obrigatório')
			.max(MAX_FIELD_LENGTH, { error: `Tamanho máximo de ${MAX_FIELD_LENGTH} caracteres` }),
		relativePhone: z
			.string({ error: 'Campo obrigatório' })
			.trim()
			.refine((value) => (!value || value.length < 15 ? false : validatePhone(value)), { error: 'Telefone inválido' }),
		servedLastEvent: z.string().optional(),
	})
	.superRefine((data, ctx) => {
		if (data.hasCell === 'Yes' && !data.cell?.trim()) {
			ctx.addIssue({
				code: 'custom',
				message: 'Campo obrigatório',
				path: ['cell'],
			})
		}
		if (data.hasHealth === 'Yes' && !data.health?.trim()) {
			ctx.addIssue({
				code: 'custom',
				message: 'Campo obrigatório',
				path: ['health'],
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

export const ExternalVolunteerFormSchemaStepTwo = z.object({
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
	terms: z.boolean({ error: 'Campo obrigatório' }).refine((value) => value, {
		error: 'Campo obrigatório',
	}),
})

export const ExternalVolunteerFormSchemaStepThree = z.object({
	paymentMethod: z
		.union([
			z.enum(['PIX', 'Cash/Card'], {
				error: 'Campo obrigatório',
			}),
			z.string(),
		])
		.refine((value) => ['PIX', 'Cash/Card'].includes(value), {
			error: 'Campo obrigatório',
		}),
})

export const fullSchema = z.intersection(
	z.intersection(ExternalVolunteerFormSchemaStepOne, ExternalVolunteerFormSchemaStepTwo),
	ExternalVolunteerFormSchemaStepThree
)

export type FullSchemaType = z.infer<typeof fullSchema>

export const stepsFields = [
	{
		fields: [
			'name',
			'email',
			'called',
			'birthdate',
			'phone',
			'relative',
			'relativePhone',
			'hasCell',
			'hasServed',
			'servedLastEvent',
			'cell',
			'hasHealth',
			'health',
			'community',
		],
		schema: ExternalVolunteerFormSchemaStepOne,
	},
	{
		fields: ['terms', 'address.street', 'address.neighborhood', 'address.number', 'address.city', 'address.state'],
		schema: ExternalVolunteerFormSchemaStepTwo,
	},
	{
		fields: ['paymentMethod'],
		schema: ExternalVolunteerFormSchemaStepThree,
	},
] as const
