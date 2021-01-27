// this should be the entry point to your library
module.exports = {
    ServerAPI: require('./ServerAPI').default, // eslint-disable-line global-require
    CustomControllers: require('./controllers/CustomControllers').default, // eslint-disable-line global-require
};