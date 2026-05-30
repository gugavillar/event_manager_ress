import { BanknoteArrowUp, FileUser, HandCoins } from 'lucide-react'
import { twMerge } from 'tailwind-merge'

import { PaymentTag, Tooltip } from '@/components/Atoms'
import {
	CHECK_IN_STATUS,
	COMMON_PROPS_TOOLTIPS_BUTTON_TABLE,
	LINE_COLOR,
	PaymentTypeAPI,
	realValueInscriptionVolunteer,
} from '@/constants'
import { currencyValue, formatPhone } from '@/formatters'
import type { VolunteersAPI } from '@/services/queries/volunteers/volunteers.type'

const generateTooltipText = (volunteerWithdraw: boolean, paymentTotal: boolean) => {
	if (volunteerWithdraw) {
		return 'Voluntário desistiu'
	}
	if (paymentTotal) {
		return 'Voluntário pagou o valor total'
	}
	return 'Informar pagamento'
}

export const HEADER_LABELS = [
	{
		accessor: 'name',
		label: 'Nome',
	},
	{
		accessor: 'called',
		label: 'Chamado',
	},
	{
		accessor: 'phone',
		label: 'Telefone',
	},
	{
		accessor: 'eventName',
		label: 'Evento',
	},
	{
		accessor: 'eventValue',
		label: 'Valor evento',
	},
	{
		accessor: 'valuePayed',
		label: 'Valor pago',
	},
	{
		accessor: 'payment',
		label: 'Status',
	},
	{
		accessor: 'actions',
		label: '',
	},
]

export const formatTableData = (
	payments: Array<VolunteersAPI> | undefined,
	handlePaymentModal: (payment: VolunteersAPI) => void,
	handleReturnPaymentModal: (payment: VolunteersAPI) => void,
	handleShowVolunteer: (id: VolunteersAPI['id']) => void
) => {
	if (!payments) return []

	return payments.map((payment) => {
		const isVolunteerWithdraw = payment.checkIn === CHECK_IN_STATUS.WITHDREW
		const totalPayment = payment.payments.reduce((total, p) => {
			if (payment.id === p.volunteerId) {
				return total + Number(p.paymentValue)
			}
			return total
		}, 0)

		const volunteerInscriptionValue = realValueInscriptionVolunteer(
			payment.withShirt,
			payment.event.volunteerPrice,
			payment.event.volunteerPriceWithShirt,
			payment.shirtSize
		)
		const isPaymentNotTotal = totalPayment > 0 && totalPayment < Number(volunteerInscriptionValue)
		const isPaymentTotal = totalPayment >= Number(volunteerInscriptionValue)
		const isVolunteerPaidAndWithdraw = isVolunteerWithdraw && totalPayment > 0
		const canInformPayment = !isPaymentTotal && !isVolunteerWithdraw

		return {
			...((isPaymentNotTotal || isVolunteerWithdraw) && {
				backgroundColor: isVolunteerWithdraw ? LINE_COLOR.withdrew : LINE_COLOR.payment,
			}),
			actions: (
				<div className="flex space-x-4">
					<Tooltip
						{...COMMON_PROPS_TOOLTIPS_BUTTON_TABLE}
						trigger={<FileUser className="cursor-pointer" onClick={() => handleShowVolunteer(payment.id)} size={20} />}
					>
						Informações
					</Tooltip>
					<Tooltip
						{...COMMON_PROPS_TOOLTIPS_BUTTON_TABLE}
						trigger={
							<HandCoins
								className={twMerge(
									isVolunteerWithdraw || isPaymentTotal ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'
								)}
								size={20}
								{...(canInformPayment && {
									onClick: () => handlePaymentModal(payment),
								})}
							/>
						}
					>
						{generateTooltipText(isVolunteerWithdraw, isPaymentTotal)}
					</Tooltip>
					{isVolunteerPaidAndWithdraw && (
						<Tooltip
							{...COMMON_PROPS_TOOLTIPS_BUTTON_TABLE}
							trigger={
								<BanknoteArrowUp
									className="cursor-pointer"
									onClick={() => handleReturnPaymentModal(payment)}
									size={20}
								/>
							}
						>
							Devolver pagamento
						</Tooltip>
					)}
				</div>
			),
			called: payment.called,
			eventName: payment.event.name,
			eventValue: currencyValue(Number(volunteerInscriptionValue)),
			id: payment.id,
			name: payment.name,
			payment: (
				<div className="flex gap-2">
					{!payment.payments.length ? (
						<PaymentTag status={PaymentTypeAPI.OPEN} />
					) : (
						payment.payments.map((p) => (
							<PaymentTag key={p.id} status={!p.paymentType ? PaymentTypeAPI.OPEN : p.paymentType} />
						))
					)}
				</div>
			),
			phone: formatPhone(payment.phone),
			valuePayed: currencyValue(totalPayment),
		}
	})
}
