import Accordion from "@/components/Accordion/Accordion";
import Button from "@/components/Button";
import { SelectBox } from "@/components/Select";
import Slider from "@/components/Slider/Slider";
import ToggleSwitch from "@/components/ToggleSwtich/ToggleSwtich";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Tabs,
  TabsContent,
  ScrollableTabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { useTheme } from "@/hooks/useTheme";
import { isNativeWebview } from "@/hooks/useNativeWebview";
import { isEnvironmentTransformLocked } from "@/core/environment";
import { openExternalUrl } from "@/core/openExternalUrl";
import {
  LOCALE_TO_FLAG,
  locales,
  setPreferredLocale,
  tJsx,
  useDictionary,
  type Locale,
} from "@/i18n";
import type { Theme } from "@/lib/theme";
import { MAX_VARIATION_STEPS } from "@/lib/utils";
import { useRendererStore } from "@/store";
import StoreBadges from "@/widgets/StoreBadges";
import CoffeeButton from "@/widgets/CoffeeButton";
import {
  ChatBubbleIcon,
  DesktopIcon,
  MoonIcon,
  SunIcon,
} from "@radix-ui/react-icons";
import { getFeedback } from "@sentry/browser";
import clsx from "clsx";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useShallow } from "zustand/react/shallow";
import blueAreaPreview from "../../../assets/blue-arena.png";
import grasslandPreview from "../../../assets/grassland.png";
import { useConfirmation } from "../Confirmation/Confirmation";

export interface DetailPanelProps {
  className?: string;
  open: boolean;
  setOpen: (open: boolean) => void;
  exitButton?: React.ReactNode;
  reset: (() => void) | undefined;
  mode: "Editing" | "Preview";
  handlePocketSwitch?: (newIsPocket: boolean) => void;
  handleResolutionSwitch?: (newIsDoubleRes: boolean) => void;
  handleFlipFrontToBack?: () => void;
  hideHeader?: boolean;
}

export const DetailPanelContent: React.FC<DetailPanelProps> = ({
  className,
  exitButton,
  setOpen,
  mode,
  handlePocketSwitch,
  handleResolutionSwitch,
  handleFlipFrontToBack,
  hideHeader,
}) => {
  const { dictionary: dict, locale } = useDictionary();
  const pathname = usePathname();
  const router = useRouter();
  const [feedback, setFeedback] = useState<ReturnType<typeof getFeedback>>();
  useEffect(() => {
    setFeedback(getFeedback());
  }, []);

  const switchLanguage = (newLocale: Locale) => {
    if (newLocale === locale) return;
    // Mark language detection as dismissed when user actively switches language
    localStorage.setItem("language-detection-dismissed", "true");
    setPreferredLocale(newLocale);
    const newPath = pathname.replace(`/${locale}`, `/${newLocale}`);
    router.push(newPath);
  };
  // Single shallow-compared subscription so per-frame store updates (e.g. camera
  // orbit) don't re-run 24 separate selectors against this component.
  const {
    errors,
    setValue,
    skinIsPocket,
    skinIsDoubleRes,
    diffuseStrength,
    specularStrength,
    objectTranslationX,
    objectTranslationY,
    objectTranslationZ,
    objectRotationX,
    objectRotationY,
    objectRotationZ,
    cameraFieldOfView,
    cameraSpeed,
    cameraDampingFactor,
    directionalLightIntensity,
    ambientLight,
    diffuseLightPositionX,
    diffuseLightPositionY,
    diffuseLightPositionZ,
    variationIntensity,
    environmentPreset,
  } = useRendererStore(
    useShallow((state) => ({
      errors: state.errors,
      setValue: state.setValue,
      skinIsPocket: state.skinIsPocket,
      skinIsDoubleRes: state.skinIsDoubleRes,
      diffuseStrength: state.diffuseStrength,
      specularStrength: state.specularStrength,
      objectTranslationX: state.objectTranslationX,
      objectTranslationY: state.objectTranslationY,
      objectTranslationZ: state.objectTranslationZ,
      objectRotationX: state.objectRotationX,
      objectRotationY: state.objectRotationY,
      objectRotationZ: state.objectRotationZ,
      cameraFieldOfView: state.cameraFieldOfView,
      cameraSpeed: state.cameraSpeed,
      cameraDampingFactor: state.cameraDampingFactor,
      directionalLightIntensity: state.directionalLightIntensity,
      ambientLight: state.ambientLight,
      diffuseLightPositionX: state.diffuseLightPositionX,
      diffuseLightPositionY: state.diffuseLightPositionY,
      diffuseLightPositionZ: state.diffuseLightPositionZ,
      variationIntensity: state.variationIntensity,
      environmentPreset: state.environmentPreset,
    })),
  );
  const envLocked = isEnvironmentTransformLocked(environmentPreset);

  // Stable per-key setters so memo'd Sliders don't see a new onChange identity
  // on every parent render.
  const sliderSetters = useMemo(() => {
    const numericKeys = [
      "variationIntensity",
      "diffuseStrength",
      "specularStrength",
      "objectTranslationX",
      "objectTranslationY",
      "objectTranslationZ",
      "objectRotationX",
      "objectRotationY",
      "objectRotationZ",
      "cameraFieldOfView",
      "cameraSpeed",
      "cameraDampingFactor",
      "directionalLightIntensity",
      "diffuseLightPositionX",
      "diffuseLightPositionY",
      "diffuseLightPositionZ",
      "ambientLight",
    ] as const;
    const out = {} as Record<(typeof numericKeys)[number], (v: number) => void>;
    for (const key of numericKeys) {
      out[key] = (v: number) => setValue(key, v);
    }
    return out;
  }, [setValue]);

  // Mimics the in-viewport Blender-style grid: a neutral lattice with red (X)
  // and green (Z) center axes. Lines are semi-transparent so it reads on both
  // the light and dark base color set via previewClass.
  const gridPreviewStyle: React.CSSProperties = {
    backgroundImage: [
      // Red X axis (horizontal center line)
      "linear-gradient(to bottom, transparent calc(50% - 0.5px), rgba(199,66,64,0.9) calc(50% - 0.5px), rgba(199,66,64,0.9) calc(50% + 0.5px), transparent calc(50% + 0.5px))",
      // Green Z axis (vertical center line)
      "linear-gradient(to right, transparent calc(50% - 0.5px), rgba(76,168,82,0.9) calc(50% - 0.5px), rgba(76,168,82,0.9) calc(50% + 0.5px), transparent calc(50% + 0.5px))",
      // Vertical lattice lines
      "repeating-linear-gradient(to right, transparent 0, transparent 7px, rgba(128,128,140,0.45) 7px, rgba(128,128,140,0.45) 8px)",
      // Horizontal lattice lines
      "repeating-linear-gradient(to bottom, transparent 0, transparent 7px, rgba(128,128,140,0.45) 7px, rgba(128,128,140,0.45) 8px)",
    ].join(", "),
  };

  const environmentOptions: {
    value: "grid" | "empty" | "grassland" | "scifi";
    label: string;
    previewClass: string;
    previewImage?: string;
    previewStyle?: React.CSSProperties;
  }[] = [
    {
      value: "grid",
      label: dict.detailPanel.environmentGrid,
      previewClass: "bg-neutral-200 dark:bg-neutral-800",
      previewStyle: gridPreviewStyle,
    },
    {
      value: "empty",
      label: dict.detailPanel.environmentEmpty,
      previewClass:
        "bg-gradient-to-br from-neutral-50 to-neutral-100 dark:from-neutral-800 dark:to-neutral-950",
    },
    {
      value: "grassland",
      label: dict.detailPanel.environmentGrassland,
      previewClass: "bg-center bg-cover",
      previewImage: grasslandPreview.src,
    },
    {
      value: "scifi",
      label: dict.detailPanel.environmentScifi,
      previewClass: "bg-center bg-cover",
      previewImage: blueAreaPreview.src,
    },
  ];

  const [theme, setTheme] = useTheme();

  const themeOptions: { value: Theme; label: string; icon: React.ReactNode }[] =
    [
      { value: "system", label: dict.theme.system, icon: <DesktopIcon /> },
      { value: "light", label: dict.theme.light, icon: <SunIcon /> },
      { value: "dark", label: dict.theme.dark, icon: <MoonIcon /> },
    ];

  const currentTheme =
    themeOptions.find((o) => o.value === theme) ?? themeOptions[0];

  const { getConfirmation } = useConfirmation();
  const setHasCompletedTutorial = useRendererStore(
    (state) => state.setHasCompletedTutorial,
  );

  return (
    <div
      className={clsx(
        "relative flex h-full min-h-0 min-w-0 flex-col overflow-hidden border bg-neutral-50 dark:bg-neutral-800 border-neutral-300 dark:border-gray-transparent dark:border-neutral-700 p-2 sm:p-3 rounded-lg",
        className,
      )}
    >
      {!hideHeader && (
        <div className="mb-4 flex shrink-0 items-center justify-between px-2">
          <h3 className="text-lg font-semibold dark:text-neutral-100 text-neutral-900">
            {dict.common.settings}
          </h3>
          {exitButton}
        </div>
      )}

      <Tabs
        defaultValue="preferences"
        className="flex min-h-0 min-w-0 flex-1 flex-col"
      >
        <div className="min-w-0 shrink-0 px-2">
          <ScrollableTabsList className="h-auto justify-start">
            <TabsTrigger className="shrink-0 px-2 text-xs" value="actions">
              {dict.detailPanel.actions}
            </TabsTrigger>
            <TabsTrigger className="shrink-0 px-2 text-xs" value="preferences">
              {dict.detailPanel.preferences}
            </TabsTrigger>
            <TabsTrigger className="shrink-0 px-2 text-xs" value="help">
              {dict.detailPanel.informationHelp}
            </TabsTrigger>
          </ScrollableTabsList>
        </div>

        <TabsContent
          value="actions"
          className="mt-3 min-h-0 min-w-0 flex-1 data-[state=inactive]:hidden"
        >
          <ScrollArea className="h-full">
            <div className="flex min-w-0 flex-col gap-5 ps-2 pe-3 pt-1 pb-1">
              <div className="flex flex-col gap-3">
                <ToggleSwitch
                  label={dict.detailPanel.slimMode}
                  id="pocket-mode"
                  checked={skinIsPocket}
                  onCheckedChange={(checked) => {
                    getConfirmation({
                      title: dict.detailPanel.changeSkinMode,
                      description: dict.detailPanel.changeSkinModeDescription,
                      confirmText: dict.common.change,
                      cancelText: dict.common.cancel,
                    }).then((confirmed) => {
                      if (confirmed) handlePocketSwitch?.(checked);
                    });
                  }}
                />
                <ToggleSwitch
                  label={dict.detailPanel.doubleResolution}
                  id="double-res-mode"
                  checked={skinIsDoubleRes}
                  onCheckedChange={(checked) => {
                    getConfirmation({
                      title: dict.detailPanel.changeResolution,
                      description: dict.detailPanel.changeResolutionDescription,
                      confirmText: dict.common.change,
                      cancelText: dict.common.cancel,
                    }).then((confirmed) => {
                      if (confirmed) handleResolutionSwitch?.(checked);
                    });
                  }}
                />
                <p className="mt-2 text-xs text-neutral-500 dark:text-neutral-400">
                  {dict.detailPanel.doubleResWarning}
                </p>
              </div>

              {handleFlipFrontToBack && (
                <div className="flex flex-col gap-2">
                  <Button
                    variant="outlined"
                    size="sm"
                    onClick={() => {
                      getConfirmation({
                        title: dict.detailPanel.flipFrontToBack,
                        description: dict.detailPanel.flipFrontToBackConfirm,
                        confirmText: dict.common.change,
                        cancelText: dict.common.cancel,
                      }).then((confirmed) => {
                        if (confirmed) handleFlipFrontToBack();
                      });
                    }}
                  >
                    {dict.detailPanel.flipFrontToBack}
                  </Button>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">
                    {dict.detailPanel.flipFrontToBackDescription}
                  </p>
                </div>
              )}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent
          value="preferences"
          className="mt-3 min-h-0 min-w-0 flex-1 data-[state=inactive]:hidden"
        >
          <ScrollArea className="h-full">
            <div className="min-w-0 ps-2 pe-3 pt-1 pb-1">
              {mode === "Editing" && (
                <Accordion label={dict.detailPanel.paint}>
                  <Slider
                    label={dict.detailPanel.variationToolIntensity}
                    value={variationIntensity}
                    onChange={sliderSetters.variationIntensity}
                    max={MAX_VARIATION_STEPS}
                    min={1}
                    step={1}
                    formatValue={(v) => `${v}`}
                    error={errors.variationIntensity}
                    editKey="variationIntensity"
                  />
                </Accordion>
              )}

              <Accordion label={dict.detailPanel.skin}>
                <Slider
                  label={dict.detailPanel.surfaceBrightness}
                  value={diffuseStrength}
                  onChange={sliderSetters.diffuseStrength}
                  max={1}
                  min={0}
                  step={0.01}
                  error={errors.diffuseStrength}
                  editKey="diffuseStrength"
                />

                <Slider
                  label={dict.detailPanel.shineGlossiness}
                  value={specularStrength}
                  onChange={sliderSetters.specularStrength}
                  max={1}
                  min={0}
                  step={0.01}
                  error={errors.specularStrength}
                  editKey="specularStrength"
                />

                <hr className="my-4 h-px bg-neutral-300 dark:bg-neutral-600 w-full border-none" />

                <Slider
                  label={dict.detailPanel.moveLeftRight}
                  value={envLocked ? 0 : objectTranslationX}
                  onChange={sliderSetters.objectTranslationX}
                  error={errors.objectTranslationX}
                  max={100}
                  min={-100}
                  step={0.1}
                  formatValue={(v) => `${v.toFixed(1)}`}
                  editKey="objectTranslationX"
                  disabled={envLocked}
                  disabledTooltip={dict.detailPanel.lockedByEnvironment}
                />
                <Slider
                  label={dict.detailPanel.moveForwardBack}
                  value={envLocked ? 0 : objectTranslationZ}
                  onChange={sliderSetters.objectTranslationZ}
                  error={errors.objectTranslationZ}
                  max={100}
                  min={-100}
                  step={0.1}
                  formatValue={(v) => `${v.toFixed(1)}`}
                  editKey="objectTranslationZ"
                  disabled={envLocked}
                  disabledTooltip={dict.detailPanel.lockedByEnvironment}
                />
                <Slider
                  label={dict.detailPanel.moveUpDown}
                  onChange={sliderSetters.objectTranslationY}
                  error={errors.objectTranslationY}
                  value={envLocked ? 0 : objectTranslationY}
                  max={100}
                  min={-100}
                  step={0.1}
                  formatValue={(v) => `${v.toFixed(1)}`}
                  editKey="objectTranslationY"
                  disabled={envLocked}
                  disabledTooltip={dict.detailPanel.lockedByEnvironment}
                />

                <hr className="my-4 h-px bg-neutral-300 dark:bg-neutral-600 w-full border-none" />

                <Slider
                  label={dict.detailPanel.tiltUpDown}
                  value={objectRotationX}
                  onChange={sliderSetters.objectRotationX}
                  max={Math.PI}
                  min={-Math.PI}
                  step={0.001}
                  editKey="objectRotationX"
                />

                <Slider
                  label={dict.detailPanel.turnLeftRight}
                  value={objectRotationY}
                  onChange={sliderSetters.objectRotationY}
                  max={Math.PI}
                  min={-Math.PI}
                  step={0.001}
                  editKey="objectRotationY"
                />

                <Slider
                  label={dict.detailPanel.roll}
                  value={objectRotationZ}
                  onChange={sliderSetters.objectRotationZ}
                  max={Math.PI}
                  min={-Math.PI}
                  step={0.001}
                  editKey="objectRotationZ"
                />
              </Accordion>

              <Accordion label={dict.detailPanel.camera}>
                <Slider
                  label={dict.detailPanel.fieldOfView}
                  value={cameraFieldOfView}
                  onChange={sliderSetters.cameraFieldOfView}
                  max={Math.PI - 0.1}
                  min={0.4}
                  step={0.001}
                  error={errors.cameraFieldOfView}
                  formatValue={(v) => `${v.toFixed(1)}°`}
                  editKey="cameraFieldOfView"
                />

                <Slider
                  label={dict.detailPanel.movementSpeed}
                  value={cameraSpeed}
                  onChange={sliderSetters.cameraSpeed}
                  max={0.5}
                  min={0}
                  step={0.001}
                  error={errors.cameraSpeed}
                  editKey="cameraSpeed"
                />
                <Slider
                  label={dict.detailPanel.damping}
                  value={cameraDampingFactor}
                  onChange={sliderSetters.cameraDampingFactor}
                  max={1}
                  min={0}
                  step={0.001}
                  error={errors.cameraDampingFactor}
                  editKey="cameraDampingFactor"
                />
              </Accordion>

              <Accordion label={dict.detailPanel.light}>
                <Slider
                  label={dict.detailPanel.mainLight}
                  value={directionalLightIntensity}
                  onChange={sliderSetters.directionalLightIntensity}
                  max={1}
                  min={0}
                  step={0.01}
                  error={errors.directionalLightIntensity}
                  editKey="directionalLightIntensity"
                />

                <Slider
                  label={dict.detailPanel.lightLeftRight}
                  value={diffuseLightPositionX}
                  onChange={sliderSetters.diffuseLightPositionX}
                  max={10}
                  min={-10}
                  step={0.1}
                  formatValue={(v) => `${v.toFixed(1)}`}
                  editKey="diffuseLightPositionX"
                />
                <Slider
                  label={dict.detailPanel.lightUpDown}
                  value={diffuseLightPositionY}
                  onChange={sliderSetters.diffuseLightPositionY}
                  max={10}
                  min={-10}
                  step={0.1}
                  formatValue={(v) => `${v.toFixed(1)}`}
                  editKey="diffuseLightPositionY"
                />
                <Slider
                  label={dict.detailPanel.lightForwardBack}
                  value={diffuseLightPositionZ}
                  onChange={sliderSetters.diffuseLightPositionZ}
                  error={errors.diffuseLightPositionZ}
                  max={10}
                  min={-10}
                  step={0.1}
                  formatValue={(v) => `${v.toFixed(1)}`}
                  editKey="diffuseLightPositionZ"
                />

                <Slider
                  label={dict.detailPanel.overallBrightness}
                  value={ambientLight}
                  onChange={sliderSetters.ambientLight}
                  max={1}
                  min={0}
                  step={0.01}
                  error={errors.ambientLight}
                  editKey="ambientLight"
                />
              </Accordion>

              <Accordion label={dict.detailPanel.environment}>
                <p className="text-sm text-neutral-600 dark:text-neutral-400 -mt-1 mb-3">
                  {dict.detailPanel.environmentDescription}
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {environmentOptions.map((option) => {
                    const active = option.value === environmentPreset;
                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() =>
                          setValue("environmentPreset", option.value)
                        }
                        className={clsx(
                          "rounded-md border p-2 text-start transition-colors focus:outline-none focus:ring-1 focus:ring-blue-500",
                          active
                            ? "border-blue-500 bg-blue-50 dark:bg-blue-950/30"
                            : "border-neutral-300 dark:border-neutral-600 hover:border-neutral-400 dark:hover:border-neutral-500",
                        )}
                      >
                        <div
                          className={clsx(
                            "h-8 rounded-sm mb-2",
                            option.previewClass,
                          )}
                          style={
                            option.previewImage
                              ? {
                                  backgroundImage: `url(${option.previewImage})`,
                                }
                              : option.previewStyle
                          }
                        />
                        <div className="text-xs text-neutral-700 dark:text-neutral-200 leading-tight">
                          {option.label}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </Accordion>

              <div className="mt-4 flex flex-col gap-4">
                <label className="flex flex-col gap-1">
                  <span className="text-sm font-medium text-neutral-700 dark:text-neutral-200">
                    {dict.languageSwitcher.language}
                  </span>
                  <SelectBox
                    size="sm"
                    fullWidth
                    value={locale}
                    onValueChange={(value) => switchLanguage(value as Locale)}
                    leftIcon={
                      <span
                        className={`fi fi-${LOCALE_TO_FLAG[locale]} rounded-sm`}
                      />
                    }
                    options={locales.map((loc) => ({
                      value: loc,
                      label: dict.languageSwitcher[loc],
                      icon: (
                        <span
                          className={`fi fi-${LOCALE_TO_FLAG[loc]} rounded-sm`}
                        />
                      ),
                    }))}
                  />
                </label>

                <label className="flex flex-col gap-1">
                  <span className="text-sm font-medium text-neutral-700 dark:text-neutral-200">
                    {dict.theme.label}
                  </span>
                  <SelectBox
                    size="sm"
                    fullWidth
                    value={theme}
                    onValueChange={(value) => setTheme(value as Theme)}
                    leftIcon={currentTheme.icon}
                    options={themeOptions.map((opt) => ({
                      value: opt.value,
                      label: opt.label,
                      icon: opt.icon,
                    }))}
                  />
                </label>
              </div>
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent
          value="help"
          className="mt-3 min-h-0 min-w-0 flex-1 data-[state=inactive]:hidden"
        >
          <ScrollArea className="h-full">
            <div className="flex min-w-0 flex-col gap-4 ps-2 pe-3 pt-1 pb-1">
              {mode === "Editing" && (
                <div className="flex flex-col gap-2">
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">
                    {dict.detailPanel.restartTutorialDescription}
                  </p>
                  <Button
                    variant={"outlined"}
                    onClick={async () => {
                      setOpen(false);
                      setHasCompletedTutorial(false);
                    }}
                  >
                    {dict.detailPanel.restartTutorial}
                  </Button>
                </div>
              )}

              <Button
                variant="outlined"
                size="sm"
                leftIcon={<ChatBubbleIcon />}
                onClick={async () => {
                  setOpen(false);
                  const form = await feedback?.createForm({
                    formTitle: dict.feedback.formTitle,
                    showName: false,
                    showEmail: false,
                    messageLabel: dict.feedback.messageLabel,
                    messagePlaceholder: dict.feedback.messagePlaceholder,
                    submitButtonLabel: dict.feedback.submitButtonLabel,
                    cancelButtonLabel: dict.feedback.cancelButtonLabel,
                    successMessageText: dict.feedback.successMessageText,
                    isRequiredLabel: dict.feedback.isRequiredLabel,
                    addScreenshotButtonLabel:
                      dict.feedback.addScreenshotButtonLabel,
                    removeScreenshotButtonLabel:
                      dict.feedback.removeScreenshotButtonLabel,
                  });
                  form?.appendToDom();
                  const feedbackEl = document.getElementById("sentry-feedback");
                  if (feedbackEl?.shadowRoot) {
                    const style = document.createElement("style");
                    style.textContent =
                      ".dialog__position { inset: max(var(--page-margin), env(safe-area-inset-top, 0px)) max(var(--page-margin), env(safe-area-inset-right, 0px)) max(var(--page-margin), env(safe-area-inset-bottom, 0px)) max(var(--page-margin), env(safe-area-inset-left, 0px)) !important; }";
                    feedbackEl.shadowRoot.prepend(style);
                  }
                  form?.open();
                }}
              >
                {dict.detailPanel.reportAnIssue}
              </Button>

              <div className="text-sm text-neutral-600 dark:text-neutral-400">
                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                  {tJsx(dict.detailPanel.referToUsageGuide, {
                    link: (
                      <a
                        key="usage-guide-link"
                        href={`/${locale}/guides/usage_guide`}
                        target="_blank"
                        rel="noopener noreferrer"
                        title={dict.detailPanel.usageGuide}
                        className="text-blue-600 dark:text-blue-400 hover:underline"
                        onClick={(e) => {
                          if (isNativeWebview()) {
                            e.preventDefault();
                            openExternalUrl(`/${locale}/guides/usage_guide`);
                          }
                        }}
                      >
                        {dict.detailPanel.usageGuide}
                      </a>
                    ),
                  })}
                  {locale === "en" &&
                    tJsx(dict.detailPanel.orJoinDiscord, {
                      link: (
                        <a
                          key="discord-link"
                          href="https://discord.gg/2egvhmqdza"
                          className="text-blue-600 dark:text-blue-400 hover:underline"
                          target="_blank"
                          rel="noreferrer"
                        >
                          {dict.detailPanel.discordServer}
                        </a>
                      ),
                    })}
                </p>
                <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
                  <a
                    href={`/${locale}/changelog`}
                    target="_blank"
                    rel="noopener noreferrer"
                    title={dict.changelog.title}
                    className="text-blue-600 dark:text-blue-400 hover:underline"
                    onClick={(e) => {
                      if (isNativeWebview()) {
                        e.preventDefault();
                        openExternalUrl(`/${locale}/changelog`);
                      }
                    }}
                  >
                    {dict.changelog.viewChangelog}
                  </a>
                </p>
              </div>

              {/* Two separate ways to help — the app-install ask and the tip ask
                  are kept apart so neither reads as a condition of the other.
                  Stacked (not side-by-side) to fit the narrow panel. Both link
                  out of the app (store pages and an external tip page), so the
                  whole block is hidden in the native webview where external
                  purchase/tip links are blocked and risk App Store 3.1.1
                  rejection. */}
              {!isNativeWebview() && (
                <div className="flex flex-col gap-4">
                  <div>
                    <p className="mb-2 text-sm font-medium text-neutral-700 dark:text-neutral-200">
                      {dict.home.supportAppTitle}
                    </p>
                    <StoreBadges
                      source="settings"
                      size="sm"
                      appStoreAlt={dict.home.appStoreAlt}
                      playStoreAlt={dict.home.playStoreAlt}
                    />
                  </div>

                  <div>
                    <p className="mb-2 text-sm font-medium text-neutral-700 dark:text-neutral-200">
                      {dict.home.supportTipTitle}
                    </p>
                    <CoffeeButton
                      source="settings"
                      label={dict.home.buyMeACoffee}
                    />
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
};
