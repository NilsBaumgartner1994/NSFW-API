const fs = require("fs-extra");
const path = require('path');
const decompress = require('decompress');

/**
 * A Helper for FileSystem. Managing Files, deleting, ...
 */
export default class FileSystemHelper {

    /**
     * Make a Directory, and by default all subfolders automatically recursive.
     * @param dirPath
     */
    static mkdirpath(dirPath, recursive = true) {
        try {
            fs.mkdirSync(dirPath, {recursive: recursive})
        } catch (err) {
            if (err.code !== 'EEXIST') {
            }
        }
    }

    static move(src,dst){
        return fs.move(src,dst);
    }

    /**
     * Checks if a path exists
     * @param path The path as String
     * @returns {boolean}
     */
    static doesPathExist(path) {
        return fs.existsSync(path);
    }

    /**
     * Creates all folders necessary for a file.
     * @param filePath path to a file
     */
    static mkdirpathForFile(filePath) {
        let parentDir = path.dirname(filePath); //get folder of file
        FileSystemHelper.mkdirpath(parentDir); //create all subfolders
    }

    /**
     * Deletes a File from Disk
     * @param filePath path to file
     */
    static deleteFile(filePath) {
        try {
            fs.unlinkSync(filePath);
        } catch (err) {
            if (err.code !== "ENOENT") { //deleting something that does not exist
            }
        }
    }

    /**
     * Read Content from a File
     * @param path path to file
     * @returns {Buffer} Returns the content from the file
     */
    static readFileAsString(path) {
        let contents = fs.readFileSync(path);
        return contents;
    }

    /**
     * Reads Content from a File and Converts to JSON
     * @param path path to file
     * @returns {any}
     */
    static readFileAsJSON(path) {
        return fs.readJSONSync(path);
    }

    /**
     * Writes content into a file
     * @param path path to file
     * @param json
     */
    static writeFileAsJSON(path, json) {
        return fs.writeJSONSync(path,json);
    }

    /**
     * Get all Files from a Path. Ignores Hidden files
     * @param path Path to a folder
     * @returns {null|Array}
     */
    static getAllFilesFormPath(path) {
        if (!path) { //if no path defined
            return null; //handle error
        }
        let files = []; //create empty list
        if (fs.existsSync(path)) { //is path exists
            fs.readdirSync(path).forEach(function (file, index) {
                let curPath = path + "/" + file; //create path of file
                if (fs.lstatSync(curPath).isDirectory()) { //if its dictionary
                    //do nothing
                } else { // otherwise if file
                    if (!(/(^|\/)\.[^\/\.]/g).test(file)) { //ignore hidden files https://stackoverflow.com/questions/18973655/how-to-ingnore-hidden-files-in-fs-readdir-result
                        files.push(file); //add to list
                    }
                }
            });
        }
        return files; //return found resulsts
    }

    /**
     * Get all Files from a Path. Ignores Hidden files
     * @param path Path to a folder
     * @returns {null|Array}
     */
    static getAllFoldersFormPath(path) {
        if (!path) { //if no path defined
            return null; //handle error
        }
        let folders = []; //create empty list
        if (fs.existsSync(path)) { //is path exists
            fs.readdirSync(path).forEach(function (file, index) {
                let curPath = path + "/" + file; //create path of file
                if (fs.lstatSync(curPath).isDirectory()) { //if its dictionary
                    if (!(/(^|\/)\.[^\/\.]/g).test(file)) { //ignore hidden files https://stackoverflow.com/questions/18973655/how-to-ingnore-hidden-files-in-fs-readdir-result
                        folders.push(file); //add to list
                    }
                } else { // otherwise if file
                    //do nothing
                }
            });
        }
        return folders; //return found resulsts
    }

    /**
     * Deletes a Folder recursive
     * @param path The path to be deleted
     * @param inst
     */
    static deleteFolderRecursive(path) {
        if (path === undefined) {
            return;
        }
        if (fs.existsSync(path)) {
            fs.readdirSync(path).forEach(function (file, index) {
                let curPath = path + "/" + file;
                if (fs.lstatSync(curPath).isDirectory()) { // recursive
                    FileSystemHelper.deleteFolderRecursive(curPath);
                } else { // delete file
                    fs.unlinkSync(curPath);
                }
            });
            fs.rmdirSync(path);
        }
    }

    static getFilenameWithoutExtensionFromName(filenameWithExtension){
        return filenameWithExtension.split('.').slice(0, -1).join('.');
    }

    static getFileExtensionFromName(filenameWithExtension){
        return filenameWithExtension.split('.').pop();
    }

    /**
     * Get the createdAt time of a file/folder
     * @param path The path to the file/folder
     * @returns {Date}
     */
    static getCreatedDate(path) {
        const {birthtime} = fs.statSync(path);
        return birthtime;
    }

    /**
     * Get the updatedAt time of a file/folder
     * @param path The path to the file/folder
     * @returns {Date}
     */
    static getFileUpdatedDate(path) {
        const stats = fs.statSync(path);
        return stats.mtime
    }

    /**
     * Get Informations about a file
     * @param filename A file name
     * @returns {{createdAt: Date, id: *, filePath: string, updatedAt: Date}}
     */
    static getFileInformation(path, filename) {
        let createdAt = FileSystemHelper.getCreatedDate(path);
        let updatedAt = FileSystemHelper.getFileUpdatedDate(path);
        return {
            name: filename,
            path: path,
            createdAt: createdAt,
            updatedAt: updatedAt
        }
    }

}