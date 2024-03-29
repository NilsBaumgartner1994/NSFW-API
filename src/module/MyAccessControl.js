import MyExpressRouter from "./MyExpressRouter";
import SequelizeHelper from "../helper/SequelizeHelper";
import SequelizeAssociationController from "../controllers/SequelizeAssociationController";

const AccessControl = require('accesscontrol');

/**
 * My Access Control is a Helper to Set all Permissions initially and to provide some helper methods. AccessControl
 * itself is a nice package which allows us to easily handle permissions.
 * Read More about it here: https://www.npmjs.com/package/accesscontrol
 */
export default class MyAccessControl {

    /**
     * Roles which we can use
     */
    static roleNameGuest = "guest"; //a guest which represents someone anonymous
    static roleNameUser = "user"; //a user is someone registered in our system
    static roleNameModerator = "moderator"; //A moderator
    static roleNameSuperModerator = "supermoderator"; //a person which degrate other moderators
    static roleNameAdmin = "admin";
    static roleNameOwner = "owner";

    static customAccessControl;

    /**
     * Constructor
     * @param logger The logger
     * @param models The sequelize models
     */
    constructor(logger, models) {
        this.logger = logger;
        this.logger.info("[MyAccessControl] initialising");
        this.models = models;
        this.initialiseAccessControlInstance(); //init access control
        this.initialisePermissions(); // load permissions
        this.checkIfCustomAccessControlInstanceFound();
        this.logger.info("[MyAccessControl] initialised");

    }

    static getAccessControlResourceOfTablename(tablename){
        return "RESOURCE_"+tablename;
    }

    static getAccessControlResourceOfAssociation(tablename, associationname){
        return "ASSOCIATION_"+tablename+"_"+associationname;
    }

    /**
     * Get all Roles which are inheritated of given role
     * @param role The role to check
     * @param accessControlInstance
     * @returns {*|string[]}
     */
    static getInheritedRolesOf(role, accessControlInstance) {
        return accessControlInstance.getInheritedRolesOf(role);
    }

    /**
     * Checks if a role inheritates a other role or is the same
     * @param ownRole The own Role we got
     * @param roleToCheck The role which we want to know if its inheritated
     * @param accessControlInstance
     * @returns {boolean}
     */
    static inheritatesOrIsSameRole(ownRole, roleToCheck, accessControlInstance) {
        if (ownRole === roleToCheck) { //either its the same role
            return true;
        }
        return MyAccessControl.isFirstRoleRealyHigher(ownRole, roleToCheck, accessControlInstance);
    }

    /**
     * Checks is higherRole is realy higher thant the lowerRole. If the Roles are same the result will be false.
     * @param higherRole The role which should be higher
     * @param lowerRole The role which should be lower
     * @returns {boolean}
     */
    static isFirstRoleRealyHigher(higherRole, lowerRole, accessControlInstance) {
        let inheritatedRoles = MyAccessControl.getInheritedRolesOf(higherRole, accessControlInstance); //get inheritated roles
        return (inheritatedRoles.indexOf(lowerRole) >= 0); //return if its contained

    }

    static getCleanAccessControlInstance(){
        return new AccessControl();
    }

    static getCleanAccessControlInstanceWithDefaultRoles(){
        return MyAccessControl.addDefaultRolesToAccessControlInstance(MyAccessControl.getCleanAccessControlInstance());
    }

    /**
     * Create Access Control Instance
     */
    initialiseAccessControlInstance() {
        this.logger.info("[MyAccessControl] initialiseAccessControlInstance");
        this.ac = MyAccessControl.getCleanAccessControlInstanceWithDefaultRoles();
    }

    checkIfCustomAccessControlInstanceFound(){
        if(!!MyAccessControl.customAccessControl){
            this.ac = MyAccessControl.customAccessControl;
        }
    }

    static addDefaultRolesToAccessControlInstance(ac){
        ac.grant(MyAccessControl.roleNameGuest);
        ac.grant(MyAccessControl.roleNameUser);
        ac.grant(MyAccessControl.roleNameUser).extend(MyAccessControl.roleNameGuest);
        ac.grant(MyAccessControl.roleNameModerator);
        ac.grant(MyAccessControl.roleNameModerator).extend(MyAccessControl.roleNameUser);
        ac.grant(MyAccessControl.roleNameSuperModerator);
        ac.grant(MyAccessControl.roleNameSuperModerator).extend(MyAccessControl.roleNameModerator);
        ac.grant(MyAccessControl.roleNameAdmin);
        ac.grant(MyAccessControl.roleNameAdmin).extend(MyAccessControl.roleNameSuperModerator);
        ac.grant(MyAccessControl.roleNameOwner).extend(MyAccessControl.roleNameAdmin);
        return ac;
    }

    /**
     * Get the Access Control instance
     */
    getAccessControlInstance() {
        return this.ac;
    }

    /**
     * Initialise Permissions of all Groups
     */
    initialisePermissions() {
        this.logger.info("[MyAccessControl] initialisePermissions");
        let ac = this.getAccessControlInstance();

        //Create the Groups in Access Control
        MyAccessControl.addDefaultRolesToAccessControlInstance(ac);

        // Init the specific permissions
        this.initGuestPermissions();
        this.initUserPermissions();
        this.initModeratorPermissions();
        this.initSuperModeratorPermissions();
        this.initAdminPermissions();

        /**
         * Owner
         * The Owner should be allowed to do anything he wants, but thats maybe to powerfull ?
         */
        ac.grant(MyAccessControl.roleNameOwner).extend(MyAccessControl.roleNameAdmin);

        this.logger.info("[MyAccessControl] initialisePermissions finished");
        this.ac = ac;
    }

    /**
     * Init All Guest Permissions
     * Guest should can use minimum of functionalities
     */
    initGuestPermissions() {
        let ac = this.getAccessControlInstance();
        if(!!this.models.User){
            let userAssociationResouce = MyAccessControl.getAccessControlResourceOfTablename(this.models.User.tableName)
            ac.grant(MyAccessControl.roleNameGuest).createOwn(userAssociationResouce, ["plaintextSecret"]);
        }

    }

    /**
     * Init User Permissions
     *
     * Users should have permission to set their favorite Meals
     * Set their allegens
     * Make Friends
     */
    initUserPermissions() {
        let ac = this.getAccessControlInstance();
        ac.grant(MyAccessControl.roleNameUser).extend(MyAccessControl.roleNameGuest);
        if(!!this.models.User){
            let userAssociationResouce = MyAccessControl.getAccessControlResourceOfTablename(this.models.User.tableName)
            ac.grant(MyAccessControl.roleNameUser).readOwn(userAssociationResouce, ['id', 'onlineTime', 'privacyPolicyReadDate', 'pseudonym', 'avatar', 'language']);
            ac.grant(MyAccessControl.roleNameUser).updateOwn(userAssociationResouce, ['pseudonym', 'avatar', '!privacyPolicyReadDate', 'language']); // user is not allowed to change privacyPoliceReadDate manualy
            ac.grant(MyAccessControl.roleNameUser).deleteOwn(userAssociationResouce);
        }

    }

    /**
     * Init Moderator Permissions
     *
     * Moderators should manage to Adjust small errors in Building (like the name is wrong, a building moved
     */
    initModeratorPermissions() {
        let ac = this.getAccessControlInstance();
        ac.grant(MyAccessControl.roleNameModerator).extend(MyAccessControl.roleNameUser);

        //should be able to see who is a special person
        //ac.grant(MyAccessControl.roleNameModerator).readAny(MyExpressRouter.userrole_accessControlResource, ['UserID', 'RoleId']);
    }

    /**
     * Init Super Moderator Permissions
     * They should be able to assign new Moderators or to remove them
     */
    initSuperModeratorPermissions() {
        let ac = this.getAccessControlInstance();
        ac.grant(MyAccessControl.roleNameSuperModerator).extend(MyAccessControl.roleNameModerator);
    }

    /**
     * Init Admin Permissions
     * Admins should be able to do everything
     */
    initAdminPermissions() {
        let ac = this.getAccessControlInstance();
        ac.grant(MyAccessControl.roleNameAdmin).extend(MyAccessControl.roleNameSuperModerator);
        this.grantRoleAllPermissions(MyAccessControl.roleNameAdmin);
    }

    static getAllAccessControlResourcesOfModels(models){
        let tableNames = SequelizeHelper.getModelTableNames(models);
        let accessControlResources = [];
        for(let i=0; i<tableNames.length; i++){
            let tableName = tableNames[i];
            let accessControlResource = MyAccessControl.getAccessControlResourceOfTablename(tableName);
            accessControlResources.push(accessControlResource)
        }
        return accessControlResources;
    }

    grantRoleAllPermissions(role){
        let ac = this.getAccessControlInstance();
        let accessControlResources = MyAccessControl.getAllAccessControlResourcesOfModels(this.models);
        let associationNames = SequelizeAssociationController.getForAllModelsAllAccessControlAssociationResources(this.models);
        let totalAdminPermission = accessControlResources.concat(associationNames);

        let functionPermissions = [MyExpressRouter.adminRoutes_accessControlResource];
        totalAdminPermission = totalAdminPermission.concat(functionPermissions);

        //.push(MyExpressRouter.adminRoutes_accessControlResource); //for any general not resource based

        for (let i = 0; i < totalAdminPermission.length; i++) { //for all permissions allow everything
            let accessControl = totalAdminPermission[i];
            ac.grant(role).createAny(accessControl, ['*']);
            ac.grant(role).readAny(accessControl, ['*']);
            ac.grant(role).updateAny(accessControl, ['*']);
            ac.grant(role).deleteAny(accessControl, ['*']);
        }
    }
}
