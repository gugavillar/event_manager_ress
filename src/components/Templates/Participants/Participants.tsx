'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import dynamic from 'next/dynamic'
import { useCallback, useState } from 'react'
import { FormProvider, useForm } from 'react-hook-form'

import { Pagination } from '@/components/Atoms'
import { CreateParticipantButton, ListManager } from '@/components/Molecules'
import { ExportParticipantsButton, FilterDrawer, ListPage, PageContent } from '@/components/Organisms'
import {
	ParticipantSchema,
	type ParticipantType,
} from '@/components/Organisms/ParticipantDrawer/ParticipantDrawer.schema'
import { MEMBERS, PARTICIPANT_MODAL_TYPE } from '@/constants'
import { useGetParticipants } from '@/services/queries/participants'
import type { ParticipantsAPI } from '@/services/queries/participants/participants.type'

import { formatTableData, HEADER_LABELS } from './Participants.utils'

export type SelectedParticipant = {
	modal: PARTICIPANT_MODAL_TYPE | null
	id: ParticipantsAPI['id'] | null
}

const ParticipantCheckInModal = dynamic(() =>
	import('@/components/Organisms').then((mod) => mod.ParticipantCheckInModal)
)

const ParticipantModalData = dynamic(() => import('@/components/Organisms').then((mod) => mod.ParticipantModalData))

const ParticipantDeleteModal = dynamic(() => import('@/components/Organisms').then((mod) => mod.ParticipantDeleteModal))

const ParticipantDrawer = dynamic(() => import('@/components/Organisms').then((mod) => mod.ParticipantDrawer))

const InterestedModalToParticipant = dynamic(() =>
	import('@/components/Organisms').then((mod) => mod.InterestedModalToParticipant)
)

export const Participants = () => {
	const [selectedParticipant, setSelectedParticipant] = useState<null | SelectedParticipant>(null)

	const methods = useForm<ParticipantType>({
		defaultValues: {
			address: {
				city: '',
				neighborhood: '',
				number: '',
				state: '',
				street: '',
			},
			birthdate: '',
			called: '',
			civilStatus: '',
			email: '',
			eventId: '',
			hasHealth: '',
			hasReligion: '',
			health: '',
			host: '',
			hostPhone: '',
			name: '',
			phone: '',
			religion: '',
			responsible: '',
			responsiblePhone: '',
		},
		mode: 'onChange',
		resolver: zodResolver(ParticipantSchema),
	})
	const { data: participants, isLoading, search, setSearch, page, setPage, query, setQuery } = useGetParticipants()

	const handleOpenModalToDeleteParticipant = useCallback((id: ParticipantsAPI['id']) => {
		setSelectedParticipant({ id, modal: PARTICIPANT_MODAL_TYPE.DELETE })
	}, [])

	const handleOpenModalToCheckInParticipant = useCallback((id: ParticipantsAPI['id']) => {
		setSelectedParticipant({ id, modal: PARTICIPANT_MODAL_TYPE.CHECK_IN })
	}, [])

	const handleOpenDrawerToCreateOrEditParticipant = useCallback((id?: ParticipantsAPI['id']) => {
		if (id) {
			setSelectedParticipant({ id, modal: PARTICIPANT_MODAL_TYPE.CREATE_OR_EDIT })
		} else {
			setSelectedParticipant({ id: null, modal: PARTICIPANT_MODAL_TYPE.CREATE_OR_EDIT })
		}
	}, [])

	const handleOpenModalToShowParticipantData = useCallback((id: ParticipantsAPI['id']) => {
		setSelectedParticipant({ id, modal: PARTICIPANT_MODAL_TYPE.INFO })
	}, [])

	const handleOpenModalInterestedParticipant = useCallback((id: ParticipantsAPI['id']) => {
		setSelectedParticipant({ id, modal: PARTICIPANT_MODAL_TYPE.INTERESTED })
	}, [])

	const formattedParticipants = formatTableData(
		participants?.data,
		handleOpenModalToDeleteParticipant,
		handleOpenModalToCheckInParticipant,
		handleOpenDrawerToCreateOrEditParticipant,
		handleOpenModalToShowParticipantData,
		handleOpenModalInterestedParticipant
	)

	const hasMoreThanOnePage = !!participants?.totalPages && participants.totalPages > 1

	const handleCreateParticipant = useCallback(
		() => handleOpenDrawerToCreateOrEditParticipant(),
		[handleOpenDrawerToCreateOrEditParticipant]
	)

	return (
		<PageContent pageTitle="Participantes" subheadingPage="Lista de participantes">
			<div className="flex flex-col items-center justify-end gap-5 md:flex-row">
				<ExportParticipantsButton />
				<CreateParticipantButton handleCreateParticipant={handleCreateParticipant} />
			</div>
			<ListPage
				className="lg:max-w-full"
				moreFilter={<FilterDrawer query={query} setQuery={setQuery} type={MEMBERS.PARTICIPANT} />}
				placeholderField="Encontrar um participante"
				search={search}
				setSearch={setSearch}
			>
				<ListManager bodyData={formattedParticipants} headerLabels={HEADER_LABELS} isLoading={isLoading} />
				{hasMoreThanOnePage && (
					<Pagination currentPage={page} setPage={setPage} totalPages={participants?.totalPages} />
				)}
			</ListPage>
			<ParticipantDeleteModal
				selectedParticipant={selectedParticipant}
				setSelectedParticipant={setSelectedParticipant}
			/>
			<ParticipantCheckInModal
				selectedParticipant={selectedParticipant}
				setSelectedParticipant={setSelectedParticipant}
			/>
			<FormProvider {...methods}>
				<ParticipantDrawer selectedParticipant={selectedParticipant} setSelectedParticipant={setSelectedParticipant} />
			</FormProvider>
			<ParticipantModalData selectedParticipant={selectedParticipant} setSelectedParticipant={setSelectedParticipant} />
			<InterestedModalToParticipant
				interested={true}
				selectedParticipant={selectedParticipant}
				setSelectedParticipant={setSelectedParticipant}
			/>
		</PageContent>
	)
}
