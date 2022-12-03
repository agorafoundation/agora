/**
 * Agora - Close the loop
 * © 2021-2022 Brian Gormanly
 * BSD 3-Clause License
 * see included LICENSE or https://opensource.org/licenses/BSD-3-Clause 
 */

function searchResult() {
    this.name = "";
    this.id = -1;
    this.description = "";
}

exports.emptyGoal = () => {
    return new searchResult();
};

exports.ormSearchResult = async ( element, main, secone, type, sectwo = "" ) => {
    let itemtype = type;
    let id = element.id;
    let itemmain = element[main];
    let secondary = element[secone] + element[sectwo];
    return {itemtype, id, itemmain, secondary};
};