'use client'
import { format, previousSunday } from 'date-fns'
import { ptBR } from 'date-fns/locale/pt-BR'
import { type Dispatch, type SetStateAction, useState } from 'react'
import { useFormContext } from 'react-hook-form'

import { SelectField } from '@/components/Molecules'
import type { ExternalParticipantFormProps } from '@/components/Templates'
import type { FullSchemaType } from '@/components/Templates/ExternalParticipantForm/ExternalParticipantForm.schema'
import { type MEMBERS, PAYMENT_METHOD_EXTERNAL_OPTIONS } from '@/constants'

import { PaymentChoice } from './PaymentChoice'
import { PaymentObservations } from './PaymentObservations'

type PaymentExternalFormProps = ExternalParticipantFormProps & {
	setCurrentStep: Dispatch<SetStateAction<number>>
	initialDate?: Date
	inscriptionType: MEMBERS
}

export const PaymentExternalForm = ({
	registrationValue,
	setCurrentStep,
	initialDate,
	inscriptionType,
}: PaymentExternalFormProps) => {
	const [pixValue, setPixValue] = useState<string | null>(null)
	const { watch } = useFormContext<FullSchemaType>()

	const paymentMethod = watch('paymentMethod') ?? ''
	const lastSundayFromEvent = format(previousSunday(initialDate ?? new Date()), 'dd MMMM', { locale: ptBR })

	return (
		<div className="flex flex-col space-y-8">
			<PaymentObservations
				inscriptionType={inscriptionType}
				lastSundayFromEvent={lastSundayFromEvent}
				registrationValue={registrationValue}
			/>
			<div className="grid grid-cols-1 md:grid-cols-2"></div>
			<SelectField
				fieldName="paymentMethod"
				options={PAYMENT_METHOD_EXTERNAL_OPTIONS}
				placeholder="Selecione o tipo de pagamento"
			>
				Selecione uma das opções abaixo e siga as instruções para concluir o pagamento da sua inscrição
			</SelectField>
			<PaymentChoice
				paymentMethod={paymentMethod}
				pixValue={pixValue}
				registrationValue={registrationValue}
				setCurrentStep={setCurrentStep}
				setPixValue={setPixValue}
			/>
		</div>
	)
}
