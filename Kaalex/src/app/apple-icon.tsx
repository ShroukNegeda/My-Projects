import { ImageResponse } from "next/og";

export const size = {
  width: 180,
  height: 180,
};
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <svg
          width="112"
          height="112"
          viewBox="220 0 740 650"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M250 20H420V325H350C295 325 250 280 250 225V20ZM420 360L685 45H930L492 543H250V430C250 391 282 360 320 360H420ZM638 420L842 625H586L518 554L638 420Z"
            fill="#9fd400"
          />
        </svg>
      </div>
    ),
    {
      ...size,
    }
  );
}
