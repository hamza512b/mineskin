import React from "react";
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
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" {...props}>
    <path
      fill="currentColor"
      d="M5 12a5 5 0 0 0 7 7c-4 0-7-3-7-7m10-8-3 1c4 0 7 3 7 7a5 5 0 0 0-4-8"
      opacity={0.3}
    />
    <path
      fill="currentColor"
      d="M12 7h-2v2a5 5 0 0 0 7 5v-2c0-3-2-5-5-5"
      opacity={0.3}
    />
    <path
      fill="currentColor"
      d="M8 9a5 5 0 0 0 7 7c-4 0-7-3-7-7"
      opacity={0.3}
    />
    <path
      fill="currentColor"
      d="M15 2c-3 0-5 2-6 4a7 7 0 0 0-3 3 7 7 0 0 0-4 6 7 7 0 0 0 13 3 7 7 0 0 0 3-3 7 7 0 0 0 4-6c0-4-3-7-7-7M9 20a5 5 0 0 1-4-8c0 4 3 7 7 7l-3 1m3-3a5 5 0 0 1-4-8c0 4 3 7 7 7l-3 1m5-3h-2a5 5 0 0 1-5-7h2a5 5 0 0 1 5 7m2-2c0-4-3-7-7-7a5 5 0 0 1 7 7"
    />
  </svg>
);
