/**
 * @name RST-Bypass
 * @author MrRangerYT
 * @authorId 737323631117598811
 * @version 5.0
 * @description RST-Bypass
 * @website https://vk.com/mrrangeryt
 * @updateUrl https://raw.githubusercontent.com/DEVRANGERSTUDIO/RST-Bypass/main/RST-Bypass.plugin.js
 */
module.exports = (() => {
	const config = {
		info: {
			name: "RST-Bypass",
			authors: [
				{
					name: "MrRangerYT",
					discord_id: "265508941818101769",
					github_username: "DEVRANGERSTUDIO",
				},
			],
			version: "5.0",
			description:
				"Bypass nitro, обновлений скорее всего не будет, а там хз",
			github: "https://github.com/DEVRANGERSTUDIO/RST-Bypass",
			github_raw:
				"https://raw.githubusercontent.com/DEVRANGERSTUDIO/RST-Bypass/main/RST-Bypass.plugin.js",
		},
		main: "RST-Bypass.plugin.js",
	};

	return !global.ZeresPluginLibrary
		? class {
				constructor() {
					this._config = config;
				}
				getName() {
					return config.info.name;
				}
				getAuthor() {
					return config.info.authors.map((a) => a.name).join(", ");
				}
				getDescription() {
					return config.info.description;
				}
				getVersion() {
					return config.info.version;
				}
				load() {
					BdApi.showConfirmationModal(
						"Библиотека отсутствует",
						`Отсутствует подключаемый модуль библиотеки, необходимый для ${config.info.name} Нажмите «Загрузить сейчас», чтобы установить его`,
						{
							confirmText: "Скачать сейчас",
							cancelText: "Отмена",
							onConfirm: () => {
								require("request").get(
									"https://rauenzi.github.io/BDPluginLibrary/release/0PluginLibrary.plugin.js",
									async (error, response, body) => {
										if (error)
											return require("electron").shell.openExternal(
												"https://betterdiscord.net/ghdl?url=https://raw.githubusercontent.com/rauenzi/BDPluginLibrary/master/release/0PluginLibrary.plugin.js"
											);
										await new Promise((r) =>
											require("fs").writeFile(
												require("path").join(
													BdApi.Plugins.folder,
													"0PluginLibrary.plugin.js"
												),
												body,
												r
											)
										);
									}
								);
							},
						}
					);
				}
				start() {}
				stop() {}
		  }
		: (([Plugin, Api]) => {
				const plugin = (Plugin, Api) => {
					const { Patcher, DiscordModules, Settings, PluginUtilities } = Api;
					return class NitroEmoteAndScreenShareBypass extends Plugin {
						settings = PluginUtilities.loadSettings(this.getName(), {
							size: 48,
						});
						getSettingsPanel() {
							return Settings.SettingPanel.build(
								(_) =>
									PluginUtilities.saveSettings(this.getName(), this.settings),
								...[
									new Settings.Slider(
										"Размер эмодзи",
										"Выберите размер смайликов.",
										16,
										128,
										this.settings.size,
										(size) => (this.settings.size = size),
										{
											markers: [16, 20, 32, 48, 64, 128],
											stickToMarkers: true,
										}
									),
								]
							);
						}

						onStart() {
							// подделка премиум на стороне клиента
							let tries = 1;
							let intervalId = setInterval(() => {
								if (++tries > 5) clearInterval(intervalId);

								const user =
									ZeresPluginLibrary.DiscordModules.UserStore.getCurrentUser();
								if (!user) return;
								user.premiumType = 2;
								clearInterval(intervalId);
							}, 1000);

							Patcher.before(
								DiscordModules.MessageActions,
								"sendMessage",
								(_, [, message]) => {
									const emojis = message.validNonShortcutEmojis;

									emojis.forEach((emoji) => {
										// пропустить дискорд смайлики
										if (!emoji.require_colons) return;

										// создайте строку смайликов, которую мы заменим
										const emojiString = `<${emoji.animated ? "a" : ""}:${
											emoji.name
										}:${emoji.id}>`;

										let url = emoji.url;

										// изменить размер смайлов в URL
										const size = this.settings.size;
										if (size != 48) {
											url = url.replace(/\?size=[0-9]+/, `?size=${size}`);
										}

										// замените сообщение, содержащее смайлик, на URL-адрес
										message.content = message.content.replace(emojiString, url);
									});
								}
							);
						}

						onStop() {
							Patcher.unpatchAll();
						}
					};
				};
				return plugin(Plugin, Api);
		  })(global.ZeresPluginLibrary.buildPlugin(config));
})();
/*@конец@*/
