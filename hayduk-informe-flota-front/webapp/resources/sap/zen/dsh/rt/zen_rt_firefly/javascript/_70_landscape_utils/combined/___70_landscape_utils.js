$Firefly
		.createClass(
				"sap.zen.DesignStudio",
				sap.firefly.XObject,
				{
					xWindow : null,
					language : null,
					sdkLoaderPath : null,
					applicationName : null,
					biappPath : null,
					repositoryUrl : null,
					urlParameter : null,
					designMode : false,
					dshControlId : null,
					pageId : null,
					landscapeUtils : null,
					host : null,
					port : 0,
					protocol : null,
					hanaMode : false,
					client : null,
					templateLoader : null,
					bookmarkRequestHandler : null,
					localeString : null,
					sdkLoader : null,
					bookmarkService : null,
					user : null,
					password : null,
					userAgent : null,
					optimizeDSRequests : false,
					staticMimesRootPath : null,
					xLogging : null,
					systemAlias : null,
					localization : null,
					newBW : false,
					rightToLeft : false,
					setLogging : function(xLogging) {
						this.xLogging = xLogging;
					},
					setLocalization : function(localization) {
						this.localization = localization;
					},
					setSdkLoader : function(sdkLoader) {
						this.sdkLoader = sdkLoader;
					},
					setXWindow : function(xWindow) {
						this.xWindow = xWindow;
					},
					setLanguage : function(language) {
						this.language = language;
					},
					setSdkLoaderPath : function(sdkLoaderPath) {
						this.sdkLoaderPath = sdkLoaderPath;
					},
					setApplicationName : function(applicationName) {
						this.applicationName = applicationName;
					},
					setApplicationPath : function(biappPath) {
						this.biappPath = biappPath;
					},
					setRepositoryUrl : function(url) {
						this.repositoryUrl = url;
					},
					setUrlParameter : function(urlParameter) {
						this.urlParameter = urlParameter;
					},
					setDesignMode : function(designMode) {
						this.designMode = designMode;
					},
					setDshControlId : function(dshControlId) {
						this.dshControlId = dshControlId;
					},
					setPageId : function(pageId) {
						this.pageId = pageId;
					},
					setLandscapeUtils : function(landscapeUtils) {
						this.landscapeUtils = landscapeUtils;
					},
					setHost : function(host) {
						this.host = host;
					},
					setPort : function(port) {
						this.port = port;
					},
					setProtocol : function(protocol) {
						this.protocol = protocol;
					},
					setHanaMode : function(hanaMode) {
						this.hanaMode = hanaMode;
					},
					setClient : function(client) {
						this.client = client;
					},
					setTemplateLoader : function(templateLoader) {
						this.templateLoader = templateLoader;
					},
					setBookmarkRequestHandler : function(bookmarkRequestHandler) {
						this.bookmarkRequestHandler = bookmarkRequestHandler;
					},
					setUser : function(name) {
						this.user = name;
					},
					setPassword : function(password) {
						this.password = password;
					},
					setUserAgent : function(userAgent) {
						this.userAgent = userAgent;
					},
					setOptimizeDSRequests : function(optimizeDSRequests) {
						this.optimizeDSRequests = optimizeDSRequests;
					},
					setStaticMimesRootPath : function(path) {
						this.staticMimesRootPath = path;
					},
					setSystemAlias : function(alias) {
						this.systemAlias = alias;
					},
					setNewBW : function(newBW) {
						this.newBW = newBW;
					},
					setRightToLeft : function(rightToLeft) {
						this.rightToLeft = rightToLeft;
					},
					createPage : function() {
						var mySelf;
						var systemType;
						var s;
						var ix;
						var ix2;
						var zts;
						var page;
						if (this.sdkLoader === null) {
							this.sdkLoader = new sap.zen.SDKLoader();
						}
						if (this.xLogging === null) {
							this.xLogging = sap.buddha.XLogging.create();
						}
						if (this.localization === null) {
							this.localization = sap.buddha.XLocalization
									.create();
						}
						this.sdkLoader.setRelativePath(this.sdkLoaderPath);
						this.sdkLoader.setRuntimePath(this.staticMimesRootPath);
						if (this.landscapeUtils === null) {
							this.landscapeUtils = new sap.zen.LandscapeUtils();
						}
						if ((this.language === null)
								|| (sap.firefly.XString.size(this.language) === 0)) {
							this.language = "EN";
						}
						this.landscapeUtils.doInit(this.language);
						if (this.xWindow === null) {
							this.xWindow = sap.buddha.XWindow.create();
						}
						if ((this.host === null)
								|| (sap.firefly.XString.size(this.host) === 0)) {
							this.host = "localhost";
						}
						if (!sap.firefly.XString.endsWith(this.biappPath, "/")) {
							this.biappPath = sap.firefly.XString.concatenate2(
									this.biappPath, "/");
						}
						this.xWindow.setLocale(this.localeString);
						mySelf = this.landscapeUtils.getSelf();
						if (mySelf === null) {
							if (this.newBW
									|| sap.firefly.XStringUtils
											.isNotNullAndNotEmpty(this.client)) {
								mySelf = this.landscapeUtils.addSelfBW(
										this.host, this.port, this.protocol,
										this.client, this.systemAlias,
										this.newBW);
							} else {
								mySelf = this.landscapeUtils.addSelf(this.host,
										this.port, this.protocol);
							}
							if ((this.user !== null)
									&& (sap.firefly.XString.size(this.user) > 0)) {
								(mySelf).setUser(this.user);
							}
							if ((this.password !== null)
									&& (sap.firefly.XString.size(this.password) > 0)) {
								(mySelf).setPassword(this.password);
							}
							if (this.templateLoader === null
									&& this.bookmarkRequestHandler === null) {
								this.templateLoader = new sap.zen.TemplateLoader();
								this.bookmarkRequestHandler = new sap.zen.BookmarkRequestHandler();
								systemType = mySelf.getSystemType();
								if (systemType
										.isTypeOf(sap.firefly.SystemType.ABAP)) {
									this.adaptFFForWebDispatcher(mySelf);
									this.templateLoader.initBaseBW(mySelf,
											this.applicationName,
											this.repositoryUrl);
									this.bookmarkRequestHandler
											.initBaseBW(mySelf);
								} else {
									s = this.biappPath;
									if (sap.firefly.XString.startsWith(s,
											"http://")) {
										s = sap.firefly.XString.substring(s, 7,
												-1);
										ix = sap.firefly.XString
												.indexOf(s, "/");
										s = sap.firefly.XString.substring(s,
												ix, -1);
									} else {
										if (sap.firefly.XString.startsWith(s,
												"https://")) {
											s = sap.firefly.XString.substring(
													s, 8, -1);
											ix2 = sap.firefly.XString.indexOf(
													s, "/");
											s = sap.firefly.XString.substring(
													s, ix2, -1);
										}
									}
									s = sap.firefly.XString.concatenate2(s,
											"content.biapp");
									this.templateLoader.initBase(mySelf, s);
									this.bookmarkRequestHandler.initBase(
											mySelf, s);
								}
							}
						}
						if (this.bookmarkService === null) {
							this.bookmarkService = new sap.zen.BookmarkService();
							this.bookmarkService.setup();
						}
						if (this.dshControlId === null) {
							this.dshControlId = "";
						}
						zts = new sap.zen.ZenTemplateService();
						page = zts.createPage(this.landscapeUtils
								.getApplication(), this.xWindow,
								this.applicationName, this.biappPath,
								this.hanaMode, this.urlParameter,
								this.designMode, this.dshControlId,
								this.sdkLoader, this.pageId,
								this.templateLoader, this.userAgent,
								this.bookmarkService,
								this.bookmarkRequestHandler,
								this.optimizeDSRequests, this.xLogging,
								this.localization, this.rightToLeft);
						page.setLocalPort(this.port);
						return page;
					},
					setLocaleString : function(localeString) {
						this.localeString = localeString;
					},
					setBookmarkService : function(bookmarkService) {
						this.bookmarkService = bookmarkService;
					},
					adaptFFForWebDispatcher : function(localHost) {
						var capabilitiesPath = null;
						var httpClient;
						var request;
						var extResult;
						var elem;
						var rootStructure;
						var sysInfo;
						var client;
						var inFix;
						if (localHost.getSystemType().isTypeOf(
								sap.firefly.SystemType.BW)) {
							capabilitiesPath = sap.firefly.ConnectionConstants
									.getServerInfoPath(sap.firefly.SystemType.BW);
						} else {
							httpClient = sap.firefly.HttpClientFactory
									.newInstanceByProtocol(localHost
											.getApplication().getSession(),
											localHost.getProtocolType());
							request = httpClient.getRequest();
							request.setConnectionInfo(localHost);
							request
									.setPath(sap.firefly.ConnectionConstants
											.getServerInfoPath(sap.firefly.SystemType.BW));
							request
									.setMethod(sap.firefly.HttpRequestMethod.HTTP_GET);
							request
									.setAcceptContentType(sap.firefly.HttpContentType.APPLICATION_JSON);
							extResult = httpClient.processHttpRequest(
									sap.firefly.SyncType.BLOCKING, null, null);
							if (!extResult.hasErrors()
									&& extResult.getData() !== null
									&& extResult.getData().getStatusCode() < 400) {
								capabilitiesPath = sap.firefly.ConnectionConstants
										.getServerInfoPath(sap.firefly.SystemType.BW);
								elem = extResult.getData().getJsonContent();
								if (elem !== null && elem.isStructure()) {
									rootStructure = elem.asStructure();
									sysInfo = rootStructure
											.getStructureByName("ServerInfo");
									if (sysInfo !== null) {
										client = sysInfo
												.getStringByName("Client");
										if (client !== null) {
											this.client = client;
											localHost.setClient(client);
										}
									}
								}
							} else {
								capabilitiesPath = sap.firefly.ConnectionConstants
										.getServerInfoPath(sap.firefly.SystemType.ABAP);
							}
						}
						if (sap.firefly.XStringUtils
								.isNotNullAndNotEmpty(this.systemAlias)) {
							inFix = sap.firefly.XString.concatenate2(";o=",
									this.systemAlias);
							capabilitiesPath = sap.firefly.XString
									.concatenate2(capabilitiesPath, inFix);
						}
						localHost.setCapabilitiesPath(capabilitiesPath);
					}
				});
$Firefly
		.createClass(
				"sap.zen.LandscapeUtils",
				sap.firefly.XObject,
				{
					$statics : {
						BW_WD_INA_SERVICE_BASEPATH : "/sap/bw/ina/GetResponse",
						registerComponentFactory : function(component,
								pageFactory) {
							sap.zen.ZenTemplateService.factory.registerFactory(
									component, pageFactory);
						}
					},
					initialized : false,
					doInit : function(language) {
						var regService;
						var coreModule;
						var platformModule;
						var runtimeModule;
						var olapModule;
						var olapExtModule;
						var olapImplModule;
						var providerModule;
						var bhuddaModule;
						if (this.initialized) {
							return;
						}
						this.initialized = true;
						regService = sap.firefly.RegistrationService
								.getInstance();
						coreModule = sap.firefly.CoreModule.getInstance();
						platformModule = sap.firefly.PlatformModule
								.getInstance();
						runtimeModule = sap.firefly.RuntimeModule.getInstance();
						olapModule = sap.firefly.OlapApiModule.getInstance();
						olapExtModule = sap.firefly.OlapExtModule.getInstance();
						olapImplModule = sap.firefly.OlapImplModule
								.getInstance();
						providerModule = sap.firefly.ProviderModule
								.getInstance();
						bhuddaModule = sap.zen.BuddhaModule.getInstance();
						this.application = sap.firefly.ApplicationFactory
								.createDefaultApplicationWithVersion(sap.firefly.XVersion.V77_RETURNED_DATA_SELECTION);
						this.landscape = sap.firefly.StandaloneSystemLandscape
								.create(this.getApplication());
						this.language = language;
						this.getApplication().setLandscape(this.landscape);
						this.hanaMode = false;
					},
					addSelf : function(host, port, protocol) {
						var system = this.landscape.createSystem();
						system.setLanguage(this.language);
						system.setSystemType(sap.firefly.SystemType.HANA);
						system.setName("self");
						system.setText("self");
						system.setHost(host);
						system.setPort(port);
						system
								.setAuthentication(sap.firefly.AuthenticationType.BASIC);
						if (sap.firefly.XString.isEqual("https", protocol)) {
							system
									.setProtocolType(sap.firefly.ProtocolType.HTTPS);
						} else {
							system
									.setProtocolType(sap.firefly.ProtocolType.HTTP);
						}
						this.landscape.setSystemByDescription(system);
						return system;
					},
					addSelfBW : function(host, port, protocol, client,
							systemAlias, newBW) {
						var system = this.landscape.createSystem();
						var inFix;
						system.setLanguage(this.language);
						if (newBW) {
							system.setSystemType(sap.firefly.SystemType.BW);
						} else {
							system.setSystemType(sap.firefly.SystemType.ABAP);
						}
						system.setName("self");
						system.setText("self");
						system.setHost(host);
						system.setPort(port);
						if (sap.firefly.XStringUtils
								.isNotNullAndNotEmpty(client)) {
							system.setClient(client);
						}
						system.setTimeout(60000);
						system
								.setAuthentication(sap.firefly.AuthenticationType.BASIC);
						if (sap.firefly.XString.isEqual("https", protocol)) {
							system
									.setProtocolType(sap.firefly.ProtocolType.HTTPS);
						} else {
							system
									.setProtocolType(sap.firefly.ProtocolType.HTTP);
						}
						system.setProperty("systemAlias", systemAlias);
						if (sap.firefly.XStringUtils
								.isNotNullAndNotEmpty(systemAlias)) {
							inFix = sap.firefly.XString.concatenate2(";o=",
									systemAlias);
							system
									.setServicePath(sap.firefly.XString
											.concatenate2(
													sap.zen.LandscapeUtils.BW_WD_INA_SERVICE_BASEPATH,
													inFix));
						}
						this.landscape.setSystemByDescription(system);
						return system;
					},
					application : null,
					landscape : null,
					hanaMode : false,
					language : null,
					setHanaMode : function(hanaMode) {
						this.hanaMode = hanaMode;
					},
					getApplication : function() {
						return this.application;
					},
					getSelf : function() {
						return this.landscape.getSystemDescription("self");
					},
					getSystem : function(name) {
						return this.landscape.getSystemDescription(name);
					}
				});