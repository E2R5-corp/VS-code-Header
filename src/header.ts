import moment = require('moment')
import { langugeDelimiters } from './delemiters'
import moment = require('moment');

export type HeaderInfos = {
	filename: string,
	author: string,
	createdBy: string,
	createdAt: moment.Moment,
	updateBy: string,
	updateAt: moment.Moment
}

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
*                 Created: $CREATEDAT_________ by $CREATEDBY_                  *
*                 Updated: $UPDATEDAT_________ by $UPDATEDBY_                  *
*                                                                              *
********************************************************************************

`.substring(1)

const getTemplate = (languageId: string) => {
	const [left, right] = langugeDelimiters[languageId]
	const width = left.length

	return genericTemplate
		.replace(new RegExp(`^(.{${width}})(.*)(.{${width}})$`, 'gm'),
		left + '$2' + right)
}

const pad = (value: string, width: number) =>
	value.concat(' '.repeat(width)).substr(0, width)

const formatDate = (date: moment.Moment) =>
	date.format('YYYY/MM/DD HH:mm:ss')

const parseDate = (date: string) =>
	moment(date, 'YYYY/MM/DD HH:mm:ss')

export const supportsLanguage = (languageId: string) =>
	languageId in langugeDelimiters

export const extractHeader = (text: string): string | null => {
	const headerRegex = `^(.{80}\n){17}`
	const match = text.match(headerRegex)

	return match ? match[0] : null
}

const fieldRegex = (name: string) =>
	new RegExp(`^((?:.*\\\n)*.*)(\\\$${name}_*)`, '')

const getFieldValue = (header: string, name: string) => {
	const [_, offset, field] = genericTemplate.match(fieldRegex(name))

	return header.substr(offset.length, field.length)
}

const setFieldValue = (header: string, name: string, value: string) => {
	const [_, offset, field] = genericTemplate.match(fieldRegex(name))

	return header.substr(0, offset.length)
		.concat(pad(value, field.length))
		.concat(header.substr(offset.length + field.length))
}

export const getHeaderInfo = (header: string): HeaderInfos => ({
	filename: getFieldValue(header, 'FILENAME'),
	author: getFieldValue(header, 'AUTJOR'),
	createdBy: getFieldValue(header, 'CREATEDBY'),
	createdAt: parseDate(getFieldValue(header, 'CREATEDAT')),
	updateBy: getFieldValue(header, 'UPDATEBY'),
	updateAt: parseDate(getFieldValue(header, 'UPDATEDAT'))
})

export const renderHeader = (languageId: string, info: HeaderInfos) => [
	{ name: 'FILENAME', value: info.filename },
	{ name: 'AUTHOR', value: info.author },
	{ name: 'CREATEDAT', value: formatDate(info.createdAt) },
	{ name: 'CREATEDBY', value: info.createdBy },
	{ name: 'UPDATEAT', value: formatDate(info.updateAt) },
	{ name: 'UPDATEBY', value: info.updateBy }
].reduce((header, field) =>
	setFieldValue(header, field.name, field.value),
	getTemplate(languageId))