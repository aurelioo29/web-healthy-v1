import { createNavigation } from "next-intl/navigation";

export const locales = ["en", "id"];

export const { Link, usePathname, useRouter } = createNavigation({ locales });
