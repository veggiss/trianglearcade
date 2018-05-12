function ranWorldPos() {
    return {x: Math.floor(Math.random() * 1520) + 300, y: Math.floor(Math.random() * 1520) + 300};
}

function ranPlayerAngle() {
    return Math.floor(Math.random() * 360);
}

function distanceFrom(source, target) {
    let dx = source.x - target.x; 
    let dy = source.y - target.y;

    return Math.sqrt(dx * dx + dy * dy);
}

function uniqueId(length) {
    return Math.random().toString(36).substr(2, length);
}

function setEnumerable(object) {
    let private = {};

    for (let key in object) {
        Object.defineProperty(private, key, {
            value: object[key],
            enumerable: false,
            writable: true
        });
    }

    return private;
}

function ranNumBetween(min, max) {
    return Math.floor(Math.random() * max) + min;
}

module.exports = {
    ranWorldPos: ranWorldPos,
    ranPlayerAngle: ranPlayerAngle,
    distanceFrom: distanceFrom,
    uniqueId: uniqueId,
    setEnumerable: setEnumerable,
    ranNumBetween: ranNumBetween
}