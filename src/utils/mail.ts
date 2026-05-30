import nodemailer from 'nodemailer'

import { MEMBERS } from '@/constants'

type SendMailArgs = {
	name: string
	email: string
	event: string
	type: MEMBERS
}

export const sendMail = async ({ name, email, event, type }: SendMailArgs) => {
	const transporter = nodemailer.createTransport({
		auth: {
			pass: process.env.SEND_MAIL_PASSWORD,
			user: 'eventos.anglicana@gmail.com',
		},
		service: 'gmail',
	})
	try {
		await transporter.sendMail({
			from: `"Anglicana eventos" <eventos.anglicana@gmail.com>`,
			subject: `Sua inscrição foi confirmada - ${event}`,
			text: `
			Olá, ${name}!
			Esperamos que esta mensagem o(a) encontre bem.

			Estamos entrando em contato a respeito do evento ${event}.

			${type === MEMBERS.PARTICIPANT ? 'Sua inscrição foi confirmada.' : 'Obrigado por servir conosco neste evento.'}

			Caso precise de mais informações ou tenha alguma dúvida, nossa equipe está à disposição para ajudar.
			Agradecemos por fazer parte deste momento tão especial. Que este evento seja uma oportunidade de comunhão, crescimento e experiências marcantes na presença de Deus.

			Que Deus o(a) abençoe!
      `,
			to: email,
		})
	} catch {
		throw new Error('Ocorreu um erro ao enviar o email')
	}
}
