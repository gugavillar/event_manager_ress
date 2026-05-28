'use client'
import { format } from 'date-fns'
import { CalendarMinus, ChevronDown, ExternalLink, Lock, SquarePen } from 'lucide-react'

import { Dropdown, DropdownItem, Tooltip } from '@/components/Atoms'
import { COMMON_PROPS_TOOLTIPS_BUTTON_TABLE, GenderType, MEMBERS } from '@/constants'
import { currencyValue } from '@/formatters'
import type { EventsAPI } from '@/services/queries/events/event.type'

export const HEADER_LABELS = [
	{
		accessor: 'name',
		label: 'Nome',
	},
	{
		accessor: 'gender',
		label: 'Gênero',
	},
	{
		accessor: 'initialDate',
		label: 'Data inicial',
	},
	{
		accessor: 'finalDate',
		label: 'Data final',
	},
	{
		accessor: 'participantPrice',
		label: 'R$ Participante',
	},
	{
		accessor: 'volunteerPrice',
		label: 'R$ Voluntário',
	},
	{
		accessor: 'volunteerPriceWithShirt',
		label: 'R$ Voluntário Camisa',
	},
	{
		accessor: 'actions',
		label: '',
	},
]

export const formatTableData = (
	data: Array<EventsAPI> | undefined,
	handleOpenDrawer: (id: EventsAPI['id']) => void,
	handleDeleteEvent: (id: EventsAPI['id']) => void,
	handleOpenLink: (id: EventsAPI['id'], type: 'participante' | 'voluntario') => void,
	handleBlockOrOpenRegistration: (id: EventsAPI['id'], memberType: MEMBERS, action: 'open' | 'close') => void,
	handleActivatedOrDeactivatedInterestedList: (id: EventsAPI['id'], action: 'open' | 'close') => void,
	handleOpenInterestedLink: (id: EventsAPI['id']) => void
) => {
	if (!data) return []

	return data?.map((event) => ({
		...event,
		actions: (
			<div className="flex space-x-4">
				<Dropdown
					trigger={
						<div>
							<Tooltip
								{...COMMON_PROPS_TOOLTIPS_BUTTON_TABLE}
								trigger={
									<div className="inline-flex cursor-pointer items-center gap-1">
										<ExternalLink className="size-4" />
										<ChevronDown className="size-4" />
									</div>
								}
							>
								Links de inscrições
							</Tooltip>
						</div>
					}
				>
					<DropdownItem
						className="block cursor-pointer select-none rounded-lg px-3 py-2 hover:bg-gray-100"
						onSelect={() => handleOpenLink(event.id, 'participante')}
					>
						Inscrição participantes
					</DropdownItem>

					<DropdownItem
						className="block cursor-pointer select-none rounded-lg px-3 py-2 hover:bg-gray-100"
						onSelect={() => handleOpenLink(event.id, 'voluntario')}
					>
						Inscrição voluntários
					</DropdownItem>
					<DropdownItem
						className="block cursor-pointer select-none rounded-lg px-3 py-2 hover:bg-gray-100"
						onSelect={() => handleOpenInterestedLink(event.id)}
					>
						Lista de interessados
					</DropdownItem>
				</Dropdown>
				<Dropdown
					trigger={
						<div>
							<Tooltip
								{...COMMON_PROPS_TOOLTIPS_BUTTON_TABLE}
								trigger={
									<div className="inline-flex cursor-pointer items-center gap-1">
										<Lock className="size-4" />
										<ChevronDown className="size-4" />
									</div>
								}
							>
								Bloquear links
							</Tooltip>
						</div>
					}
				>
					<DropdownItem
						className="block cursor-pointer select-none rounded-lg px-3 py-2 hover:bg-gray-100"
						onSelect={() =>
							handleBlockOrOpenRegistration(
								event.id,
								MEMBERS.PARTICIPANT,
								event.isParticipantRegistrationOpen ? 'close' : 'open'
							)
						}
					>
						{event.isParticipantRegistrationOpen ? 'Fechar inscrição participantes' : 'Abrir inscrição participantes'}
					</DropdownItem>
					<DropdownItem
						className="block cursor-pointer select-none rounded-lg px-3 py-2 hover:bg-gray-100"
						onSelect={() =>
							handleBlockOrOpenRegistration(
								event.id,
								MEMBERS.VOLUNTEER,
								event.isVolunteerRegistrationOpen ? 'close' : 'open'
							)
						}
					>
						{event.isVolunteerRegistrationOpen ? 'Fechar inscrição voluntários' : 'Abrir inscrição voluntários'}
					</DropdownItem>
					<DropdownItem
						className="block cursor-pointer select-none rounded-lg px-3 py-2 hover:bg-gray-100"
						onSelect={() =>
							handleActivatedOrDeactivatedInterestedList(event.id, event.isInterestedListOpen ? 'close' : 'open')
						}
					>
						{event.isInterestedListOpen ? 'Fechar lista de interessados' : 'Abrir lista de interessados'}
					</DropdownItem>
				</Dropdown>
				<Tooltip
					{...COMMON_PROPS_TOOLTIPS_BUTTON_TABLE}
					trigger={<SquarePen className="cursor-pointer" onClick={() => handleOpenDrawer(event.id)} size={18} />}
				>
					Editar
				</Tooltip>
				<Tooltip
					{...COMMON_PROPS_TOOLTIPS_BUTTON_TABLE}
					trigger={<CalendarMinus className="cursor-pointer" onClick={() => handleDeleteEvent(event.id)} size={18} />}
				>
					Excluir
				</Tooltip>
			</div>
		),
		finalDate: format(event.finalDate, 'dd/MM/yyyy'),
		gender: GenderType[event.gender].label,
		initialDate: format(event.initialDate, 'dd/MM/yyyy'),
		participantPrice: currencyValue(Number(event.participantPrice)),
		volunteerPrice: currencyValue(Number(event.volunteerPrice)),
		volunteerPriceWithShirt: currencyValue(Number(event.volunteerPriceWithShirt ?? 0)),
	}))
}
