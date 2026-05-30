export const formatterFieldSelectValues = (value?: Array<any>, keyLabel?: string, keyValue?: string) => {
	if (!value) return []

	return value?.map((value) => ({
		label: keyLabel ? value[keyLabel] : value,
		value: keyValue ? value[keyValue] : value,
	}))
}

export const formatterComboBoxValues = (
	value?: Array<any>,
	keyLabel?: string,
	keyValue?: string,
	hasAllOption?: boolean,
	allOptionsLabel?: string
) => {
	if (!value) return []

	const formattedValues = value?.map((value) => ({
		customProps: {
			label: keyLabel ? value[keyLabel] : value,
			value: keyValue ? value[keyValue] : value,
		},
	}))

	if (hasAllOption) {
		const label = allOptionsLabel ?? 'Todos'
		formattedValues.unshift({
			customProps: { label, value: '' },
		})
	}
	return formattedValues
}

export const convertToBoolean = (value: string | null) => {
	if (!value) return false
	return value === 'true'
}

export const parseUrlToFile = async (url: string, fileName: string, mimeType: string) => {
	try {
		const response = await fetch(url)
		const blob = await response.blob()

		const arquivo = new File([blob], fileName, { type: mimeType })

		const dataTransfer = new DataTransfer()
		dataTransfer.items.add(arquivo)

		return dataTransfer.files[0]
	} catch (error) {
		console.error('Erro ao converter ou adicionar o arquivo:', error)
	}
}
