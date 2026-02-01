import Accordion from "@/components/Accordion/Accordion";
import Button from "@/components/Button";
import Dropdown, { DropdownItem } from "@/components/Dropdown";
import Slider from "@/components/Slider/Slider";
import ToggleSwitch from "@/components/ToggleSwtich/ToggleSwtich";
import { useRendererStore } from "@/hooks/useRendererState";
import { locales, tJsx, useDictionary, type Locale } from "@/i18n";
import { CheckIcon, GlobeIcon } from "@radix-ui/react-icons";
import clsx from "clsx";
import { usePathname, useRouter } from "next/navigation";
import { useConfirmation } from "../Confirmation/Confirmation";

export interface DetailPanelProps {
  className?: string;
  open: boolean;
  setOpen: (open: boolean) => void;
  exitButton?: React.ReactNode;
  reset: (() => void) | undefined;
  mode: "Editing" | "Preview";
}

export const DetailPanelContent: React.FC<DetailPanelProps> = ({
  className,
  exitButton,
  setOpen,
  mode,
}) => {
  const { dictionary: dict, locale } = useDictionary();
  const pathname = usePathname();
  const router = useRouter();

  const switchLanguage = (newLocale: Locale) => {
    if (newLocale === locale) return;
    // Mark language detection as dismissed when user actively switches language
    localStorage.setItem("language-detection-dismissed", "true");
    const newPath = pathname.replace(`/${locale}`, `/${newLocale}`);
    router.push(newPath);
  };
  // Use Zustand store with selective subscriptions
  const errors = useRendererStore((state) => state.errors);
  const handleChange = useRendererStore((state) => state.handleChange);
  const skinIsPocket = useRendererStore((state) => state.values.skinIsPocket);
  const diffuseStrength = useRendererStore(
    (state) => state.values.diffuseStrength,
  );
  const specularStrength = useRendererStore(
    (state) => state.values.specularStrength,
  );
  const objectTranslationX = useRendererStore(
    (state) => state.values.objectTranslationX,
  );
  const objectTranslationZ = useRendererStore(
    (state) => state.values.objectTranslationZ,
  );
  const objectTranslationY = useRendererStore(
    (state) => state.values.objectTranslationY,
  );
  const objectRotationX = useRendererStore(
    (state) => state.values.objectRotationX,
  );
  const objectRotationY = useRendererStore(
    (state) => state.values.objectRotationY,
  );
  const objectRotationZ = useRendererStore(
    (state) => state.values.objectRotationZ,
  );
  const cameraFieldOfView = useRendererStore(
    (state) => state.values.cameraFieldOfView,
  );
  const cameraSpeed = useRendererStore((state) => state.values.cameraSpeed);
  const cameraDampingFactor = useRendererStore(
    (state) => state.values.cameraDampingFactor,
  );
  const directionalLightIntensity = useRendererStore(
    (state) => state.values.directionalLightIntensity,
  );
  const ambientLight = useRendererStore((state) => state.values.ambientLight);
  const diffuseLightPositionX = useRendererStore(
    (state) => state.values.diffuseLightPositionX,
  );
  const diffuseLightPositionZ = useRendererStore(
    (state) => state.values.diffuseLightPositionZ,
  );
  const diffuseLightPositionY = useRendererStore(
    (state) => state.values.diffuseLightPositionY,
  );
  const variationIntensity = useRendererStore(
    (state) => state.values.variationIntensity,
  );

  const { getConfirmation } = useConfirmation();
  const setHasCompletedTutorial = useRendererStore(
    (state) => state.setHasCompletedTutorial,
  );

  return (
    <div
      className={clsx(
        "relative overflow-hidden border bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-transparent dark:border-gray-700 p-5 overflow-y-auto shadow-lg h-full select-none rounded-lg",
        className,
      )}
    >
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold dark:text-slate-100 text-slate-900">
          {dict.common.settings}
        </h3>
        {exitButton}
      </div>

      <fieldset className="mb-4 p-4 border border-slate-700 rounded-lg">
        <legend className="text-lg font-semibold px-2">
          {dict.detailPanel.mode}
        </legend>
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
              if (confirmed)
                handleChange("skinIsPocket", checked, "PocketSwitch");
            });
          }}
        />
      </fieldset>

      {mode === "Editing" && (
        <Accordion label={dict.detailPanel.paint}>
          <Slider
            label={dict.detailPanel.variationToolIntensity}
            value={variationIntensity}
            onChange={(value) => handleChange("variationIntensity", value)}
            max={1}
            min={0.05}
            step={0.01}
            error={errors.variationIntensity}
            editKey="variationIntensity"
          />
        </Accordion>
      )}

      <Accordion label={dict.detailPanel.skin}>
        <Slider
          label={dict.detailPanel.surfaceBrightness}
          value={diffuseStrength}
          onChange={(value) => handleChange("diffuseStrength", value)}
          max={1}
          min={0}
          step={0.01}
          error={errors.diffuseStrength}
          editKey="diffuseStrength"
        />

        <Slider
          label={dict.detailPanel.shineGlossiness}
          value={specularStrength}
          onChange={(value) => handleChange("specularStrength", value)}
          max={1}
          min={0}
          step={0.01}
          error={errors.specularStrength}
          editKey="specularStrength"
        />

        <hr className="my-4 h-px bg-slate-300 dark:bg-slate-600 w-full border-none" />

        <Slider
          label={dict.detailPanel.moveLeftRight}
          value={objectTranslationX}
          onChange={(value) => handleChange("objectTranslationX", value)}
          error={errors.objectTranslationX}
          max={100}
          min={-100}
          step={0.1}
          formatValue={(v) => `${v.toFixed(1)}`}
          editKey="objectTranslationX"
        />
        <Slider
          label={dict.detailPanel.moveForwardBack}
          value={objectTranslationZ}
          onChange={(value) => handleChange("objectTranslationZ", value)}
          error={errors.objectTranslationZ}
          max={100}
          min={-100}
          step={0.1}
          formatValue={(v) => `${v.toFixed(1)}`}
          editKey="objectTranslationZ"
        />
        <Slider
          label={dict.detailPanel.moveUpDown}
          onChange={(value) => handleChange("objectTranslationY", value)}
          error={errors.objectTranslationY}
          value={objectTranslationY}
          max={100}
          min={-100}
          step={0.1}
          formatValue={(v) => `${v.toFixed(1)}`}
          editKey="objectTranslationY"
        />

        <hr className="my-4 h-px bg-slate-300 dark:bg-slate-600 w-full border-none" />

        <Slider
          label={dict.detailPanel.tiltUpDown}
          value={objectRotationX}
          onChange={(value) => handleChange("objectRotationX", value)}
          max={Math.PI}
          min={-Math.PI}
          step={0.001}
          editKey="objectRotationX"
        />

        <Slider
          label={dict.detailPanel.turnLeftRight}
          value={objectRotationY}
          onChange={(value) => handleChange("objectRotationY", value)}
          max={Math.PI}
          min={-Math.PI}
          step={0.001}
          editKey="objectRotationY"
        />

        <Slider
          label={dict.detailPanel.roll}
          value={objectRotationZ}
          onChange={(value) => handleChange("objectRotationZ", value)}
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
          onChange={(value) => handleChange("cameraFieldOfView", value)}
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
          onChange={(value) => handleChange("cameraSpeed", value)}
          max={0.5}
          min={0}
          step={0.001}
          error={errors.cameraSpeed}
          editKey="cameraSpeed"
        />
        <Slider
          label={dict.detailPanel.damping}
          value={cameraDampingFactor}
          onChange={(value) => handleChange("cameraDampingFactor", value)}
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
          onChange={(value) => handleChange("directionalLightIntensity", value)}
          max={1}
          min={0}
          step={0.01}
          error={errors.directionalLightIntensity}
          editKey="directionalLightIntensity"
        />

        <Slider
          label={dict.detailPanel.lightLeftRight}
          value={diffuseLightPositionX}
          onChange={(value) => handleChange("diffuseLightPositionX", value)}
          max={10}
          min={-10}
          step={0.1}
          formatValue={(v) => `${v.toFixed(1)}`}
          editKey="diffuseLightPositionX"
        />
        <Slider
          label={dict.detailPanel.lightUpDown}
          value={diffuseLightPositionY}
          onChange={(value) => handleChange("diffuseLightPositionY", value)}
          max={10}
          min={-10}
          step={0.1}
          formatValue={(v) => `${v.toFixed(1)}`}
          editKey="diffuseLightPositionY"
        />
        <Slider
          label={dict.detailPanel.lightForwardBack}
          value={diffuseLightPositionZ}
          onChange={(value) => handleChange("diffuseLightPositionZ", value)}
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
          onChange={(value) => handleChange("ambientLight", value)}
          max={1}
          min={0}
          step={0.01}
          error={errors.ambientLight}
          editKey="ambientLight"
        />
      </Accordion>

      {mode == "Editing" && (
        <Accordion label={dict.detailPanel.interactiveTutorial}>
          <div className="flex flex-col gap-2 -mt-3">
            <p className="text-sm text-slate-600 dark:text-slate-400">
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
        </Accordion>
      )}

      <div className="flex flex-col gap-4">
        <div className="text-sm text-slate-600 dark:text-slate-400">
          <ul className="mt-4">
            <li className="mb-1">
              {tJsx(dict.detailPanel.reportBug, {
                link: (
                  <a
                    key="github-link"
                    href="https://github.com/hamza512b/minskin/issues"
                    className="text-blue-600 dark:text-blue-400 hover:underline"
                    target="_blank"
                    rel="noreferrer"
                  >
                    {dict.detailPanel.githubRepository}
                  </a>
                ),
              })}
            </li>
            <li className="mb-1">
              {tJsx(dict.detailPanel.orJoinDiscord, {
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
            </li>
          </ul>
          <p className="mt-4 text-sm text-slate-600 dark:text-slate-400">
            {tJsx(dict.detailPanel.referToUsageGuide, {
              link: (
                <a
                  key="usage-guide-link"
                  href={`/${locale}/guides/usage_guide`}
                  title={dict.detailPanel.usageGuide}
                  className="text-blue-600 dark:text-blue-400 hover:underline"
                >
                  {dict.detailPanel.usageGuide}
                </a>
              ),
            })}
          </p>
          <p className="mt-4 text-sm text-slate-600 dark:text-slate-400">
            {tJsx(dict.detailPanel.madeWithLove, {
              link: (
                <a
                  key="author-link"
                  href="https://hamza.se"
                  className="text-blue-600 dark:text-blue-400 hover:underline"
                  target="_blank"
                  rel="noreferrer"
                >
                  Hamza
                </a>
              ),
            })}
          </p>

          <div className="mt-4 flex items-center gap-2">
            <Dropdown
              size="sm"
              align="start"
              trigger={
                <button className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 border border-slate-300 dark:border-slate-600 rounded px-2 py-1 cursor-pointer hover:border-slate-400 dark:hover:border-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500 max-w-[200px]">
                  <GlobeIcon className="w-4 h-4 shrink-0" />
                  <span className="truncate">{dict.languageSwitcher[locale]}</span>
                </button>
              }
            >
              {locales.map((loc) => (
                <DropdownItem
                  key={loc}
                  onSelect={() => switchLanguage(loc)}
                  rightIcon={loc === locale ? <CheckIcon /> : undefined}
                >
                  {dict.languageSwitcher[loc]}
                </DropdownItem>
              ))}
            </Dropdown>
          </div>
        </div>
      </div>
    </div>
  );
};
