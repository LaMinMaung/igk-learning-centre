migrate((app) => {
	let settings = app.settings()
	settings.meta.appName = "Coderick AI"
	settings.meta.appURL = "https://vc298887080532.coderick.net"
	settings.meta.senderAddress = "admin@vc298887080532.coderick.net"

	settings.smtp.enabled = true
	settings.smtp.host = "localhost"
	settings.smtp.port = 465
	settings.smtp.username = "admin@vc298887080532.coderick.net"
	settings.smtp.password = "c9dd4e4dab7f634ed070b5c53c7e3df1"
	settings.smtp.tls = true

	app.save(settings)
})
