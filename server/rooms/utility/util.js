function ranWorldPos() {
    return {x: Math.floor(Math.random() * 1520) + 300, y: Math.floor(Math.random() * 1520) + 300};
}

function ranPlayerAngle() {
    return Math.floor(Math.random() * 360);
}

function distanceFrom(source, target) {
    let sx, sy, tx, ty

    if (source.pos) {
        sx = source.pos.x;
        sy = source.pos.y
    } else {
        sx = source.x;
        sy = source.y;
    }

    if (target.pos) {
        tx = target.pos.x;
        ty = target.pos.y;
    } else {
        tx = target.x;
        ty = target.y;
    }

    let dx = sx - tx; 
    let dy = sy - ty;

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

function wrapAngle(angle, radians) {
    let radianFactor = (radians) ? Math.PI / 180 : 1;
    return wrap(angle, -180 * radianFactor, 180 * radianFactor);
}

function getShortestAngle(angle1, angle2) {
    let difference = angle2 - angle1;

    if (difference === 0)
    {
        return 0;
    }

    let times = Math.floor((difference - (-180)) / 360);

    return difference - (times * 360);
}

function wrap(value, min, max) {
    let range = max - min;

    if (range <= 0)
    {
        return 0;
    }

    let result = (value - min) % range;

    if (result < 0)
    {
        result += range;
    }

    return result + min;
}

function getProximityList(player, list, within, range) {
    let exclutionList = [];
    let proxyRange = range ? 1280 : range;

    for (let id in list) {
        if (id !== player.id) {
            let target = list[id];
            let dist = distanceFrom(player, target);

            if (within) {
                if (dist < range) exclutionList.push(target.id);
            } else {
                if (dist > range) exclutionList.push(target.id);
            }
        }
    }

    return exclutionList;
}

function lerp(a, b, n) {
    return (1 - n) * a + n * b;
}

function idExistInArr(id, arr) {
    let exist = false;

    arr.forEach(item => {
        if (item.id == id) {
            exist = true;
        }
    })

    return exist;
}

module.exports = {
    ranWorldPos: ranWorldPos,
    ranPlayerAngle: ranPlayerAngle,
    distanceFrom: distanceFrom,
    uniqueId: uniqueId,
    setEnumerable: setEnumerable,
    ranNumBetween: ranNumBetween,
    wrapAngle: wrapAngle,
    getShortestAngle: getShortestAngle,
    getProximityList: getProximityList,
    lerp: lerp,
    idExistInArr: idExistInArr
}