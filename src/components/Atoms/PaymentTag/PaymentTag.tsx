import { type ComponentProps, memo } from 'react'
import { twMerge } from 'tailwind-merge'

import { PaymentType, PaymentTypeAPI } from '@/constants'

type PaymentTagProps = ComponentProps<'mark'> & {
	status: (typeof PaymentTypeAPI)[keyof typeof PaymentTypeAPI]
}

const STATUS_COLORS = {
	[PaymentTypeAPI.CARD]: 'bg-blue-300/30',
	[PaymentTypeAPI.CASH]: 'bg-yellow-400/30',
	[PaymentTypeAPI.PIX]: 'bg-green-500/30',
	[PaymentTypeAPI.DONATION]: 'bg-purple-400/30',
	[PaymentTypeAPI.OPEN]: 'bg-gray-400/30',
}

export const PaymentTag = memo(({ status, className, ...props }: PaymentTagProps) => {
	return (
		<mark
			className={twMerge(
				'flex w-fit items-center justify-center gap-x-1.5 rounded-3xl px-4 py-1 text-slate-800',
				className,
				STATUS_COLORS[status]
			)}
			{...props}
		>
			{PaymentType[status].label}
		</mark>
	)
})

PaymentTag.displayName = 'PaymentTag'
