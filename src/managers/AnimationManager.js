export class AnimationManager {
    constructor() {
        this.animations = [];  // list of active animations
    }

    addAnimation(animation) {
        // add new animation to the list
        this.animations.push(animation);
    }

    update() {
        // update all animations every frame
        for (let i = this.animations.length - 1; i >= 0; i--) {
            const animation = this.animations[i];
            animation.update();
            
            // remove if animation is complete
            if (animation.isComplete) {
                this.animations.splice(i, 1);
            }
        }
    }
}