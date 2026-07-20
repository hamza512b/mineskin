import animations, {
  AnimationBodyPart,
  AnimationDefinition,
  AnimationKeyframe,
  AnimationPartData,
  PartTransform,
} from "./animations";
import { lerpVector3, smoothStepLerpVector3 } from "./interpolationUtils";
import { MeshGroup } from "./mesh";
import { MinecraftSkin } from "./MinecraftSkin";

export class AnimationSystem {
  private currentAnimation: AnimationDefinition | null = null;
  private animationTime: number = 0;
  private animationSpeed: number = 1.0;
  private isPlaying: boolean = false;
  private bodyParts: AnimationBodyPart[] = [];
  private originalTransforms: Map<string, PartTransform> = new Map();
  private parentGroups: Set<MeshGroup> = new Set();
  private onAnimationUpdate?: () => void;

  constructor(onAnimationUpdate?: () => void) {
    this.onAnimationUpdate = onAnimationUpdate;
  }

  public setupBodyParts(skin: MinecraftSkin, isSlim: boolean): void {
    this.bodyParts = [
      { name: "head", base: skin.baseHead, overlay: skin.overlayHead },
      { name: "body", base: skin.baseBody, overlay: skin.overlayBody },
      {
        name: "leftArm",
        base: isSlim ? skin.baseLeftSlimArm : skin.baseLeftArm,
        overlay: isSlim ? skin.overlayLeftSlimArm : skin.overlayLeftArm,
      },
      {
        name: "rightArm",
        base: isSlim ? skin.baseRightSlimArm : skin.baseRightArm,
        overlay: isSlim ? skin.overlayRightSlimArm : skin.overlayRightArm,
      },
      { name: "leftLeg", base: skin.baseLeftLeg, overlay: skin.overlayLeftLeg },
      {
        name: "rightLeg",
        base: skin.baseRightLeg,
        overlay: skin.overlayRightLeg,
      },
    ];

    // Collect parent groups (opaqueGroup, transparentGroup) so body transform
    // can be applied to them, making all parts inherit body rotation/position
    this.parentGroups.clear();
    for (const part of this.bodyParts) {
      const baseParent = part.base?.getParent();
      const overlayParent = part.overlay?.getParent();
      if (baseParent instanceof MeshGroup) this.parentGroups.add(baseParent);
      if (overlayParent instanceof MeshGroup)
        this.parentGroups.add(overlayParent);
    }
  }

  public playAnimation(animationName: string): void {
    const animation = animations.find((a) => a.name === animationName);
    if (!animation) {
      console.warn(`Animation "${animationName}" not found`);
      return;
    }

    this.currentAnimation = animation;
    this.animationTime = 0;
    this.isPlaying = true;

    this.resetToOriginalTransforms();
  }

  public stopAnimation(): void {
    this.currentAnimation = null;
    this.resetToOriginalTransforms();
  }

  public update(deltaTime: number = 0.016): void {
    if (!this.currentAnimation) return;

    this.animationTime += deltaTime * this.animationSpeed;
    if (this.animationTime >= this.currentAnimation.duration) {
      if (this.currentAnimation.loop) {
        this.animationTime =
          this.animationTime % this.currentAnimation.duration;
      } else {
        this.stopAnimation();
        return;
      }
    }

    this.updateAnimation();
    this.onAnimationUpdate?.();
  }

  public setAnimationSpeed(speed: number): void {
    this.animationSpeed = Math.max(0.1, speed);
  }

  public setAnimationTime(time: number): void {
    if (!this.currentAnimation) return;

    const duration = this.currentAnimation.duration;
    this.animationTime = this.currentAnimation.loop
      ? ((time % duration) + duration) % duration
      : Math.min(Math.max(0, time), duration);
    this.updateAnimation();
    this.onAnimationUpdate?.();
  }

  public isAnimationPlaying(): boolean {
    return this.isPlaying;
  }

  public getCurrentAnimationName(): string | null {
    return this.currentAnimation?.name || null;
  }

  private updateAnimation(): void {
    if (!this.currentAnimation) return;

    // Process body first: apply body transform to parent groups so all parts
    // inherit the body's rotation/position (e.g. tilting forward when flying)
    const bodyPartData = this.currentAnimation.parts.find(
      (p) => p.name === "body",
    );
    if (bodyPartData) {
      const bodyTransform = this.calculatePartTransformAtTime(
        bodyPartData,
        this.animationTime,
      );
      for (const group of this.parentGroups) {
        group.rotation = bodyTransform.rotation;
        group.position = bodyTransform.position;
      }
    }

    // Apply animation to each part
    this.currentAnimation.parts.forEach((partData) => {
      const bodyPart = this.bodyParts.find((bp) => bp.name === partData.name);
      if (!bodyPart) return;

      // Body transform is already applied to parent groups above;
      // reset the body part itself so it doesn't double-rotate
      if (partData.name === "body") {
        if (bodyPart.base) {
          bodyPart.base.rotation = [0, 0, 0];
          bodyPart.base.position = [0, 0, 0];
          bodyPart.base.scale = [1, 1, 1];
        }
        if (bodyPart.overlay) {
          bodyPart.overlay.rotation = [0, 0, 0];
          bodyPart.overlay.position = [0, 0, 0];
        }
        return;
      }

      const transform = this.calculatePartTransformAtTime(
        partData,
        this.animationTime,
      );

      if (bodyPart.base) {
        bodyPart.base.rotation = transform.rotation;
        if (bodyPart.base.position) {
          bodyPart.base.position = transform.position;
        }
        if (bodyPart.base.scale) {
          bodyPart.base.scale = transform.scale;
        }
      }

      if (bodyPart.overlay) {
        bodyPart.overlay.rotation = transform.rotation;
        if (bodyPart.overlay.position) {
          bodyPart.overlay.position = transform.position;
        }
        if (bodyPart.overlay.scale) {
          bodyPart.overlay.scale = transform.scale;
        }
      }
    });
  }

  private calculatePartTransformAtTime(
    partData: AnimationPartData,
    time: number,
  ): PartTransform {
    const keyframes = partData.keyframes.sort((a, b) => a.time - b.time);

    const originalBase = this.originalTransforms.get(`base_${partData.name}`);
    const originalOverlay = this.originalTransforms.get(
      `overlay_${partData.name}`,
    );
    const original = originalBase ||
      originalOverlay || {
        rotation: [0, 0, 0] as [number, number, number],
        position: [0, 0, 0] as [number, number, number],
        scale: [1, 1, 1] as [number, number, number],
      };

    if (keyframes.length === 0) {
      return original;
    }

    if (time <= keyframes[0].time) {
      return this.blendWithOriginal(original, keyframes[0]);
    }

    if (time >= keyframes[keyframes.length - 1].time) {
      return this.blendWithOriginal(original, keyframes[keyframes.length - 1]);
    }

    for (let i = 0; i < keyframes.length - 1; i++) {
      const currentKeyframe = keyframes[i];
      const nextKeyframe = keyframes[i + 1];

      if (time >= currentKeyframe.time && time <= nextKeyframe.time) {
        const t =
          (time - currentKeyframe.time) /
          (nextKeyframe.time - currentKeyframe.time);
        return this.interpolateKeyframes(
          original,
          currentKeyframe,
          nextKeyframe,
          t,
        );
      }
    }

    return original;
  }

  private blendWithOriginal(
    original: PartTransform,
    keyframe: AnimationKeyframe,
  ): PartTransform {
    return {
      rotation: keyframe.rotation
        ? lerpVector3(original.rotation, keyframe.rotation, 1)
        : original.rotation,
      position: keyframe.position
        ? lerpVector3(original.position, keyframe.position, 1)
        : original.position,
      scale: keyframe.scale
        ? lerpVector3(original.scale, keyframe.scale, 1)
        : original.scale,
    };
  }

  private interpolateKeyframes(
    original: PartTransform,
    keyframe1: AnimationKeyframe,
    keyframe2: AnimationKeyframe,
    t: number,
  ): PartTransform {
    const rotation1 = keyframe1.rotation || original.rotation;
    const rotation2 = keyframe2.rotation || original.rotation;

    const position1 = keyframe1.position || original.position;
    const position2 = keyframe2.position || original.position;

    const scale1 = keyframe1.scale || original.scale;
    const scale2 = keyframe2.scale || original.scale;

    return {
      rotation: smoothStepLerpVector3(rotation1, rotation2, t),
      position: smoothStepLerpVector3(position1, position2, t),
      scale: smoothStepLerpVector3(scale1, scale2, t),
    };
  }

  private resetToOriginalTransforms(): void {
    // Reset parent groups (body transform applied during animation)
    for (const group of this.parentGroups) {
      group.rotation = [0, 0, 0];
      group.position = [0, 0, 0];
    }

    this.bodyParts.forEach((part) => {
      if (part.base) {
        part.base.rotation = [0, 0, 0];
        part.base.position = [0, 0, 0];
        part.base.scale = [1, 1, 1];
      }
      if (part.overlay) {
        part.overlay.rotation = [0, 0, 0];
        part.overlay.position = [0, 0, 0];
      }
    });
  }

  public dispose(): void {
    this.stopAnimation();
    this.originalTransforms.clear();
    this.bodyParts = [];
  }
}
