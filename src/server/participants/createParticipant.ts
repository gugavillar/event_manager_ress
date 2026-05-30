import { NextResponse } from 'next/server'
import { z } from 'zod'

import { type ParticipantSchemaRouteType, participantSchemaRoute } from '@/app/api/participants/participant.schema'
import { deepTrim, MEMBERS } from '@/constants'
import { prisma } from '@/lib/prisma'
import { sendMail } from '@/utils/mail'

export const createParticipant = async (
	data: ParticipantSchemaRouteType & { eventId: string },
	inscriptionType: string | null
) => {
	try {
		participantSchemaRoute
			.extend({
				eventId: z.uuid(),
			})
			.parse({ ...data })

		const trimData = deepTrim(data)

		const { address, ...restData } = trimData

		const isAlreadyRegistered = await prisma.participant.findFirst({
			where: {
				email: data.email,
				eventId: data.eventId,
			},
		})

		if (isAlreadyRegistered) {
			return NextResponse.json({ error: 'Participante já cadastrado' }, { status: 400 })
		}

		const isRegistrationOpen = await prisma.event.findUnique({
			where: {
				id: data.eventId,
			},
		})

		if (!isRegistrationOpen?.isParticipantRegistrationOpen && !inscriptionType) {
			return NextResponse.json({ error: 'Inscrições encerradas' }, { status: 400 })
		}

		await sendMail({
			email: restData.email,
			event: isRegistrationOpen?.name ?? '',
			name: restData.name,
			type: MEMBERS.PARTICIPANT,
		})

		return await prisma.$transaction(async (tx) => {
			const participant = await tx.participant.create({
				data: restData,
			})

			await tx.participantAddress.create({
				data: {
					...address,
					participantId: participant.id,
				},
			})
		})
	} catch (error) {
		console.error('@createParticipant error:', error)
		throw Error
	}
}
