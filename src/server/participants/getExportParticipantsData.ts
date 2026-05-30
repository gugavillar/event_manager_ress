import { NextResponse } from 'next/server'
import { utils, write } from 'xlsx'
import { z } from 'zod'

import { CivilStatus, generateColumnWidths } from '@/constants'
import { currencyValue, formatBirthdate, formatCheckIn, formatPhone, paymentDate, paymentStatus } from '@/formatters'
import { prisma } from '@/lib/prisma'

export const getExportParticipantsData = async (eventId: string, isInterested: boolean) => {
	try {
		z.object({
			eventId: z.uuid(),
		}).parse({ eventId })

		const participants = await prisma.participant.findMany({
			include: {
				address: true,
				event: true,
				groupMemberships: {
					include: {
						group: true,
					},
				},
				payments: true,
				roomMember: {
					include: {
						room: true,
					},
				},
			},
			orderBy: {
				...(isInterested ? { createdAt: 'asc' } : { name: 'asc' }),
			},
			where: {
				eventId,
				...(isInterested ? { interested: true } : { OR: [{ interested: false }, { interested: null }] }),
			},
		})

		if (!participants.length) {
			return NextResponse.json(
				{
					error: isInterested ? 'Nenhuma pessoa interessada cadastrada' : 'Nenhum participante cadastrado',
				},
				{ status: 400 }
			)
		}

		if (isInterested) {
			// biome-ignore assist/source/useSortedKeys: <order necessary for xlsx file>
			const interestedData = participants.map((participant) => ({
				Nome: participant.name,
				Chamado: participant.called,
				Data_Nascimento: formatBirthdate(
					participant.birthdate.toISOString(),
					participant.event.finalDate.toISOString()
				),
				Endereço: `${participant.address?.street}, ${participant.address?.number}`,
				Bairro: participant.address?.neighborhood,
				Cidade: `${participant.address?.city} - ${participant.address?.state}`,
				Telefone: formatPhone(participant.phone),
				Estado_Civil: CivilStatus[participant.civilStatus].label,
				Alimentação_Saúde: participant.health || 'Não possui',
				Responsável: participant.responsible,
				Telefone_Responsável: formatPhone(participant.responsiblePhone),
				Convidou: participant.host,
				Telefone_Convidou: formatPhone(participant.hostPhone),
				Email: participant.email,
				Religião: participant.religion || 'Não possui',
			}))
			const tableHeaderParticipants = Object.keys(interestedData[0])
			const worksheetParticipants = utils.json_to_sheet(interestedData, {
				header: tableHeaderParticipants,
			})
			const workbook = utils.book_new()
			utils.book_append_sheet(workbook, worksheetParticipants, 'Interessados')
			worksheetParticipants['!cols'] = generateColumnWidths(interestedData)
			const buffer = write(workbook, { bookType: 'xlsx', type: 'buffer' })

			return new NextResponse(buffer, {
				headers: {
					'Content-Disposition': 'attachment; filename="interessados.xlsx"',
					'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
				},
				status: 200,
			})
		}

		// biome-ignore assist/source/useSortedKeys: <order necessary for xlsx file>
		const participantsData = participants.map((participant) => ({
			Nome: participant.name,
			Chamado: participant.called,
			Data_Nascimento: formatBirthdate(participant.birthdate.toISOString(), participant.event.finalDate.toISOString()),
			Endereço: `${participant.address?.street}, ${participant.address?.number}`,
			Bairro: participant.address?.neighborhood,
			Cidade: `${participant.address?.city} - ${participant.address?.state}`,
			Telefone: formatPhone(participant.phone),
			Estado_Civil: CivilStatus[participant.civilStatus].label,
			Alimentação_Saúde: participant.health || 'Não possui',
			Responsável: participant.responsible,
			Telefone_Responsável: formatPhone(participant.responsiblePhone),
			Convidou: participant.host,
			Telefone_Convidou: formatPhone(participant.hostPhone),
			Grupo:
				participant.groupMemberships?.find(
					(group) => group.participantId === participant.id && group.group.eventId === eventId
				)?.group.name || 'Sem grupo',
			Quarto:
				participant.roomMember?.find((room) => room.participantId === participant.id && room.room.eventId === eventId)
					?.room.roomNumber || 'Sem quarto',
			Email: participant.email,
			Religião: participant.religion || 'Não possui',
			Status: formatCheckIn(participant.checkIn),
			Tem_Foto: participant?.pictureUrl ? 'Sim' : 'Não',
		}))

		const paymentsData = participants.map((payment) => {
			const paymentValue = payment.payments.reduce((acc, p) => (acc += p.paymentValue.toNumber()), 0)
			const hasPayment = payment.payments.length > 0
			const statusPayments = !hasPayment
				? paymentStatus(payment.checkIn, null)
				: payment.payments.map((p) => paymentStatus(payment.checkIn, p.paymentType)).join(', ')
			const datesPayments = payment.payments.map((p) => paymentDate(p.paymentType, p.updatedAt)).join(', ')
			// biome-ignore assist/source/useSortedKeys: <order necessary for xlsx file>
			return {
				Nome: payment.name,
				Status: statusPayments,
				Data_Pagamento: datesPayments,
				Valor_Pago: currencyValue(paymentValue),
			}
		})

		const tableHeaderParticipants = Object.keys(participantsData[0])
		const worksheetParticipants = utils.json_to_sheet(participantsData, {
			header: tableHeaderParticipants,
		})
		worksheetParticipants['!cols'] = generateColumnWidths(participantsData)
		const tableHeaderPayments = Object.keys(paymentsData[0])
		const worksheetPayments = utils.json_to_sheet(paymentsData, {
			header: tableHeaderPayments,
		})
		worksheetPayments['!cols'] = generateColumnWidths(paymentsData)
		const workbook = utils.book_new()
		utils.book_append_sheet(workbook, worksheetParticipants, 'Participantes')
		utils.book_append_sheet(workbook, worksheetPayments, 'Pagamentos')
		const buffer = write(workbook, { bookType: 'xlsx', type: 'buffer' })

		return new NextResponse(buffer, {
			headers: {
				'Content-Disposition': 'attachment; filename="participantes.xlsx"',
				'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
			},
			status: 200,
		})
	} catch (error) {
		console.error('@getExportParticipantsData error:', error)
		throw Error
	}
}
