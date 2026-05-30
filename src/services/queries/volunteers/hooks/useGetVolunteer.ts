'use client'
import type { UseQueryResult } from '@tanstack/react-query'
import { format } from 'date-fns'

import type { UUID } from 'node:crypto'

import { QUERY_KEYS } from '@/constants'
import { formatPhone } from '@/formatters'
import { useQuery } from '@/providers/QueryProvider'

import { getVolunteer } from '../usecases'
import type { VolunteersAPI } from '../volunteers.type'

type FormattedVolunteersAPI = Omit<VolunteersAPI, 'address'> & {
	address: Extract<VolunteersAPI['address'], { id: UUID }>
	hasCell: 'Yes' | 'No'
	hasHealth: 'Yes' | 'No'
}

export const useGetVolunteer = (volunteerId: VolunteersAPI['id'] | null) => {
	const { data, isLoading }: UseQueryResult<FormattedVolunteersAPI> = useQuery({
		enabled: !!volunteerId,
		queryFn: () => getVolunteer(volunteerId as VolunteersAPI['id']),
		queryKey: [QUERY_KEYS.VOLUNTEER, volunteerId],
		select: ({ address, ...data }: VolunteersAPI) => ({
			...data,
			address: {
				...address,
			},
			birthdate: format(data.birthdate, 'dd/MM/yyyy'),
			hasCell: data.cell ? 'Yes' : ('No' as 'Yes' | 'No'),
			hasHealth: data.health ? 'Yes' : ('No' as 'Yes' | 'No'),
			hasServed: data.servedLastEvent ? 'Yes' : ('No' as 'Yes' | 'No'),
			phone: formatPhone(data.phone),
			relativePhone: formatPhone(data.relativePhone),
		}),
	})

	return { data, isLoading }
}
