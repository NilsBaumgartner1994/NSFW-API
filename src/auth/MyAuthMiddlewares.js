import HttpStatus from 'http-status-codes';

import MyTokenHelper from "./MyTokenHelper";

import MyAccessControl from "./../module/MyAccessControl";
import MyExpressRouter from "../module/MyExpressRouter";
import AuthConnector from "./AuthConnector";

/**
 * The My Express Router which is the core functionality. It setups all controllers and handles routes
 */
export default class MyAuthMiddlewares {

    constructor(logger, expressApp, routeAuth, authConfig) {
        console.log("export default class MyAuthMiddlewares ");

        this.logger = logger;
        this.expressApp = expressApp;
        this.routeAuth = routeAuth;
        this.authConfig = authConfig;

        this.routeAuthMethodList = this.routeAuth+"/"+"methods";
        this.routeAuthAccessToken = this.routeAuth+"/"+"accessToken";
        this.routeAuthRefreshAccessToken = this.routeAuth+"/"+"refresh";
        this.routeAuthAuthorize = this.routeAuth+"/"+"authorize";
        this.routeAuthLogout = this.routeAuth+"/"+"logout";
        this.routeAuthLogoutFromAllDevices = this.routeAuth+"/"+"logoutFromAllDevices";
        this.routeAuthCurrentUser = this.routeAuth+"/"+"currentUser";

        this.tokenHelper = new MyTokenHelper(logger); //create the token helper
        this.authConnector = new AuthConnector(authConfig);
        this.authConnector.configureAuthMethods();
        this.configureExpressApp();
    }

    configureExpressApp(){
        this.expressApp.use(this.middlewareCookieParse.bind(this));
        this.expressApp.use(this.middlewareAuthToken.bind(this)); //always check if there is a access token provided
        this.expressApp.get(this.routeAuth, this.handleGetRouteInfo.bind(this));
        this.expressApp.get(this.routeAuthMethodList, this.handleGetAuthMethods.bind(this));

        this.expressApp.post(this.routeAuthRefreshAccessToken, this.middlewareOnlyAuthenticatedViaRefreshToken.bind(this), this.handleRefreshAccessToken.bind(this));

        this.expressApp.post(this.routeAuthLogout, this.middlewareOnlyAuthenticatedViaRefreshToken.bind(this), this.handleLogout.bind(this));
        this.expressApp.post(this.routeAuthLogoutFromAllDevices, this.middlewareOnlyAuthenticatedViaPlaintextSecret.bind(this), this.handleLogoutFromAllDevices.bind(this));

        this.expressApp.post(this.routeAuthAuthorize, this.middlewareOnlyAuthenticatedViaPlaintextSecret.bind(this), this.handleAuthorize.bind(this));
        this.expressApp.get(this.routeAuthCurrentUser, this.handleGetCurrentUser.bind(this));
    }

     middlewareCookieParse(req, res, next){

        let cookies = MyAuthMiddlewares.parseCookies(req);
        req.locals = req.locals || {};
        req.locals.cookies = cookies;
        next();
    }

    static parseCookies (request) {
        //console.log("parseCookies");
        const list = {};
        const rc = request.headers.cookie;
        //console.log("Request Cookies");
        //console.log(rc);

        rc && rc.split(';').forEach(function( cookie ) {
            const parts = cookie.split('=');
            list[parts.shift().trim()] = decodeURI(parts.join('='));
        });

        //Remove Empty Variables in Cookies
        let cookieKeys = Object.keys(list);
        for(let i=0; i<cookieKeys.length; i++){
            let key = cookieKeys[i];
            if(list[key]===""){
                delete list[key];
            }
        }

        return list;
    }

    handleGetRouteInfo(req,res){
        let answer = {
            "AuthMethods" : this.routeAuthMethodList,
            "Refresh": this.routeAuthRefreshAccessToken,
            "Authorize": this.routeAuthAuthorize,
            "AccessToken" : this.routeAuthAccessToken,
            "CurrentUser" : this.routeAuthCurrentUser,
            "Logout":  this.routeAuthLogout,
            "LogoutFromAllDevices" : this.routeAuthLogoutFromAllDevices
        }
        MyExpressRouter.responseWithSuccessJSON(res, answer); //anyway answer normaly
    }

    handleGetCurrentUser(req,res){
        console.log("handleGetCurrentUser");
        let currentUser = req.locals.currentUser;
        console.log(currentUser);
        MyExpressRouter.responseWithSuccessJSON(res, currentUser); //anyway answer normaly
    }

    handleGetAuthMethods(req,res){
        console.log("handleGetAuthMethods");
        let dataJSON = AuthConnector.getAuthMethods();
        console.log("dataJSON");
        console.log(dataJSON);
        MyExpressRouter.responseWithSuccessJSON(res, dataJSON); //anyway answer normaly
    }

    /**
     * @apiDefine MyAuthorization
     * @apiHeader {String="Authorization TOKEN"} authorization Authorization Token.
     */
    middlewareAuthToken(req, res, next) {
        const logger = this.logger;

        this.logger.info("[MyExpressRouter] middlewareAuthToken - url: " + req.url);
        //console.log("URL: "+req.url);

        req.locals = req.locals || {};
        req.locals.currentUser = {}; //create a current user, which will be the user who initiates the request
        req.locals.currentUser.role = MyAccessControl.roleNameGuest; //define it as anonymous


        if(!!this.authConfig.disabled){
            req.locals.currentUser.role = MyAccessControl.roleNameAdmin; //better make him then admin
            next();
            return; //abort further checks
        }

        try { //lets try to find if a token is provided
            let authorization = req.headers.authorization; //get auth headers
            if (!!authorization) { //if there are headers
                const token = authorization.split(" ")[1]; //get the token Header: ACCESSTOKEN TheSuperCoolToken

                console.log("Start verifikation");
                //start verification of headers
                this.tokenHelper.verifyToken(token, function (err, tokenPayload) { //verify the token
                    if (err != null) { //if there is an error
                        if (err.name === "TokenExpiredError") { //if token is Expired
                            console.log("TokenExpiredError");
                            MyExpressRouter.responseWithErrorJSON(res, HttpStatus.UNAUTHORIZED, {message:'AccessTokenExpiredError'});
                            return;
                        } else { //thats an invalid token boy !
                            console.log("TokenInvalid");
                            //logger.error("[" + workerID + "][MyExpressRouter] middlewareAuthToken - invalid token ! remoteAddress: " + ip);
                            MyExpressRouter.responseWithErrorJSON(res, HttpStatus.UNAUTHORIZED, {message:'AccessTokenInvalid'});
                            return;
                        }
                    }
                    console.log("Check payload");
                    if (!!tokenPayload) { // payload was correct so we know which user this is
                        console.log("found tokenPayload");
                        console.log(tokenPayload);
                        req.locals.currentUser = tokenPayload || {};
                        if (!req.locals.currentUser.role) {
                            req.locals.currentUser.role = MyAccessControl.roleNameUser; // is nothing provided, you are atleast a user
                        }
                        console.log("okay role set continue");
                    }
                    next();
                });
            } else {
                //well no authoritation provided
                next();
            }
        } catch (err) { //no headers found or some wrong headers provided

            console.log(err);
            logger.error("[MyExpressRouter] middlewareAuthToken - " + err.toString());
            next();
        }
    }

    static cookieRefreshTokenKey = "refreshToken";

    resetRefreshTokenCookie(res){
        this.setRefreshTokenCookie(res,"");
    }

    setRefreshTokenCookie(res,refreshToken){
        //HttpOnly - Javascript cant access this
        //Path since we dont want, that the client ALWAYS sends the refresh token, we specify a path when to send it
        res.header('Set-Cookie', [MyAuthMiddlewares.cookieRefreshTokenKey+'='+refreshToken+'; HttpOnly; Path=/api/auth;']);
    }

    async handleLogout(req,res){
        console.log("### handleLogout ###");
        let refreshToken = req.locals.refreshToken;
        let success = await this.tokenHelper.rejectRefreshToken(refreshToken);
        this.resetRefreshTokenCookie(res);
        MyExpressRouter.responseWithSuccessJSON(res, {refreshToken: null});
        return;
    }

    async handleLogoutFromAllDevices(req,res){
        let authObject = req.locals.currentUser;
        if(!!authObject){
            let success = await this.tokenHelper.rejectAllRefreshTokensFromAuthObject(authObject);
            this.resetRefreshTokenCookie(res);
            MyExpressRouter.responseWithSuccessJSON(res, {refreshToken: null});
            return;
        } else {
            MyExpressRouter.responseWithErrorJSON(res, HttpStatus.INTERNAL_SERVER_ERROR, {message:"No Credentials Provided"});
        }
    }

    async handleAuthorize(req, res){
        console.log("handleGetNewRefreshToken");
        let authObject = req.locals.currentUser;
        let currentUser = req.locals.currentUser;
        let rememberMe = req.body.rememberMe;

        let accessToken = this.tokenHelper.createAccessToken(authObject); //create token
        let refreshToken = await this.tokenHelper.createRefreshToken(authObject); //create token
        if(!!rememberMe){
            this.setRefreshTokenCookie(res,refreshToken);
        }

        MyExpressRouter.responseWithSuccessJSON(res, {refreshToken: refreshToken, accessToken: accessToken, currentUser: currentUser});
    }

    handleRefreshAccessToken(req, res) {
        console.log("handleGetNewAccessToken");
        let authObject = req.locals.currentUser;
        let currentUser = req.locals.currentUser;

        let accessToken = this.tokenHelper.createAccessToken(authObject); //create token
        let answer = {accessToken: accessToken, currentUser: currentUser}; //create answer
        MyExpressRouter.responseWithSuccessJSON(res, answer);
    }

    static getRefreshTokenFromReq(req){
        req.locals = req.locals || {};
        return req.locals.cookies[MyAuthMiddlewares.cookieRefreshTokenKey];
    }

    /**
     * Middleware which will only Accept Plaintext Passwords, Tokens dont help you here !
     * @param req the reuqest object
     * @param res the response object
     * @param next the next function
     *
     * @apiDefine MyPasswordAuthorization
     * @apiHeader {Content-Type="application/json"} Content-Type Authorization Token.
     * @apiParam {Number} user_id User's unique ID.
     * @apiParam {String} plaintextSecret User's password as plain text.
     */
    async middlewareOnlyAuthenticatedViaRefreshToken(req, res, next) {
        console.log("middlewareOnlyAuthenticatedViaRefreshToken");
        if(!!this.authConfig.disabled){
            console.log("Skip, auth is disabled");
            next();
            return;
        }

        req.locals = req.locals || {};
        let refreshToken = null;

        let cookiesRefreshToken = MyAuthMiddlewares.getRefreshTokenFromReq(req);
        if(!!cookiesRefreshToken){
            console.log("Found cookiesRefreshToken");
            refreshToken = cookiesRefreshToken;
        }

        let bodyRefreshToken = req.body.refreshToken;
        if(!!bodyRefreshToken){
            console.log("Found bodyRefreshToken");
            refreshToken = bodyRefreshToken;
        }

        console.log("refreshToken: "+refreshToken);
        if(!!refreshToken){
            let authObject = await MyTokenHelper.getAuthObjectFromRefreshToken(refreshToken);
            console.log(authObject);
            if(!!authObject){
                req.locals.refreshToken = refreshToken;
                req.locals.currentUser = authObject;
                next();
                return;
            } else {
                if(!!cookiesRefreshToken){
                    this.resetRefreshTokenCookie(res);
                }
                MyExpressRouter.responseWithErrorJSON(res, HttpStatus.BAD_REQUEST, {message:"RefreshTokenInvalid"});
                return;
            }
        } else {
            if(!!cookiesRefreshToken){
                this.resetRefreshTokenCookie(res);
            }
            MyExpressRouter.responseWithErrorJSON(res, HttpStatus.BAD_REQUEST, {message:"RefreshTokenMissing"});
            return;
        }
    }

    /**
     * Middleware which will only Accept Plaintext Passwords, Tokens dont help you here !
     * @param req the reuqest object
     * @param res the response object
     * @param next the next function
     *
     * @apiDefine PasswordAuthorization
     * @apiHeader {Content-Type="application/json"} Content-Type Authorization Token.
     * @apiParam {Number} user_id User's unique ID.
     * @apiParam {String} plaintextSecret User's password as plain text.
     */
    async middlewareOnlyAuthenticatedViaPlaintextSecret(req, res, next) {
        if(!!this.authConfig.disabled){
            next();
            return;
        }
        console.log("middlewareOnlyAuthenticatedViaPlaintextSecret");
        //Remove Token Authentication
        req.locals = req.locals || {};
        req.locals.currentUser = {};
        req.locals.currentUser.role = MyAccessControl.roleNameGuest;

        console.log(req.body);

        let auth = req.body.auth;
        console.log(auth);

        if (!!auth) { //if a plaintext was provided
            let answer = await AuthConnector.authorize(auth);
            console.log(answer);
            if(!!answer){
                if(answer.success){
                    console.log("middlewareOnlyAuthenticatedViaPlaintextSecret success");
                    console.log(answer.auth);
                    req.locals.currentUser = answer.auth;
                    next();
                } else if(!!answer.error){
                    MyExpressRouter.responseWithErrorJSON(res, HttpStatus.BAD_REQUEST, {message:"auth not correct", details: answer.error});
                } else if(!!answer.success) {

                }
            } else {
                MyExpressRouter.responseWithErrorJSON(res, HttpStatus.INTERNAL_SERVER_ERROR, {message:"Unexpected Error at auth"});
            }
        } else { //no auth given
            MyExpressRouter.responseWithErrorJSON(res, HttpStatus.BAD_REQUEST, {message:"auth is missing"});
        }
    }

}
