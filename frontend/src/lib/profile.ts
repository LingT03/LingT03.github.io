/**
 * Profile constants — single source of truth for personal info displayed on
 * the Home sidebar, footer, and meta tags. Edit this file to update the
 * site owner's identity in one place.
 */

export const PROFILE = {
  name: "Ling Thang",
  shortName: "Ling._.T",
  bio: "Aspiring researcher interested in causal machine learning and computational social science research and modeling.",
  email: "lingthang03@gmail.com",
  links: {
    github: "https://github.com/LingT03",
    linkedin: "https://www.linkedin.com/in/ling-thang-686a52213/",
    leetcode: "https://leetcode.com/u/Ling_T_/",
    deepml: "https://www.deep-ml.com/profile/p2W48UqGgWgLmhytGWa1RMvirXA2",
  },
  // Avatar path under /public; replace with your own image.
  avatarUrl: "/avatar-placeholder.png",
} as const;

export type ProfileLinkKey = keyof typeof PROFILE.links;
