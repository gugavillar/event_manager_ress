import { z } from 'zod'

import { fileInputSchema } from '@/components/Atoms'
import { GenderTypeAPI, MAX_FIELD_LENGTH } from '@/constants'
import { isEqualOrIsBeforeFirstDate, isValidateDate } from '@/formatters'

export const EventSchema = z
	.object({
		file: fileInputSchema,
		finalDate: z
			.string({ error: 'Campo obrigatório' })
			.refine((value) => !!value?.length, { error: 'Campo obrigatório' })
			.refine((value) => (/^\d{2}\/\d{2}\/\d{4}/g.test(value) ? isValidateDate(value) : false), {
				error: 'A data não é valida',
			}),
		gender: z
			.union([
				z.enum([GenderTypeAPI.MALE, GenderTypeAPI.FEMALE, GenderTypeAPI.BOTH], {
					error: 'Campo obrigatório',
				}),
				z.string(),
			])
			.refine(
				(value) => [GenderTypeAPI.MALE, GenderTypeAPI.FEMALE, GenderTypeAPI.BOTH].includes(value as GenderTypeAPI),
				{ error: 'Campo obrigatório' }
			),
		initialDate: z
			.string({ error: 'Campo obrigatório' })
			.refine((value) => !!value?.length, { error: 'Campo obrigatório' })
			.refine((value) => (/^\d{2}\/\d{2}\/\d{4}/g.test(value) ? isValidateDate(value) : false), {
				error: 'A data não é valida',
			}),
		maxAge: z.string().optional(),
		minAge: z.string().optional(),
		name: z
			.string({ error: 'Campo obrigatório' })
			.trim()
			.min(3, 'Campo obrigatório')
			.max(MAX_FIELD_LENGTH, { error: `Tamanho máximo de ${MAX_FIELD_LENGTH} caracteres` }),
		participantPrice: z
			.string({
				error: 'Campo obrigatório',
			})
			.min(1, 'Campo obrigatório'),
		volunteerPrice: z
			.string({
				error: 'Campo obrigatório',
			})
			.min(1, 'Campo obrigatório'),
		volunteerPriceWithShirt: z
			.string({
				error: 'Campo obrigatório',
			})
			.min(1, 'Campo obrigatório'),
	})
	.refine((data) => isEqualOrIsBeforeFirstDate(data.initialDate, data.finalDate), {
		error: 'Data inicial deve ser menor que a data final',
		path: ['finalDate'],
	})
	.refine(
		(data) => {
			if (data.minAge && data.maxAge) {
				return Number(data.minAge) <= Number(data.maxAge)
			}
			return true
		},
		{
			error: 'Idade mínima deve ser menor que a idade máxima',
			path: ['maxAge'],
		}
	)

export type EventSchemaType = z.infer<typeof EventSchema>
