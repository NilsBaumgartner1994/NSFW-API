// this should be the entry point to your library
import AuthConfigList from "./auth/AuthConfigList";

module.exports = {
    ServerAPI: require('./ServerAPI').default, // eslint-disable-line global-require
    CustomControllers: require('./controllers/CustomControllers').default, // eslint-disable-line global-require
    AuthConnector: require('./auth/AuthConnector').default, // eslint-disable-line global-require
    AuthConfigList: require('./auth/AuthConfigList').default, // eslint-disable-line global-require
    DatabaseBackupModule: require('./plugins/backupPlugin/DatabaseBackupModule').default, // eslint-disable-line global-require

    MyExpressRouter: require('./module/MyExpressRouter').default, // eslint-disable-line global-require
    ScheduleModule: require('./module/ScheduleModule').default, // eslint-disable-line global-require
    MyAccessControl: require('./module/MyAccessControl').default, // eslint-disable-line global-require

    DefaultProxyServer: require('./helper/DefaultProxyServer').default, // eslint-disable-line global-require

    DefaultControllerHelper: require('./helper/DefaultControllerHelper').default, // eslint-disable-line global-require
    StringHelper: require('./helper/StringHelper').default, // eslint-disable-line global-require
    NumberHelper: require('./helper/NumberHelper').default, // eslint-disable-line global-require
    FileSystemHelper: require('./helper/FileSystemHelper').default, // eslint-disable-line global-require
};