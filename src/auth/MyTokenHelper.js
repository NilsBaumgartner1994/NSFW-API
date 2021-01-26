import AuthConnector from "./AuthConnector";
import MyExpressRouter from "../module/MyExpressRouter";

const jwt = require('jsonwebtoken');
const jwtSecret = "supersecretJWTKey";
const accessToken_expirationTime = "24h";

const randtoken = require('rand-token');
const refreshTokenKey = "RefreshTokens"+".";
const usersRefreshTokensKey = "UsersRefreshTokens"+".";

/**
 * A Token helper for easy verification and creating of tokens
 */
export default class MyTokenHelper {

    static ID = 2;

    /**
     * Constructor for the token Helper
     * @param logger the logger class
     */
    constructor(logger) {
        this.logger = logger;
        this.logger.info("[MyTokenHelper] creating");
    }

    /**
     * Verifies a Token and calls a callback function on result
     * @param token the token to be checked
     * @param functionToCall the callback function
     */
    verifyToken(token, functionToCall) {
        jwt.verify(token, jwtSecret, functionToCall);
    }

    async rejectAllRefreshTokensFromAuthObject(authObject){
        console.log("Reject all RefreshTokens from Users authObject");
        let authMethod = authObject[AuthConnector.AUTH_METHOD];
        let username = authObject.username;
        let key = authMethod+"."+username;

        let redisUserRefreshTokensKey = usersRefreshTokensKey+key;
        let usersRefreshTokensAsString = await MyExpressRouter.getFromRedis(redisUserRefreshTokensKey);
        if(!!usersRefreshTokensAsString){
            console.log("Found RefreshTokens for User");
            let usersRefreshTokens = JSON.parse(usersRefreshTokensAsString);
            let refreshTokens = Object.keys(usersRefreshTokens);
            for(let i=0; i<refreshTokens.length; i++){
                console.log("Reject Users ResfreshToken: "+i+"/"+refreshTokens.length);
                let refreshToken = refreshTokens[i];
                await this.rejectRefreshToken(refreshToken);
            }
            console.log("Rejected all Users RefreshTokens");
            return true;
        }
    }

    async rejectRefreshToken(refreshToken){
        console.log("rejectRefreshToken start");
        let redisRefreshTokensKey = refreshTokenKey+refreshToken;
        let authObject = await MyTokenHelper.getAuthObjectFromRefreshToken(refreshToken);
        if(!!authObject){
            console.log("RefreshToken was found, now reject it");
            let authMethod = authObject[AuthConnector.AUTH_METHOD];
            let username = authObject.username;
            let key = authMethod+"."+username;
            let redisUserRefreshTokensKey = usersRefreshTokensKey+key;
            let usersRefreshTokensAsString = await MyExpressRouter.getFromRedis(redisUserRefreshTokensKey);
            let usersRefreshTokens = !!usersRefreshTokensAsString ? JSON.parse(usersRefreshTokensAsString) : {};
            delete usersRefreshTokens[refreshToken];
            console.log("Save all users RefreshTokens");
            if(Object.keys(usersRefreshTokens).length===0){
                await MyExpressRouter.deleteInRedis(redisUserRefreshTokensKey);
            } else {
                await MyExpressRouter.saveInRedis(redisUserRefreshTokensKey, JSON.stringify(usersRefreshTokens));
            }

        }
        console.log("Reject RefreshToken anyway");
        await MyExpressRouter.deleteInRedis(redisRefreshTokensKey);
        return true;
    }

    static async getAuthObjectFromRefreshToken(refreshToken){
        let redisRefreshTokensKey = refreshTokenKey+refreshToken;
        let authObjectAsString = await MyExpressRouter.getFromRedis(redisRefreshTokensKey);
        console.log("getAuthObjectFromRefreshToken: "+authObjectAsString)
        if(!!authObjectAsString){
            return JSON.parse(authObjectAsString)
        }
        return null;
    }

    async createRefreshToken(authObject){
        //console.log("createRefreshToken start");
        let refreshToken = randtoken.uid(512);
        let redisRefreshTokensKey = refreshTokenKey+refreshToken;
        let foundAuthObject = await MyTokenHelper.getAuthObjectFromRefreshToken(refreshToken);

        if(!foundAuthObject){
            //console.log("Refresh Token not used :-)")
            let authMethod = authObject[AuthConnector.AUTH_METHOD];
            let username = authObject.username;
            let key = authMethod+"."+username;

            let redisUserRefreshTokensKey = usersRefreshTokensKey+key;

            let usersRefreshTokensAsString = await MyExpressRouter.getFromRedis(redisUserRefreshTokensKey);
            let usersRefreshTokens = !!usersRefreshTokensAsString ? JSON.parse(usersRefreshTokensAsString) : {};
            usersRefreshTokens[refreshToken] = true;

            //console.log("Saving RefreshToken in Redis Client");
            await MyExpressRouter.saveInRedis(redisUserRefreshTokensKey, JSON.stringify(usersRefreshTokens));
            await MyExpressRouter.saveInRedis(redisRefreshTokensKey, JSON.stringify(authObject));
            //console.log("Refresh Token successufully created");
            //console.log(refreshToken);
            return refreshToken;
        }
        console.log("Refresh Token already exists ?");
        return null;
    }


    /**
     * Creates a Token with an default expiration time
     * @param user_id The UserID we want to add into the key
     * @param roleName the RoleName we want to add
     * @returns {string} the token
     */
    createAccessToken(authObject) {
        this.logger.info("[MyTokenHelper] createToken: "+JSON.stringify(authObject));
        console.log("createToken");
        console.log(authObject);
        let token = jwt.sign(authObject, jwtSecret, {expiresIn: accessToken_expirationTime});
        console.log("token:");
        console.log(token);
        return token;
    }

}
