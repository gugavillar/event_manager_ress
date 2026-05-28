import type { Metadata, Viewport } from 'next'

import { Providers } from '@/providers/Providers'
import { roboto } from '@/theme'

import './globals.css'

export const metadata: Metadata = {
	description: 'Gerenciador de eventos da igreja ress pombos',
	title: 'Gerenciador de eventos - Ress Pombos',
}

export const viewport: Viewport = {
	initialScale: 1,
	maximumScale: 1,
	userScalable: false,
	width: 'device-width',
}

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode
}>) {
	return (
		<html lang="pt-BR">
			<body
				className={`flex h-dvh min-h-dvh w-dvw min-w-dvw flex-col overflow-x-clip md:overflow-y-auto ${roboto.className}`}
			>
				<Providers>{children}</Providers>
			</body>
		</html>
	)
}
