import { ExternalLink } from 'lucide-react'
import type { ComponentProps } from 'react'
import { twMerge } from 'tailwind-merge'

import { InformationCard, Spinner, Text } from '@/components/Atoms'
import { InfoBox } from '@/components/Molecules'
import { CivilStatus, type CivilStatusAPI } from '@/constants'

type PersonalInfoCardProps = ComponentProps<'div'> & {
	userInfo: {
		name: string
		email: string
		called: string
		birthdate: string
		phone: string
		cell?: string
		community?: string
		religion?: string
		health?: string
		pictureUrl?: string
		civilStatus?: CivilStatusAPI
		shirtSize?: string
		servedLastEvent?: string | null
	}
	type: 'volunteer' | 'participant'
	seePicture?: VoidFunction
	isLoadingUrl?: boolean
}

export const PersonalInfoCard = ({
	className,
	userInfo,
	type,
	seePicture,
	isLoadingUrl,
	...props
}: PersonalInfoCardProps) => {
	return (
		<InformationCard className={twMerge('space-y-3 pb-6', className)} headingText="Dados pessoais" {...props}>
			<InfoBox label="Nome" value={userInfo.name} />
			<InfoBox label="Email" value={userInfo.email} />
			<InfoBox label="Como quer ser chamado" value={userInfo.called} />
			<InfoBox label="Data de nascimento" value={userInfo.birthdate} />
			<InfoBox isPhone label="Telefone" value={userInfo.phone} />
			{type === 'participant' ? (
				<>
					<InfoBox label="Religião" value={userInfo?.religion ?? 'Não possui'} />
					<InfoBox label="Estado Civil" value={CivilStatus[userInfo?.civilStatus as CivilStatusAPI]?.label} />
				</>
			) : (
				<>
					<InfoBox label="Tamanho da camisa" value={userInfo?.shirtSize} />
					<InfoBox label="Serviu no último evento" value={userInfo?.servedLastEvent} />
					<InfoBox label="Célula" value={userInfo?.cell ?? 'Não frequenta'} />
					<InfoBox label="Comunidade" value={userInfo?.community} />
				</>
			)}
			<InfoBox label="Restrição Saúde/Alimentar" value={userInfo?.health ?? 'Não possui'} />
			{userInfo?.pictureUrl && (
				<div className="space-y-0.5 px-6">
					<Text className="opacity-50">Foto</Text>
					<button
						className="flex cursor-pointer items-center gap-x-2 text-sky-500 disabled:cursor-not-allowed disabled:opacity-50"
						disabled={isLoadingUrl}
						onClick={seePicture}
					>
						Visualizar {isLoadingUrl ? <Spinner className="size-4" /> : <ExternalLink size={16} />}
					</button>
				</div>
			)}
		</InformationCard>
	)
}
