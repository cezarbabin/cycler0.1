ObjectContainer = function(objArray) {};

ObjectContainer.prototype.initialize = function(name){
    if (name == 'underWorld' || name == 'trail' || name == 'lane' || name == 'chargingObstacleContainer'){
        this[name] = [];
    } else if (name == "obstacleContainer") {
        this[name] = [];
        for (var r = 0; r < ROWS; r++){
            this[name].push([]);
        }
    }
}
