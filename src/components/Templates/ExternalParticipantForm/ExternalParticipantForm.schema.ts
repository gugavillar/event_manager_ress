import { validateEmail, validatePhone, validateUF } from 'validations-br'
import { z } from 'zod'

import { CivilStatusAPI, MAX_FIELD_LENGTH, validatePhonesNotEquals } from '@/constants'
import { validateBirthdate, validateDateRange } from '@/formatters'

export const ExternalParticipantFormSchemaStepOne = (minAge?: number | null, maxAge?: number | null) =>
	z
		.object({
			birthdate: z
				.string({ error: 'Campo obrigatório' })
				.trim()
				.refine((value) => (/^\d{2}\/\d{2}\/\d{4}/g.test(value) ? validateBirthdate(value) : false), {
					error: 'Data inválida',
				})
				.refine((value) => (/^\d{2}\/\d{2}\/\d{4}/g.test(value) ? validateDateRange(value, minAge, maxAge) : false), {
					error: maxAge
						? `Idade tem que ser entre ${minAge} e ${maxAge} anos`
						: `Idade tem que ser maior ou igual a ${minAge} anos`,
				}),
			called: z
				.string({ error: 'Campo obrigatório' })
				.trim()
				.min(1, 'Campo obrigatório')
				.max(MAX_FIELD_LENGTH, { error: `Tamanho máximo de ${MAX_FIELD_LENGTH} caracteres` }),
			civilStatus: z
				.union([
					z.enum([CivilStatusAPI.DIVORCED, CivilStatusAPI.MARRIED, CivilStatusAPI.SINGLE, CivilStatusAPI.WIDOWED], {
						error: 'Campo obrigatório',
					}),
					z.string(),
				])
				.refine(
					(value) =>
						[CivilStatusAPI.DIVORCED, CivilStatusAPI.MARRIED, CivilStatusAPI.SINGLE, CivilStatusAPI.WIDOWED].includes(
							value as CivilStatusAPI
						),
					{
						error: 'Campo obrigatório',
					}
				),
			email: z
				.email({ error: 'Email inválido' })
				.trim()
				.refine((value) => validateEmail(value), { error: 'Email inválido' }),
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
			hasReligion: z
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
			host: z
				.string()
				.trim()
				.min(3, 'Campo obrigatório')
				.max(MAX_FIELD_LENGTH, { error: `Tamanho máximo de ${MAX_FIELD_LENGTH} caracteres` }),
			hostPhone: z
				.string({ error: 'Campo obrigatório' })
				.trim()
				.refine((value) => (!value || value.length < 15 ? false : validatePhone(value)), {
					error: 'Telefone inválido',
				}),
			name: z
				.string()
				.trim()
				.min(3, 'Campo obrigatório')
				.max(MAX_FIELD_LENGTH, { error: `Tamanho máximo de ${MAX_FIELD_LENGTH} caracteres` }),
			phone: z
				.string({ error: 'Campo obrigatório' })
				.trim()
				.refine((value) => (!value || value.length < 15 ? false : validatePhone(value)), {
					error: 'Telefone inválido',
				}),
			pixModal: z.boolean().optional(),
			religion: z.string().optional(),
			responsible: z
				.string()
				.trim()
				.min(3, 'Campo obrigatório')
				.max(MAX_FIELD_LENGTH, { error: `Tamanho máximo de ${MAX_FIELD_LENGTH} caracteres` }),
			responsiblePhone: z
				.string({ error: 'Campo obrigatório' })
				.trim()
				.refine((value) => (!value || value.length < 15 ? false : validatePhone(value)), {
					error: 'Telefone inválido',
				}),
		})
		.superRefine((data, ctx) => {
			if (data.hasReligion === 'Yes' && !data.religion?.trim()) {
				ctx.addIssue({
					code: 'custom',
					message: 'Campo obrigatório',
					path: ['religion'],
				})
			}
			if (data.hasHealth === 'Yes' && !data.health?.trim()) {
				ctx.addIssue({
					code: 'custom',
					message: 'Campo obrigatório',
					path: ['health'],
				})
			}
			validatePhonesNotEquals(
				data.phone,
				[
					{ field: 'responsiblePhone', phone: data.responsiblePhone },
					{ field: 'hostPhone', phone: data.hostPhone },
				],
				ctx
			)
		})

export const ExternalParticipantFormSchemaStepTwo = () =>
	z.object({
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

export const ExternalParticipantFormSchemaStepThree = (isInterestedList?: boolean) =>
	z.object({
		paymentMethod: isInterestedList
			? z.enum(['PIX', 'Cash/Card']).optional()
			: z.enum(['PIX', 'Cash/Card'], { error: 'Campo obrigatório' }),
	})

export const fullSchema = (minAge?: number | null, maxAge?: number | null, isInterestedList?: boolean) =>
	z.intersection(
		z.intersection(ExternalParticipantFormSchemaStepOne(minAge, maxAge), ExternalParticipantFormSchemaStepTwo()),
		ExternalParticipantFormSchemaStepThree(isInterestedList)
	)

export type FullSchemaType = z.infer<ReturnType<typeof fullSchema>>

export const stepsFields = (minAge?: number | null, maxAge?: number | null, isInterestedList?: boolean) =>
	[
		{
			fields: [
				'name',
				'email',
				'called',
				'birthdate',
				'phone',
				'civilStatus',
				'responsible',
				'responsiblePhone',
				'hasReligion',
				'religion',
				'hasHealth',
				'health',
				'host',
				'hostPhone',
			],
			schema: ExternalParticipantFormSchemaStepOne(minAge, maxAge),
		},
		{
			fields: ['terms', 'address.street', 'address.neighborhood', 'address.number', 'address.city', 'address.state'],
			schema: ExternalParticipantFormSchemaStepTwo(),
		},
		{
			fields: ['paymentMethod'],
			schema: ExternalParticipantFormSchemaStepThree(isInterestedList),
		},
	] as const
