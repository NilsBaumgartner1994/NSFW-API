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
        let authMethod = authObject[AuthConnector.AUTH_METHOD];
        let username = authObject.username;
        let key = authMethod+"."+username;

        let redisUserRefreshTokensKey = usersRefreshTokensKey+key;
        let usersRefreshTokensAsString = await MyExpressRouter.getFromRedis(redisUserRefreshTokensKey);
        if(!!usersRefreshTokensAsString){
            let usersRefreshTokens = JSON.parse(usersRefreshTokensAsString);
            let refreshTokens = Object.keys(usersRefreshTokens);
            for(let i=0; i<refreshTokens.length; i++){
                let refreshToken = refreshTokens[i];
                await this.rejectRefreshToken(refreshToken);
            }
            return true;
        }
    }

    async rejectRefreshToken(refreshToken){
        let redisRefreshTokensKey = refreshTokenKey+refreshToken;
        let authObject = await MyTokenHelper.getAuthObjectFromRefreshToken(refreshToken);
        if(!!authObject){
            let authMethod = authObject[AuthConnector.AUTH_METHOD];
            let username = authObject.username;
            let key = authMethod+"."+username;
            let redisUserRefreshTokensKey = usersRefreshTokensKey+key;
            let usersRefreshTokensAsString = await MyExpressRouter.getFromRedis(redisUserRefreshTokensKey);
            let usersRefreshTokens = !!usersRefreshTokensAsString ? JSON.parse(usersRefreshTokensAsString) : {};
            delete usersRefreshTokens[refreshToken];
            if(Object.keys(usersRefreshTokens).length===0){
                await MyExpressRouter.deleteInRedis(redisUserRefreshTokensKey);
            } else {
                await MyExpressRouter.saveInRedis(redisUserRefreshTokensKey, JSON.stringify(usersRefreshTokens));
            }

        }
        await MyExpressRouter.deleteInRedis(redisRefreshTokensKey);
        return true;
    }

    static async getAuthObjectFromRefreshToken(refreshToken){
        let redisRefreshTokensKey = refreshTokenKey+refreshToken;
        let authObjectAsString = await MyExpressRouter.getFromRedis(redisRefreshTokensKey);
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
        let token = jwt.sign(authObject, jwtSecret, {expiresIn: accessToken_expirationTime});
        return token;
    }

}
