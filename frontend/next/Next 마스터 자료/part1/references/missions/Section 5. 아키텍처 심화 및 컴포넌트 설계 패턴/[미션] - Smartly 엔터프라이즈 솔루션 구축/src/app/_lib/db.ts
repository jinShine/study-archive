export type Device = { id: string; name: string; category: "light" | "security" | "climate"; status: "on" | "off"; };
export const MOCK_DEVICES: Device[] = [
  { id: "L-101", name: "Living Room Light", category: "light", status: "on" },
  { id: "S-99", name: "Main Door Lock", category: "security", status: "on" },
  { id: "C-42", name: "Bedroom AC", category: "climate", status: "off" },
];
