"use client";
import { useAuth } from "@/hooks/useAuth/useAuth";
import { Button } from "../button";
import { useTranslations } from "next-intl";
import { ChevronDown, LogOutIcon, SettingsIcon } from "lucide-react";
import { Avatar, AvatarFallback } from "../avatar";
import { useMemo } from "react";
import { usePathname, useRouter } from "next/navigation";
import logoSrc from "../../../public/logo.svg";
import Image from "next/image";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useOnborda } from "onborda";

export const Menu = () => {
  return (
    <>
      <div className="h-(--menu-height)"></div>
      <div className="w-full h-(--menu-height) left-0 top-0 fixed z-50 backdrop-blur-md bg-[#071421]/80 border-b border-white/8">
        <div className="container mx-auto">
          <div className="flex items-start justify-between gap-2 px-8">
            <MenuHeader />
            <MenuList />
            <MenuUserSection />
          </div>
        </div>
      </div>
    </>
  );
};

export const Logo = () => {
  return (
    <div className="flex h-(--menu-height) items-center">
      <Image src={logoSrc} alt="Calculadora Indulto Logo" className="h-8" />
    </div>
  );
};

export const MenuHeader = () => {
  return (
    <>
      <Logo />
    </>
  );
};

export const MenuListItem = ({
  icon,
  label,
  path,
  id,
}: {
  icon: React.ReactNode;
  label: string;
  path: string;
  id?: string;
}) => {
  const router = useRouter();
  const pathname = usePathname();
  const pathIsActive = pathname === path;
  return (
    <li id={id}>
      <Button
        variant={pathIsActive ? "outline" : "ghost"}
        size="lg"
        className={`w-full justify-start cursor-pointer rounded-full h-8 text-white ${pathIsActive ? "bg-white/15 border-white/20 text-white" : "hover:bg-white/10"}`}
        onClick={() => router.push(path)}
      >
        <span className="text-xl leading-none">{icon}</span>
        {label}
      </Button>
    </li>
  );
};

const MenuItems: Array<{
  icon: React.ReactNode;
  label: string;
  path: string;
  id?: string;
}> = [
  {
    icon: (
      <i className="material-symbols-outlined material-symbols-outlined-sized leading-none">
        balance
      </i>
    ),
    label: "items.start",
    path: "/",
  },
  {
    icon: (
      <i className="material-symbols-outlined material-symbols-outlined-sized leading-none">
        calculate
      </i>
    ),
    label: "items.calculos",
    path: "/calculos",
  },
  {
    icon: (
      <i className="material-symbols-outlined material-symbols-outlined-sized leading-none">
        people
      </i>
    ),
    label: "items.apenados",
    path: "/apenados",
  },
  {
    icon: (
      <i className="material-symbols-outlined material-symbols-outlined-sized leading-none">
        menu_book
      </i>
    ),
    label: "items.legislacao",
    path: "/legislacao",
    id: "tour-3",
  },
];

export const MenuList = () => {
  const t = useTranslations("menu");
  return (
    <ul className="flex gap-4 justify-between w-full max-w-[600px] flex-wrap min-h-(--menu-height) items-center">
      {MenuItems.map((item) => (
        <MenuListItem
          key={item.path}
          icon={item.icon}
          label={t(item.label)}
          path={item.path}
          id={item.id}
        />
      ))}
    </ul>
  );
};

export const MenuUserSection = () => {
  const { authService, me } = useAuth();
  const t = useTranslations("menu");
  const router = useRouter();
  const { startOnborda } = useOnborda();

  const userName = me ? `${me.first_name} ${me.last_name}` : "";
  const userEmail = me ? me.email : "";
  const userInitials = useMemo(() => {
    const nameParts = userName.split(" ");
    const firstInitial = nameParts[0].charAt(0).toUpperCase();
    const lastInitial =
      nameParts.length > 1
        ? nameParts[nameParts.length - 1].charAt(0).toUpperCase()
        : "";
    return firstInitial + lastInitial;
  }, [userName]);

  return (
    <div className="h-(--menu-height) flex items-center justify-center">
      <Button
        variant="ghost"
        className="text-white"
        size="icon"
        onClick={() => {
          startOnborda("main");
        }}
      >
        <span className="material-symbols-outlined">help</span>
      </Button>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="rounded-full cursor-pointer text-white hover:text-primary"
          >
            <Avatar>
              <AvatarFallback className="text-primary">
                {userInitials}
              </AvatarFallback>
            </Avatar>
            <ChevronDown />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuGroup>
            <DropdownMenuLabel>
              <div className="flex flex-col gap-2">
                <strong>{userName}</strong>
                {userEmail}
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
          </DropdownMenuGroup>
          <DropdownMenuGroup>
            <DropdownMenuItem
              className="cursor-pointer"
              onClick={() => {
                router.push("/settings");
              }}
            >
              <SettingsIcon />
              {t("items.settings")}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
          </DropdownMenuGroup>
          <DropdownMenuGroup>
            <DropdownMenuItem
              variant="destructive"
              className="cursor-pointer"
              onClick={() => {
                authService?.current.logout();
              }}
            >
              <LogOutIcon />
              {t("logout")}
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};
