import { fireEvent, render } from '@testing-library/react'

import { ApplicationAvatar } from './ApplicationAvatar'

describe('ApplicationAvatar component', () => {
	const handleCollapse = vi.fn()

	it('renders correctly', () => {
		const { getByTestId } = render(<ApplicationAvatar collapsed={false} handleCollapse={handleCollapse} />)

		const applicationAvatar = getByTestId('application-avatar')

		expect(applicationAvatar).toBeInTheDocument()
	})

	it('renders a paragraph with the text "Hub de Eventos"', () => {
		const { getByText } = render(<ApplicationAvatar collapsed={false} handleCollapse={handleCollapse} />)

		const paragraph = getByText('Hub de Eventos')

		expect(paragraph).toBeInTheDocument()
	})

	it('renders a paragraph with the text "Ress Pombos"', () => {
		const { getByText } = render(<ApplicationAvatar collapsed={false} handleCollapse={handleCollapse} />)

		const paragraph = getByText('Ress Pombos')

		expect(paragraph).toBeInTheDocument()
	})

	it('renders a icon with the size of 48', () => {
		const { getByTestId } = render(<ApplicationAvatar collapsed={false} handleCollapse={handleCollapse} />)

		const icon = getByTestId('ticket-icon')

		expect(icon).toHaveAttribute('width', '48')
		expect(icon).toHaveAttribute('height', '48')
	})

	it('calls handleCollapse function when clicked', () => {
		const { getByRole } = render(<ApplicationAvatar collapsed={false} handleCollapse={handleCollapse} />)
		const button = getByRole('button')
		fireEvent.click(button)

		expect(handleCollapse).toHaveBeenCalledTimes(1)
	})
})
