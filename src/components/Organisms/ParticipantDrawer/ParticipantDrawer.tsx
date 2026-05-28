'use client'
import { type Dispatch, memo, type SetStateAction, useEffect } from 'react'
import { Controller, type SubmitHandler, useFormContext } from 'react-hook-form'
import toast from 'react-hot-toast'

import { Button, Drawer, DrawerBody, DrawerFooter } from '@/components/Atoms'
import { InputField, MaskedInputField, SearchBox, SelectField } from '@/components/Molecules'
import type { SelectedParticipant } from '@/components/Templates'
import { CivilStatusOptions, PARTICIPANT_MODAL_TYPE, UF, YES_OR_NO_SELECT_OPTIONS } from '@/constants'
import { formatDateToSendToApi, formatterComboBoxValues } from '@/formatters'
import { useInfiniteScrollObserver } from '@/hooks'
import { useGetCities } from '@/services/queries/cities'
import { useGetInfinityEvents } from '@/services/queries/events'
import { useCreateParticipant, useGetParticipant, useUpdateParticipant } from '@/services/queries/participants'
import type { ParticipantsAPI } from '@/services/queries/participants/participants.type'
import { generateToastError } from '@/utils/errors'

import type { ParticipantType } from './ParticipantDrawer.schema'

type ParticipantDrawerProps = {
	selectedParticipant: null | SelectedParticipant
	setSelectedParticipant: Dispatch<SetStateAction<SelectedParticipant | null>>
}

export const ParticipantDrawer = memo(({ selectedParticipant, setSelectedParticipant }: ParticipantDrawerProps) => {
	const { data, isLoading } = useGetParticipant(selectedParticipant?.id as ParticipantsAPI['id'])
	const {
		handleSubmit,
		reset,
		watch,
		control,
		formState: { isValid, isDirty, errors },
	} = useFormContext<ParticipantType>()
	const { data: events, hasNextPage, isFetchingNextPage, fetchNextPage, search, setSearch } = useGetInfinityEvents()
	const { isPending: isUpdating, update } = useUpdateParticipant()
	const { isPending: isCreating, create } = useCreateParticipant()

	const selectedUF = watch('address.state')
	const hasReligion = watch('hasReligion')
	const hasHealth = watch('hasHealth')

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

	const handleSubmitForm: SubmitHandler<ParticipantType> = async (values) => {
		if (!values) return

		const { hasReligion, religion, hasHealth, health, ...data } = values

		const formattedData = {
			...data,
			...(hasReligion === 'Yes' ? { religion } : { religion: null }),
			...(hasHealth === 'Yes' ? { health } : { health: null }),
			birthdate: formatDateToSendToApi(data.birthdate),
			hostPhone: data.hostPhone.replace(/\D/g, ''),
			phone: data.phone.replace(/\D/g, ''),
			responsiblePhone: data.responsiblePhone.replace(/\D/g, ''),
			...(!selectedParticipant && { inscriptionType: 'internal' as const }),
		}

		if (selectedParticipant?.id) {
			return await update(
				{
					data: {
						...formattedData,
					},
					participantId: selectedParticipant.id,
				},
				{
					onError: () => toast.error('Erro ao atualizar participante'),
					onSuccess: () => {
						reset()
						setSelectedParticipant(null)
						toast.success('Participante atualizado com sucesso!')
					},
				}
			)
		}
		await create(
			{
				...formattedData,
			},
			{
				onError: (error) => generateToastError(error, 'Erro ao criar participante'),
				onSuccess: () => {
					reset()
					setSelectedParticipant(null)
					toast.success('Participante criado com sucesso!')
				},
			}
		)
	}

	const handleClose = () => {
		reset()
		setSelectedParticipant(null)
	}

	useEffect(() => {
		if (!data) return reset({}, { keepDefaultValues: true })

		reset({ ...data }, { keepDefaultValues: true })
	}, [data, reset])

	return (
		<Drawer
			handleClose={handleClose}
			headingTitle="Dados do participante"
			isOpen={selectedParticipant?.modal === PARTICIPANT_MODAL_TYPE.CREATE_OR_EDIT}
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
				<SelectField fieldName="civilStatus" options={CivilStatusOptions} placeholder="Selecione uma opção">
					Estado civil
				</SelectField>
				<SelectField fieldName="hasReligion" options={YES_OR_NO_SELECT_OPTIONS} placeholder="Selecione uma opção">
					Tem religião?
				</SelectField>
				{hasReligion === 'Yes' && <InputField fieldName="religion">Qual?</InputField>}
				<SelectField fieldName="hasHealth" options={YES_OR_NO_SELECT_OPTIONS} placeholder="Selecione uma opção">
					Tem restrição saúde/alimentar?
				</SelectField>
				{hasHealth === 'Yes' && <InputField fieldName="health">Descreva?</InputField>}
				<InputField fieldName="responsible">Responsável</InputField>
				<MaskedInputField fieldName="responsiblePhone" format="(##) #####-####">
					Telefone responsável
				</MaskedInputField>

				<InputField fieldName="host">Quem convidou</InputField>
				<MaskedInputField fieldName="hostPhone" format="(##) #####-####">
					Telefone quem convidou
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
					isLoading={isUpdating || isCreating}
					onClick={handleSubmit(handleSubmitForm)}
					type="submit"
				>
					Salvar
				</Button>
			</DrawerFooter>
		</Drawer>
	)
})

ParticipantDrawer.displayName = 'ParticipantDrawer'
