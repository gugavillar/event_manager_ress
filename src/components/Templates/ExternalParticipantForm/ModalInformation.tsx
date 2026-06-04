import { format, previousSunday } from 'date-fns'
import { ptBR } from 'date-fns/locale/pt-BR'
import extenso from 'extenso'
import { type Dispatch, memo, type SetStateAction } from 'react'

import { Button, Header, Modal } from '@/components/Atoms'
import { currencyValue } from '@/formatters'

type ModalInformationProps = {
	isOpen: boolean
	setIsOpen: Dispatch<SetStateAction<boolean>>
	initialDate?: Date
	finalDate?: Date
	registrationValue?: number
	minAge?: number | null
}

export const ModalInformation = memo(
	({ isOpen, setIsOpen, initialDate, finalDate, registrationValue, minAge }: ModalInformationProps) => {
		const handleClose = () => {
			setIsOpen(false)
		}
		const lastSundayFromEvent = format(previousSunday(initialDate ?? new Date()), "dd 'de' MMMM '('eeee')'", {
			locale: ptBR,
		})
		const checkInDate = format(initialDate ?? new Date(), 'dd/MM', {
			locale: ptBR,
		})
		const closingDate = format(finalDate ?? new Date(), 'dd/MM', {
			locale: ptBR,
		})

		return (
			<Modal isLarge onOpenChange={handleClose} open={isOpen}>
				<div className="flex flex-col space-y-4 max-md:h-[85dvh] max-md:overflow-y-auto">
					<Header as="h3" className="text-center text-lg">
						LEIA COM ATENÇÃO ESTAS ORIENTAÇÕES
					</Header>
					<div className="flex flex-col space-y-4 px-8">
						<strong className="text-center text-md">IDADE MÍNIMA {minAge} ANOS, PARA PARTICIPAR DO EVENTO</strong>
						<ol className="flex list-decimal flex-col space-y-4 text-justify text-sm">
							<li>O preenchimento da sua ficha não implica aceitação imediata e consequente participação;</li>
							<li>
								Você que participará deste evento, deverá entrar em contato com Luciana (Tesoureira) (81) 98413-0663
								para realizar o pagamento da inscrição no valor de{' '}
								<strong>{currencyValue(registrationValue as number)}</strong> (
								{extenso(registrationValue as number, { mode: 'currency' })}) até o dia{' '}
								<strong>{lastSundayFromEvent}</strong>.{' '}
								<strong>Formas de pagamento: Dinheiro em espécie, PIX e Cartão de Crédito</strong>, o qual visa cobrir
								despesas com alimentação, transporte, material gráfico e hospedagem;
							</li>
							<li>
								Levar materiais de higiene pessoal, remédios habituais, travesseiro, toalha de banho e lençóis, utilize
								roupas e calçados confortáveis, evitar vestimentas curtas, em virtude de serem incompatíveis com os
								momentos que ali serão vividos;
							</li>
							<li>
								Horário de chegada na Igreja para <strong>CHECK-IN</strong> será às{' '}
								<strong>18:30h no dia {checkInDate}</strong>;
							</li>
							<li>
								Teremos prazer em acolher seus familiares e amigos no culto de encerramento que será realizado no
								domingo, <strong>{closingDate} às 18:00h</strong> na Catedral Anglicana Ressurreição. Por favor,
								convide-os;
							</li>
						</ol>
					</div>
					<Button
						className="inline-flex w-full cursor-pointer items-center justify-center gap-x-1 rounded-lg border border-transparent bg-teal-500 px-3 py-2.5 font-medium text-sm text-white transition-all duration-300 hover:bg-teal-400 focus:outline-hidden disabled:pointer-events-none disabled:opacity-50"
						onClick={handleClose}
					>
						Iniciar inscrição
					</Button>
				</div>
			</Modal>
		)
	}
)

ModalInformation.displayName = 'ModalInformation'
