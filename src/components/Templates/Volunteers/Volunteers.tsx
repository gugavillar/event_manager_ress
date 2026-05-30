'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import dynamic from 'next/dynamic'
import { useCallback, useState } from 'react'
import { FormProvider, useForm } from 'react-hook-form'

import { Pagination } from '@/components/Atoms'
import { CreateVolunteerButton, ListManager } from '@/components/Molecules'
import { ExportVolunteersButton, FilterDrawer, ListPage, PageContent } from '@/components/Organisms'
import { VolunteerSchema, type VolunteerType } from '@/components/Organisms/VolunteerDrawer/VolunteerDrawer.schema'
import { MEMBERS, VOLUNTEER_MODAL_TYPE } from '@/constants'
import { useGetVolunteers } from '@/services/queries/volunteers'
import type { VolunteersAPI } from '@/services/queries/volunteers/volunteers.type'

import { formatTableData, HEADER_LABELS } from './Volunteers.utils'

export type SelectedVolunteer = {
	id: VolunteersAPI['id'] | null
	modal: VOLUNTEER_MODAL_TYPE | null
}

const AssignFunctionVolunteerModal = dynamic(() =>
	import('@/components/Organisms').then((mod) => mod.AssignFunctionVolunteerModal)
)

const VolunteerCheckInModal = dynamic(() => import('@/components/Organisms').then((mod) => mod.VolunteerCheckInModal))

const VolunteerDeleteModal = dynamic(() => import('@/components/Organisms').then((mod) => mod.VolunteerDeleteModal))

const VolunteerDrawer = dynamic(() => import('@/components/Organisms').then((mod) => mod.VolunteerDrawer))

const VolunteerModalData = dynamic(() => import('@/components/Organisms').then((mod) => mod.VolunteerModalData))

export const Volunteers = () => {
	const [selectedVolunteer, setSelectedVolunteer] = useState<SelectedVolunteer | null>(null)

	const { data: volunteers, isLoading, search, setSearch, page, setPage, query, setQuery } = useGetVolunteers()

	const methods = useForm<VolunteerType>({
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
			cell: '',
			community: '',
			email: '',
			eventId: '',
			hasCell: '',
			hasHealth: '',
			hasServed: '',
			health: '',
			name: '',
			phone: '',
			relative: '',
			relativePhone: '',
			servedLastEvent: '',
			shirtSize: '',
			withShirt: '',
		},
		mode: 'onChange',
		resolver: zodResolver(VolunteerSchema),
	})

	const handleOpenModalToCheckInVolunteer = useCallback((id: VolunteersAPI['id']) => {
		setSelectedVolunteer({ id, modal: VOLUNTEER_MODAL_TYPE.CHECK_IN })
	}, [])

	const handleOpenModalToDeleteVolunteer = useCallback((id: VolunteersAPI['id']) => {
		setSelectedVolunteer({ id, modal: VOLUNTEER_MODAL_TYPE.DELETE })
	}, [])

	const handleOpenModalToShowVolunteerData = useCallback((id: VolunteersAPI['id']) => {
		setSelectedVolunteer({ id, modal: VOLUNTEER_MODAL_TYPE.INFO })
	}, [])

	const handleOpenDrawerToCreateOrEditVolunteer = useCallback((id?: VolunteersAPI['id']) => {
		if (id) {
			setSelectedVolunteer({ id, modal: VOLUNTEER_MODAL_TYPE.CREATE_OR_EDIT })
		} else {
			setSelectedVolunteer({ id: null, modal: VOLUNTEER_MODAL_TYPE.CREATE_OR_EDIT })
		}
	}, [])

	const handleOpenAssignFunctionVolunteerModal = useCallback((id: VolunteersAPI['id']) => {
		setSelectedVolunteer({ id, modal: VOLUNTEER_MODAL_TYPE.ASSIGN_FUNCTION })
	}, [])

	const formattedVolunteers = formatTableData(
		volunteers?.data,
		handleOpenModalToCheckInVolunteer,
		handleOpenModalToDeleteVolunteer,
		handleOpenDrawerToCreateOrEditVolunteer,
		handleOpenAssignFunctionVolunteerModal,
		handleOpenModalToShowVolunteerData
	)

	const hasMoreThanOnePage = !!volunteers?.totalPages && volunteers.totalPages > 1

	const handleCreateVolunteer = useCallback(
		() => handleOpenDrawerToCreateOrEditVolunteer(),
		[handleOpenDrawerToCreateOrEditVolunteer]
	)

	return (
		<PageContent pageTitle="Voluntários" subheadingPage="Lista de voluntários">
			<div className="flex flex-col items-center justify-end gap-5 md:flex-row">
				<ExportVolunteersButton />
				<CreateVolunteerButton handleCreateVolunteer={handleCreateVolunteer} />
			</div>
			<ListPage
				className="lg:max-w-full"
				moreFilter={<FilterDrawer query={query} setQuery={setQuery} type={MEMBERS.VOLUNTEER} />}
				placeholderField="Encontrar um voluntário"
				search={search}
				setSearch={setSearch}
			>
				<ListManager bodyData={formattedVolunteers} headerLabels={HEADER_LABELS} isLoading={isLoading} />
				{hasMoreThanOnePage && <Pagination currentPage={page} setPage={setPage} totalPages={volunteers?.totalPages} />}
			</ListPage>
			<VolunteerCheckInModal selectedVolunteer={selectedVolunteer} setSelectedVolunteer={setSelectedVolunteer} />
			<VolunteerDeleteModal selectedVolunteer={selectedVolunteer} setSelectedVolunteer={setSelectedVolunteer} />
			<FormProvider {...methods}>
				<VolunteerDrawer selectedVolunteer={selectedVolunteer} setSelectedVolunteer={setSelectedVolunteer} />
			</FormProvider>
			<AssignFunctionVolunteerModal selectedVolunteer={selectedVolunteer} setSelectedVolunteer={setSelectedVolunteer} />
			<VolunteerModalData selectedVolunteer={selectedVolunteer} setSelectedVolunteer={setSelectedVolunteer} />
		</PageContent>
	)
}
