import Vector2 from "./vector2.js";

export const checkOverlapPolygon = (vertices1, vertices2) => {
    let minOverlap = Number.MAX_VALUE;
    let minOverlapNormal;

    for (let i = 0; i < vertices1.length; i++) {
        const vertex = vertices1[i];
        const nextVertex = vertices1[(i + 1) % vertices1.length];

        // get the edge vector
        const edge = { x: nextVertex.x - vertex.x, y: nextVertex.y - vertex.y };

        // get the perpendicular vector to the edge (normal)
        const normal = { x: -edge.y, y: edge.x };

        // normalise the normal
        const normalLength = Math.sqrt(normal.x * normal.x + normal.y * normal.y);
        normal.x /= normalLength;
        normal.y /= normalLength;

        const points1 = projectPolygon(vertices1, normal);
        const min1 = points1.min;
        const max1 = points1.max;

        const points2 = projectPolygon(vertices2, normal);
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
            minOverlapNormal = normal;
        }
    }

    for (let i = 0; i < vertices2.length; i++) {
        const vertex = vertices2[i];
        const nextVertex = vertices2[(i + 1) % vertices2.length];

        // get the edge vector
        const edge = { x: nextVertex.x - vertex.x, y: nextVertex.y - vertex.y };

        // get the perpendicular vector to the edge (normal)
        const normal = { x: -edge.y, y: edge.x };

        // normalise the normal
        const normalLength = Math.sqrt(normal.x * normal.x + normal.y * normal.y);
        normal.x /= normalLength;
        normal.y /= normalLength;

        const points1 = projectPolygon(vertices1, normal);
        const min1 = points1.min;
        const max1 = points1.max;

        const points2 = projectPolygon(vertices2, normal);
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
            minOverlapNormal = normal;
        }
    }
    // get the minimum translation vector
    const mtv = new Vector2(minOverlapNormal.x, minOverlapNormal.y);
    mtv.mult(minOverlap);
    return mtv;
}

export const ckeckOverlapCirclePolygon = (circleCenter, circleRadius, vertices) => {
    let minOverlap = Number.MAX_VALUE;
    let minOverlapNormal = null;

    for (let i = 0; i < vertices.length; i++) {
        const vertex = vertices[i];
        const nextVertex = vertices[(i + 1) % vertices.length];

        // get the edge vector
        const edge = new Vector2(nextVertex.x - vertex.x, nextVertex.y - vertex.y);

        // get the perpendicular vector to the edge (normal)
        // this normal will be the axis we project shapes onto
        const axis = Vector2.normal(edge);

        const points1 = projectPolygon(vertices, axis);
        const min1 = points1.min;
        const max1 = points1.max;

        const points2 = projectCircle(circleCenter, circleRadius, axis);
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
            minOverlapNormal = axis;
        }
    }

    const closestPoint = findClosestPointOnPolygon(circleCenter, vertices);
    const axis = new Vector2(closestPoint.x - circleCenter.x, closestPoint.y - circleCenter.y);
    axis.normalize();

    const points1 = projectPolygon(vertices, axis);
    const min1 = points1.min;
    const max1 = points1.max;

    const points2 = projectCircle(circleCenter, circleRadius, axis);
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
        minOverlapNormal = axis;
    }

    // get the minimum translation vector
    const mtv = new Vector2(minOverlapNormal.x, minOverlapNormal.y);
    mtv.mult(minOverlap);
    return mtv;
}

const projectPolygon = (vertices, normal) => {
    let min = Number.MAX_VALUE;
    let max = -Number.MAX_VALUE;
    vertices.forEach(vertex => {
        const dot = vertex.x * normal.x + vertex.y * normal.y;
        if (dot < min) {
            min = dot;
        }
        if (dot > max) {
            max = dot;
        }
    });
    return { min, max };
}

const projectCircle = (circleCenter, circleRadius, axis) => {
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

export const getRectVertices = (centerX, centerY, width, height, angle) => {
    // TODO : only check 2 edges for rectangles and squares
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

export const getTriangleVertices = (centerX, centerY, width, height, angle) => {
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

export const getRandInt = (max) => {
    return Math.floor(Math.random() * max);
}

const findClosestPointOnPolygon = (circleCenter, vertices) => {
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