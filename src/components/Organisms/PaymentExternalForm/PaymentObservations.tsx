import extenso from 'extenso'

import { MEMBERS } from '@/constants'
import { currencyValue } from '@/formatters'

type PaymentObservationsProps = {
	inscriptionType: MEMBERS
	registrationValue?: number
	lastSundayFromEvent: string
}

export const PaymentObservations = ({
	inscriptionType,
	registrationValue,
	lastSundayFromEvent,
}: PaymentObservationsProps) => {
	return inscriptionType === MEMBERS.PARTICIPANT ? (
		<div className="flex flex-col space-y-4">
			<h2 className="text-center text-lg">Declaração</h2>
			<p className="text-justify">
				Ao finalizar, declaro estar ciente, que é minha responsabilidade conferir se as informações descritas nesse
				formulário estão corretas. Declaro estar ciente da necessidade de entrar em contato com Luciana (tesoureira), a
				fim de confirmar minha presença, efetuando o pagamento da taxa no valor de{' '}
				{currencyValue(registrationValue as number)} ({extenso(registrationValue as number, { mode: 'currency' })}) até
				o dia {lastSundayFromEvent}.
			</p>
			<p className="text-justify font-medium">
				OBS: O cancelamento da inscrição com direito a devolução total do valor pago terá que ser feito até 48 horas
				antes do Cursilho. O cancelamento após 48h antes do Cursilho só terá direito a 50% da taxa de inscrição, pois a
				inclusão do nome como participante, gera despesas que não poderão ser ressarcidas.
			</p>
		</div>
	) : (
		<div className="flex flex-col space-y-4">
			<h2 className="text-center text-lg">INFORMAÇÕES IMPORTANTES</h2>
			<p className="text-justify font-medium">
				OBS: Sua inscrição não garantirá sua participação na equipe de serviço, será necessário que a equipe de mesa
				confirme sua participação, a prioridade é para os que não trabalharam no Cursilho passado!
			</p>
			<p className="text-justify">
				Após realizar o pagamento da sua inscrição, entre em contato com a Luciana (81) 98413-0663 e envie o comprovante
				de pagamento.
			</p>
			<p className="text-justify">
				Para cancelar sua inscrição com direito a devolução do total, o cancelamento terá que ser feita até 48 horas
				antes do Cursilho. Fora desse prazo, só terá direito a 50% do valor da inscrição, pois a inclusão do nome como
				participante gera despesas que não poderão ser ressarcidas.
			</p>
		</div>
	)
}
