
function getPointsInWindow(maxLon, minLon, maxLat, minLat) {
    for (var i = 0; i < this.points.length; i++) {
        if (this.points[i].lon <= maxLon && this.points[i].lon >= minLon && this.points[i].lat > minLat && this.points[i].lat < maxLat) {
            this.pointsInWindow.push(this.points[i])
        }
    }
}
function isCoverEachOther(point1, point2) {
    if (point1.lon - this.rectRadius > point2.lon + this.rectRadius || point2.lon - this.rectRadius > point1.lon + this.rectRadius || point1.lat - this.rectRadius > point2.lat + this.rectRadius || point2.lat - this.rectRadius > point1.lat + this.rectRadius) {
        return false;
    }
    return true;
}
function getMinDistanceClusterPoint(point) {
    var distance = 0;
    var index = 0;
    for (var i = 0; i < this.clusterPoints.length; i++) {
        var xx = (this.clusterPoints[i].lon - point.lon) * (this.clusterPoints[i].lon - point.lon);
        var yy = (this.clusterPoints[i].lat - point.lat) * (this.clusterPoints[i].lat - point.lat);
        var dist = xx + yy;
        if (i == 0) {
            distance = dist;
        } else {
            if (dist < distance) {
                distance = dist;
                index = i;
            }
        }
    }
    return index;
}
function getClusterPoints() {
    for (var i = 0; i < this.pointsInWindow.length; i++) {
        if (this.clusterPoints.length == 0) {
            this.clusterPoints.push({
                size: 1,
                lon: this.pointsInWindow[i].lon,
                lat: this.pointsInWindow[i].lat,
                point: this.pointsInWindow[i]
            });
        } else {
            var index = this.getMinDistanceClusterPoint(this.pointsInWindow[i]);
            if (this.isCoverEachOther(this.clusterPoints[index], this.pointsInWindow[i])) {
                this.clusterPoints[index].size++;
            } else {
                this.clusterPoints.push({
                    size: 1,
                    lon: this.pointsInWindow[i].lon,
                    lat: this.pointsInWindow[i].lat,
                    point: this.pointsInWindow[i]
                });
            }
        }
    }
}
function drawPoints() {
    for (var i = 0; i < this.clusterPoints.length; i++) {
        this.pointsOnMap.push(this.clusterPoints[i].lon + this.clusterPoints[i].lat + this.icon)
        if (this.clusterPoints[i].size == 1) {
            this.callback(this.clusterPoints[i].lon, this.clusterPoints[i].lat, this.icon, this.clusterPoints[i].point)
        } else {
            this.callback(this.clusterPoints[i].lon, this.clusterPoints[i].lat, this.icon, "", this.clusterPoints[i].size)
        }
    }
}
function drawRealPoints() {
    for (var i = 0; i < this.pointsInWindow.length; i++) {
        this.pointsOnMap.push(this.pointsInWindow[i].lon + this.pointsInWindow[i].lat + this.icon)
        this.callback(this.pointsInWindow[i].lon, this.pointsInWindow[i].lat, this.icon, this.pointsInWindow[i])
    }
}
function removePoints() {
    for (var i = 0; i < this.pointsOnMap.length; i++) {
        appMap.removeOverlayPoint(this.pointsOnMap[i]);
    }
    this.pointsOnMap = [];
}
function startCluster() {
    var level = this.level || 15;
    this.pointsInWindow = [];
    this.clusterPoints = [];
    this.removePoints();
    var bounds = _mapApp.map.getBoundsLatLng();
    if (_mapApp.map.getZoomLevel() >= level) {
        this.getPointsInWindow(bounds._northEast.lng, bounds._southWest.lng, bounds._northEast.lat, bounds._southWest.lat);
        this.drawRealPoints();
        return;
    }
    this.rectRadius = (bounds._northEast.lng - bounds._southWest.lng) / 40;
    this.getPointsInWindow(bounds._northEast.lng, bounds._southWest.lng, bounds._northEast.lat, bounds._southWest.lat);
    this.getClusterPoints();
    this.drawPoints();
}
/**
 * 
 * @param {Array required} points 点集合
 * @param {String required} icon 地图点的图标
 * @param {Function required} callback 上点回调
 * @param {Number} level 在最低哪个地图缩放级别开始取消聚合
 */
export default function Cluster(points, icon, callback, level) {
    this.drawPoints = drawPoints;
    this.icon = icon;
    this.level = level;
    this.callback = callback;
    this.drawRealPoints = drawRealPoints;
    this.pointsOnMap = [];
    this.startCluster = startCluster;
    this.points = points;
    this.rectRadius = 0.005;
    this.removePoints = removePoints;
    this.getMinDistanceClusterPoint = getMinDistanceClusterPoint;
    this.isCoverEachOther = isCoverEachOther;
    this.pointsInWindow = [];
    this.clusterPoints = [];
    this.getClusterPoints = getClusterPoints;
    this.getPointsInWindow = getPointsInWindow;
    this.startCluster();
}