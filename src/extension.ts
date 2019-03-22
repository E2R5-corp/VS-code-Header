import { basename } from 'path'
import vscode = require('vscode')
import moment = require('moment')

import {
	ExtensionContext, TextEdit, TextEditorEdit, TextDocument, Position, Range
} from 'vscode'

import {
	extractHeader, getHeaderInfo, renderHeader,
	supportsLanguage, HeaderInfo
} from './header'

const getCurrentUser = () =>
	vscode.workspace.getConfiguration().get('e2r5header.username') || 'Pedro'

const getCurrentUserMail = () =>
	vscode.workspace.getConfiguration()
	.get('e2r5header.email') || 'contact-e2r5@gmail.com'

const newHeaderInfo = (document: TextDocument, headerInfo?: HeaderInfo) => {
	const user = getCurrentUser()
	const mail = getCurrentUserMail()

	return Object.assign({},
		{
			createdAt: moment(),
			createdBy: user
		},
		headerInfo,
		{
			filename: basename(document.fileName),
			author: `${user} <${mail}>`,
			updateBy: user,
			updateAt: moment()
		}
	)
}

const insertHeaderHandler = () => {
	const { activeTextEditor } = vscode.window
	const { document } = activeTextEditor

	if (supportsLanguage(document.languageId))
		activeTextEditor.edit(editor => {
			const currentHeader = extractHeader(document.getText())

			if (currentHeader)
				editor.replace(
					new Range(0, 0, 19, 0),
					renderHeader(
						document.languageId,
						newHeaderInfo(document, getHeaderInfo(currentHeader))
					)
				)
			else
				editor.insert(
					new Position(0, 0),
					renderHeader(
						document.languageId,
						newHeaderInfo(document)
					)
				)
		})
	else
		vscode.window.showInformationMessage(
			`No header support for language ${document.languageId}`
		)
}

const startUpdateOnSave = (subscriptions: vscode.Disposable[]) =>
	vscode.workspace.onWillSaveTextDocument(event => {
		const document = event.document
		const currentHeader = extractHeader(document.getText())

		event.waitUntil(
			Promise.resolve(
				supportsLanguage(document.languageId) && currentHeader ?
					[
						TextEdit.replace(
							new Range(0, 0, 19, 0),
							renderHeader(
								document.languageId,
								newHeaderInfo(document, getHeaderInfo(currentHeader))
							)
						)
					]
					: []
			)
		)
	},
		null, subscriptions
	)

	export const active = (context: vscode.ExtensionContext) => {
		const disposable = vscode.commands
			.registerTextEditorCommand('e2r5header.insertHeader', insertHeaderHandler)
		
			context.subscriptions.push(disposable)
			startUpdateOnSave(context.subscriptions)
	}