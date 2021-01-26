import React, {Component} from "react";

export class NumberHelper extends Component {

   static getNumberInString(string){
       let numbersInString = string.match(/\d/g).join("");
       return parseInt(numbersInString);
   }

}
