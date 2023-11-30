export const isRectOverlap = (x1, y1, w1, h1, x2, y2, w2, h2) => {
    // check horizontal overlap
    if ((x1 > (x2 + w2)) || ((x1 + w1) < x2))
        return false;
    // check vertical overlap
    if ((y1 > (y2 + h2)) || ((y1 + h1) < y2))
        return false;
    return true;
};
export const getXOverlap = (x1, w1, x2, w2) => {
    let leftOverlap = x1 - (x2 + w2);
    let rightOverlap = x2 - (x1 + w1);
    // if (leftOverlap <= 0 || rightOverlap <= 0) {
    //     return 0;
    // }
    if (leftOverlap > rightOverlap) {
        return -leftOverlap;
    }
    return rightOverlap;
}
export const getYOverlap = (y1, h1, y2, h2) => {
    let bottomOverlap = y1 - (y2 + h2);
    let topOverlap = y2 - (y1 + h1);
    // if (topOverlap <= 0 || bottomOverlap <= 0) {
    //     return 0;
    // }
    if (bottomOverlap > topOverlap) {
        return -bottomOverlap;
    }
    return topOverlap;
}
export const checkOverlapSAT = (x1, y1, w1, h1, angle1, x2, y2, w2, h2, angle2) => {
    // TODO : only check 2 edges for rectangles and squares
    // TODO : check for circles
    const vertices1 = getVertices(x1, y1, w1, h1, angle1);
    const vertices2 = getVertices(x2, y2, w2, h2, angle2);

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

        const points1 = projectShape(vertices1, normal);
        const min1 = points1.min;
        const max1 = points1.max;

        const points2 = projectShape(vertices2, normal);
        const min2 = points2.min;
        const max2 = points2.max;

        // check if the projections overlap
        if (max1 < min2 || max2 < min1) {
            // there is a separating axis, so no overlap
            return false;
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

        const points1 = projectShape(vertices1, normal);
        const min1 = points1.min;
        const max1 = points1.max;

        const points2 = projectShape(vertices2, normal);
        const min2 = points2.min;
        const max2 = points2.max;

        // check if the projections overlap
        if (max1 < min2 || max2 < min1) {
            // there is a separating axis, so no overlap
            return false;
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
    const mtv = { x: minOverlapNormal.x * minOverlap, y: minOverlapNormal.y * minOverlap };
    return mtv;
}
const projectShape = (vertices, normal) => {
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
export const getVertices = (centerX, centerY, width, height, angle) => {
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

export const getRandInt = (max) => {
    return Math.floor(Math.random() * max);
}