import { PanelRightClose, PanelRightOpen, Tickets } from 'lucide-react'
import { type Dispatch, memo, type SetStateAction } from 'react'
import { twMerge } from 'tailwind-merge'

import { Button, Text } from '@/components/Atoms'

type ApplicationAvatarProps = {
	collapsed: boolean
	handleCollapse: Dispatch<SetStateAction<boolean>>
}

export const ApplicationAvatar = memo(({ collapsed, handleCollapse }: ApplicationAvatarProps) => {
	return (
		<section
			className={twMerge('relative flex items-center gap-x-4', collapsed && 'justify-center')}
			data-testid="application-avatar"
		>
			{!collapsed && (
				<>
					<Tickets className="text-slate-100" data-testid="ticket-icon" size={48} />
					<div>
						<Text className="font-bold text-gray-100 text-xl">Hub de Eventos</Text>
						<Text className="text-gray-100/40 text-lg">Ress Pombos</Text>
					</div>
				</>
			)}
			<Button
				className={twMerge(
					'absolute -top-3 hidden items-center justify-center gap-x-0 rounded-lg border-none bg-slate-900/80 p-0 font-medium text-gray-100 text-lg transition-all duration-500 md:inline-flex',
					collapsed ? 'left-12' : 'left-64'
				)}
				onClick={() => handleCollapse(!collapsed)}
				type="button"
			>
				{collapsed ? <PanelRightClose size={28} /> : <PanelRightOpen size={28} />}
			</Button>
		</section>
	)
})

ApplicationAvatar.displayName = 'ApplicationAvatar'
