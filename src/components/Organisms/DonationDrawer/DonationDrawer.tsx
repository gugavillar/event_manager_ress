'use client'
import type { Dispatch, SetStateAction } from 'react'
import { Controller, type SubmitHandler, useFormContext } from 'react-hook-form'
import toast from 'react-hot-toast'

import { Button, Drawer, DrawerBody, DrawerFooter } from '@/components/Atoms'
import { CurrencyInputField, InputField, SearchBox, SelectField } from '@/components/Molecules'
import { DONATION_MODAL_TYPE, PaymentSelectOptions, PaymentTypeAPI } from '@/constants'
import { formatterComboBoxValues, removeCurrencyFormat } from '@/formatters'
import { useInfiniteScrollObserver } from '@/hooks'
import { useCreateDonation } from '@/services/queries/donations'
import { useGetInfinityEvents } from '@/services/queries/events'
import { generateToastError } from '@/utils/errors'

import type { DonationType } from './DonationDrawer.schema'

type DonationDrawerProps = {
	isOpen: DONATION_MODAL_TYPE | null
	setIsOpen: Dispatch<SetStateAction<DONATION_MODAL_TYPE | null>>
}

const paymentMethods = PaymentSelectOptions.filter(
	(item) => ![PaymentTypeAPI.DONATION, PaymentTypeAPI.OPEN].includes(item.value)
)

export const DonationDrawer = ({ isOpen, setIsOpen }: DonationDrawerProps) => {
	const { data: events, hasNextPage, isFetchingNextPage, fetchNextPage, search, setSearch } = useGetInfinityEvents()
	const { create, isPending } = useCreateDonation()
	const {
		handleSubmit,
		reset,
		control,
		formState: { isValid, isDirty, errors },
	} = useFormContext<DonationType>()

	const formattedEvents = formatterComboBoxValues(
		events?.pages?.flatMap((page) => page.data),
		'name',
		'id'
	)

	const lastItemRef = useInfiniteScrollObserver({
		fetchNextPage,
		hasNextPage: Boolean(hasNextPage),
		isFetchingNextPage,
	})

	const onSubmit: SubmitHandler<DonationType> = async (values) => {
		if (!values) return

		const formattedValues = {
			...values,
			value: Number(removeCurrencyFormat(values.value)),
		}

		await create(formattedValues, {
			onError: (error) => generateToastError(error, 'Erro ao criar doação'),
			onSuccess: () => {
				reset()
				toast.success('Doação criada com sucesso!')
				setIsOpen(null)
			},
		})
	}

	const handleClose = () => {
		reset()
		setIsOpen(null)
	}

	return (
		<Drawer handleClose={handleClose} headingTitle="Nova doação" isOpen={isOpen === DONATION_MODAL_TYPE.CREATE}>
			<DrawerBody>
				<Controller
					control={control}
					name="eventId"
					render={({ field }) => (
						<SearchBox
							error={errors.eventId?.message}
							keyOptionLabel="label"
							keyOptionValue="value"
							label="Evento"
							lastItemRef={lastItemRef}
							options={formattedEvents}
							search={search}
							selectedValue={field.value}
							setSearch={setSearch}
							setSelectedValue={field.onChange}
						/>
					)}
				/>
				<InputField fieldName="name">Nome do doador</InputField>
				<SelectField fieldName="type" options={paymentMethods} placeholder="Selecione o tipo">
					Tipo
				</SelectField>
				<CurrencyInputField fieldName="value" type="tel">
					Valor
				</CurrencyInputField>
			</DrawerBody>
			<DrawerFooter>
				<Button
					className="w-full items-center justify-center border-transparent bg-teal-500 text-base text-gray-50 transition-colors duration-500 hover:bg-teal-400 hover:text-slate-800"
					disabled={!isValid || !isDirty}
					isLoading={isPending}
					onClick={handleSubmit(onSubmit)}
					type="submit"
				>
					Criar doação
				</Button>
			</DrawerFooter>
		</Drawer>
	)
}
