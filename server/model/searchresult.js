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

exports.ormSearchResult = function ( row ) {
    let searchResult = new searchResult;
    searchResult.name = row.name;
    searchResult.id = row.id;
    searchResult.description = row.description;
    return searchResult;
};