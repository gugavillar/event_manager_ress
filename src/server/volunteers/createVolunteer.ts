import { NextResponse } from 'next/server'
import { z } from 'zod'

import { type VolunteerSchemaRouteType, volunteerSchemaRoute } from '@/app/api/volunteers/volunteer.schema'
import { deepTrim, MEMBERS } from '@/constants'
import { prisma } from '@/lib/prisma'
import { sendMail } from '@/utils/mail'

export const createVolunteer = async (
	data: VolunteerSchemaRouteType & { eventId: string },
	inscriptionType: string | null
) => {
	try {
		volunteerSchemaRoute
			.extend({
				eventId: z.uuid(),
			})
			.parse({ ...data })

		const trimData = deepTrim(data)

		const { address, ...restData } = trimData

		const isAlreadyRegistered = await prisma.volunteer.findFirst({
			where: {
				email: data.email,
				eventId: data.eventId,
			},
		})

		if (isAlreadyRegistered) {
			return NextResponse.json({ error: 'Voluntário ja cadastrado' }, { status: 400 })
		}

		const isRegistrationOpen = await prisma.event.findUnique({
			where: {
				id: data.eventId,
			},
		})

		if (!isRegistrationOpen?.isVolunteerRegistrationOpen && !inscriptionType) {
			return NextResponse.json({ error: 'Inscrições encerradas' }, { status: 400 })
		}

		await sendMail({
			email: restData.email,
			event: isRegistrationOpen?.name ?? '',
			name: restData.name,
			type: MEMBERS.VOLUNTEER,
		})

		return await prisma.$transaction(async (tx) => {
			const volunteer = await tx.volunteer.create({
				data: restData,
			})

			await tx.volunteerAddress.create({
				data: {
					...address,
					volunteerId: volunteer.id,
				},
			})
		})
	} catch (error) {
		console.error('@createVolunteer error:', error)
		throw Error
	}
}
