'use client'

import dynamic from 'next/dynamic'
import { useCallback, useState } from 'react'
import toast from 'react-hot-toast'

import { Pagination } from '@/components/Atoms'
import { ListManager } from '@/components/Molecules'
import { FilterDrawer, ListPage, ModalReturnPayment, PageContent } from '@/components/Organisms'
import type { PaymentModalType } from '@/components/Organisms/PaymentModal/PaymentModal.schema'
import {
	MEMBERS,
	PaymentTypeAPI,
	realValueInscriptionVolunteer,
	type ShirtsAPI,
	VOLUNTEER_MODAL_TYPE,
} from '@/constants'
import { removeCurrencyFormat } from '@/formatters'
import { useCreateVolunteerPayment, useGetPayments, useReturnVolunteerPayment } from '@/services/queries/volunteers'
import type { VolunteersAPI } from '@/services/queries/volunteers/volunteers.type'
import { generateToastError } from '@/utils/errors'

import type { SelectedVolunteer } from '../Volunteers/Volunteers'
import { formatTableData, HEADER_LABELS } from './VolunteersPayments.utils'

const PaymentModal = dynamic(() => import('@/components/Organisms').then((mod) => mod.PaymentModal))

const VolunteerModalData = dynamic(() => import('@/components/Organisms').then((mod) => mod.VolunteerModalData))
export const VolunteersPayments = () => {
	const [selectedVolunteer, setSelectedVolunteer] = useState<VolunteersAPI | null>(null)
	const [selectVolunteer, setSelectVolunteer] = useState<SelectedVolunteer | null>(null)
	const {
		data: volunteersPayments,
		isLoading: isLoadingPayments,
		search,
		setSearch,
		page,
		setPage,
		query,
		setQuery,
	} = useGetPayments()
	const { create, isPending } = useCreateVolunteerPayment()
	const { returnPayment, isPending: isPendingReturn } = useReturnVolunteerPayment()

	const handleOpenModalToPaymentVolunteer = useCallback((payment: VolunteersAPI) => {
		setSelectedVolunteer(payment)
		setSelectVolunteer({ id: payment.id, modal: VOLUNTEER_MODAL_TYPE.PAYMENT })
	}, [])

	const handleOpenModalToReturnPaymentVolunteer = useCallback((payment: VolunteersAPI) => {
		setSelectedVolunteer(payment)
		setSelectVolunteer({ id: payment.id, modal: VOLUNTEER_MODAL_TYPE.RETURN_PAYMENT })
	}, [])

	const handleOpenModalToShowVolunteerData = useCallback((id: VolunteersAPI['id']) => {
		setSelectVolunteer({ id, modal: VOLUNTEER_MODAL_TYPE.INFO })
	}, [])

	const formattedData = formatTableData(
		volunteersPayments?.data,
		handleOpenModalToPaymentVolunteer,
		handleOpenModalToReturnPaymentVolunteer,
		handleOpenModalToShowVolunteerData
	)

	const handleUpdate = useCallback(
		async (values: PaymentModalType) => {
			if (!selectedVolunteer) return

			const eventValue =
				realValueInscriptionVolunteer(
					Boolean(selectedVolunteer?.withShirt),
					selectedVolunteer?.event?.volunteerPrice ?? '0',
					selectedVolunteer?.event?.volunteerPriceWithShirt ?? '0',
					selectedVolunteer?.shirtSize as ShirtsAPI
				) ?? 0

			const formatValues = {
				eventId: selectedVolunteer.eventId,
				paymentType: values.paymentType as PaymentTypeAPI,
				paymentValue:
					values.paid === 'partial' && values.paymentValue
						? Number(removeCurrencyFormat(values.paymentValue))
						: eventValue,
				volunteerId: selectedVolunteer.id,
				...(values.paymentType === PaymentTypeAPI.CARD && {
					paymentReceived: Number(removeCurrencyFormat(values.paymentReceived as string)),
				}),
			}

			await create(
				{ data: formatValues },
				{
					onError: (error) => generateToastError(error, 'Erro ao registrar pagamento do voluntário'),
					onSuccess: () => {
						setSelectedVolunteer(null)
						toast.success('Pagamento do voluntário registrado com sucesso!')
					},
				}
			)
		},
		[selectedVolunteer, create]
	)

	const handleReturnPayment = useCallback(async () => {
		if (!selectedVolunteer) return

		const results = await Promise.allSettled(selectedVolunteer.payments.map((p) => returnPayment({ id: p.id })))
		const hasError = results.some((res) => res.status === 'rejected')

		if (hasError) {
			toast.error('Erro ao devolver pagamento do voluntário')
		} else {
			toast.success('Pagamento do voluntário devolvido com sucesso!')
		}

		setSelectedVolunteer(null)
	}, [returnPayment, selectedVolunteer])

	const hasMoreThanOnePage = !!volunteersPayments?.totalPages && volunteersPayments.totalPages > 1

	const isExistPayment = Boolean(selectedVolunteer?.payments?.length)
	const paidValue = selectedVolunteer?.payments?.reduce((total, p) => (total += Number(p.paymentValue)), 0) ?? 0
	const eventValue =
		realValueInscriptionVolunteer(
			Boolean(selectedVolunteer?.withShirt),
			selectedVolunteer?.event?.volunteerPrice ?? '0',
			selectedVolunteer?.event?.volunteerPriceWithShirt ?? '0',
			selectedVolunteer?.shirtSize as ShirtsAPI
		) ?? 0

	return (
		<PageContent pageTitle="Pagamentos dos voluntários" subheadingPage="Lista de pagamentos">
			<ListPage
				className="lg:max-w-full"
				moreFilter={<FilterDrawer isPaymentType query={query} setQuery={setQuery} type={MEMBERS.VOLUNTEER} />}
				placeholderField="Encontrar um voluntário"
				search={search}
				setSearch={setSearch}
			>
				<ListManager bodyData={formattedData} headerLabels={HEADER_LABELS} isLoading={isLoadingPayments} />
				{hasMoreThanOnePage && (
					<Pagination currentPage={page} setPage={setPage} totalPages={volunteersPayments?.totalPages} />
				)}
			</ListPage>
			<PaymentModal
				eventValue={eventValue}
				handleSubmit={handleUpdate}
				isExistPayment={isExistPayment}
				isPending={isPending}
				modalType="voluntário"
				paidValue={paidValue}
				selected={selectVolunteer}
				setSelected={setSelectVolunteer}
			/>
			<ModalReturnPayment
				handleReturnPayment={handleReturnPayment}
				isPending={isPendingReturn}
				modalType="voluntário"
				selected={selectVolunteer}
				setSelected={setSelectVolunteer}
			/>
			<VolunteerModalData selectedVolunteer={selectVolunteer} setSelectedVolunteer={setSelectVolunteer} />
		</PageContent>
	)
}
