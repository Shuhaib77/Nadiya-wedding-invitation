// Edit only this file: all text, date, venue and colours live here.
export const invitation = {
  theme: "maroon", // maroon | emerald | navy | your own below. Preview: /?theme=emerald
  themes: {
    maroon:  { deep: "#6E1423", mid: "#8E1B2E", gold: "#B98A5E", goldl: "#E8CDB0", ivory: "#F6EADF", bg: "#EBD9C8", surface: "#F4E7DB", ink: "#3B0F18", muted: "#8A6A6A", line: "#E6D3C3" },
    emerald: { deep: "#0d4f3c", mid: "#1a7a5e", gold: "#C79A6A", goldl: "#f2c4b8", ivory: "#F4F7F1", bg: "#DDE8DF", surface: "#F3F8F2", ink: "#12352B", muted: "#5F7A70", line: "#d8e4da" },
    navy:    { deep: "#14264F", mid: "#2B4C8C", gold: "#C9A25B", goldl: "#EBD3A0", ivory: "#F5F7FB", bg: "#DCE3EF", surface: "#F4F7FC", ink: "#14213D", muted: "#62708A", line: "#dde3ee" },
  } as Record<string, Record<string, string>>,

  showSwitcher: true, // colour dots for preview; set false before sharing the real link

  intro: "Together with their families request the honor of your presence at the wedding celebration of our beloved daughter",
  bride: "Nadiya",
  groom: "Muhammad Fazil",
  monogram: "N&F",
  groomLine: "S/o. Mr. Kunhablulla & Mrs. Rahmath, Elavana (Ho), Kottapally",
  brideParents: { label: "Daughter of", names: ["Hameed K.M", "Soudha Hameed"] },
  groomParents: { label: "Son of", names: ["Mr. Kunhablulla", "Mrs. Rahmath"] },
  home: "Elavana (Ho), Kottapally",

  event: {
    title: "Wedding Ceremony",
    start: "2027-01-10T11:00:00+05:30", // ISO with timezone offset
    timeZone: "Asia/Kolkata",
    durationHours: 3,
    hijri: "2 Shaban 1448",
    venue: "Kandimannil Meethal (Ho)",
    place: "Edavarad",
    note: "Wedding ceremony",
    mapUrl: "https://www.google.com/maps?q=11.596010,75.729293",
  },
  rsvpBy: "3 January 2027",
  hosts: "Hameed K.M & Soudha Hameed",
  regards: "Best regards: Sahadiya · Jaseer · Izin Zaad . Op Family & Km Family",
  whatsapp: "7511178407", // country code + number, no + sign
};