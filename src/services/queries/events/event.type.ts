import type { UUID } from 'node:crypto'

import type { GenderTypeAPI } from '@/constants'

export type FormEvent = {
	name: string
	gender: GenderTypeAPI
	initialDate: string
	finalDate: string
	minAge?: number
	maxAge?: number
	participantPrice: number
	volunteerPrice: number
	volunteerPriceWithShirt: number
	file: any
}

export type EventsAPI = {
	id: UUID
	name: string
	gender: GenderTypeAPI
	initialDate: string
	finalDate: string
	participantPrice: string
	volunteerPrice: string
	volunteerPriceWithShirt: string
	isParticipantRegistrationOpen: boolean
	isVolunteerRegistrationOpen: boolean
	isInterestedListOpen: boolean
	minAge: number | null
	maxAge: number | null
	imageUrl: string | null
	createdAt: string
	updatedAt: string
	userId: UUID
}

export type EventsFromAPI = {
	data: Array<EventsAPI>
	currentPage: number
	perPage: number
	totalCount: number
	totalPages: number
}
