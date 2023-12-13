import Vector2 from "./vector2.js";

export default class Collision2D {
    static checkOverlapPolygonSAT = (vertices1, vertices2) => {
        let minOverlap = Number.MAX_VALUE;
        let mtv = null;

        for (let i = 0; i < vertices1.length; i++) {
            const vertex = vertices1[i];
            const nextVertex = vertices1[(i + 1) % vertices1.length];

            // get the edge vector
            const edge = new Vector2(nextVertex.x - vertex.x, nextVertex.y - vertex.y);

            // get the perpendicular vector to the edge (normal)
            const normal = Vector2.normal(edge);

            const points1 = Collision2D.projectPolygon(vertices1, normal);
            const min1 = points1.min;
            const max1 = points1.max;

            const points2 = Collision2D.projectPolygon(vertices2, normal);
            const min2 = points2.min;
            const max2 = points2.max;

            // check if the projections overlap
            if (max1 < min2 || max2 < min1) {
                // there is a separating axis, so no overlap
                return null;
            }

            // get the overlap
            const overlap = Math.min(max1 - min2, max2 - min1);

            // get the smallest overlap
            if (overlap < minOverlap) {
                minOverlap = overlap;
                mtv = normal;
            }
        }

        for (let i = 0; i < vertices2.length; i++) {
            const vertex = vertices2[i];
            const nextVertex = vertices2[(i + 1) % vertices2.length];

            // get the edge vector
            const edge = new Vector2(nextVertex.x - vertex.x, nextVertex.y - vertex.y);

            // get the perpendicular vector to the edge (normal)
            const normal = Vector2.normal(edge);

            const points1 = Collision2D.projectPolygon(vertices1, normal);
            const min1 = points1.min;
            const max1 = points1.max;

            const points2 = Collision2D.projectPolygon(vertices2, normal);
            const min2 = points2.min;
            const max2 = points2.max;

            // check if the projections overlap
            if (max1 < min2 || max2 < min1) {
                // there is a separating axis, so no overlap
                return null;
            }

            // get the overlap
            const overlap = Math.min(max1 - min2, max2 - min1);

            // get the smallest overlap
            if (overlap < minOverlap) {
                minOverlap = overlap;
                mtv = normal;
            }
        }

        mtv.mult(minOverlap);
        return mtv;
    }

    static ckeckOverlapCirclePolygonSAT = (circleCenter, circleRadius, vertices) => {
        let minOverlap = Number.MAX_VALUE;
        let mtv = null;

        for (let i = 0; i < vertices.length; i++) {
            const vertex = vertices[i];
            const nextVertex = vertices[(i + 1) % vertices.length];

            // get the edge vector
            const edge = new Vector2(nextVertex.x - vertex.x, nextVertex.y - vertex.y);

            // get the perpendicular vector to the edge (normal)
            // this normal will be the axis we project shapes onto
            const axis = Vector2.normal(edge);

            const points1 = Collision2D.projectPolygon(vertices, axis);
            const min1 = points1.min;
            const max1 = points1.max;

            const points2 = Collision2D.projectCircle(circleCenter, circleRadius, axis);
            const min2 = points2.min;
            const max2 = points2.max;

            // check if the projections overlap
            if (max1 < min2 || max2 < min1) {
                // there is a separating axis, so no overlap
                return null;
            }

            // get the overlap
            const overlap = Math.min(max1 - min2, max2 - min1);

            // get the smallest overlap
            if (overlap < minOverlap) {
                minOverlap = overlap;
                mtv = axis;
            }
        }

        const closestPoint = Collision2D.findClosestPointOnPolygon(circleCenter, vertices);
        const axis = new Vector2(closestPoint.x - circleCenter.x, closestPoint.y - circleCenter.y);
        axis.normalize();

        const points1 = Collision2D.projectPolygon(vertices, axis);
        const min1 = points1.min;
        const max1 = points1.max;

        const points2 = Collision2D.projectCircle(circleCenter, circleRadius, axis);
        const min2 = points2.min;
        const max2 = points2.max;

        // check if the projections overlap
        if (max1 < min2 || max2 < min1) {
            // there is a separating axis, so no overlap
            return null;
        }

        // get the overlap
        const overlap = Math.min(max1 - min2, max2 - min1);

        // get the smallest overlap
        if (overlap < minOverlap) {
            minOverlap = overlap;
            mtv = axis;
        }

        mtv.mult(minOverlap);
        return mtv;
    }

    static projectPolygon(vertices, normal) {
        let min = Number.MAX_VALUE;
        let max = -Number.MAX_VALUE;

        vertices.forEach(vertex => {
            const dot = Vector2.dot(vertex, normal);
            if (dot < min) {
                min = dot;
            }
            if (dot > max) {
                max = dot;
            }
        });

        return { min, max };
    }

    static projectCircle(circleCenter, circleRadius, axis){
        const dot = Vector2.dot(circleCenter, axis);
        let min = dot - circleRadius;
        let max = dot + circleRadius;

        if (min > max) {
            const temp = min;
            min = max;
            max = temp;
        }

        return { min, max };
    }

    static findClosestPointOnPolygon(circleCenter, vertices) {
        let closestDistance = Number.MAX_VALUE;
        let closestPoint = null;

        vertices.forEach(vertex => {
            const distance = Vector2.distance(circleCenter, vertex);
            if (distance < closestDistance) {
                closestDistance = distance;
                closestPoint = vertex;
            }
        });

        return closestPoint;
    }

    static getRectVertices(centerX, centerY, width, height, angle) {
        const radians = (-angle * Math.PI) / 180;
        const cos = Math.cos(radians);
        const sin = Math.sin(radians);

        const halfWidth = width / 2;
        const halfHeight = height / 2;

        // create vertices relative to the center of the rectangle
        const vertices = [
            { x: -halfWidth, y: -halfHeight },
            { x: halfWidth, y: -halfHeight },
            { x: halfWidth, y: halfHeight },
            { x: -halfWidth, y: halfHeight }
        ];

        // rotate the vertices
        const rotatedVertices = vertices.map(vertex => {
            const x = vertex.x * cos - vertex.y * sin;
            const y = vertex.x * sin + vertex.y * cos;
            return { x: x + centerX, y: y + centerY };
        });

        return rotatedVertices;
    }

    static getTriangleVertices(centerX, centerY, width, height, angle) {
        const radians = (-angle * Math.PI) / 180;
        const cos = Math.cos(radians);
        const sin = Math.sin(radians);

        const halfWidth = width / 2;
        const halfHeight = height / 2;

        // create vertices relative to the center of the triangle
        const vertices = [
            { x: -halfWidth, y: -halfHeight },
            { x: halfWidth, y: 0 },
            { x: -halfWidth, y: halfHeight }
        ];

        // rotate the vertices
        const rotatedVertices = vertices.map(vertex => {
            const x = vertex.x * cos - vertex.y * sin;
            const y = vertex.x * sin + vertex.y * cos;
            return { x: x + centerX, y: y + centerY };
        });

        return rotatedVertices;
    }
}