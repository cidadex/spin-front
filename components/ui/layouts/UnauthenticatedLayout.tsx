"use client";

import { useTranslations } from "next-intl";
import logoSrc from "../../../public/logo.svg";
import bgLinesSrc from "../../../public/bg-graphs.webp";
import Image from "next/image";
import { Button } from "../button";
import { HelpCircle } from "lucide-react";

export const UnauthenticatedLayout = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const t = useTranslations();
  return (
    <div className="min-h-svh bg-linear-to-r from-[#11132C] to-[#383F92] flex items-center justify-center lg:px-4 lg:h-svh lg:overflow-hidden">
      <Bg />
      <div className="relative pb-34 w-full max-w-6xl overflow-x-hidden h-full flex gap-2 flex-col justify-center items-center lg:grid lg:grid-cols-[544px_1fr] lg:grid-rows-[auto_1fr_auto] lg:pb-0 lg:overflow-hidden">
        <UnauthenticatedLayoutHeader />
        <UnauthenticatedLayoutContentContainer>
          {children}
        </UnauthenticatedLayoutContentContainer>
        <div className="flex flex-col gap-8 lg:flex-row lg:col-start-1 lg:row-start-3 lg:pb-20">
          <FeatureLabel
            label={t("common.features.calculations.label")}
            description={t("common.features.calculations.description")}
            icon={<span className="material-symbols-outlined">calculate</span>}
          />
          <FeatureLabel
            label={t("common.features.experts.label")}
            description={t("common.features.experts.description")}
            icon={<span className="material-symbols-outlined">explore</span>}
          />
          <FeatureLabel
            label={t("common.features.students.label")}
            description={t("common.features.students.description")}
            icon={<span className="material-symbols-outlined">send</span>}
          />
        </div>
      </div>
    </div>
  );
};

export const UnauthenticatedLayoutContentContainer = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return (
    <div className="w-full px-4 flex flex-col justify-center items-center lg:items-end overflow-hidden mb-8 lg:row-start-2 lg:col-start-2 lg:mb-0 lg:max-h-full lg:h-full lg:py-0 lg:pb-20 lg:px-0 lg:w-full lg:row-span-2">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-lg max-h-full overflow-hidden">
        {children}
      </div>
    </div>
  );
};

export const UnauthenticatedLayoutHeaderFooter = () => {
  const t = useTranslations();
  return (
    <footer className="p-6 pb-8 text-center text-sm text-white">
      {t("common.appFooterText", { year: new Date().getFullYear() })}
    </footer>
  );
};

export const UnauthenticatedLayoutHeader = () => {
  const t = useTranslations();
  return (
    <>
      <div className="flex items-center justify-center lg:items-start lg:justify-start mt-14 mb-12 text-2xl lg:col-start-1">
        <Logo />
      </div>
      <div className="hidden lg:flex lg:items-end lg:justify-end">
        <Button variant="ghost" className="text-white cursor-pointer">
          <HelpCircle />
          {t("common.support")}
        </Button>
      </div>
      <header className="flex px-4 flex-col gap-4 text-white items-center justify-center mb-12 lg:col-start-1 lg:row-start-2 lg:items-start lg:px-0 lg:max-w-[544px] lg:self-start">
        <span className="mb-6">
          <BetaLabel />
        </span>
        <h2 className="text-4xl leading-normal font-semibold text-center lg:text-left">
          {t("common.appSubtitle")}
        </h2>
        <p className="text-center leading-normal text-sm lg:text-left">
          {t("common.appDescription")}
        </p>
      </header>
    </>
  );
};

export const Logo = () => {
  return <Image src={logoSrc} alt="App Logo" className=" h-10" />;
};

export const Bg = () => {
  return (
    <div
      style={{
        backgroundImage: `url(${bgLinesSrc.src})`,
      }}
      className="fixed w-lvw h-lvh left-0 top-0 bg-top-right pointer-events-none bg-no-repeat bg-size-[auto_100%]"
    />
  );
};

export const BetaLabel = () => {
  const t = useTranslations();
  return (
    <span className="flex gap-2 px-2 text-sm py-1 pr-4 border items-center rounded-full border-gray-700 leading-none">
      <span className="rounded-full font-semibold text-purple-700 px-3 py-2 bg-linear-to-b from-[#F5F5F5] to-[#B4B4B4] ">
        {t("common.betaLabel")}
      </span>
      <span>{t("common.betaDescription")}</span>
    </span>
  );
};

export const FeatureLabel = ({
  label,
  description,
  icon,
}: {
  label: string;
  description: string;
  icon?: React.ReactNode;
}) => {
  return (
    <span className="flex flex-col items-center text-white px-4 lg:px-0 lg:items-start">
      <div className="p-4 rounded-lg bg-[#2D255E87] text-[#4957B4] leading-none">
        {icon}
      </div>
      <span className="text-2xl font-medium leading-normal text-center lg:text-left">
        {label}
      </span>
      <span className="text-sm leading-normal text-center lg:text-left">
        {description}
      </span>
    </span>
  );
};
