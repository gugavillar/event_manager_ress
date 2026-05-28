'use client'
import { zodResolver } from '@hookform/resolvers/zod'
import { CalendarPlus } from 'lucide-react'
import { type Dispatch, memo, type SetStateAction } from 'react'
import { FormProvider, useForm } from 'react-hook-form'

import { Button } from '@/components/Atoms'
import type { SelectedEvent } from '@/components/Templates'
import { EVENTS_MODAL_TYPE } from '@/constants'

import { EventDrawer } from '../EventDrawer'
import { EventSchema, type EventSchemaType } from '../EventDrawer/EventDrawer.schema'

type CreateEventButtonProps = {
	selectedEvent: null | SelectedEvent
	setSelectedEvent: Dispatch<SetStateAction<SelectedEvent | null>>
}

export const CreateEventButton = memo(({ selectedEvent, setSelectedEvent }: CreateEventButtonProps) => {
	const methods = useForm<EventSchemaType>({
		defaultValues: {
			file: undefined,
			finalDate: '',
			gender: '',
			initialDate: '',
			maxAge: '',
			minAge: '',
			name: '',
			participantPrice: '',
			volunteerPrice: '',
			volunteerPriceWithShirt: '',
		},
		mode: 'onChange',
		resolver: zodResolver(EventSchema),
	})

	const handleCreateEvent = () => {
		setSelectedEvent({ id: '', modal: EVENTS_MODAL_TYPE.CREATE_OR_EDIT })
	}

	return (
		<>
			<Button
				className="items-center justify-center border-transparent bg-teal-500 text-base text-gray-50 transition-colors duration-500 hover:bg-teal-400 hover:text-slate-800 md:min-w-60"
				leftIcon={<CalendarPlus />}
				onClick={handleCreateEvent}
				type="button"
			>
				<span className="max-md:hidden">Criar evento</span>
			</Button>
			<FormProvider {...methods}>
				<EventDrawer selectedEvent={selectedEvent} setSelectedEvent={setSelectedEvent} />
			</FormProvider>
		</>
	)
})

CreateEventButton.displayName = 'CreateEventButton'
