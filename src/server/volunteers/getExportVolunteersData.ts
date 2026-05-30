import { NextResponse } from 'next/server'
import { utils, write } from 'xlsx'
import { z } from 'zod'

import { generateColumnWidths } from '@/constants'
import { currencyValue, formatBirthdate, formatCheckIn, formatPhone, paymentDate, paymentStatus } from '@/formatters'
import { prisma } from '@/lib/prisma'

export const getExportVolunteersData = async (eventId: string) => {
	try {
		z.object({
			eventId: z.uuid(),
		}).parse({ eventId })

		const volunteers = await prisma.volunteer.findMany({
			include: {
				address: true,
				event: true,
				eventRoles: {
					include: {
						leaders: true,
						volunteerRole: true,
					},
				},
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
				name: 'asc',
			},
			where: {
				eventId,
			},
		})

		if (!volunteers.length) {
			return NextResponse.json({ error: 'Nenhum voluntário cadastrado' }, { status: 400 })
		}

		// biome-ignore assist/source/useSortedKeys: <order necessary for xlsx file>
		const volunteersData = volunteers.map((volunteer) => ({
			Nome: volunteer.name,
			Chamado: volunteer.called,
			Data_Nascimento: formatBirthdate(volunteer.birthdate.toISOString(), volunteer.event.finalDate.toISOString()),
			Endereço: `${volunteer.address?.street}, ${volunteer.address?.number}`,
			Bairro: volunteer.address?.neighborhood,
			Cidade: `${volunteer.address?.city} - ${volunteer.address?.state}`,
			Telefone: formatPhone(volunteer.phone),
			Alimentação_Saúde: volunteer.health || 'Não possui',
			Parente: volunteer.relative,
			Telefone_Parente: formatPhone(volunteer.relativePhone),
			Tipo_Inscrição: volunteer.withShirt ? 'Com Camisa' : 'Sem Camisa',
			Tamanho_Camisa: volunteer.withShirt ? volunteer.shirtSize : '',
			Evento_Anterior: volunteer.servedLastEvent || 'Não Serviu',
			Função: !volunteer.eventRoles?.length
				? 'Sem Função'
				: volunteer.eventRoles
						.map((role) =>
							role.eventId === eventId && role.leaders.some((leader) => leader.id === volunteer.id)
								? `${role.volunteerRole.role} - Líder`
								: role.volunteerRole.role
						)
						.join(', '),
			Grupo:
				volunteer.groupMemberships?.find(
					(group) => group.volunteerId === volunteer.id && group.group.eventId === eventId
				)?.group.name || 'Sem grupo',
			Quarto:
				volunteer.roomMember?.find((room) => room.volunteerId === volunteer.id && room.room.eventId === eventId)?.room
					.roomNumber || 'Sem quarto',
			Célula: volunteer.cell || 'Nenhuma',
			Email: volunteer.email,
			Status: formatCheckIn(volunteer.checkIn),
		}))

		const paymentsData = volunteers.map((payment) => {
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

		const tableHeaderVolunteers = Object.keys(volunteersData[0])
		const worksheetVolunteers = utils.json_to_sheet(volunteersData, {
			header: tableHeaderVolunteers,
		})
		const tableHeaderPayments = Object.keys(paymentsData[0])
		const worksheetPayments = utils.json_to_sheet(paymentsData, {
			header: tableHeaderPayments,
		})
		const workbook = utils.book_new()
		utils.book_append_sheet(workbook, worksheetVolunteers, 'Voluntários')
		worksheetVolunteers['!cols'] = generateColumnWidths(volunteersData)
		utils.book_append_sheet(workbook, worksheetPayments, 'Pagamentos')
		worksheetPayments['!cols'] = generateColumnWidths(paymentsData)
		const buffer = write(workbook, { bookType: 'xlsx', type: 'buffer' })

		return new NextResponse(buffer, {
			headers: {
				'Content-Disposition': 'attachment; filename="voluntarios.xlsx"',
				'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
			},
			status: 200,
		})
	} catch (error) {
		console.error('@getExportVolunteersData error:', error)
		throw Error
	}
}
