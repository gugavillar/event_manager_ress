import { PhoneCall } from 'lucide-react'
import Link from 'next/link'
import type { ComponentProps } from 'react'
import { twMerge } from 'tailwind-merge'

import { Text, WhatsAppIcon } from '@/components/Atoms'

type InfoBoxProps = ComponentProps<'div'> & {
	label: string
	value?: string | null
	isPhone?: boolean
}

export const InfoBox = ({ label, value, className, isPhone, ...props }: InfoBoxProps) => {
	if (!value) return null

	const phoneNumber = isPhone ? value.replace(/\D/g, '') : value

	return (
		<div className={twMerge('space-y-0.5 px-6', className)} {...props}>
			<Text className="opacity-50">{label}</Text>
			{isPhone ? (
				<div className="flex items-center gap-2 max-sm:flex">
					<Text>{value}</Text>
					<Link href={`tel:0${phoneNumber}`}>
						<PhoneCall size={16} />
					</Link>
					<Link href={`https://wa.me/+55${phoneNumber}`} target="_blank">
						<WhatsAppIcon className="size-4 text-gray-800" />
					</Link>
				</div>
			) : (
				<Text>{value}</Text>
			)}
		</div>
	)
}
