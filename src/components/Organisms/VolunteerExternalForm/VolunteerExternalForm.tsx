'use client'

import { useFormContext } from 'react-hook-form'

import { InputField, MaskedInputField, SelectField } from '@/components/Molecules'
import type { FullSchemaType } from '@/components/Templates/ExternalVolunteerForm/ExternalVolunteerForm.schema'
import { YES_OR_NO_SELECT_OPTIONS } from '@/constants'

export const VolunteerExternalForm = ({ eventName }: { eventName?: string }) => {
	const { watch } = useFormContext<FullSchemaType>()
	const hasCell = watch('hasCell')
	const hasHealth = watch('hasHealth')
	const hasServed = watch('hasServed')
	const lastEventName = eventName ? eventName?.replace(/\d/g, '') : ''

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
				<InputField fieldName="community" placeholder="Nome da igreja ou comunidade">
					Igreja que frequenta
				</InputField>
			</div>
			<div className="grid grid-cols-1 gap-5 md:grid-cols-2">
				<SelectField fieldName="hasServed" options={YES_OR_NO_SELECT_OPTIONS} placeholder="Selecione uma opção">
					Serviu no último {lastEventName}?
				</SelectField>
				{hasServed === 'Yes' && (
					<InputField fieldName="servedLastEvent" placeholder="Função">
						Qual a função?
					</InputField>
				)}
			</div>
			<div className="grid grid-cols-1 gap-5 md:grid-cols-2">
				<SelectField fieldName="hasCell" options={YES_OR_NO_SELECT_OPTIONS} placeholder="Selecione uma opção">
					Participa de célula?
				</SelectField>
				{hasCell === 'Yes' && (
					<InputField fieldName="cell" placeholder="Nome da célula ou do líder">
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
				<InputField fieldName="relative" placeholder="Nome completo do parente próximo">
					Parente próximo
				</InputField>
				<MaskedInputField fieldName="relativePhone" format="(##) #####-####" placeholder="(00) 00000-0000">
					Telefone do parente
				</MaskedInputField>
			</div>
		</div>
	)
}
