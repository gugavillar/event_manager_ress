import { format } from 'date-fns'
import { notFound } from 'next/navigation'
import { z } from 'zod'

import { Image } from '@/components/Atoms'
import { ClosedInscriptions, ExternalVolunteerForm } from '@/components/Templates'
import { eventPermitCreateRegistration, MEMBERS } from '@/constants'
import { getEventById } from '@/server'
import type { EventsAPI } from '@/services/queries/events/event.type'

type Params = {
	params: Promise<{
		event_id?: EventsAPI['id']
	}>
}

export default async function RegistrationPage({ params }: Params) {
	const pageParams = await params.then((res) => ({
		event_id: res.event_id,
	}))
	const isValidEventId = z
		.object({
			event_id: z.uuid(),
		})
		.safeParse({ event_id: pageParams.event_id })

	if (!isValidEventId.success || !pageParams.event_id) {
		notFound()
	}

	const event = await getEventById(pageParams.event_id)

	if (!event) {
		notFound()
	}

	const isRegistrationPermitted = eventPermitCreateRegistration(event, MEMBERS.VOLUNTEER)

	if (!isRegistrationPermitted) {
		return <ClosedInscriptions />
	}

	const backgroundImage = event?.imageUrl ? event.imageUrl : '/placeholder.png'
	const startDate = format(event?.initialDate, 'dd/MM')
	const endDate = format(event?.finalDate, 'dd/MM')
	const year = format(event?.finalDate, 'yyyy')

	return (
		<div className="grid h-dvh w-full lg:grid-cols-2">
			<Image backgroundImage={backgroundImage} />
			<div className="size-full h-[70dvh] overflow-y-auto lg:h-full">
				<div className="flex min-h-full flex-col items-center justify-center space-y-8 p-8">
					<header className="space-y-2 text-center">
						<h1 className="text-4xl">{event?.name}</h1>
						<p className="text-2xl">Inscrição para voluntário</p>
						<p className="text-lg">
							🗓️ {startDate} a {endDate} de {year}
						</p>
					</header>
					<ExternalVolunteerForm
						eventId={event?.id}
						eventName={event?.name}
						inscriptionType={MEMBERS.VOLUNTEER}
						registrationValue={Number(event?.volunteerPrice)}
					/>
				</div>
			</div>
		</div>
	)
}
