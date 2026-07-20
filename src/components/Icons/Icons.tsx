import { SVGProps } from "react";

export const ColorPickerIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={24} height={24} {...props}>
    <path
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="m11 7 6 6M4 16 15.7 4.3a1 1 0 0 1 1.4 0l2.6 2.6a1 1 0 0 1 0 1.4L8 20H4z"
    />
  </svg>
);

export const PartsFilterIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024" {...props}>
    <path
      fill="currentColor"
      fillOpacity={0.15}
      d="M512 318c-79.2 0-148.5-48.8-176.7-120H182v196h119v432h422V394h119V198H688.7c-28.2 71.2-97.5 120-176.7 120"
    />
    <path
      fill="currentColor"
      d="M870 126H663.8c-17.4 0-32.9 11.9-37 29.3C614.3 208.1 567 246 512 246s-102.3-37.9-114.8-90.7a37.93 37.93 0 0 0-37-29.3H154a44 44 0 0 0-44 44v252a44 44 0 0 0 44 44h75v388a44 44 0 0 0 44 44h478a44 44 0 0 0 44-44V466h75a44 44 0 0 0 44-44V170a44 44 0 0 0-44-44m-28 268H723v432H301V394H182V198h153.3c28.2 71.2 97.5 120 176.7 120s148.5-48.8 176.7-120H842z"
    />
  </svg>
);

export const PaintCanIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" {...props}>
    <path
      fill="currentColor"
      d="m19.228 18.732 1.767-1.767 1.768 1.767a2.5 2.5 0 1 1-3.535 0M8.878 1.08l11.314 11.313a1 1 0 0 1 0 1.415l-8.485 8.485a1 1 0 0 1-1.414 0l-8.485-8.485a1 1 0 0 1 0-1.415l7.778-7.778-2.122-2.121zM11 6.03 3.929 13.1l7.07 7.072 7.072-7.071z"
    />
  </svg>
);

export const PenToolIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" {...props}>
    <path
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 20h9M16.376 3.622a1 1 0 0 1 3.002 3.002L7.368 18.635a2 2 0 0 1-.855.506l-2.872.838a.5.5 0 0 1-.62-.62l.838-2.872a2 2 0 0 1 .506-.854z"
    />
  </svg>
);

export const EraserIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" {...props}>
    <path
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={4}
      d="M4 42h40M31 4 7 28l6 6h8l20-20z"
    />
  </svg>
);

export const GearIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" {...props}>
    <g fill="currentColor">
      <path
        d="m207.86 123.18 16.78-21a99 99 0 0 0-10.07-24.29l-26.7-3a81 81 0 0 0-6.81-6.81l-3-26.71a99.4 99.4 0 0 0-24.3-10l-21 16.77a82 82 0 0 0-9.64 0l-21-16.78a99 99 0 0 0-24.21 10.07l-3 26.7a81 81 0 0 0-6.81 6.81l-26.71 3a99.4 99.4 0 0 0-10 24.3l16.77 21a82 82 0 0 0 0 9.64l-16.78 21a99 99 0 0 0 10.07 24.29l26.7 3a81 81 0 0 0 6.81 6.81l3 26.71a99.4 99.4 0 0 0 24.3 10l21-16.77a82 82 0 0 0 9.64 0l21 16.78a99 99 0 0 0 24.29-10.07l3-26.7a81 81 0 0 0 6.81-6.81l26.71-3a99.4 99.4 0 0 0 10-24.3l-16.77-21a82 82 0 0 0-.08-9.64M128 168a40 40 0 1 1 40-40 40 40 0 0 1-40 40"
        opacity={0.2}
      />
      <path d="M128 80a48 48 0 1 0 48 48 48.05 48.05 0 0 0-48-48m0 80a32 32 0 1 1 32-32 32 32 0 0 1-32 32m88-29.84q.06-2.16 0-4.32l14.92-18.64a8 8 0 0 0 1.48-7.06 107.6 107.6 0 0 0-10.88-26.25 8 8 0 0 0-6-3.93l-23.72-2.64q-1.48-1.56-3-3L186 40.54a8 8 0 0 0-3.94-6 107.3 107.3 0 0 0-26.25-10.86 8 8 0 0 0-7.06 1.48L130.16 40h-4.32L107.2 25.11a8 8 0 0 0-7.06-1.48 107.6 107.6 0 0 0-26.25 10.88 8 8 0 0 0-3.93 6l-2.64 23.76q-1.56 1.49-3 3L40.54 70a8 8 0 0 0-6 3.94 107.7 107.7 0 0 0-10.87 26.25 8 8 0 0 0 1.49 7.06L40 125.84v4.32L25.11 148.8a8 8 0 0 0-1.48 7.06 107.6 107.6 0 0 0 10.88 26.25 8 8 0 0 0 6 3.93l23.72 2.64q1.49 1.56 3 3L70 215.46a8 8 0 0 0 3.94 6 107.7 107.7 0 0 0 26.25 10.87 8 8 0 0 0 7.06-1.49L125.84 216q2.16.06 4.32 0l18.64 14.92a8 8 0 0 0 7.06 1.48 107.2 107.2 0 0 0 26.25-10.88 8 8 0 0 0 3.93-6l2.64-23.72q1.56-1.48 3-3l23.78-2.8a8 8 0 0 0 6-3.94 107.7 107.7 0 0 0 10.87-26.25 8 8 0 0 0-1.49-7.06Zm-16.1-6.5a74 74 0 0 1 0 8.68 8 8 0 0 0 1.74 5.48l14.19 17.73a91.6 91.6 0 0 1-6.23 15l-22.6 2.56a8 8 0 0 0-5.1 2.64 74 74 0 0 1-6.14 6.14 8 8 0 0 0-2.64 5.1l-2.51 22.58a91.3 91.3 0 0 1-15 6.23l-17.74-14.19a8 8 0 0 0-5-1.75h-.48a74 74 0 0 1-8.68 0 8.06 8.06 0 0 0-5.48 1.74l-17.78 14.2a91.6 91.6 0 0 1-15-6.23L82.89 187a8 8 0 0 0-2.64-5.1 74 74 0 0 1-6.14-6.14 8 8 0 0 0-5.1-2.64l-22.58-2.52a91.3 91.3 0 0 1-6.23-15l14.19-17.74a8 8 0 0 0 1.74-5.48 74 74 0 0 1 0-8.68 8 8 0 0 0-1.74-5.48L40.2 100.45a91.6 91.6 0 0 1 6.23-15L69 82.89a8 8 0 0 0 5.1-2.64 74 74 0 0 1 6.14-6.14A8 8 0 0 0 82.89 69l2.51-22.57a91.3 91.3 0 0 1 15-6.23l17.74 14.19a8 8 0 0 0 5.48 1.74 74 74 0 0 1 8.68 0 8.06 8.06 0 0 0 5.48-1.74l17.77-14.19a91.6 91.6 0 0 1 15 6.23L173.11 69a8 8 0 0 0 2.64 5.1 74 74 0 0 1 6.14 6.14 8 8 0 0 0 5.1 2.64l22.58 2.51a91.3 91.3 0 0 1 6.23 15l-14.19 17.74a8 8 0 0 0-1.74 5.53Z" />
    </g>
  </svg>
);

export const PreviewIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" {...props}>
    <path
      fill="currentColor"
      d="m2 12 1 3c2 3 5 5 9 5s7-2 9-5l1-3-1-3c-2-2-5-5-9-5S5 7 3 9l-1 3"
      opacity={0.5}
    />
    <path
      fill="currentColor"
      fillRule="evenodd"
      d="M8 12a4 4 0 1 1 8 0 4 4 0 0 1-8 0m2 0a2 2 0 1 1 4 0 2 2 0 0 1-4 0"
      clipRule="evenodd"
    />
  </svg>
);

export const EditorIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" {...props}>
    <path fill="currentColor" d="m15 12-8 7H6v-1l7-8z" opacity={0.3} />
    <path
      fill="currentColor"
      d="m19 10 1-1V7l-1-2h-3l-1 1zm-4 2-8 7H6v-1l7-8zm-2-4-9 9v4h4l9-9zm6 10c0 2-3 3-5 3l-1-1 1-1 3-1-1-2 1-1c1 0 2 1 2 3M5 13l-2-2c0-2 2-3 4-3l2-2-2-1-2 1H4a1 1 0 0 1 0-2l3-1c2 0 4 1 4 3S9 9 7 9l-2 2 1 1z"
    />
  </svg>
);

export const AnimationIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 100 100"
    {...props}
  >
    <path
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={6}
      paintOrder="stroke"
      fill="none"
      d="m84.157 44.463-5.104 8.468L60 41.446v21.898l9.314 28.181-10.218 3.378-9.585-29h-.02l-10.962 28.87-10.06-3.82L40 60.58V41.446L20.947 52.931l-5.104-8.468L40 29.903h20l24.157 14.56ZM61 25.903H39v-21h22v21Z"
    />
    <path
      fill="currentColor"
      opacity={0.3}
      d="m84.157 44.463-5.104 8.468L60 41.446v21.898l9.314 28.181-10.218 3.378-9.585-29h-.02l-10.962 28.87-10.06-3.82L40 60.58V41.446L20.947 52.931l-5.104-8.468L40 29.903h20l24.157 14.56ZM61 25.903H39v-21h22v21Z"
    />
  </svg>
);

export const CursorFollowIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    {...props}
  >
    <path
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      paintOrder="stroke"
      fill="none"
      d="M6 4l11 8.25-4.3 1.2 2.75 4.7-2 1.2-2.75-4.7L8 17.5z"
    />
    <path
      fill="currentColor"
      opacity={0.3}
      d="M6 4l11 8.25-4.3 1.2 2.75 4.7-2 1.2-2.75-4.7L8 17.5z"
    />
  </svg>
);
export const VariationIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" {...props}>
    <g fill="currentColor">
      <path
        d="m225 65-69 59 16.69 16.69a16 16 0 0 1 0 22.62L152 184l-80-80 20.69-20.69a16 16 0 0 1 22.62 0L132 100l59-69a24 24 0 0 1 34 34"
        opacity={0.2}
      />
      <path d="M230.64 25.36a32 32 0 0 0-45.26 0q-.21.21-.42.45l-53.41 62.41L121 77.64a24 24 0 0 0-33.95 0l-76.69 76.7a8 8 0 0 0 0 11.31l80 80a8 8 0 0 0 11.31 0L178.36 169a24 24 0 0 0 0-33.95l-10.58-10.57L230.19 71c.15-.14.31-.28.45-.43a32 32 0 0 0 0-45.21M96 228.69 79.32 212l22.34-22.35a8 8 0 0 0-11.31-11.31L68 200.68 55.32 188l22.34-22.35a8 8 0 0 0-11.31-11.31L44 176.68 27.31 160 72 115.31 140.69 184ZM219.52 59.1l-68.71 58.81a8 8 0 0 0-.46 11.74L167 146.34a8 8 0 0 1 0 11.31l-15 15L83.32 104l15-15a8 8 0 0 1 11.31 0l16.69 16.69a8 8 0 0 0 11.74-.46l58.84-68.75a16 16 0 0 1 22.62 22.62" />
    </g>
  </svg>
);

export const InfoCircle = (props: SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={24} height={24} {...props}>
    <g fill="none">
      <circle cx={12} cy={12} r={9} fill="currentColor" opacity={0.16} />
      <circle
        cx={12}
        cy={12}
        r={9}
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
      />
      <path
        stroke="currentColor"
        strokeLinejoin="round"
        strokeWidth={3}
        d="M12 8h.01v.01H12z"
      />
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 12v4"
      />
    </g>
  </svg>
);

export const Close = (props: SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" {...props}>
    <path
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="m7 7 10 10M7 17 17 7"
    />
  </svg>
);

export const GridIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 100 100"
    {...props}
  >
    <path
      fill="currentColor"
      d="M36.451 8v23.033h25.742V8h5.42v23.033H92v5.418H67.613v25.742H92v5.42H67.613V92h-5.42V67.613H36.451V92h-5.418V67.613H8v-5.42h23.033V36.451H8v-5.418h23.033V8h5.418Zm0 54.193h25.742V36.451H36.451v25.742Z"
    />
  </svg>
);

export const ScreenshotIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" {...props}>
    <path
      fill="currentColor"
      opacity={0.3}
      d="M20 4h-3.17L15 2H9L7.17 4H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2"
    />
    <path
      fill="currentColor"
      d="M20 4h-3.17L15 2H9L7.17 4H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2m0 14H4V6h4.05l1.83-2h4.24l1.83 2H20zM12 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10m0 8a3 3 0 1 1 0-6 3 3 0 0 1 0 6"
    />
  </svg>
);

export const RecordIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" {...props}>
    <path
      fill="currentColor"
      opacity={0.3}
      d="M17 10.5V7a1 1 0 0 0-1-1H4a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-3.5l4 4v-11z"
    />
    <path
      fill="currentColor"
      d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11zm-2 3.67V16H5V8h10v2.83l2-2v6.34z"
    />
    <circle cx={9} cy={12} r={2.4} fill="currentColor" />
  </svg>
);

export const TouchDrawIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 28 28" {...props}>
    <path
      fill="currentColor"
      d="M12.772 2.994c1.662-.018 3.835-.042 5.663.158 1.018.111 1.86.285 2.427.533.592.258.638.473.638.565 0 .137-.05.301-.41.501-.384.214-.997.386-1.838.507-1.669.24-3.92.242-6.252.242h-.045c-2.279 0-4.633 0-6.421.258-.894.129-1.726.332-2.353.68C3.528 6.802 3 7.389 3 8.25c0 .659.339 1.164.757 1.518.407.345.929.585 1.442.756 1.032.344 2.24.476 3.05.476H9V9.5h-.75c-.69 0-1.731-.117-2.575-.399-.424-.141-.746-.307-.948-.478-.191-.162-.227-.281-.227-.373 0-.137.05-.3.41-.5.384-.214.998-.386 1.838-.507C8.417 7.002 10.668 7 13 7h.045c2.279 0 4.634 0 6.421-.257.894-.13 1.726-.332 2.354-.681.652-.363 1.18-.949 1.18-1.812 0-1.017-.782-1.61-1.538-1.94-.78-.34-1.805-.534-2.865-.65-1.924-.21-4.19-.184-5.839-.166l-.515.006a.75.75 0 1 0 .014 1.5zM13.75 8A2.75 2.75 0 0 0 11 10.75v5.337c-1.276-.471-2.382-.479-3.297-.131-1.16.44-1.86 1.391-2.165 2.307a.75.75 0 0 0 .346.892l4.555 2.551a6.25 6.25 0 0 1 2.373 2.352l.353.618a2.75 2.75 0 0 0 2.813 1.353l2.781-.435a2.75 2.75 0 0 0 2.264-2.138l1.029-4.772a3.75 3.75 0 0 0-3.153-4.506l-2.399-.331v-3.096A2.75 2.75 0 0 0 13.75 8m-1.25 2.75a1.25 1.25 0 1 1 2.5 0v3.75a.75.75 0 0 0 .647.743l3.047.421a2.25 2.25 0 0 1 1.891 2.703l-1.029 4.773a1.25 1.25 0 0 1-1.029.972l-2.781.435a1.25 1.25 0 0 1-1.279-.615l-.353-.618a7.75 7.75 0 0 0-2.942-2.917l-3.947-2.21c.233-.359.57-.662 1.01-.829.642-.244 1.66-.255 3.16.553a.75.75 0 0 0 1.105-.66z"
    />
  </svg>
);

export const TouchViewIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" {...props}>
    <g fill="currentColor">
      <path
        d="M208 76v76a80 80 0 0 1-80 80c-44.18 0-60.75-21.28-93.32-90a20 20 0 0 1 34.64-20L88 152V60a20 20 0 0 1 40 0V44a20 20 0 0 1 40 0v32a20 20 0 0 1 40 0"
        opacity={0.2}
      />
      <path d="M188 48a27.75 27.75 0 0 0-12 2.71V44a28 28 0 0 0-54.65-8.6A28 28 0 0 0 80 60v64l-3.82-6.13a28 28 0 0 0-48.6 27.82c16 33.77 28.93 57.72 43.72 72.69C86.24 233.54 103.2 240 128 240a88.1 88.1 0 0 0 88-88V76a28 28 0 0 0-28-28m12 104a72.08 72.08 0 0 1-72 72c-20.38 0-33.51-4.88-45.33-16.85C69.44 193.74 57.26 171 41.9 138.58a6 6 0 0 0-.3-.58 12 12 0 0 1 20.79-12 2 2 0 0 0 .14.23l18.67 30A8 8 0 0 0 96 152V60a12 12 0 0 1 24 0v60a8 8 0 0 0 16 0V44a12 12 0 0 1 24 0v76a8 8 0 0 0 16 0V76a12 12 0 0 1 24 0Z" />
    </g>
  </svg>
);
