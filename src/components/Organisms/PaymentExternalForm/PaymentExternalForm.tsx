'use client'
import { format, previousSunday } from 'date-fns'
import { ptBR } from 'date-fns/locale/pt-BR'
import { type Dispatch, type SetStateAction, useState } from 'react'
import { useFormContext } from 'react-hook-form'

import { SelectField } from '@/components/Molecules'
import type { ExternalParticipantFormProps, ExternalVolunteerFormProps } from '@/components/Templates'
import type { FullSchemaType as FullSchemaTypeParticipant } from '@/components/Templates/ExternalParticipantForm/ExternalParticipantForm.schema'
import type { FullSchemaType as FullSchemaTypeVolunteer } from '@/components/Templates/ExternalVolunteerForm/ExternalVolunteerForm.schema'
import { PAYMENT_METHOD_EXTERNAL_OPTIONS, ShirtsAPI, ShirtsOptions } from '@/constants'

import { PaymentChoice } from './PaymentChoice'
import { PaymentObservations } from './PaymentObservations'

type DefaultProps = ExternalParticipantFormProps & ExternalVolunteerFormProps

type PaymentExternalFormProps = DefaultProps & {
	setCurrentStep: Dispatch<SetStateAction<number>>
}

const INSCRIPTION_OPTION = [
	{ label: 'Inscrição com camisa', value: 'Yes' },
	{ label: 'Inscrição sem camisa', value: 'No' },
]

export const PaymentExternalForm = ({
	registrationValue,
	setCurrentStep,
	initialDate,
	inscriptionType,
	registrationValueWithShirt,
}: PaymentExternalFormProps) => {
	const [pixValue, setPixValue] = useState<string | null>(null)
	const { watch } = useFormContext<FullSchemaTypeParticipant | FullSchemaTypeVolunteer>()

	const paymentMethod = watch('paymentMethod') ?? ''
	const lastSundayFromEvent = format(previousSunday(initialDate ?? new Date()), 'dd MMMM', { locale: ptBR })
	const hasShirt = watch('withShirt')
	const isShirtSizeSpecial = watch('shirtSize') === ShirtsAPI.SPECIAL
	const valueWithShirt =
		isShirtSizeSpecial && registrationValueWithShirt ? registrationValueWithShirt + 5 : registrationValueWithShirt

	return (
		<div className="flex flex-col space-y-8">
			<PaymentObservations
				inscriptionType={inscriptionType}
				lastSundayFromEvent={lastSundayFromEvent}
				registrationValue={registrationValue}
			/>
			<div className="grid grid-cols-1 gap-5 md:grid-cols-2">
				<SelectField fieldName="withShirt" options={INSCRIPTION_OPTION} placeholder="Selecione uma opção">
					Selecione sua opção de Inscrição
				</SelectField>
				{hasShirt === 'Yes' && (
					<SelectField fieldName="shirtSize" options={ShirtsOptions} placeholder="Selecione uma opção">
						Qual o tamanho?
					</SelectField>
				)}
			</div>
			{hasShirt && (
				<SelectField
					fieldName="paymentMethod"
					options={PAYMENT_METHOD_EXTERNAL_OPTIONS}
					placeholder="Selecione o tipo de pagamento"
				>
					Selecione uma das opções abaixo e siga as instruções para concluir o pagamento da sua inscrição
				</SelectField>
			)}
			<PaymentChoice
				paymentMethod={paymentMethod}
				pixValue={pixValue}
				registrationValue={hasShirt === 'Yes' ? valueWithShirt : registrationValue}
				setCurrentStep={setCurrentStep}
				setPixValue={setPixValue}
			/>
		</div>
	)
}
