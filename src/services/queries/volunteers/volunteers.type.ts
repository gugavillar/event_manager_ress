import type { UUID } from 'node:crypto'

import type { CHECK_IN_STATUS, PaymentTypeAPI, ShirtsAPI } from '@/constants'

import type { EventsAPI } from '../events/event.type'

type VolunteerRole = {
	id: UUID
	role: string
	createdAt: string
	updatedAt: string
}

export type VolunteersAPI = {
	id: UUID
	name: string
	email: string
	called: string
	birthdate: string
	phone: string
	relative: string
	relativePhone: string
	cell?: string
	health?: string
	community: string
	withShirt: boolean
	servedLastEvent: null | string
	shirtSize: ShirtsAPI
	checkIn: CHECK_IN_STATUS | null
	createdAt: string
	updatedAt: string
	eventId: UUID
	event: EventsAPI
	address: {
		id: UUID
		street: string
		neighborhood: string
		number: string
		city: string
		state: string
		createdAt: string
		updatedAt: string
		volunteerId: UUID
	}
	payments: Array<{
		id: UUID
		paymentValue: string
		paymentType: (typeof PaymentTypeAPI)[keyof typeof PaymentTypeAPI] | null
		eventId: UUID
		event: EventsAPI
		volunteerId: UUID
		volunteer: VolunteersAPI
		createdAt: string
		updatedAt: string
	}>
	eventRoles: Array<{
		id: UUID
		eventId: UUID
		volunteerRoleId: UUID
		createdAt: string
		updatedAt: string
		volunteerRole: VolunteerRole
		leaders: Array<VolunteersAPI>
	}>
}

export type VolunteersFunctionsFromAPI = {
	id: UUID
	eventId: UUID
	volunteerRoleId: UUID
	volunteers: Array<VolunteersAPI>
	leaders: Array<VolunteersAPI>
	volunteerRole: VolunteerRole
	createdAt: string
	updatedAt: string
}

export type VolunteersFromAPI = {
	data: Array<VolunteersAPI>
	currentPage: number
	perPage: number
	totalCount: number
	totalPages: number
}

export type VolunteersFunctionsForm = {
	role: string
	events: Array<{ id: string }>
}

export type FormVolunteer = {
	name: string
	called: string
	email: string
	phone: string
	birthdate: string
	relative: string
	relativePhone: string
	cell?: string | null
	health?: string | null
	community: string
	address: {
		street: string
		neighborhood: string
		number: string
		city: string
		state: string
	}
}

export type VolunteersPaymentsAPI = {
	id: UUID
	paymentValue: string
	paymentType: (typeof PaymentTypeAPI)[keyof typeof PaymentTypeAPI] | null
	eventId: UUID
	event: EventsAPI
	volunteerId: UUID
	volunteer: VolunteersAPI
	createdAt: string
	updatedAt: string
}
