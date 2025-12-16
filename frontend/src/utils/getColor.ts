export const colors = [
  "bg-violet-200 text-violet-700 outline-violet-700",
  "bg-blue-200 text-blue-700 outline-blue-700",
  "bg-cyan-200 text-cyan-700 outline-cyan-700",
  "bg-green-200 text-green-700 outline-green-700",
  "bg-yellow-200 text-yellow-700 outline-yellow-700",
  "bg-orange-200 text-orange-700 outline-orange-700",
  "bg-amber-200 text-amber-700 outline-amber-700",
  "bg-red-200 text-red-700 outline-red-700",
];

export const getColor = (color: number) => {
  if (color >= 0 && color < colors.length) {
    return colors[color];
  }
  return colors[Math.floor(Math.random() * colors.length)];
};
