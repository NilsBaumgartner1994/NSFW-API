import HttpStatus from 'http-status-codes';

import MyAccessControl from "./../module/MyAccessControl";
import MyExpressRouter from "../module/MyExpressRouter";

/**
 * The My Express Router which is the core functionality. It setups all controllers and handles routes
 */
export default class AuthDatabase {

    static AUTH_NAME = "Database";

    static getNeededAuthParams(){
        return {
            name: AuthDatabase.AUTH_NAME,
            params: {
                id : "UserId",
                password: "password",
            }
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
    middlewareOnlyAuthenticatedViaPlaintextSecret(req, res, next) {
        //Remove Token Authentication
        req.locals.currentUser = {};
        req.locals.currentUser.id = undefined;
        req.locals.currentUser.role = MyAccessControl.roleNameGuest;

        let plaintextSecret = req.body.plaintextSecret;

        if (!!plaintextSecret) { //if a plaintext was provided
            let user_id = parseInt(req.body.user_id);
            if (!!user_id) { // if a user id is given
                this.logger.info("[" + this.workerID + "][MyExpressRouter] middlewareOnlyAuthenticatedViaPlaintextSecret - user_id: " + user_id + " censoredSecret: " + "x".repeat("plaintextSecret".length));
                this.models.User.findOne({where: {id: user_id}}).then(user => { //search for a user
                    if (!user) { //there is no user ?
                        MyExpressRouter.responseWithErrorJSON(res, HttpStatus.NOT_FOUND, {
                            error: 'user_id not found',
                            user_id: user_id
                        });
                    } else { //okay user exists
                        user.getLogin().then(login => { //search for login, which should exist
                            if (!login) { //if the login does not exist
                                MyExpressRouter.responseWithErrorJSON(res, HttpStatus.INTERNAL_SERVER_ERROR, {message:"User does not have a Login"});
                            } else { //if the login exists
                                let correct = LoginController.correctPlaintextSecretForUser(login, plaintextSecret); //check if password is korregt
                                if (correct) { //if thats a valid password
                                    req.locals.currentUser.id = user.id; //set id
                                    req.locals.currentUser.role = MyAccessControl.roleNameUser; //and lowest role
                                    this.logger.info("[" + this.workerID + "][MyExpressRouter] middlewareOnlyAuthenticatedViaPlaintextSecret - user_id: " + user_id + " correct plaintext");

                                    this.models.UserRole.findOne({where: {UserId: user.id}}).then(userroleEntry => { //but mayby he has a role ?
                                        if (!!userroleEntry) { //if a userrole entry exists
                                            let roleId = userroleEntry.RoleId;
                                            this.models.Role.findOne({where: {id: roleId}}).then(role => {
                                                if (!!role) {  //and if the role exists
                                                    req.locals.currentUser.role = role.name; //the the role name in it
                                                }
                                                //okay unkown role id found?
                                                this.logger.info("[" + this.workerID + "][MyExpressRouter] middlewareOnlyAuthenticatedViaPlaintextSecret - user_id: " + user_id + " as special role: " + req.locals.currentUser.role);
                                                next();
                                            }).catch(err => {
                                                this.logger.error("[" + this.workerID + "][MyExpressRouter] middlewareOnlyAuthenticatedViaPlaintextSecret - " + err.toString());
                                            });
                                        } else { //no special entry for user, but still a valid user
                                            this.logger.info("[" + this.workerID + "][MyExpressRouter] middlewareOnlyAuthenticatedViaPlaintextSecret - user_id: " + user_id + " as default role: " + req.locals.currentUser.role);
                                            next();
                                        }
                                    }).catch(err => {
                                        this.logger.error("[" + this.workerID + "][MyExpressRouter] middlewareOnlyAuthenticatedViaPlaintextSecret - " + err.toString());
                                        MyExpressRouter.responseWithErrorJSON(res, HttpStatus.INTERNAL_SERVER_ERROR, {message:err.toString()});
                                    })
                                } else {
                                    MyExpressRouter.responseWithErrorJSON(res, HttpStatus.UNAUTHORIZED, {message:"WrongCredentials"});
                                }
                            }
                        }).catch(err => {
                            this.logger.error("[" + this.workerID + "][MyExpressRouter] middlewareOnlyAuthenticatedViaPlaintextSecret - " + err.toString());
                            MyExpressRouter.responseWithErrorJSON(res, HttpStatus.INTERNAL_SERVER_ERROR, {message:err.toString()});
                        });
                    }
                }).catch(err => {
                    this.logger.error("[" + this.workerID + "][MyExpressRouter] middlewareOnlyAuthenticatedViaPlaintextSecret - " + err.toString());
                    MyExpressRouter.responseWithErrorJSON(res, HttpStatus.INTERNAL_SERVER_ERROR, {message:err.toString()});
                });
            } else { //no user id given
                MyExpressRouter.responseWithErrorJSON(res, HttpStatus.BAD_REQUEST, {message:"user_id is missing"});
            }
        } else { //no plaintext secret given
            MyExpressRouter.responseWithErrorJSON(res, HttpStatus.BAD_REQUEST, {message:"plaintextSecret is missing"});
        }
    }

}
