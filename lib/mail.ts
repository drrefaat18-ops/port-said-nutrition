export function standSize(area: string) {
  const [w, d] = area.split("X").map(Number);
  return { w, d };
}

export const logoScale = (logo: string) => parseInt(logo, 10);

export const rollUpCount = (t: { rollUps?: string }) => (t.rollUps ? parseInt(t.rollUps, 10) : 0);

export function mailHref(email: string, tier?: string) {
  const subject = `Port Said Nutrition Conference sponsorship${tier ? ` - ${tier}` : ""}`;
  return `mailto:${email}?subject=${encodeURIComponent(subject)}`;
}
