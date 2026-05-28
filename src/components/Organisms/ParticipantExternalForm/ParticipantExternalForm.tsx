'use client'

import { useFormContext } from 'react-hook-form'

import { InputField, MaskedInputField, SelectField } from '@/components/Molecules'
import type { FullSchemaType } from '@/components/Templates/ExternalParticipantForm/ExternalParticipantForm.schema'
import { CivilStatusOptions, YES_OR_NO_SELECT_OPTIONS } from '@/constants'

type ParticipantExternalFormProps = {
	isNotHappening?: boolean
}

export const ParticipantExternalForm = ({ isNotHappening }: ParticipantExternalFormProps) => {
	const { watch } = useFormContext<FullSchemaType>()
	const hasReligion = watch('hasReligion')
	const hasHealth = watch('hasHealth')
	const fieldResponsibleLabel = isNotHappening ? 'Parente próximo' : 'Responsável'
	const filedResponsiblePhoneLabel = isNotHappening ? 'Telefone parente' : 'Telefone responsável'
	return (
		<div className="space-y-6">
			<div className="grid grid-cols-1 gap-5 md:grid-cols-2">
				<InputField fieldName="name" placeholder="Digite seu nome completo">
					Nome completo
				</InputField>
				<InputField fieldName="called" placeholder="Ex: João, Ana, Juninho...">
					Como você gostaria de ser chamado(a)?
				</InputField>
				<InputField fieldName="email" placeholder="exemplo@email.com" type="email">
					E-mail
				</InputField>
				<MaskedInputField fieldName="phone" format="(##) #####-####" placeholder="(00) 00000-0000">
					Telefone
				</MaskedInputField>
				<MaskedInputField fieldName="birthdate" format="##/##/####" placeholder="DD/MM/AAAA">
					Data de nascimento
				</MaskedInputField>
				<SelectField fieldName="civilStatus" options={CivilStatusOptions} placeholder="Selecione uma opção">
					Estado civil
				</SelectField>
			</div>
			<div className="grid grid-cols-1 gap-5 md:grid-cols-2">
				<SelectField fieldName="hasReligion" options={YES_OR_NO_SELECT_OPTIONS} placeholder="Selecione uma opção">
					Tem religião?
				</SelectField>
				{hasReligion === 'Yes' && (
					<InputField fieldName="religion" placeholder="Ex: Católica, Evangélica, Espírita...">
						Qual?
					</InputField>
				)}
			</div>
			<div className="grid grid-cols-1 gap-5 md:grid-cols-2">
				<SelectField fieldName="hasHealth" options={YES_OR_NO_SELECT_OPTIONS} placeholder="Selecione uma opção">
					Tem restrição saúde/alimentar?
				</SelectField>
				{hasHealth === 'Yes' && (
					<InputField fieldName="health" placeholder="Descreva a restrição ou alergia">
						Descreva?
					</InputField>
				)}
			</div>
			<div className="grid grid-cols-1 gap-5 md:grid-cols-2">
				<InputField fieldName="responsible" placeholder="Nome completo do responsável">
					{fieldResponsibleLabel}
				</InputField>
				<MaskedInputField fieldName="responsiblePhone" format="(##) #####-####" placeholder="(00) 00000-0000">
					{filedResponsiblePhoneLabel}
				</MaskedInputField>

				<InputField fieldName="host" placeholder="Nome de quem fez o convite">
					Quem convidou
				</InputField>
				<MaskedInputField fieldName="hostPhone" format="(##) #####-####" placeholder="(00) 00000-0000">
					Telefone quem convidou
				</MaskedInputField>
			</div>
		</div>
	)
}
