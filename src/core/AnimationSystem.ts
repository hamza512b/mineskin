import animations, {
  AnimationBodyPart,
  AnimationDefinition,
  AnimationKeyframe,
  AnimationPartData,
  PartTransform,
} from "./animations";
import { lerpVector3, smoothStepLerpVector3 } from "./interpolationUtils";
import { V3 } from "./maths";
import { MeshGroup } from "./mesh";
import { MinecraftSkin } from "./MinecraftSkin";
import {
  isPoseLimb,
  Pose,
  PoseLimb,
  PoseSystem,
  resolveBodyParts,
} from "./PoseSystem";
import { multiplyQuat, Quat, quatFromEuler } from "./quaternion";

export class AnimationSystem {
  private currentAnimation: AnimationDefinition | null = null;
  private animationTime: number = 0;
  private animationSpeed: number = 1.0;
  private isPlaying: boolean = false;
  private bodyParts: AnimationBodyPart[] = [];
  private originalTransforms: Map<string, PartTransform> = new Map();
  private parentGroups: Set<MeshGroup> = new Set();
  private onAnimationUpdate?: () => void;
  /**
   * The manual pose a clip animates away from. When set, each part's clip
   * rotation is composed onto its posed rest position instead of replacing it,
   * so "wave while posed" works and stopping a clip returns to the pose rather
   * than to a T-pose.
   */
  private poseSystem: PoseSystem | null = null;

  constructor(onAnimationUpdate?: () => void) {
    this.onAnimationUpdate = onAnimationUpdate;
  }

  public setPoseSystem(poseSystem: PoseSystem | null): void {
    this.poseSystem = poseSystem;
  }

  public setupBodyParts(skin: MinecraftSkin, isSlim: boolean): void {
    this.bodyParts = resolveBodyParts(skin, isSlim);

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
    this.isPlaying = false;
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
      this.applyBodyTransform({
        rotation: bodyTransform.rotation,
        position: bodyTransform.position,
      });
    }

    // Limbs the clip poses through the collider, keyed by name so the solved
    // rotation can be written back to the right meshes below.
    const posedParts = new Map<PoseLimb, AnimationBodyPart>();
    const posedRotations: Pose = {};

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

      // Compose the clip onto the posed rest position: the limb is already
      // rotated by the pose, and the clip rotates it further within that frame.
      const posed = this.composeWithPose(partData.name, transform.rotation);

      for (const target of [bodyPart.base, bodyPart.overlay]) {
        if (!target) continue;
        // Rotations are held back until every part's offset is on the mesh:
        // the collider reads position and scale straight off the meshes, so a
        // clip that shifts a limb has to be solved where it will be drawn.
        if (!posed) {
          target.rotation = transform.rotation;
        }
        if (target.position) {
          target.position = transform.position;
        }
        if (target.scale) {
          target.scale = transform.scale;
        }
      }

      if (posed && isPoseLimb(partData.name)) {
        posedParts.set(partData.name, bodyPart);
        posedRotations[partData.name] = posed;
      }
    });

    if (posedParts.size === 0) return;

    // Clip and pose are authored blind to each other, so their composition can
    // put a limb inside the torso or through the other arm. Stop each one where
    // it meets whatever is in the way, exactly as a drag does.
    const resolved =
      this.poseSystem?.resolveAnimationFrame(posedRotations) ?? posedRotations;

    for (const [name, bodyPart] of posedParts) {
      const rotation = resolved[name] ?? posedRotations[name];
      if (!rotation) continue;
      if (bodyPart.base) bodyPart.base.rotationQuat = rotation;
      if (bodyPart.overlay) bodyPart.overlay.rotationQuat = rotation;
    }
  }

  /**
   * Returns pose · clip for a posed part, or null when there is no pose to
   * compose with — in which case the caller keeps the cheaper Euler path.
   */
  private composeWithPose(
    partName: string,
    clipRotation: [number, number, number],
  ): Quat | null {
    if (!this.poseSystem || !isPoseLimb(partName)) return null;
    const pose = this.poseSystem.getPartRotation(partName);
    return multiplyQuat(pose, quatFromEuler(...clipRotation));
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

  /**
   * Moves the whole model, by transforming the groups every part hangs off.
   *
   * The user's torso pose lives on those same groups, so when there is a pose
   * system it owns the matrix and composes the two; without one — the editor
   * renderer never wires it up — the clip writes the groups itself, exactly as
   * it always did.
   */
  private applyBodyTransform(
    transform: { rotation: V3; position: V3 } | null,
  ): void {
    if (this.poseSystem) {
      this.poseSystem.setBodyClipTransform(transform);
      return;
    }
    for (const group of this.parentGroups) {
      group.rotation = transform?.rotation ?? [0, 0, 0];
      group.position = transform?.position ?? [0, 0, 0];
    }
  }

  private resetToOriginalTransforms(): void {
    // Drop the clip's body transform; the user's torso pose stays.
    this.applyBodyTransform(null);

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

    // Rest position is the user's pose, not the T-pose. Re-applying after the
    // Euler writes above is what puts the limbs back where they were posed —
    // those writes clear each part's quaternion override.
    this.poseSystem?.apply();
  }

  public dispose(): void {
    this.stopAnimation();
    this.originalTransforms.clear();
    this.bodyParts = [];
  }
}
