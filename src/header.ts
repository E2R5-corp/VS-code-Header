/* ************************************************************************** */
/*                                                                            */
/*                   ::::::::::  ::::::::  :::::::::  ::::::::::              */
/*                  :+:        :+:    :+: :+:    :+: :+:    :+:               */
/*                 +:+              +:+  +:+    +:+ +:+                       */
/*                +#++:++#       +#+    +#++:++#:  +#++:++#+                  */
/*               +#+          +#+      +#+    +#+        +#+                  */
/*              #+#         #+#       #+#    #+# #+#    #+#                   */
/*             ########## ########## ###    ###  ########                     */
/*                                                                            */
/*                header.ts                                                   */
/*                                                                            */
/*                By: Glouyot <guillaume.louyot@free.fr>                      */
/*                                                                            */
/* ************************************************************************** */

import { languageDemiliters } from './delimiters'

export type HeaderInfo = {
	filename: string,
	author: string
}

/**
 * Template where each field name is prefixed by $ and is padded with _
 */
const genericTemplate = `
********************************************************************************
*                                                                              *
*                    ::::::::::  ::::::::  :::::::::  ::::::::::               *
*                   :+:        :+:    :+: :+:    :+: :+:    :+:                *
*                  +:+              +:+  +:+    +:+ +:+                        *
*                 +#++:++#       +#+    +#++:++#:  +#++:++#+                   *
*                +#+          +#+      +#+    +#+        +#+                   *
*               #+#         #+#       #+#    #+# #+#    #+#                    *
*              ########## ########## ###    ###  ########                      *
*                                                                              *
*                 $FILENAME__________________________________                  *
*                                                                              *
*                 By: $AUTHOR________________________________                  *
*                                                                              *
********************************************************************************

`.substring(1)

/**
 * Get specific header template for languageId
 */
const getTemplate = (languageId: string) => {
	const [left, right] = languageDemiliters[languageId]
	const width = left.length

	// Replace all delimiters with ones for current language
	return genericTemplate
		.replace(new RegExp(`^(.{${width}})(.*)(.{${width}})$`, 'gm'),
			left + '$2' + right)
}

/**
 * Fit value to correct field width, padded with spaces
 */
const pad = (value: string, width: number) =>
	value.concat(' '.repeat(width)).substr(0, width)

/**
 * Check if language is supported
 */
export const supportsLanguage = (languageId: string) =>
	languageId in languageDemiliters

/**
 * Returns current header text if present at top of document
 */
export const extractHeader = (text: string): string | null => {
	const headerRegex = `^(.{0,80}\n){16}`
	const match = text.match(headerRegex)

	return match ? match[0] : null
}

/**
 * Regex to match field in template
 * Returns [ global match, offset, field ]
 */
const fieldRegex = (name: string) =>
	new RegExp(`^((?:.*\\\n)*.*)(\\\$${name}_*)`, '')

/**
 * Get value for given field name from header string
 */
const getFieldValue = (header: string, name: string) => {
	const [_, offset, field] = genericTemplate.match(fieldRegex(name))

	return header.substr(offset.length, field.length)
}

/**
 * Set field value in header string
 */
const setFieldValue = (header: string, name: string, value: string) => {
	const [_, offset, field] = genericTemplate.match(fieldRegex(name))

	return header.substr(0, offset.length)
		.concat(pad(value, field.length))
		.concat(header.substr(offset.length + field.length))
}

/**
 * Extract header info from header string
 */
export const getHeaderInfo = (header: string): HeaderInfo => ({
	filename: getFieldValue(header, 'FILENAME'),
	author: getFieldValue(header, 'AUTHOR')
})

/**
 * Renders a language template with header info
 */
export const renderHeader = (languageId: string, info: HeaderInfo) => [
	{ name: 'FILENAME', value: info.filename },
	{ name: 'AUTHOR', value: info.author }
].reduce((header, field) =>
	setFieldValue(header, field.name, field.value),
	getTemplate(languageId))
