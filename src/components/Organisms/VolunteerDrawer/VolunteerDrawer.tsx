'use client'
import { type Dispatch, memo, type SetStateAction, useEffect } from 'react'
import { Controller, type SubmitHandler, useFormContext } from 'react-hook-form'
import toast from 'react-hot-toast'

import { Button, Drawer, DrawerBody, DrawerFooter } from '@/components/Atoms'
import { InputField, MaskedInputField, SearchBox, SelectField } from '@/components/Molecules'
import type { SelectedVolunteer } from '@/components/Templates'
import {
	INSCRIPTION_OPTION_VOLUNTEER,
	ShirtsOptions,
	UF,
	VOLUNTEER_MODAL_TYPE,
	YES_OR_NO_SELECT_OPTIONS,
} from '@/constants'
import { formatDateToSendToApi, formatterComboBoxValues } from '@/formatters'
import { useInfiniteScrollObserver } from '@/hooks'
import { useGetCities } from '@/services/queries/cities'
import { useGetInfinityEvents } from '@/services/queries/events'
import { useCreateVolunteer, useGetVolunteer, useUpdateVolunteer } from '@/services/queries/volunteers'
import type { VolunteersAPI } from '@/services/queries/volunteers/volunteers.type'
import { generateToastError } from '@/utils/errors'

import type { VolunteerType } from './VolunteerDrawer.schema'

type VolunteerDrawerProps = {
	selectedVolunteer: null | SelectedVolunteer
	setSelectedVolunteer: Dispatch<SetStateAction<SelectedVolunteer | null>>
}

export const VolunteerDrawer = memo(({ selectedVolunteer, setSelectedVolunteer }: VolunteerDrawerProps) => {
	const { data, isLoading } = useGetVolunteer(selectedVolunteer?.id as VolunteersAPI['id'])
	const { isPending: isUpdating, update } = useUpdateVolunteer()
	const { isPending: isCreating, create } = useCreateVolunteer()
	const { data: events, hasNextPage, isFetchingNextPage, fetchNextPage, search, setSearch } = useGetInfinityEvents()
	const {
		handleSubmit,
		reset,
		watch,
		control,
		formState: { isValid, isDirty, errors },
	} = useFormContext<VolunteerType>()

	const selectedUF = watch('address.state')
	const hasCell = watch('hasCell')
	const hasHealth = watch('hasHealth')
	const hasServed = watch('hasServed')
	const hasShirt = watch('withShirt')

	const { data: cities } = useGetCities({
		nome: selectedUF,
	})

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

	const handleSubmitForm: SubmitHandler<VolunteerType> = async (values) => {
		if (!values) return

		const { hasCell, cell, hasHealth, health, hasServed, ...data } = values

		const formattedData = {
			...data,
			...(hasCell === 'Yes' ? { cell } : { cell: null }),
			...(hasHealth === 'Yes' ? { health } : { health: null }),
			...(hasServed === 'Yes' ? { servedLastEvent: data.servedLastEvent } : { servedLastEvent: null }),
			birthdate: formatDateToSendToApi(values.birthdate),
			phone: values.phone.replace(/\D/g, ''),
			relativePhone: values.relativePhone.replace(/\D/g, ''),
			withShirt: hasShirt === 'Yes',
			...(hasShirt !== 'Yes' && { shirtSize: null }),
			...(!selectedVolunteer && { inscriptionType: 'internal' as const }),
		}

		if (selectedVolunteer?.id) {
			return await update(
				{
					data: {
						...formattedData,
					},
					volunteerId: selectedVolunteer.id,
				},
				{
					onError: () => toast.error('Erro ao atualizar voluntário'),
					onSuccess: () => {
						reset()
						setSelectedVolunteer(null)
						toast.success('Voluntário atualizado com sucesso!')
					},
				}
			)
		}
		await create(
			{
				...formattedData,
			},
			{
				onError: (error) => generateToastError(error, 'Erro ao criar voluntário'),
				onSuccess: () => {
					reset()
					setSelectedVolunteer(null)
					toast.success('Voluntário criado com sucesso!')
				},
			}
		)
	}

	const handleClose = () => {
		reset()
		setSelectedVolunteer(null)
	}

	useEffect(() => {
		if (!data) return reset({}, { keepDefaultValues: true })

		reset(
			{ ...data, shirtSize: data.withShirt ? data.shirtSize : undefined, withShirt: data.withShirt ? 'Yes' : 'No' },
			{ keepDefaultValues: true }
		)
	}, [data, reset])

	return (
		<Drawer
			handleClose={handleClose}
			headingTitle="Dados do voluntário"
			isOpen={selectedVolunteer?.modal === VOLUNTEER_MODAL_TYPE.CREATE_OR_EDIT}
		>
			<DrawerBody isLoading={isLoading}>
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
				<InputField fieldName="name">Nome completo</InputField>
				<InputField fieldName="called">Como você gostaria de ser chamado(a)?</InputField>
				<InputField fieldName="email" type="email">
					E-mail
				</InputField>
				<MaskedInputField fieldName="phone" format="(##) #####-####">
					Telefone
				</MaskedInputField>
				<MaskedInputField fieldName="birthdate" format="##/##/####">
					Data de nascimento
				</MaskedInputField>
				<InputField fieldName="community">Igreja que frequenta</InputField>
				<SelectField fieldName="hasServed" options={YES_OR_NO_SELECT_OPTIONS} placeholder="Selecione uma opção">
					Serviu no último evento?
				</SelectField>
				{hasServed === 'Yes' && (
					<InputField fieldName="servedLastEvent" placeholder="Função">
						Qual a função?
					</InputField>
				)}
				<SelectField fieldName="hasCell" options={YES_OR_NO_SELECT_OPTIONS} placeholder="Selecione uma opção">
					Participa de célula?
				</SelectField>
				{hasCell === 'Yes' && <InputField fieldName="cell">Qual?</InputField>}
				<SelectField fieldName="hasHealth" options={YES_OR_NO_SELECT_OPTIONS} placeholder="Selecione uma opção">
					Tem restrição saúde/alimentar?
				</SelectField>
				{hasHealth === 'Yes' && <InputField fieldName="health">Descreva?</InputField>}
				<SelectField fieldName="withShirt" options={INSCRIPTION_OPTION_VOLUNTEER} placeholder="Selecione uma opção">
					Opção de inscrição
				</SelectField>
				{hasShirt === 'Yes' && (
					<SelectField fieldName="shirtSize" options={ShirtsOptions} placeholder="Selecione uma opção">
						Qual o tamanho?
					</SelectField>
				)}
				<InputField fieldName="relative">Parente próximo</InputField>
				<MaskedInputField fieldName="relativePhone" format="(##) #####-####">
					Telefone do parente
				</MaskedInputField>
				<InputField fieldName="address.street">Endereço</InputField>
				<InputField fieldName="address.number">Número</InputField>
				<SelectField fieldName="address.state" options={UF} placeholder="Selecione o estado">
					Estado
				</SelectField>
				<SelectField fieldName="address.city" options={cities ?? []} placeholder="Selecione a cidade">
					Cidade
				</SelectField>
				<InputField fieldName="address.neighborhood">Bairro</InputField>
			</DrawerBody>
			<DrawerFooter>
				<Button
					className="w-full items-center justify-center border-transparent bg-teal-500 text-base text-gray-50 transition-colors duration-500 hover:bg-teal-400 hover:text-slate-800"
					disabled={!isValid || !isDirty}
					isLoading={isCreating || isUpdating}
					onClick={handleSubmit(handleSubmitForm)}
					type="submit"
				>
					Salvar
				</Button>
			</DrawerFooter>
		</Drawer>
	)
})

VolunteerDrawer.displayName = 'VolunteerDrawer'
