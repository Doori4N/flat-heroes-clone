import Vector2 from "./vector2.js";

export const getRandInt = (max) => {
    return Math.floor(Math.random() * max);
}

export const getClosestObject = (objects, position) => {
    let closestObject;
    let closestDistance = Number.MAX_VALUE;

    objects.forEach(object => {
        const distance = Vector2.distance(position, object.position);
        if (distance < closestDistance) {
            closestDistance = distance;
            closestObject = object;
        }
    });

    return closestObject;
}

export const shakeScreen = (ctx, shakeIntensity) => {
    const offsetX = Math.random() * shakeIntensity - shakeIntensity / 2;
    const offsetY = Math.random() * shakeIntensity - shakeIntensity / 2;

    ctx.save();

    // apply shake
    ctx.translate(offsetX, offsetY);

    // restore the context after a short delay
    setTimeout(() => {
        ctx.restore();
    }, 50);
}