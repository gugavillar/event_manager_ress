import { isFuture } from 'date-fns'

import {
	type UserPermissionDrawerType,
	userPermissionDrawerSchema,
} from '@/components/Organisms/UserPermissionDrawer/UserPermissionDrawer.schema'

import { MEMBERS, ShirtsAPI } from './status'

export const generatePage = (page: string | undefined) => {
	if (!page) return 1

	return Number(page)
}

export const eventPermitCreateRegistration = (event: any, type: MEMBERS) => {
	if (!event) return false

	const isFutureDate = isFuture(new Date(event.initialDate))

	if (!isFutureDate) return false

	if (type === MEMBERS.PARTICIPANT) {
		return event.isParticipantRegistrationOpen
	}

	if (type === MEMBERS.VOLUNTEER) {
		return event.isVolunteerRegistrationOpen
	}
}

export const interestedListPermitCreateRegistration = (event: any) => {
	if (!event) return false

	if (!event.isInterestedListOpen) return false

	return isFuture(new Date(event.initialDate))
}

export const hasPermission = (permissions: Partial<UserPermissionDrawerType> | null, path: string): boolean => {
	if (!path || !permissions) return false

	const keys = path.split('.')
	let current: any = permissions

	for (const key of keys) {
		if (current?.[key] === undefined) return false
		current = current[key]
	}

	return Boolean(current)
}

export const generatePrintKey = <T>(data: Array<{ id: string; members: Array<T> }>, listType?: string) => {
	if (listType) {
		return data.map((d) => `${d.id}:${d.members.length}-${listType}`).join('|')
	}

	return data.map((d) => `${d.id}:${d.members.length}`).join('|')
}

export const generateColumnWidths = (data: any[] | any[][]) => {
	let aoa: any[][]
	if (!data.length) return [{ wch: 20 }]

	if (Array.isArray(data[0])) {
		aoa = data as any[][]
	} else {
		const headers = Object.keys(data[0])
		aoa = [headers, ...(data as Record<string, any>[]).map((row) => headers.map((h) => row[h]))]
	}

	const colWidths = aoa[0].map((_, colIndex) => {
		const maxLength = aoa.map((row) => row?.[colIndex]?.toString().length || 0).reduce((a, b) => Math.max(a, b), 0)

		return { wch: maxLength + 1 }
	})

	return colWidths
}

export function deepTrim<T>(obj: T): T {
	if (typeof obj === 'string') {
		return obj.trim() as T
	}

	if (Array.isArray(obj)) {
		return obj.map(deepTrim) as T
	}

	if (obj && typeof obj === 'object') {
		return Object.fromEntries(Object.entries(obj).map(([key, value]) => [key, deepTrim(value)])) as T
	}

	return obj
}

export const safeParse = (
	value?: string | null
): { data: Partial<UserPermissionDrawerType> | null; success: boolean } => {
	if (!value) return { data: null, success: false }
	try {
		const parsed = JSON.parse(value)

		const result = userPermissionDrawerSchema.safeParse(parsed)

		if (!result.success) {
			return { data: null, success: false }
		}

		return { data: result.data, success: true }
	} catch {
		return { data: null, success: false }
	}
}

export const realValueInscriptionVolunteer = (
	withShirt: boolean,
	volunteerPrice: string,
	volunteerPriceWithShirt: string,
	shirtSize: ShirtsAPI
) => {
	if (withShirt && shirtSize === ShirtsAPI.SPECIAL) return Number(volunteerPriceWithShirt) + 5
	if (withShirt) return Number(volunteerPriceWithShirt)
	return Number(volunteerPrice)
}
