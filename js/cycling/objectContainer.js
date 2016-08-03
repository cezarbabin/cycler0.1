ObjectContainer = function(objArray) {
	this.state = {}
};

ObjectContainer.prototype.initialize = function(name){
    if (name != "obstacleContainer"){
        this[name] = [];
    } else {
        this[name] = [];
        for (var r = 0; r < ROWS; r++){
            this[name].push([]);
        }
    }
    this.state[name] = false;
}
